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
import BigDecimal from '../../../domain/context/shared/BigDecimal';
import { CapabilityDecider } from '../CapabilityDecider';
import { Operation } from '../../../domain/context/stablecoin/Capability';
import LogService from '../../../app/service/LogService';
import { SigningError } from '../hs/error/SigningError';
import { TransactionHelpers } from './TransactionHelpers';
import type { BaseHederaTransactionAdapter } from '../BaseHederaTransactionAdapter';

/**
 * Rescue operations: rescue, rescueHBAR
 */
export class RescueOperations {
	constructor(private adapter: BaseHederaTransactionAdapter) {}

	async rescue(
		coin: StableCoinCapabilities,
		amount: BigDecimal,
		startDate?: string,
	): Promise<TransactionResponse> {
		try {
			CapabilityDecider.checkContractOperation(coin, Operation.RESCUE);

			const contractId = coin.coin.proxyAddress?.value;
			const evmAddress = coin.coin.evmProxyAddress?.value;
			if (!contractId) {
				throw new Error(
					`StableCoin ${coin.coin.name} does not have a proxy address`,
				);
			}

			const iface = (this.adapter as any).getFacetInterface(
				'RescuableFacet',
			);
			const params = [amount.toBigInt()];
			return await (this.adapter as any).executeContractCall(
				contractId,
				iface,
				'rescue',
				params,
				TransactionHelpers.getGasLimit('RESCUE'),
				undefined,
				startDate,
				evmAddress,
			);
		} catch (error) {
			LogService.logError(error);
			throw new SigningError(`Unexpected error in rescue(): ${error}`);
		}
	}

	async rescueHBAR(
		coin: StableCoinCapabilities,
		amount: BigDecimal,
		startDate?: string,
	): Promise<TransactionResponse> {
		try {
			CapabilityDecider.checkContractOperation(
				coin,
				Operation.RESCUE_HBAR,
			);

			const contractId = coin.coin.proxyAddress?.value;
			const evmAddress = coin.coin.evmProxyAddress?.value;
			if (!contractId) {
				throw new Error(
					`StableCoin ${coin.coin.name} does not have a proxy address`,
				);
			}

			const iface = (this.adapter as any).getFacetInterface(
				'RescuableFacet',
			);
			const params = [amount.toBigInt()];
			return await (this.adapter as any).executeContractCall(
				contractId,
				iface,
				'rescueHBAR',
				params,
				TransactionHelpers.getGasLimit('RESCUE_HBAR'),
				undefined,
				startDate,
				evmAddress,
			);
		} catch (error) {
			LogService.logError(error);
			throw new SigningError(
				`Unexpected error in rescueHBAR(): ${error}`,
			);
		}
	}
}
