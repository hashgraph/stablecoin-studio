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
 * Role management operations: grantRole, revokeRole, grantRoles, revokeRoles
 */
export class RoleOperations {
	constructor(private adapter: BaseHederaTransactionAdapter) {}

	async grantRole(
		coin: StableCoinCapabilities,
		targetId: HederaId,
		role: any,
	): Promise<TransactionResponse> {
		try {
			CapabilityDecider.checkContractOperation(
				coin,
				Operation.GRANT_ROLE,
			);

			const contractId = coin.coin.proxyAddress?.value;
			const evmAddress = coin.coin.evmProxyAddress?.value;
			if (!contractId) {
				throw new Error(
					`StableCoin ${coin.coin.name} does not have a proxy address`,
				);
			}

			const iface = (this.adapter as any).getFacetInterface('RolesFacet');
			const params = [role, await this.adapter.getEVMAddress(targetId)];
			return await (this.adapter as any).executeContractCall(
				contractId,
				iface,
				'grantRole',
				params,
				TransactionHelpers.getGasLimit('GRANT_ROLES'),
				undefined,
				undefined,
				evmAddress,
			);
		} catch (error) {
			LogService.logError(error);
			throw new SigningError(`Unexpected error in grantRole(): ${error}`);
		}
	}

	async revokeRole(
		coin: StableCoinCapabilities,
		targetId: HederaId,
		role: any,
	): Promise<TransactionResponse> {
		try {
			CapabilityDecider.checkContractOperation(
				coin,
				Operation.REVOKE_ROLE,
			);

			const contractId = coin.coin.proxyAddress?.value;
			const evmAddress = coin.coin.evmProxyAddress?.value;
			if (!contractId) {
				throw new Error(
					`StableCoin ${coin.coin.name} does not have a proxy address`,
				);
			}

			const iface = (this.adapter as any).getFacetInterface('RolesFacet');
			const params = [role, await this.adapter.getEVMAddress(targetId)];
			return await (this.adapter as any).executeContractCall(
				contractId,
				iface,
				'revokeRole',
				params,
				TransactionHelpers.getGasLimit('REVOKE_ROLES'),
				undefined,
				undefined,
				evmAddress,
			);
		} catch (error) {
			LogService.logError(error);
			throw new SigningError(
				`Unexpected error in revokeRole(): ${error}`,
			);
		}
	}

	async grantRoles(
		coin: StableCoinCapabilities,
		targetsId: HederaId[],
		roles: any[],
		amounts: BigDecimal[],
	): Promise<TransactionResponse> {
		try {
			CapabilityDecider.checkContractOperation(
				coin,
				Operation.GRANT_ROLES,
			);

			const accounts: string[] = [];
			for (const id of targetsId)
				accounts.push(await this.adapter.getEVMAddress(id));
			const amountsFormatted = amounts.map((a) => a.toBigInt());

			const contractId = coin.coin.proxyAddress?.value;
			const evmAddress = coin.coin.evmProxyAddress?.value;

			let gas =
				targetsId.length *
				roles.length *
				TransactionHelpers.getGasLimit('GRANT_ROLES');
			const maxRolesGas = TransactionHelpers.getGasLimit('MAX_ROLES');
			gas = gas > maxRolesGas ? maxRolesGas : gas;

			return await (this.adapter as any).executeContractCall(
				contractId,
				TransactionHelpers.getFacetInterface('RoleManagementFacet'),
				'grantRoles',
				[roles, accounts, amountsFormatted],
				gas,
				undefined,
				undefined,
				evmAddress,
			);
		} catch (error) {
			LogService.logError(error);
			throw new SigningError(
				`Unexpected error in grantRoles(): ${error}`,
			);
		}
	}

	async revokeRoles(
		coin: StableCoinCapabilities,
		targetsId: HederaId[],
		roles: any[],
	): Promise<TransactionResponse> {
		try {
			CapabilityDecider.checkContractOperation(
				coin,
				Operation.REVOKE_ROLES,
			);

			const accounts: string[] = [];
			for (const id of targetsId)
				accounts.push(await this.adapter.getEVMAddress(id));

			const contractId = coin.coin.proxyAddress?.value;
			const evmAddress = coin.coin.evmProxyAddress?.value;

			let gas =
				targetsId.length *
				roles.length *
				TransactionHelpers.getGasLimit('REVOKE_ROLES');
			const maxRolesGas = TransactionHelpers.getGasLimit('MAX_ROLES');
			gas = gas > maxRolesGas ? maxRolesGas : gas;

			return await (this.adapter as any).executeContractCall(
				contractId,
				TransactionHelpers.getFacetInterface('RoleManagementFacet'),
				'revokeRoles',
				[roles, accounts],
				gas,
				undefined,
				undefined,
				evmAddress,
			);
		} catch (error) {
			LogService.logError(error);
			throw new SigningError(
				`Unexpected error in revokeRoles(): ${error}`,
			);
		}
	}
}
