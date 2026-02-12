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
import { TransactionType } from '../TransactionResponseEnums';

/**
 * Reserve management operations: getReserveAddress, updateReserveAddress, getReserveAmount, updateReserveAmount
 */
export class ReserveOperations {
	constructor(private adapter: BaseHederaTransactionAdapter) {}

	async getReserveAddress(
		coin: StableCoinCapabilities,
	): Promise<TransactionResponse> {
		try {
			const contractId = coin.coin.proxyAddress?.value;
			const evmAddress = coin.coin.evmProxyAddress?.value;
			if (!contractId) {
				throw new Error(
					`StableCoin ${coin.coin.name} does not have a proxy address`,
				);
			}

			const iface = TransactionHelpers.getFacetInterface('ReserveFacet');
			return await (this.adapter as any).executeContractCall(
				contractId,
				iface,
				'getReserveAddress',
				[],
				TransactionHelpers.getGasLimit('GET_RESERVE_ADDRESS'),
				TransactionType.RECORD,
				undefined,
				undefined,
				evmAddress,
			);
		} catch (error) {
			LogService.logError(error);
			throw new SigningError(
				`Unexpected error in getReserveAddress(): ${error}`,
			);
		}
	}

	async updateReserveAddress(
		coin: StableCoinCapabilities,
		reserveAddress: any,
		startDate?: string,
	): Promise<TransactionResponse> {
		try {
			CapabilityDecider.checkContractOperation(
				coin,
				Operation.UPDATE_RESERVE_ADDRESS,
			);

			const contractId = coin.coin.proxyAddress?.value;
			const evmAddress = coin.coin.evmProxyAddress?.value;
			if (!contractId) {
				throw new Error(
					`StableCoin ${coin.coin.name} does not have a proxy address`,
				);
			}

			const evm = await this.adapter.getEVMAddress(reserveAddress);

			const iface = (this.adapter as any).getFacetInterface(
				'ReserveFacet',
			);
			const params = [evm];
			return await (this.adapter as any).executeContractCall(
				contractId,
				iface,
				'updateReserveAddress',
				params,
				TransactionHelpers.getGasLimit('UPDATE_RESERVE_ADDRESS'),
				undefined,
				startDate,
				evmAddress,
			);
		} catch (error) {
			LogService.logError(error);
			throw new SigningError(
				`Unexpected error in updateReserveAddress(): ${error}`,
			);
		}
	}

	async getReserveAmount(
		coin: StableCoinCapabilities,
	): Promise<TransactionResponse> {
		try {
			const contractId = coin.coin.proxyAddress?.value;
			const evmAddress = coin.coin.evmProxyAddress?.value;
			if (!contractId) {
				throw new Error(
					`StableCoin ${coin.coin.name} does not have a proxy address`,
				);
			}

			const iface = TransactionHelpers.getFacetInterface('ReserveFacet');
			return await (this.adapter as any).executeContractCall(
				contractId,
				iface,
				'getReserveAmount',
				[],
				TransactionHelpers.getGasLimit('GET_RESERVE_AMOUNT'),
				TransactionType.RECORD,
				undefined,
				undefined,
				evmAddress,
			);
		} catch (error) {
			LogService.logError(error);
			throw new SigningError(
				`Unexpected error in getReserveAmount(): ${error}`,
			);
		}
	}

	async updateReserveAmount(
		reserveAddress: any,
		amount: BigDecimal,
		startDate?: string,
	): Promise<TransactionResponse> {
		try {
			const evm = await this.adapter.getEVMAddress(reserveAddress);
			const iface =
				TransactionHelpers.getFacetInterface('HederaReserveFacet');

			return await (this.adapter as any).executeContractCall(
				evm,
				iface,
				'setAmount',
				[amount.toBigInt()],
				TransactionHelpers.getGasLimit('UPDATE_RESERVE_AMOUNT'),
				undefined,
				startDate,
				undefined,
			);
		} catch (error) {
			LogService.logError(error);
			throw new SigningError(
				`Unexpected error in updateReserveAmount(): ${error}`,
			);
		}
	}
}
