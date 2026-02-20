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
import type { TransactionExecutor } from './TransactionExecutor';
import { EvmAddressResolver } from './EvmAddressResolver';
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
 * Implements TransactionExecutor so operation classes depend on the interface, not this class.
 *
 * Subclasses (WalletConnect, MultiSign, Custodial) only need to implement processTransaction().
 */
export abstract class BaseHederaTransactionAdapter
	extends TransactionAdapter
	implements TransactionExecutor
{
	// Shared utility for EVM address resolution
	protected evmResolver!: EvmAddressResolver;

	protected tokenOps!: TokenOperations;
	protected tokenControlOps!: TokenControlOperations;
	protected roleOps!: RoleOperations;
	protected rescueOps!: RescueOperations;
	protected supplierOps!: SupplierOperations;
	protected holdOps!: HoldOperations;
	protected reserveOps!: ReserveOperations;
	protected queryOps!: QueryOperations;
	protected updateOps!: UpdateOperations;

	constructor() {
		super();
		// Lazy getter avoids constructor-time resolution issues with DI
		this.evmResolver = new EvmAddressResolver(() =>
			this.getMirrorNodeAdapter(),
		);

		this.tokenOps = new TokenOperations(this, this.evmResolver);
		this.tokenControlOps = new TokenControlOperations(
			this,
			this.evmResolver,
		);
		this.roleOps = new RoleOperations(this, this.evmResolver);
		this.rescueOps = new RescueOperations(this);
		this.supplierOps = new SupplierOperations(this, this.evmResolver);
		this.holdOps = new HoldOperations(this, this.evmResolver);
		this.reserveOps = new ReserveOperations(this, this.evmResolver);
		this.queryOps = new QueryOperations(this, this.evmResolver);
		this.updateOps = new UpdateOperations(this, this.evmResolver);
	}

	/**
	 * Build a ContractExecuteTransaction without processing it.
	 * Pure building logic - no side effects, no execution or serialization.
	 */
	protected buildContractTransaction(
		contractId: string,
		iface: ethers.Interface,
		functionName: string,
		params: unknown[],
		gasLimit: number,
		payableAmountHbar?: string,
	): ContractExecuteTransaction {
		const functionCallData = iface.encodeFunctionData(functionName, params);

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

	// ===== TransactionExecutor interface =====

	public abstract processTransaction(
		tx: Transaction,
		transactionType: TransactionType,
		startDate?: string,
	): Promise<TransactionResponse>;

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
			const transaction = this.buildContractTransaction(
				contractId,
				iface,
				functionName,
				params,
				gasLimit,
				payableAmountHbar,
			);

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

	public abstract getAccount(): Account;

	public abstract supportsEvmOperations(): boolean;

	// ===== Abstract methods for subclasses =====

	public abstract getNetworkService(): NetworkService;

	public abstract getMirrorNodeAdapter(): MirrorNodeAdapter;

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

	async createHoldByController(
		coin: StableCoinCapabilities,
		amount: BigDecimal,
		escrow: HederaId,
		expirationDate: BigDecimal,
		sourceId: HederaId,
		targetId?: HederaId,
	): Promise<TransactionResponse> {
		return this.holdOps.createHoldByController(
			coin,
			amount,
			escrow,
			expirationDate,
			sourceId,
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
}
