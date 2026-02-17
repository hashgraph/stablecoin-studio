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
import { HederaId } from '../../../../domain/context/shared/HederaId';
import BigDecimal from '../../../../domain/context/shared/BigDecimal';
import LogService from '../../../../app/service/LogService';
import { SigningError } from '../../hs/error/SigningError';
import { ethers } from 'ethers';
import { HoldManagementFacet__factory } from '@hashgraph/stablecoin-npm-contracts';
import {
	CREATE_HOLD_GAS,
	EXECUTE_HOLD_GAS,
	RELEASE_HOLD_GAS,
	RECLAIM_HOLD_GAS,
	EVM_ZERO_ADDRESS,
} from '../../../../core/Constants';
import type { BaseHederaTransactionAdapter } from '../../hs/BaseHederaTransactionAdapter';

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
				: EVM_ZERO_ADDRESS;

			const hold = {
				amount: amount.toBigInt(),
				expirationTimestamp: expirationDate.toBigInt(),
				escrow: evmEscrow,
				to: evmTo,
				data: '0x',
			};

			const iface = new ethers.Interface(
				HoldManagementFacet__factory.abi,
			);
			const params = [hold];
			return await this.adapter.executeContractCall(
				contractId,
				iface,
				'createHold',
				params,
				CREATE_HOLD_GAS,
				undefined,
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
				: EVM_ZERO_ADDRESS;

			const iface = new ethers.Interface(
				HoldManagementFacet__factory.abi,
			);
			const params = [holdIdentifier, targetId, amount.toBigInt()];
			return await this.adapter.executeContractCall(
				contractId,
				iface,
				'executeHold',
				params,
				EXECUTE_HOLD_GAS,
				undefined,
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

			const iface = new ethers.Interface(
				HoldManagementFacet__factory.abi,
			);
			const params = [holdIdentifier, amount.toBigInt()];
			return await this.adapter.executeContractCall(
				contractId,
				iface,
				'releaseHold',
				params,
				RELEASE_HOLD_GAS,
				undefined,
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

			const iface = new ethers.Interface(
				HoldManagementFacet__factory.abi,
			);
			const params = [holdIdentifier];
			return await this.adapter.executeContractCall(
				contractId,
				iface,
				'reclaimHold',
				params,
				RECLAIM_HOLD_GAS,
				undefined,
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
