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
			CapabilityDecider.checkContractOperation(
				coin,
				Operation.GRANT_SUPPLIER_ROLE,
			);

			const contractId = coin.coin.proxyAddress?.value;
			const evmAddress = coin.coin.evmProxyAddress?.value;
			if (!contractId) {
				throw new Error(
					`StableCoin ${coin.coin.name} does not have a proxy address`,
				);
			}

			const iface = (this.adapter as any).getFacetInterface(
				'SupplierAdminFacet',
			);
			const params = [
				await this.adapter.getEVMAddress(targetId),
				amount.toBigInt(),
			];
			return await (this.adapter as any).executeContractCall(
				contractId,
				iface,
				'grantSupplierRole',
				params,
				TransactionHelpers.getGasLimit('GRANT_ROLES'),
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
			CapabilityDecider.checkContractOperation(
				coin,
				Operation.GRANT_UNLIMITED_SUPPLIER_ROLE,
			);

			const contractId = coin.coin.proxyAddress?.value;
			const evmAddress = coin.coin.evmProxyAddress?.value;
			if (!contractId) {
				throw new Error(
					`StableCoin ${coin.coin.name} does not have a proxy address`,
				);
			}

			const iface = (this.adapter as any).getFacetInterface(
				'SupplierAdminFacet',
			);
			const params = [await this.adapter.getEVMAddress(targetId)];
			return await (this.adapter as any).executeContractCall(
				contractId,
				iface,
				'grantUnlimitedSupplierRole',
				params,
				TransactionHelpers.getGasLimit('GRANT_ROLES'),
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
			CapabilityDecider.checkContractOperation(
				coin,
				Operation.REVOKE_SUPPLIER_ROLE,
			);

			const contractId = coin.coin.proxyAddress?.value;
			const evmAddress = coin.coin.evmProxyAddress?.value;
			if (!contractId) {
				throw new Error(
					`StableCoin ${coin.coin.name} does not have a proxy address`,
				);
			}

			const iface = (this.adapter as any).getFacetInterface(
				'SupplierAdminFacet',
			);
			const params = [await this.adapter.getEVMAddress(targetId)];
			return await (this.adapter as any).executeContractCall(
				contractId,
				iface,
				'revokeSupplierRole',
				params,
				TransactionHelpers.getGasLimit('REVOKE_ROLES'),
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
			CapabilityDecider.checkContractOperation(
				coin,
				Operation.INCREASE_SUPPLIER_ALLOWANCE,
			);

			const contractId = coin.coin.proxyAddress?.value;
			const evmAddress = coin.coin.evmProxyAddress?.value;
			if (!contractId) {
				throw new Error(
					`StableCoin ${coin.coin.name} does not have a proxy address`,
				);
			}

			const iface = (this.adapter as any).getFacetInterface(
				'SupplierAdminFacet',
			);
			const params = [
				await this.adapter.getEVMAddress(targetId),
				amount.toBigInt(),
			];
			return await (this.adapter as any).executeContractCall(
				contractId,
				iface,
				'increaseSupplierAllowance',
				params,
				TransactionHelpers.getGasLimit('INCREASE_SUPPLY'),
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
			CapabilityDecider.checkContractOperation(
				coin,
				Operation.DECREASE_SUPPLIER_ALLOWANCE,
			);

			const contractId = coin.coin.proxyAddress?.value;
			const evmAddress = coin.coin.evmProxyAddress?.value;
			if (!contractId) {
				throw new Error(
					`StableCoin ${coin.coin.name} does not have a proxy address`,
				);
			}

			const iface = (this.adapter as any).getFacetInterface(
				'SupplierAdminFacet',
			);
			const params = [
				await this.adapter.getEVMAddress(targetId),
				amount.toBigInt(),
			];
			return await (this.adapter as any).executeContractCall(
				contractId,
				iface,
				'decreaseSupplierAllowance',
				params,
				TransactionHelpers.getGasLimit('DECREASE_SUPPLY'),
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
			CapabilityDecider.checkContractOperation(
				coin,
				Operation.RESET_SUPPLIER_ALLOWANCE,
			);

			const contractId = coin.coin.proxyAddress?.value;
			const evmAddress = coin.coin.evmProxyAddress?.value;
			if (!contractId) {
				throw new Error(
					`StableCoin ${coin.coin.name} does not have a proxy address`,
				);
			}

			const iface = (this.adapter as any).getFacetInterface(
				'SupplierAdminFacet',
			);
			const params = [await this.adapter.getEVMAddress(targetId)];
			return await (this.adapter as any).executeContractCall(
				contractId,
				iface,
				'resetSupplierAllowance',
				params,
				TransactionHelpers.getGasLimit('RESET_SUPPLY'),
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
