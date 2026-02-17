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
import LogService from '../../../../app/service/LogService';
import { SigningError } from '../../hs/error/SigningError';
import { ethers } from 'ethers';
import {
	RolesFacet__factory,
	HederaTokenManagerFacet__factory,
	SupplierAdminFacet__factory,
} from '@hashgraph/stablecoin-npm-contracts';
import {
	HAS_ROLE_GAS,
	GET_ROLES_GAS,
	BALANCE_OF_GAS,
	IS_UNLIMITED_ALLOWANCE_GAS,
	GET_SUPPLY_ALLOWANCE_GAS,
} from '../../../../core/Constants';
import type { BaseHederaTransactionAdapter } from '../../hs/BaseHederaTransactionAdapter';
import { StableCoinRole } from '../../../../domain/context/stablecoin/StableCoinRole';
import { TransactionType } from '../../TransactionResponseEnums';

export class QueryOperations {
	constructor(private adapter: BaseHederaTransactionAdapter) {}

	async hasRole(
		coin: StableCoinCapabilities,
		targetId: HederaId,
		role: StableCoinRole,
	): Promise<TransactionResponse> {
		try {
			const targetEvm = await this.adapter.getEVMAddress(targetId);
			const contractId = coin.coin.proxyAddress?.value;
			if (!contractId) {
				throw new Error(
					`StableCoin ${coin.coin.name} does not have a proxy address`,
				);
			}

			const iface = new ethers.Interface(RolesFacet__factory.abi);
			return await this.adapter.executeContractCall(
				contractId,
				iface,
				'hasRole',
				[role, targetEvm],
				HAS_ROLE_GAS,
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

			const iface = new ethers.Interface(RolesFacet__factory.abi);
			return await this.adapter.executeContractCall(
				contractId,
				iface,
				'getRoles',
				[targetEvm],
				GET_ROLES_GAS,
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

			const iface = new ethers.Interface(
				HederaTokenManagerFacet__factory.abi,
			);
			return await this.adapter.executeContractCall(
				contractId,
				iface,
				'balanceOf',
				[targetEvm],
				BALANCE_OF_GAS,
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

			const iface = new ethers.Interface(SupplierAdminFacet__factory.abi);
			return await this.adapter.executeContractCall(
				contractId,
				iface,
				'isUnlimitedSupplierAllowance',
				[targetEvm],
				IS_UNLIMITED_ALLOWANCE_GAS,
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

			const iface = new ethers.Interface(SupplierAdminFacet__factory.abi);
			return await this.adapter.executeContractCall(
				contractId,
				iface,
				'getSupplierAllowance',
				[targetEvm],
				GET_SUPPLY_ALLOWANCE_GAS,
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
