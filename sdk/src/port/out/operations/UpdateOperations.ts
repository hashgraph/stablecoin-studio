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

import TransactionResponse from '../../../domain/context/transaction/TransactionResponse';
import StableCoinCapabilities from '../../../domain/context/stablecoin/StableCoinCapabilities';
import { CapabilityDecider } from '../CapabilityDecider';
import { Operation } from '../../../domain/context/stablecoin/Capability';
import LogService from '../../../app/service/LogService';
import { SigningError } from '../hs/error/SigningError';
import { TransactionHelpers } from './TransactionHelpers';
import type { BaseHederaTransactionAdapter } from '../BaseHederaTransactionAdapter';

/**
 * Update operations: update, updateCustomFees, updateConfigVersion, updateConfig, updateResolver
 */
export class UpdateOperations {
	constructor(private adapter: BaseHederaTransactionAdapter) {}

	async update(
		coin: StableCoinCapabilities,
		name?: string,
		symbol?: string,
		autoRenewPeriod?: number,
		expirationTime?: number,
		kycKey?: any,
		freezeKey?: any,
		feeScheduleKey?: any,
		pauseKey?: any,
		wipeKey?: any,
		metadata?: string,
		startDate?: string,
	): Promise<TransactionResponse> {
		try {
			CapabilityDecider.checkContractOperation(coin, Operation.UPDATE);

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

			const keys = this.adapter.setKeysForSmartContract(providedKeys);

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

			const iface = (this.adapter as any).getFacetInterface(
				'HederaTokenManagerFacet',
			);
			const params = [updateTokenStruct];
			return await (this.adapter as any).executeContractCall(
				contractId,
				iface,
				'updateToken',
				params,
				TransactionHelpers.getGasLimit('UPDATE_TOKEN'),
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
		customFees: any[],
		startDate?: string,
	): Promise<TransactionResponse> {
		try {
			CapabilityDecider.checkContractOperation(
				coin,
				Operation.CREATE_CUSTOM_FEE,
			);

			const contractId = coin.coin.proxyAddress?.value;
			const evmAddress = coin.coin.evmProxyAddress?.value;
			if (!contractId) {
				throw new Error(
					`StableCoin ${coin.coin.name} does not have a proxy address`,
				);
			}

			const { fixedFees, fractionalFees } =
				await TransactionHelpers.prepareCustomFees(
					coin,
					customFees,
					this.adapter.getMirrorNodeAdapter(),
				);

			const iface = (this.adapter as any).getFacetInterface(
				'CustomFeesFacet',
			);
			const params = [fixedFees, fractionalFees];
			return await (this.adapter as any).executeContractCall(
				contractId,
				iface,
				'updateTokenCustomFees',
				params,
				TransactionHelpers.getGasLimit('UPDATE_CUSTOM_FEES'),
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
			CapabilityDecider.checkContractOperation(
				coin,
				Operation.UPDATE_CONFIG_VERSION,
			);

			const contractId = coin.coin.proxyAddress?.value;
			const evmAddress = coin.coin.evmProxyAddress?.value;
			if (!contractId) {
				throw new Error(
					`StableCoin ${coin.coin.name} does not have a proxy address`,
				);
			}

			const iface = (this.adapter as any).getFacetInterface(
				'DiamondFacet',
			);
			const params = [configVersion];
			return await (this.adapter as any).executeContractCall(
				contractId,
				iface,
				'updateConfigVersion',
				params,
				TransactionHelpers.getGasLimit('UPDATE_CONFIG_VERSION'),
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
			CapabilityDecider.checkContractOperation(
				coin,
				Operation.UPDATE_CONFIG,
			);

			const contractId = coin.coin.proxyAddress?.value;
			const evmAddress = coin.coin.evmProxyAddress?.value;
			if (!contractId) {
				throw new Error(
					`StableCoin ${coin.coin.name} does not have a proxy address`,
				);
			}

			const iface = (this.adapter as any).getFacetInterface(
				'DiamondFacet',
			);
			const params = [configId, configVersion];
			return await (this.adapter as any).executeContractCall(
				contractId,
				iface,
				'updateConfig',
				params,
				TransactionHelpers.getGasLimit('UPDATE_CONFIG'),
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
		resolver: any,
		configVersion: number,
		configId: string,
		startDate?: string,
	): Promise<TransactionResponse> {
		try {
			CapabilityDecider.checkContractOperation(
				coin,
				Operation.UPDATE_RESOLVER,
			);

			const contractId = coin.coin.proxyAddress?.value;
			const evmAddress = coin.coin.evmProxyAddress?.value;
			if (!contractId) {
				throw new Error(
					`StableCoin ${coin.coin.name} does not have a proxy address`,
				);
			}

			const resolverEvm = await this.adapter.getEVMAddress(resolver);

			const iface = (this.adapter as any).getFacetInterface(
				'DiamondFacet',
			);
			const params = [resolverEvm, configVersion, configId];
			return await (this.adapter as any).executeContractCall(
				contractId,
				iface,
				'updateResolver',
				params,
				TransactionHelpers.getGasLimit('UPDATE_RESOLVER'),
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
}
