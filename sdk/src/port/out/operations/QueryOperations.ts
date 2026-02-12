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
import LogService from '../../../app/service/LogService';
import { SigningError } from '../hs/error/SigningError';
import { TransactionHelpers } from './TransactionHelpers';
import type { BaseHederaTransactionAdapter } from '../BaseHederaTransactionAdapter';
import { TransactionType } from '../TransactionResponseEnums';

/**
 * Query operations: hasRole, getRoles, balanceOf, supplierAllowance, isUnlimitedSupplierAllowance
 */
export class QueryOperations {
	constructor(private adapter: BaseHederaTransactionAdapter) {}

	async hasRole(
		coin: StableCoinCapabilities,
		targetId: HederaId,
		role: any,
	): Promise<TransactionResponse> {
		try {
			const targetEvm = await this.adapter.getEVMAddress(targetId);
			const contractId = coin.coin.proxyAddress?.value;
			if (!contractId) {
				throw new Error(
					`StableCoin ${coin.coin.name} does not have a proxy address`,
				);
			}

			return await (this.adapter as any).executeContractCall(
				contractId,
				TransactionHelpers.getFacetInterface('RolesFacet'),
				'hasRole',
				[role, targetEvm],
				TransactionHelpers.getGasLimit('HAS_ROLE'),
				TransactionType.RECORD,
				undefined,
				undefined,
				coin.coin.evmProxyAddress?.value,
			);
		} catch (error) {
			LogService.logError(error);
			throw new SigningError(`Unexpected error in hasRole(): ${error}`);
		}
	}

	async getRoles(
		coin: StableCoinCapabilities,
		targetId: HederaId,
	): Promise<TransactionResponse> {
		try {
			const targetEvm = await this.adapter.getEVMAddress(targetId);
			const contractId = coin.coin.proxyAddress?.value;
			if (!contractId) {
				throw new Error(
					`StableCoin ${coin.coin.name} does not have a proxy address`,
				);
			}

			return await (this.adapter as any).executeContractCall(
				contractId,
				TransactionHelpers.getFacetInterface('RolesFacet'),
				'getRoles',
				[targetEvm],
				TransactionHelpers.getGasLimit('GET_ROLES'),
				TransactionType.RECORD,
				undefined,
				undefined,
				coin.coin.evmProxyAddress?.value,
			);
		} catch (error) {
			LogService.logError(error);
			throw new SigningError(`Unexpected error in getRoles(): ${error}`);
		}
	}

	async balanceOf(
		coin: StableCoinCapabilities,
		targetId: HederaId,
	): Promise<TransactionResponse> {
		try {
			const targetEvm = await this.adapter.getEVMAddress(targetId);
			const contractId = coin.coin.proxyAddress?.value;
			if (!contractId) {
				throw new Error(
					`StableCoin ${coin.coin.name} does not have a proxy address`,
				);
			}

			return await (this.adapter as any).executeContractCall(
				contractId,
				TransactionHelpers.getFacetInterface('HederaTokenManagerFacet'),
				'balanceOf',
				[targetEvm],
				TransactionHelpers.getGasLimit('BALANCE_OF'),
				TransactionType.RECORD,
				undefined,
				undefined,
				coin.coin.evmProxyAddress?.value,
			);
		} catch (error) {
			LogService.logError(error);
			throw new SigningError(`Unexpected error in balanceOf(): ${error}`);
		}
	}

	async isUnlimitedSupplierAllowance(
		coin: StableCoinCapabilities,
		targetId: HederaId,
	): Promise<TransactionResponse> {
		try {
			const targetEvm = await this.adapter.getEVMAddress(targetId);
			const contractId = coin.coin.proxyAddress?.value;
			if (!contractId) {
				throw new Error(
					`StableCoin ${coin.coin.name} does not have a proxy address`,
				);
			}

			return await (this.adapter as any).executeContractCall(
				contractId,
				TransactionHelpers.getFacetInterface('SupplierAdminFacet'),
				'isUnlimitedSupplierAllowance',
				[targetEvm],
				TransactionHelpers.getGasLimit('IS_UNLIMITED_ALLOWANCE'),
				TransactionType.RECORD,
				undefined,
				undefined,
				coin.coin.evmProxyAddress?.value,
			);
		} catch (error) {
			LogService.logError(error);
			throw new SigningError(
				`Unexpected error in isUnlimitedSupplierAllowance(): ${error}`,
			);
		}
	}

	async supplierAllowance(
		coin: StableCoinCapabilities,
		targetId: HederaId,
	): Promise<TransactionResponse> {
		try {
			const targetEvm = await this.adapter.getEVMAddress(targetId);
			const contractId = coin.coin.proxyAddress?.value;
			if (!contractId) {
				throw new Error(
					`StableCoin ${coin.coin.name} does not have a proxy address`,
				);
			}

			return await (this.adapter as any).executeContractCall(
				contractId,
				TransactionHelpers.getFacetInterface('SupplierAdminFacet'),
				'getSupplierAllowance',
				[targetEvm],
				TransactionHelpers.getGasLimit('GET_SUPPLY_ALLOWANCE'),
				TransactionType.RECORD,
				undefined,
				undefined,
				coin.coin.evmProxyAddress?.value,
			);
		} catch (error) {
			LogService.logError(error);
			throw new SigningError(
				`Unexpected error in supplierAllowance(): ${error}`,
			);
		}
	}
}
