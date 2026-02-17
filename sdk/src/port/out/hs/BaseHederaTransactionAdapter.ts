/*
 *
 * Hedera Stablecoin SDK
 *
 * Copyright (C) 2023 Hedera Hashgraph, LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 *
 */

import { Transaction, ContractExecuteTransaction } from '@hiero-ledger/sdk';
import { CustomFee as HCustomFee } from '@hiero-ledger/sdk/lib/exports';
import TransactionAdapter from '../TransactionAdapter';
import TransactionResponse from '../../../domain/context/transaction/TransactionResponse';
import { TransactionType } from '../TransactionResponseEnums';
import StableCoinCapabilities from '../../../domain/context/stablecoin/StableCoinCapabilities';
import { HederaId } from '../../../domain/context/shared/HederaId';
import { StableCoinProps } from '../../../domain/context/stablecoin/StableCoin';
import ContractId from '../../../domain/context/contract/ContractId';
import Account from '../../../domain/context/account/Account';
import PublicKey from '../../../domain/context/account/PublicKey';
import BigDecimal from '../../../domain/context/shared/BigDecimal';
import { StableCoinRole } from '../../../domain/context/stablecoin/StableCoinRole';
import LogService from '../../../app/service/LogService';
import { SigningError } from './error/SigningError';
import { ethers } from 'ethers';
import { MirrorNodeAdapter } from '../mirror/MirrorNodeAdapter';
import NetworkService from '../../../app/service/NetworkService';
import { TokenOperations } from '../hs/operations/TokenOperations';
import { TokenControlOperations } from '../hs/operations/TokenControlOperations';
import { RoleOperations } from '../hs/operations/RoleOperations';
import { SupplierOperations } from '../hs/operations/SupplierOperations';
import { HoldOperations } from '../hs/operations/HoldOperations';
import { ReserveOperations } from '../hs/operations/ReserveOperations';
import { QueryOperations } from '../hs/operations/QueryOperations';
import { UpdateOperations } from '../hs/operations/UpdateOperations';
import { RescueOperations } from '../hs/operations/RescueOperations';

/**
 * Base adapter containing all shared business logic for Hedera transaction operations.
 * Subclasses (WalletConnect, MultiSign, Custodial) only need to implement the execution methods.
 *
 * Composition Pattern: Business logic is organized into operation classes for better maintainability.
 */
export abstract class BaseHederaTransactionAdapter extends TransactionAdapter {
	// Operation class instances
	protected tokenOps: TokenOperations;
	protected tokenControlOps: TokenControlOperations;
	protected roleOps: RoleOperations;
	protected supplierOps: SupplierOperations;
	protected holdOps: HoldOperations;
	protected reserveOps: ReserveOperations;
	protected queryOps: QueryOperations;
	protected updateOps: UpdateOperations;
	protected rescueOps: RescueOperations;

	constructor() {
		super();
		// Initialize operation classes
		this.tokenOps = new TokenOperations(this);
		this.tokenControlOps = new TokenControlOperations(this);
		this.roleOps = new RoleOperations(this);
		this.supplierOps = new SupplierOperations(this);
		this.holdOps = new HoldOperations(this);
		this.reserveOps = new ReserveOperations(this);
		this.queryOps = new QueryOperations(this);
		this.updateOps = new UpdateOperations(this);
		this.rescueOps = new RescueOperations(this);
	}

	/**
	 * Build a ContractExecuteTransaction without processing it.
	 * Pure building logic - no side effects, no execution or serialization.
	 *
	 * @param contractId The contract ID to call
	 * @param iface The ethers interface for encoding
	 * @param functionName The function name to call
	 * @param params The function parameters
	 * @param gasLimit Gas limit for the transaction
	 * @param payableAmountHbar Optional HBAR amount to send
	 * @returns ContractExecuteTransaction ready to be processed
	 */
	protected buildContractTransaction(
		contractId: string,
		iface: ethers.Interface,
		functionName: string,
		params: unknown[],
		gasLimit: number,
		payableAmountHbar?: string,
	): ContractExecuteTransaction {
		// Encode function call data
		const functionCallData = iface.encodeFunctionData(functionName, params);

		// Build ContractExecuteTransaction
		let transaction = new ContractExecuteTransaction()
			.setContractId(contractId)
			.setFunctionParameters(
				Uint8Array.from(Buffer.from(functionCallData.slice(2), 'hex')),
			)
			.setGas(gasLimit);

		if (payableAmountHbar) {
			transaction = transaction.setPayableAmount(
				parseFloat(payableAmountHbar),
			);
		}

		return transaction;
	}

	/**
	 * Process a Hedera SDK transaction. This is the MAIN processing point that subclasses must implement.
	 * All execution paths (HTS native, contract calls, etc.) eventually route through this method.
	 *
	 * Subclasses override this to define their processing strategy:
	 * - Integrated wallets (HTS, WalletConnect, Custodial): Execute on network (sign + send + receipt)
	 * - MultiSig/External wallets: Serialize and return bytes (NO network execution)
	 *
	 * @param tx The transaction to process
	 * @param transactionType Type of transaction response to retrieve (RECEIPT or RECORD)
	 * @param startDate Optional start date for the transaction (ISO string) - used for multi-sig coordination
	 * @returns Transaction response (with receipt OR serialized transaction data)
	 */
	public abstract processTransaction(
		tx: Transaction,
		transactionType: TransactionType,
		startDate?: string,
	): Promise<TransactionResponse>;

	/**
	 * Execute a contract call by building a ContractExecuteTransaction and processing it.
	 * Default implementation builds the transaction using Hedera contract ID and routes through processTransaction.
	 * Override this method if you need special address handling (e.g., WalletConnect EVM sessions).
	 *
	 * @param contractId The contract ID (Hedera format 0.0.123)
	 * @param iface The ethers interface for encoding
	 * @param functionName The function name to call
	 * @param params The function parameters
	 * @param gasLimit Gas limit for the transaction
	 * @param transactionType Type of transaction response to retrieve (RECEIPT or RECORD). Defaults to RECEIPT for mutations.
	 * @param payableAmountHbar Optional HBAR amount to send
	 * @param startDate Optional start date for the transaction
	 * @param evmAddress Optional EVM address (0x...) - avoids Mirror Node call for WalletConnect EVM sessions
	 * @returns Transaction response
	 */
	public async executeContractCall(
		contractId: string,
		iface: ethers.Interface,
		functionName: string,
		params: unknown[],
		gasLimit: number,
		transactionType: TransactionType = TransactionType.RECEIPT,
		payableAmountHbar?: string,
		startDate?: string,
		// eslint-disable-next-line @typescript-eslint/no-unused-vars
		_evmAddress?: string,
	): Promise<TransactionResponse> {
		try {
			// Build the contract transaction
			const transaction = this.buildContractTransaction(
				contractId,
				iface,
				functionName,
				params,
				gasLimit,
				payableAmountHbar,
			);

			// Route through processTransaction (the main processing point)
			return await this.processTransaction(
				transaction,
				transactionType,
				startDate,
			);
		} catch (error) {
			LogService.logError(`Error in executeContractCall: ${error}`);
			throw new SigningError(`Contract call failed: ${error}`);
		}
	}

	/**
	 * Get the account associated with this adapter.
	 */
	public abstract getAccount(): Account;

	/**
	 * Check if this adapter supports EVM operations (vs native HTS only).
	 * Implementations should return true if they can execute EVM/eth_sendTransaction calls.
	 */
	public abstract supportsEvmOperations(): boolean;

	// ===== Token Operations =====

	async create(
		coin: StableCoinProps,
		factory: ContractId,
		createReserve: boolean,
		resolver: ContractId,
		configId: string,
		configVersion: number,
		proxyOwnerAccount: HederaId,
		updatedAtThreshold: string,
		reserveAddress?: ContractId,
		reserveInitialAmount?: BigDecimal,
		reserveConfigId?: string,
		reserveConfigVersion?: number,
	): Promise<TransactionResponse> {
		return this.tokenOps.create(
			coin,
			factory,
			createReserve,
			resolver,
			configId,
			configVersion,
			proxyOwnerAccount,
			updatedAtThreshold,
			reserveAddress,
			reserveInitialAmount,
			reserveConfigId,
			reserveConfigVersion,
		);
	}

	async associateToken(
		tokenId: HederaId,
		_targetId: HederaId,
	): Promise<TransactionResponse> {
		return this.tokenOps.associateToken(tokenId, _targetId);
	}

	async wipe(
		coin: StableCoinCapabilities,
		targetId: HederaId,
		amount: BigDecimal,
		startDate?: string,
	): Promise<TransactionResponse> {
		return this.tokenOps.wipe(coin, targetId, amount, startDate);
	}

	async cashin(
		coin: StableCoinCapabilities,
		targetId: HederaId,
		amount: BigDecimal,
		startDate?: string,
	): Promise<TransactionResponse> {
		return this.tokenOps.cashin(coin, targetId, amount, startDate);
	}

	async burn(
		coin: StableCoinCapabilities,
		amount: BigDecimal,
		startDate?: string,
	): Promise<TransactionResponse> {
		return this.tokenOps.burn(coin, amount, startDate);
	}

	// ===== Token Control Operations =====

	async freeze(
		coin: StableCoinCapabilities,
		targetId: HederaId,
		startDate?: string,
	): Promise<TransactionResponse> {
		return this.tokenControlOps.freeze(coin, targetId, startDate);
	}

	async unfreeze(
		coin: StableCoinCapabilities,
		targetId: HederaId,
		startDate?: string,
	): Promise<TransactionResponse> {
		return this.tokenControlOps.unfreeze(coin, targetId, startDate);
	}

	async grantKyc(
		coin: StableCoinCapabilities,
		targetId: HederaId,
	): Promise<TransactionResponse> {
		return this.tokenControlOps.grantKyc(coin, targetId);
	}

	async revokeKyc(
		coin: StableCoinCapabilities,
		targetId: HederaId,
	): Promise<TransactionResponse> {
		return this.tokenControlOps.revokeKyc(coin, targetId);
	}

	async pause(
		coin: StableCoinCapabilities,
		startDate?: string,
	): Promise<TransactionResponse> {
		return this.tokenControlOps.pause(coin, startDate);
	}

	async unpause(coin: StableCoinCapabilities): Promise<TransactionResponse> {
		return this.tokenControlOps.unpause(coin);
	}

	async delete(
		coin: StableCoinCapabilities,
		startDate?: string,
	): Promise<TransactionResponse> {
		return this.tokenControlOps.delete(coin, startDate);
	}

	// ===== Rescue Operations =====

	async rescue(
		coin: StableCoinCapabilities,
		amount: BigDecimal,
		startDate?: string,
	): Promise<TransactionResponse> {
		return this.rescueOps.rescue(coin, amount, startDate);
	}

	async rescueHBAR(
		coin: StableCoinCapabilities,
		amount: BigDecimal,
		startDate?: string,
	): Promise<TransactionResponse> {
		return this.rescueOps.rescueHBAR(coin, amount, startDate);
	}

	// ===== Role Operations =====

	async grantRole(
		coin: StableCoinCapabilities,
		targetId: HederaId,
		role: StableCoinRole,
	): Promise<TransactionResponse> {
		return this.roleOps.grantRole(coin, targetId, role);
	}

	async revokeRole(
		coin: StableCoinCapabilities,
		targetId: HederaId,
		role: StableCoinRole,
	): Promise<TransactionResponse> {
		return this.roleOps.revokeRole(coin, targetId, role);
	}

	async grantRoles(
		coin: StableCoinCapabilities,
		targetsId: HederaId[],
		roles: StableCoinRole[],
		amounts: BigDecimal[],
	): Promise<TransactionResponse> {
		return this.roleOps.grantRoles(coin, targetsId, roles, amounts);
	}

	async revokeRoles(
		coin: StableCoinCapabilities,
		targetsId: HederaId[],
		roles: StableCoinRole[],
	): Promise<TransactionResponse> {
		return this.roleOps.revokeRoles(coin, targetsId, roles);
	}

	// ===== Supplier Operations =====

	async grantSupplierRole(
		coin: StableCoinCapabilities,
		targetId: HederaId,
		amount: BigDecimal,
	): Promise<TransactionResponse> {
		return this.supplierOps.grantSupplierRole(coin, targetId, amount);
	}

	async grantUnlimitedSupplierRole(
		coin: StableCoinCapabilities,
		targetId: HederaId,
	): Promise<TransactionResponse> {
		return this.supplierOps.grantUnlimitedSupplierRole(coin, targetId);
	}

	async revokeSupplierRole(
		coin: StableCoinCapabilities,
		targetId: HederaId,
	): Promise<TransactionResponse> {
		return this.supplierOps.revokeSupplierRole(coin, targetId);
	}

	async increaseSupplierAllowance(
		coin: StableCoinCapabilities,
		targetId: HederaId,
		amount: BigDecimal,
	): Promise<TransactionResponse> {
		return this.supplierOps.increaseSupplierAllowance(
			coin,
			targetId,
			amount,
		);
	}

	async decreaseSupplierAllowance(
		coin: StableCoinCapabilities,
		targetId: HederaId,
		amount: BigDecimal,
	): Promise<TransactionResponse> {
		return this.supplierOps.decreaseSupplierAllowance(
			coin,
			targetId,
			amount,
		);
	}

	async resetSupplierAllowance(
		coin: StableCoinCapabilities,
		targetId: HederaId,
	): Promise<TransactionResponse> {
		return this.supplierOps.resetSupplierAllowance(coin, targetId);
	}

	// ===== Update Operations =====

	async updateCustomFees(
		coin: StableCoinCapabilities,
		customFees: HCustomFee[],
	): Promise<TransactionResponse> {
		return this.updateOps.updateCustomFees(coin, customFees);
	}

	// ===== Hold Operations =====

	async createHold(
		coin: StableCoinCapabilities,
		amount: BigDecimal,
		escrow: HederaId,
		expirationDate: BigDecimal,
		targetId?: HederaId,
	): Promise<TransactionResponse> {
		return this.holdOps.createHold(
			coin,
			amount,
			escrow,
			expirationDate,
			targetId,
		);
	}

	async executeHold(
		coin: StableCoinCapabilities,
		amount: BigDecimal,
		sourceId: HederaId,
		holdId: number,
		target?: HederaId,
	): Promise<TransactionResponse> {
		return this.holdOps.executeHold(coin, amount, sourceId, holdId, target);
	}

	async releaseHold(
		coin: StableCoinCapabilities,
		amount: BigDecimal,
		sourceId: HederaId,
		holdId: number,
	): Promise<TransactionResponse> {
		return this.holdOps.releaseHold(coin, amount, sourceId, holdId);
	}

	async reclaimHold(
		coin: StableCoinCapabilities,
		sourceId: HederaId,
		holdId: number,
	): Promise<TransactionResponse> {
		return this.holdOps.reclaimHold(coin, sourceId, holdId);
	}

	// ===== Reserve Operations =====

	async getReserveAddress(
		coin: StableCoinCapabilities,
	): Promise<TransactionResponse> {
		return this.reserveOps.getReserveAddress(coin);
	}

	async updateReserveAddress(
		coin: StableCoinCapabilities,
		reserveAddress: ContractId,
	): Promise<TransactionResponse> {
		return this.reserveOps.updateReserveAddress(coin, reserveAddress);
	}

	async getReserveAmount(
		coin: StableCoinCapabilities,
	): Promise<TransactionResponse> {
		return this.reserveOps.getReserveAmount(coin);
	}

	async updateReserveAmount(
		reserveAddress: ContractId,
		amount: BigDecimal,
	): Promise<TransactionResponse> {
		return this.reserveOps.updateReserveAmount(reserveAddress, amount);
	}

	// ===== Query Operations =====

	async hasRole(
		coin: StableCoinCapabilities,
		targetId: HederaId,
		role: StableCoinRole,
	): Promise<TransactionResponse> {
		return this.queryOps.hasRole(coin, targetId, role);
	}

	async getRoles(
		coin: StableCoinCapabilities,
		targetId: HederaId,
	): Promise<TransactionResponse> {
		return this.queryOps.getRoles(coin, targetId);
	}

	async balanceOf(
		coin: StableCoinCapabilities,
		targetId: HederaId,
	): Promise<TransactionResponse> {
		return this.queryOps.balanceOf(coin, targetId);
	}

	async isUnlimitedSupplierAllowance(
		coin: StableCoinCapabilities,
		targetId: HederaId,
	): Promise<TransactionResponse> {
		return this.queryOps.isUnlimitedSupplierAllowance(coin, targetId);
	}

	async supplierAllowance(
		coin: StableCoinCapabilities,
		targetId: HederaId,
	): Promise<TransactionResponse> {
		return this.queryOps.supplierAllowance(coin, targetId);
	}

	// ===== Configuration Updates =====

	async update(
		coin: StableCoinCapabilities,
		name?: string,
		symbol?: string,
		autoRenewPeriod?: number,
		expirationTime?: number,
		kycKey?: PublicKey,
		freezeKey?: PublicKey,
		feeScheduleKey?: PublicKey,
		pauseKey?: PublicKey,
		wipeKey?: PublicKey,
		metadata?: string,
	): Promise<TransactionResponse> {
		return this.updateOps.update(
			coin,
			name,
			symbol,
			autoRenewPeriod,
			expirationTime,
			kycKey,
			freezeKey,
			feeScheduleKey,
			pauseKey,
			wipeKey,
			metadata,
		);
	}

	async updateConfigVersion(
		coin: StableCoinCapabilities,
		configVersion: number,
	): Promise<TransactionResponse> {
		return this.updateOps.updateConfigVersion(coin, configVersion);
	}

	async updateConfig(
		coin: StableCoinCapabilities,
		configId: string,
		configVersion: number,
	): Promise<TransactionResponse> {
		return this.updateOps.updateConfig(coin, configId, configVersion);
	}

	async updateResolver(
		coin: StableCoinCapabilities,
		resolver: ContractId,
		configVersion: number,
		configId: string,
	): Promise<TransactionResponse> {
		return this.updateOps.updateResolver(
			coin,
			resolver,
			configVersion,
			configId,
		);
	}

	/**
	 * Get the network service. Subclasses must provide access to the network service.
	 */
	public abstract getNetworkService(): NetworkService;

	/**
	 * Get the mirror node adapter. Subclasses must provide access to the mirror node adapter.
	 */
	public abstract getMirrorNodeAdapter(): MirrorNodeAdapter;
}
