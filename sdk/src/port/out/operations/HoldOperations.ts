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
import { HederaId } from '../../../domain/context/shared/HederaId';
import BigDecimal from '../../../domain/context/shared/BigDecimal';
import { CapabilityDecider } from '../CapabilityDecider';
import { Operation } from '../../../domain/context/stablecoin/Capability';
import LogService from '../../../app/service/LogService';
import { SigningError } from '../hs/error/SigningError';
import { TransactionHelpers } from './TransactionHelpers';
import type { BaseHederaTransactionAdapter } from '../BaseHederaTransactionAdapter';

/**
 * Hold management operations: createHold, executeHold, releaseHold, reclaimHold
 */
export class HoldOperations {
	constructor(private adapter: BaseHederaTransactionAdapter) {}

	async createHold(
		coin: StableCoinCapabilities,
		amount: BigDecimal,
		escrow: HederaId,
		expirationDate: BigDecimal,
		targetId?: HederaId,
		startDate?: string,
	): Promise<TransactionResponse> {
		try {
			CapabilityDecider.checkContractOperation(
				coin,
				Operation.CREATE_HOLD,
			);

			const contractId = coin.coin.proxyAddress?.value;
			const evmAddress = coin.coin.evmProxyAddress?.value;
			if (!contractId) {
				throw new Error(
					`StableCoin ${coin.coin.name} does not have a proxy address`,
				);
			}

			const evmEscrow = await this.adapter.getEVMAddress(escrow);
			const evmTo = targetId
				? await this.adapter.getEVMAddress(targetId)
				: TransactionHelpers.getZeroAddress();

			const hold = {
				amount: amount.toBigInt(),
				expirationTimestamp: expirationDate.toBigInt(),
				escrow: evmEscrow,
				to: evmTo,
				data: '0x',
			};

			const iface = (this.adapter as any).getFacetInterface(
				'HoldManagementFacet',
			);
			const params = [hold];
			return await (this.adapter as any).executeContractCall(
				contractId,
				iface,
				'createHold',
				params,
				TransactionHelpers.getGasLimit('CREATE_HOLD'),
				undefined,
				startDate,
				evmAddress,
			);
		} catch (error) {
			LogService.logError(error);
			throw new SigningError(
				`Unexpected error in createHold(): ${error}`,
			);
		}
	}

	async executeHold(
		coin: StableCoinCapabilities,
		amount: BigDecimal,
		sourceId: HederaId,
		holdId: number,
		target?: HederaId,
		startDate?: string,
	): Promise<TransactionResponse> {
		try {
			CapabilityDecider.checkContractOperation(
				coin,
				Operation.EXECUTE_HOLD,
			);

			const contractId = coin.coin.proxyAddress?.value;
			const evmAddress = coin.coin.evmProxyAddress?.value;
			if (!contractId) {
				throw new Error(
					`StableCoin ${coin.coin.name} does not have a proxy address`,
				);
			}

			const holdIdentifier = {
				tokenHolder: await this.adapter.getEVMAddress(sourceId),
				holdId,
			};
			const targetId = target
				? await this.adapter.getEVMAddress(target)
				: TransactionHelpers.getZeroAddress();

			const iface = (this.adapter as any).getFacetInterface(
				'HoldManagementFacet',
			);
			const params = [holdIdentifier, targetId, amount.toBigInt()];
			return await (this.adapter as any).executeContractCall(
				contractId,
				iface,
				'executeHold',
				params,
				TransactionHelpers.getGasLimit('EXECUTE_HOLD'),
				undefined,
				startDate,
				evmAddress,
			);
		} catch (error) {
			LogService.logError(error);
			throw new SigningError(
				`Unexpected error in executeHold(): ${error}`,
			);
		}
	}

	async releaseHold(
		coin: StableCoinCapabilities,
		amount: BigDecimal,
		sourceId: HederaId,
		holdId: number,
		startDate?: string,
	): Promise<TransactionResponse> {
		try {
			CapabilityDecider.checkContractOperation(
				coin,
				Operation.RELEASE_HOLD,
			);

			const contractId = coin.coin.proxyAddress?.value;
			const evmAddress = coin.coin.evmProxyAddress?.value;
			if (!contractId) {
				throw new Error(
					`StableCoin ${coin.coin.name} does not have a proxy address`,
				);
			}

			const holdIdentifier = {
				tokenHolder: await this.adapter.getEVMAddress(sourceId),
				holdId,
			};

			const iface = (this.adapter as any).getFacetInterface(
				'HoldManagementFacet',
			);
			const params = [holdIdentifier, amount.toBigInt()];
			return await (this.adapter as any).executeContractCall(
				contractId,
				iface,
				'releaseHold',
				params,
				TransactionHelpers.getGasLimit('RELEASE_HOLD'),
				undefined,
				startDate,
				evmAddress,
			);
		} catch (error) {
			LogService.logError(error);
			throw new SigningError(
				`Unexpected error in releaseHold(): ${error}`,
			);
		}
	}

	async reclaimHold(
		coin: StableCoinCapabilities,
		sourceId: HederaId,
		holdId: number,
		startDate?: string,
	): Promise<TransactionResponse> {
		try {
			CapabilityDecider.checkContractOperation(
				coin,
				Operation.RECLAIM_HOLD,
			);

			const contractId = coin.coin.proxyAddress?.value;
			const evmAddress = coin.coin.evmProxyAddress?.value;
			if (!contractId) {
				throw new Error(
					`StableCoin ${coin.coin.name} does not have a proxy address`,
				);
			}

			const holdIdentifier = {
				tokenHolder: await this.adapter.getEVMAddress(sourceId),
				holdId,
			};

			const iface = (this.adapter as any).getFacetInterface(
				'HoldManagementFacet',
			);
			const params = [holdIdentifier];
			return await (this.adapter as any).executeContractCall(
				contractId,
				iface,
				'reclaimHold',
				params,
				TransactionHelpers.getGasLimit('RECLAIM_HOLD'),
				undefined,
				startDate,
				evmAddress,
			);
		} catch (error) {
			LogService.logError(error);
			throw new SigningError(
				`Unexpected error in reclaimHold(): ${error}`,
			);
		}
	}
}
