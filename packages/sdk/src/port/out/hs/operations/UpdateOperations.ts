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

import TransactionResponse from '../../../../domain/context/transaction/TransactionResponse';
import StableCoinCapabilities from '../../../../domain/context/stablecoin/StableCoinCapabilities';
import LogService from '../../../../app/service/LogService';
import { SigningError } from '../../hs/error/SigningError';
import { ethers } from 'ethers';
import {
	HederaTokenManagerFacet__factory,
	CustomFeesFacet__factory,
	DiamondFacet__factory,
} from '@hashgraph/stablecoin-npm-contracts';
import {
	UPDATE_TOKEN_GAS,
	UPDATE_CUSTOM_FEES_GAS,
	UPDATE_CONFIG_VERSION_GAS,
	UPDATE_CONFIG_GAS,
	UPDATE_RESOLVER_GAS,
	EVM_ZERO_ADDRESS,
} from '../../../../core/Constants';
import { CustomFee as HCustomFee } from '@hiero-ledger/sdk/lib/exports';
import {
	fromHCustomFeeToSCFee,
	SC_FixedFee,
	SC_FractionalFee,
} from '../../../../domain/context/fee/CustomFee';
import type { TransactionExecutor } from '../TransactionExecutor';
import type { EvmAddressResolver } from '../EvmAddressResolver';
import { MirrorNodeAdapter } from '../../mirror/MirrorNodeAdapter';
import PublicKey from '../../../../domain/context/account/PublicKey';
import ContractId from '../../../../domain/context/contract/ContractId';

export class UpdateOperations {
	constructor(
		private executor: TransactionExecutor,
		private evmResolver: EvmAddressResolver,
	) {}

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
		startDate?: string,
	): Promise<TransactionResponse> {
		try {
			const contractId = coin.coin.proxyAddress?.value;
			const evmAddress = coin.coin.evmProxyAddress?.value;
			if (!contractId) {
				throw new Error(
					`StableCoin ${coin.coin.name} does not have a proxy address`,
				);
			}

			const providedKeys = [
				undefined, // admin key (index 0) - never updated
				kycKey,
				freezeKey,
				wipeKey,
				undefined, // supply key (index 4) - never updated
				feeScheduleKey,
				pauseKey,
			];

			const keys =
				this.evmResolver.buildKeysForSmartContract(providedKeys);

			const updateTokenStruct = {
				tokenName: name ?? '',
				tokenSymbol: symbol ?? '',
				keys,
				second: expirationTime
					? Math.floor(expirationTime / 1000000000)
					: -1,
				autoRenewPeriod: autoRenewPeriod ?? -1,
				tokenMetadataURI: metadata ?? '',
			};

			const iface = new ethers.Interface(
				HederaTokenManagerFacet__factory.abi,
			);
			const params = [updateTokenStruct];
			return await this.executor.executeContractCall(
				contractId,
				iface,
				'updateToken',
				params,
				UPDATE_TOKEN_GAS,
				undefined,
				undefined,
				startDate,
				evmAddress,
			);
		} catch (error) {
			LogService.logError(error);
			throw new SigningError(`Unexpected error in update(): ${error}`);
		}
	}

	async updateCustomFees(
		coin: StableCoinCapabilities,
		customFees: HCustomFee[],
		startDate?: string,
	): Promise<TransactionResponse> {
		try {
			const contractId = coin.coin.proxyAddress?.value;
			const evmAddress = coin.coin.evmProxyAddress?.value;
			if (!contractId) {
				throw new Error(
					`StableCoin ${coin.coin.name} does not have a proxy address`,
				);
			}

			const { fixedFees, fractionalFees } = await this.prepareCustomFees(
				coin,
				customFees,
				this.evmResolver.getMirrorNodeAdapter(),
			);

			const iface = new ethers.Interface(CustomFeesFacet__factory.abi);
			const params = [fixedFees, fractionalFees];
			return await this.executor.executeContractCall(
				contractId,
				iface,
				'updateTokenCustomFees',
				params,
				UPDATE_CUSTOM_FEES_GAS,
				undefined,
				undefined,
				startDate,
				evmAddress,
			);
		} catch (error) {
			LogService.logError(error);
			throw new SigningError(
				`Unexpected error in updateCustomFees(): ${error}`,
			);
		}
	}

	async updateConfigVersion(
		coin: StableCoinCapabilities,
		configVersion: number,
		startDate?: string,
	): Promise<TransactionResponse> {
		try {
			const contractId = coin.coin.proxyAddress?.value;
			const evmAddress = coin.coin.evmProxyAddress?.value;
			if (!contractId) {
				throw new Error(
					`StableCoin ${coin.coin.name} does not have a proxy address`,
				);
			}

			const iface = new ethers.Interface(DiamondFacet__factory.abi);
			const params = [configVersion];
			return await this.executor.executeContractCall(
				contractId,
				iface,
				'updateConfigVersion',
				params,
				UPDATE_CONFIG_VERSION_GAS,
				undefined,
				startDate,
				evmAddress,
			);
		} catch (error) {
			LogService.logError(error);
			throw new SigningError(
				`Unexpected error in updateConfigVersion(): ${error}`,
			);
		}
	}

	async updateConfig(
		coin: StableCoinCapabilities,
		configId: string,
		configVersion: number,
		startDate?: string,
	): Promise<TransactionResponse> {
		try {
			const contractId = coin.coin.proxyAddress?.value;
			const evmAddress = coin.coin.evmProxyAddress?.value;
			if (!contractId) {
				throw new Error(
					`StableCoin ${coin.coin.name} does not have a proxy address`,
				);
			}

			const iface = new ethers.Interface(DiamondFacet__factory.abi);
			const params = [configId, configVersion];
			return await this.executor.executeContractCall(
				contractId,
				iface,
				'updateConfig',
				params,
				UPDATE_CONFIG_GAS,
				undefined,
				undefined,
				startDate,
				evmAddress,
			);
		} catch (error) {
			LogService.logError(error);
			throw new SigningError(
				`Unexpected error in updateConfig(): ${error}`,
			);
		}
	}

	async updateResolver(
		coin: StableCoinCapabilities,
		resolver: ContractId,
		configVersion: number,
		configId: string,
		startDate?: string,
	): Promise<TransactionResponse> {
		try {
			const contractId = coin.coin.proxyAddress?.value;
			const evmAddress = coin.coin.evmProxyAddress?.value;
			if (!contractId) {
				throw new Error(
					`StableCoin ${coin.coin.name} does not have a proxy address`,
				);
			}

			const resolverEvm = await this.evmResolver.resolve(resolver);

			const iface = new ethers.Interface(DiamondFacet__factory.abi);
			const params = [resolverEvm, configId, configVersion];
			return await this.executor.executeContractCall(
				contractId,
				iface,
				'updateResolver',
				params,
				UPDATE_RESOLVER_GAS,
				undefined,
				undefined,
				startDate,
				evmAddress,
			);
		} catch (error) {
			LogService.logError(error);
			throw new SigningError(
				`Unexpected error in updateResolver(): ${error}`,
			);
		}
	}

	private async prepareCustomFees(
		coin: StableCoinCapabilities,
		customFees: HCustomFee[],
		mirrorNodeAdapter: MirrorNodeAdapter,
	): Promise<{
		fixedFees: SC_FixedFee[];
		fractionalFees: SC_FractionalFee[];
	}> {
		const fixedFees: SC_FixedFee[] = [];
		const fractionalFees: SC_FractionalFee[] = [];

		for (const cf of customFees) {
			const feeCollector = cf.feeCollectorAccountId
				? (
						await mirrorNodeAdapter.getAccountInfo(
							cf.feeCollectorAccountId.toString(),
						)
				  ).accountEvmAddress ?? EVM_ZERO_ADDRESS
				: EVM_ZERO_ADDRESS;

			const scFee = fromHCustomFeeToSCFee(
				cf,
				coin.coin.tokenId?.toString() ?? '',
				feeCollector,
			);
			if (scFee instanceof SC_FixedFee) fixedFees.push(scFee);
			else fractionalFees.push(scFee as SC_FractionalFee);
		}

		return { fixedFees, fractionalFees };
	}
}
