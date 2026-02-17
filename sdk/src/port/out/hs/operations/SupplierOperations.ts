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
import { SupplierAdminFacet__factory } from '@hashgraph/stablecoin-npm-contracts';
import {
	GRANT_ROLES_GAS,
	REVOKE_ROLES_GAS,
	INCREASE_SUPPLY_GAS,
	DECREASE_SUPPLY_GAS,
	RESET_SUPPLY_GAS,
} from '../../../../core/Constants';
import type { BaseHederaTransactionAdapter } from '../../hs/BaseHederaTransactionAdapter';

/**
 * Supplier role management operations
 */
export class SupplierOperations {
	constructor(private adapter: BaseHederaTransactionAdapter) {}

	async grantSupplierRole(
		coin: StableCoinCapabilities,
		targetId: HederaId,
		amount: BigDecimal,
	): Promise<TransactionResponse> {
		try {
			const contractId = coin.coin.proxyAddress?.value;
			const evmAddress = coin.coin.evmProxyAddress?.value;
			if (!contractId) {
				throw new Error(
					`StableCoin ${coin.coin.name} does not have a proxy address`,
				);
			}

			const iface = new ethers.Interface(SupplierAdminFacet__factory.abi);
			const params = [
				await this.adapter.getEVMAddress(targetId),
				amount.toBigInt(),
			];
			return await this.adapter.executeContractCall(
				contractId,
				iface,
				'grantSupplierRole',
				params,
				GRANT_ROLES_GAS,
				undefined,
				undefined,
				undefined,
				evmAddress,
			);
		} catch (error) {
			LogService.logError(error);
			throw new SigningError(
				`Unexpected error in grantSupplierRole(): ${error}`,
			);
		}
	}

	async grantUnlimitedSupplierRole(
		coin: StableCoinCapabilities,
		targetId: HederaId,
	): Promise<TransactionResponse> {
		try {
			const contractId = coin.coin.proxyAddress?.value;
			const evmAddress = coin.coin.evmProxyAddress?.value;
			if (!contractId) {
				throw new Error(
					`StableCoin ${coin.coin.name} does not have a proxy address`,
				);
			}

			const iface = new ethers.Interface(SupplierAdminFacet__factory.abi);
			const params = [await this.adapter.getEVMAddress(targetId)];
			return await this.adapter.executeContractCall(
				contractId,
				iface,
				'grantUnlimitedSupplierRole',
				params,
				GRANT_ROLES_GAS,
				undefined,
				undefined,
				undefined,
				evmAddress,
			);
		} catch (error) {
			LogService.logError(error);
			throw new SigningError(
				`Unexpected error in grantUnlimitedSupplierRole(): ${error}`,
			);
		}
	}

	async revokeSupplierRole(
		coin: StableCoinCapabilities,
		targetId: HederaId,
	): Promise<TransactionResponse> {
		try {
			const contractId = coin.coin.proxyAddress?.value;
			const evmAddress = coin.coin.evmProxyAddress?.value;
			if (!contractId) {
				throw new Error(
					`StableCoin ${coin.coin.name} does not have a proxy address`,
				);
			}

			const iface = new ethers.Interface(SupplierAdminFacet__factory.abi);
			const params = [await this.adapter.getEVMAddress(targetId)];
			return await this.adapter.executeContractCall(
				contractId,
				iface,
				'revokeSupplierRole',
				params,
				REVOKE_ROLES_GAS,
				undefined,
				undefined,
				undefined,
				evmAddress,
			);
		} catch (error) {
			LogService.logError(error);
			throw new SigningError(
				`Unexpected error in revokeSupplierRole(): ${error}`,
			);
		}
	}

	async increaseSupplierAllowance(
		coin: StableCoinCapabilities,
		targetId: HederaId,
		amount: BigDecimal,
	): Promise<TransactionResponse> {
		try {
			const contractId = coin.coin.proxyAddress?.value;
			const evmAddress = coin.coin.evmProxyAddress?.value;
			if (!contractId) {
				throw new Error(
					`StableCoin ${coin.coin.name} does not have a proxy address`,
				);
			}

			const iface = new ethers.Interface(SupplierAdminFacet__factory.abi);
			const params = [
				await this.adapter.getEVMAddress(targetId),
				amount.toBigInt(),
			];
			return await this.adapter.executeContractCall(
				contractId,
				iface,
				'increaseSupplierAllowance',
				params,
				INCREASE_SUPPLY_GAS,
				undefined,
				undefined,
				undefined,
				evmAddress,
			);
		} catch (error) {
			LogService.logError(error);
			throw new SigningError(
				`Unexpected error in increaseSupplierAllowance(): ${error}`,
			);
		}
	}

	async decreaseSupplierAllowance(
		coin: StableCoinCapabilities,
		targetId: HederaId,
		amount: BigDecimal,
	): Promise<TransactionResponse> {
		try {
			const contractId = coin.coin.proxyAddress?.value;
			const evmAddress = coin.coin.evmProxyAddress?.value;
			if (!contractId) {
				throw new Error(
					`StableCoin ${coin.coin.name} does not have a proxy address`,
				);
			}

			const iface = new ethers.Interface(SupplierAdminFacet__factory.abi);
			const params = [
				await this.adapter.getEVMAddress(targetId),
				amount.toBigInt(),
			];
			return await this.adapter.executeContractCall(
				contractId,
				iface,
				'decreaseSupplierAllowance',
				params,
				DECREASE_SUPPLY_GAS,
				undefined,
				undefined,
				undefined,
				evmAddress,
			);
		} catch (error) {
			LogService.logError(error);
			throw new SigningError(
				`Unexpected error in decreaseSupplierAllowance(): ${error}`,
			);
		}
	}

	async resetSupplierAllowance(
		coin: StableCoinCapabilities,
		targetId: HederaId,
	): Promise<TransactionResponse> {
		try {
			const contractId = coin.coin.proxyAddress?.value;
			const evmAddress = coin.coin.evmProxyAddress?.value;
			if (!contractId) {
				throw new Error(
					`StableCoin ${coin.coin.name} does not have a proxy address`,
				);
			}

			const iface = new ethers.Interface(SupplierAdminFacet__factory.abi);
			const params = [await this.adapter.getEVMAddress(targetId)];
			return await this.adapter.executeContractCall(
				contractId,
				iface,
				'resetSupplierAllowance',
				params,
				RESET_SUPPLY_GAS,
				undefined,
				undefined,
				undefined,
				evmAddress,
			);
		} catch (error) {
			LogService.logError(error);
			throw new SigningError(
				`Unexpected error in resetSupplierAllowance(): ${error}`,
			);
		}
	}
}
