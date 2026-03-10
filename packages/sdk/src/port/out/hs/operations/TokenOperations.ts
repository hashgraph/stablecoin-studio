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

import {
	TokenMintTransaction,
	TokenBurnTransaction,
	TokenWipeTransaction,
	TokenAssociateTransaction,
	TokenId,
	AccountId,
} from '@hiero-ledger/sdk';
import { UINT256_MAX } from '../../../../core/Constants';
import { ethers } from 'ethers';
import TransactionResponse from '../../../../domain/context/transaction/TransactionResponse';
import StableCoinCapabilities from '../../../../domain/context/stablecoin/StableCoinCapabilities';
import { HederaId } from '../../../../domain/context/shared/HederaId';
import { StableCoinProps } from '../../../../domain/context/stablecoin/StableCoin';
import ContractId from '../../../../domain/context/contract/ContractId';
import { FactoryCashinRole } from '../../../../domain/context/factory/FactoryCashinRole';
import { StableCoinRole } from '../../../../domain/context/stablecoin/StableCoinRole';
import { ResolverProxyConfiguration } from '../../../../domain/context/factory/ResolverProxyConfiguration';
import { FactoryRole } from '../../../../domain/context/factory/FactoryRole';
import { FactoryStableCoin } from '../../../../domain/context/factory/FactoryStableCoin';
import { TokenSupplyType } from '../../../../domain/context/stablecoin/TokenSupply';
import BigDecimal from '../../../../domain/context/shared/BigDecimal';
import { CapabilityDecider, Decision } from '../../CapabilityDecider';
import { Operation } from '../../../../domain/context/stablecoin/Capability';
import LogService from '../../../../app/service/LogService';
import { SigningError } from '../../hs/error/SigningError';
import {
	StableCoinFactoryFacet__factory,
	IHRC__factory,
	WipeableFacet__factory,
	CashInFacet__factory,
	BurnableFacet__factory,
} from '@hashgraph/stablecoin-npm-contracts';
import {
	ASSOCIATE_GAS,
	CREATE_SC_GAS,
	TOKEN_CREATION_COST_HBAR,
	WIPE_GAS,
	CASHIN_GAS,
	BURN_GAS,
} from '../../../../core/Constants';
import type { TransactionExecutor } from '../TransactionExecutor';
import type { EvmAddressResolver } from '../EvmAddressResolver';
import { TransactionType } from '../../TransactionResponseEnums';

export class TokenOperations {
	constructor(
		private executor: TransactionExecutor,
		private evmResolver: EvmAddressResolver,
	) {}

	/** Create stablecoin using native Hedera contract execution */
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
		startDate?: string,
	): Promise<TransactionResponse> {
		try {
			// Prepare common data
			const cashinRole: FactoryCashinRole = {
				account:
					!coin.cashInRoleAccount ||
					coin.cashInRoleAccount.toString() === '0.0.0'
						? '0x0000000000000000000000000000000000000000'
						: await this.evmResolver.resolve(
								coin.cashInRoleAccount,
						  ),
				allowance:
					!coin.cashInRoleAllowance ||
					coin.cashInRoleAllowance.toString() === '0'
						? UINT256_MAX.toString()
						: coin.cashInRoleAllowance.toFixedNumber(),
			};

			const keys = this.evmResolver.buildKeysForSmartContract([
				coin.adminKey,
				coin.kycKey,
				coin.freezeKey,
				coin.wipeKey,
				coin.supplyKey,
				coin.feeScheduleKey,
				coin.pauseKey,
			]);

			const baseRoles = [
				{
					account: proxyOwnerAccount,
					role: StableCoinRole.DEFAULT_ADMIN_ROLE,
				},
				{
					account: coin.burnRoleAccount,
					role: StableCoinRole.BURN_ROLE,
				},
				{
					account: coin.wipeRoleAccount,
					role: StableCoinRole.WIPE_ROLE,
				},
				{
					account: coin.rescueRoleAccount,
					role: StableCoinRole.RESCUE_ROLE,
				},
				{
					account: coin.pauseRoleAccount,
					role: StableCoinRole.PAUSE_ROLE,
				},
				{
					account: coin.freezeRoleAccount,
					role: StableCoinRole.FREEZE_ROLE,
				},
				{
					account: coin.deleteRoleAccount,
					role: StableCoinRole.DELETE_ROLE,
				},
				{ account: coin.kycRoleAccount, role: StableCoinRole.KYC_ROLE },
				{
					account: coin.feeRoleAccount,
					role: StableCoinRole.CUSTOM_FEES_ROLE,
				},
				{
					account: coin.holdCreatorRoleAccount,
					role: StableCoinRole.HOLD_CREATOR_ROLE,
				},
			];

			const roles = await Promise.all(
				baseRoles
					.filter(
						(r) =>
							r.account &&
							r.account.value !== HederaId.NULL.value,
					)
					.map(async (r) => {
						const fr = new FactoryRole();
						fr.role = r.role;
						fr.account = await this.evmResolver.resolve(
							r.account as HederaId,
						);
						return fr;
					}),
			);

			const stableCoinConfigurationId: ResolverProxyConfiguration = {
				key: configId,
				version: configVersion,
			};

			const reserveConfigurationId = ResolverProxyConfiguration.empty();
			if (createReserve) {
				reserveConfigurationId.key = reserveConfigId ?? '';
				reserveConfigurationId.version = reserveConfigVersion ?? 0;
			}

			const resolverEvm = await this.evmResolver.resolve(resolver);
			const reserveEvm =
				reserveAddress?.toString?.() === '0.0.0' || !reserveAddress
					? '0x0000000000000000000000000000000000000000'
					: await this.evmResolver.resolve(reserveAddress);

			const stableCoinToCreate = new FactoryStableCoin(
				coin.name,
				coin.symbol,
				coin.freezeDefault ?? false,
				coin.supplyType === TokenSupplyType.FINITE,
				coin.maxSupply?.toFixedNumber() ??
					BigDecimal.ZERO.toFixedNumber(),
				coin.initialSupply?.toFixedNumber() ??
					BigDecimal.ZERO.toFixedNumber(),
				coin.decimals,
				reserveEvm,
				updatedAtThreshold,
				reserveInitialAmount?.toFixedNumber() ??
					BigDecimal.ZERO.toFixedNumber(),
				createReserve,
				keys,
				roles,
				cashinRole,
				coin.metadata ?? '',
				resolverEvm,
				stableCoinConfigurationId,
				reserveConfigurationId,
			);

			return await this.executor.executeContractCall(
				factory.value,
				new ethers.Interface(StableCoinFactoryFacet__factory.abi),
				'deployStableCoin',
				[stableCoinToCreate],
				CREATE_SC_GAS,
				undefined,
				TOKEN_CREATION_COST_HBAR.toString(),
				startDate,
				undefined,
			);
		} catch (error) {
			LogService.logError(error);
			throw new SigningError(`Unexpected error in create(): ${error}`);
		}
	}

	/** Associate HTS token via EVM (IHRC.associate) or native HTS */
	async associateToken(
		tokenId: HederaId,
		_targetId: HederaId,
		startDate?: string,
	): Promise<TransactionResponse> {
		try {
			const account = this.executor.getAccount();

			// Check if EVM operations are supported and account has EVM address
			if (this.executor.supportsEvmOperations() && account.evmAddress) {
				// EVM path - use IHRC.associate on the token contract.
				// Pass the Hedera ID format so ContractId.fromString() succeeds.
				// ExternalEVMTransactionAdapter resolves the EVM address via getContractInfo().
				return await this.executor.executeContractCall(
					tokenId.toString(),
					new ethers.Interface(IHRC__factory.abi),
					'associate',
					[],
					ASSOCIATE_GAS,
					undefined,
					undefined,
					startDate,
					undefined,
				);
			} else {
				// Native HTS path - use TokenAssociateTransaction
				const associateTx = new TokenAssociateTransaction()
					.setAccountId(AccountId.fromString(account.id.toString()))
					.setTokenIds([TokenId.fromString(tokenId.toString())]);

				return await this.executor.processTransaction(
					associateTx,
					TransactionType.RECEIPT,
					startDate,
				);
			}
		} catch (error) {
			LogService.logError(error);
			throw new SigningError(
				`Unexpected error in associateToken(): ${error}`,
			);
		}
	}

	async wipe(
		coin: StableCoinCapabilities,
		targetId: HederaId,
		amount: BigDecimal,
		startDate?: string,
	): Promise<TransactionResponse> {
		try {
			const decision = CapabilityDecider.getAccessDecision(
				coin,
				Operation.WIPE,
			);

			if (decision === Decision.CONTRACT) {
				const contractId = coin.coin.proxyAddress?.value;
				const evmAddress = coin.coin.evmProxyAddress?.value;
				if (!contractId) {
					throw new Error(
						`StableCoin ${coin.coin.name} does not have a proxy address`,
					);
				}

				const iface = new ethers.Interface(WipeableFacet__factory.abi);
				const params = [
					await this.evmResolver.resolve(targetId),
					amount.toBigInt(),
				];
				return await this.executor.executeContractCall(
					contractId,
					iface,
					'wipe',
					params,
					WIPE_GAS,
					undefined,
					undefined,
					startDate,
					evmAddress,
				);
			} else if (decision === Decision.HTS) {
				if (!coin.coin.tokenId) {
					throw new Error(
						`StableCoin ${coin.coin.name} does not have a token ID`,
					);
				}

				const wipeTx = new TokenWipeTransaction()
					.setAccountId(AccountId.fromString(targetId.toString()))
					.setTokenId(TokenId.fromString(coin.coin.tokenId.value))
					.setAmount(amount.toLong());

				return await this.executor.processTransaction(
					wipeTx,
					TransactionType.RECEIPT,
					startDate,
				);
			}
			throw new Error(`Operation not permitted for token`);
		} catch (error) {
			LogService.logError(error);
			throw new SigningError(`Unexpected error in wipe(): ${error}`);
		}
	}

	async cashin(
		coin: StableCoinCapabilities,
		targetId: HederaId,
		amount: BigDecimal,
		startDate?: string,
	): Promise<TransactionResponse> {
		try {
			const decision = CapabilityDecider.getAccessDecision(
				coin,
				Operation.CASH_IN,
			);

			if (decision === Decision.CONTRACT) {
				const contractId = coin.coin.proxyAddress?.value;
				const evmAddress = coin.coin.evmProxyAddress?.value;
				if (!contractId) {
					throw new Error(
						`StableCoin ${coin.coin.name} does not have a proxy address`,
					);
				}

				const iface = new ethers.Interface(CashInFacet__factory.abi);
				const params = [
					await this.evmResolver.resolve(targetId),
					amount.toBigInt(),
				];
				return await this.executor.executeContractCall(
					contractId,
					iface,
					'mint',
					params,
					CASHIN_GAS,
					undefined,
					undefined,
					startDate,
					evmAddress,
				);
			} else if (decision === Decision.HTS) {
				if (!coin.coin.tokenId) {
					throw new Error(
						`StableCoin ${coin.coin.name} does not have a token ID`,
					);
				}

				const mintTx = new TokenMintTransaction()
					.setTokenId(coin.coin.tokenId.value)
					.setAmount(amount.toLong());

				return await this.executor.processTransaction(
					mintTx,
					TransactionType.RECEIPT,
					startDate,
				);
			}
			throw new Error(`Operation not permitted for token`);
		} catch (error) {
			LogService.logError(error);
			throw new SigningError(`Unexpected error in cashin(): ${error}`);
		}
	}

	async burn(
		coin: StableCoinCapabilities,
		amount: BigDecimal,
		startDate?: string,
	): Promise<TransactionResponse> {
		try {
			const decision = CapabilityDecider.getAccessDecision(
				coin,
				Operation.BURN,
			);

			if (decision === Decision.CONTRACT) {
				const contractId = coin.coin.proxyAddress?.value;
				const evmAddress = coin.coin.evmProxyAddress?.value;
				if (!contractId) {
					throw new Error(
						`StableCoin ${coin.coin.name} does not have a proxy address`,
					);
				}

				const iface = new ethers.Interface(BurnableFacet__factory.abi);
				const params = [amount.toBigInt()];
				return await this.executor.executeContractCall(
					contractId,
					iface,
					'burn',
					params,
					BURN_GAS,
					undefined,
					undefined,
					startDate,
					evmAddress,
				);
			} else if (decision === Decision.HTS) {
				if (!coin.coin.tokenId) {
					throw new Error(
						`StableCoin ${coin.coin.name} does not have a token ID`,
					);
				}

				const burnTx = new TokenBurnTransaction()
					.setTokenId(coin.coin.tokenId.value)
					.setAmount(amount.toLong());

				return await this.executor.processTransaction(
					burnTx,
					TransactionType.RECEIPT,
					startDate,
				);
			}
			throw new Error(`Operation not permitted for token`);
		} catch (error) {
			LogService.logError(error);
			throw new SigningError(`Unexpected error in burn(): ${error}`);
		}
	}
}
