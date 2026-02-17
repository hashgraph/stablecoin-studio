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
import BigDecimal from '../../../../domain/context/shared/BigDecimal';
import LogService from '../../../../app/service/LogService';
import { SigningError } from '../../hs/error/SigningError';
import { ethers } from 'ethers';
import {
	ReserveFacet__factory,
	HederaReserveFacet__factory,
} from '@hashgraph/stablecoin-npm-contracts';
import {
	GET_RESERVE_ADDRESS_GAS,
	UPDATE_RESERVE_ADDRESS_GAS,
	GET_RESERVE_AMOUNT_GAS,
	UPDATE_RESERVE_AMOUNT_GAS,
} from '../../../../core/Constants';
import type { BaseHederaTransactionAdapter } from '../../hs/BaseHederaTransactionAdapter';
import { TransactionType } from '../../TransactionResponseEnums';
import ContractId from '../../../../domain/context/contract/ContractId';

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

			const iface = new ethers.Interface(ReserveFacet__factory.abi);
			return await this.adapter.executeContractCall(
				contractId,
				iface,
				'getReserveAddress',
				[],
				GET_RESERVE_ADDRESS_GAS,
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
		reserveAddress: ContractId,
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

			const evm = await this.adapter.getEVMAddress(reserveAddress);

			const iface = new ethers.Interface(ReserveFacet__factory.abi);
			const params = [evm];
			return await this.adapter.executeContractCall(
				contractId,
				iface,
				'updateReserveAddress',
				params,
				UPDATE_RESERVE_ADDRESS_GAS,
				undefined,
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

			const iface = new ethers.Interface(ReserveFacet__factory.abi);
			return await this.adapter.executeContractCall(
				contractId,
				iface,
				'getReserveAmount',
				[],
				GET_RESERVE_AMOUNT_GAS,
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
		reserveAddress: ContractId,
		amount: BigDecimal,
		startDate?: string,
	): Promise<TransactionResponse> {
		try {
			const evm = await this.adapter.getEVMAddress(reserveAddress);
			const iface = new ethers.Interface(HederaReserveFacet__factory.abi);

			return await this.adapter.executeContractCall(
				reserveAddress.toHederaAddress().toString(),
				iface,
				'setAmount',
				[amount.toBigInt()],
				UPDATE_RESERVE_AMOUNT_GAS,
				undefined,
				undefined,
				startDate,
				evm,
			);
		} catch (error) {
			LogService.logError(error);
			throw new SigningError(
				`Unexpected error in updateReserveAmount(): ${error}`,
			);
		}
	}
}
