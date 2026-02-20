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
import {
	RolesFacet__factory,
	RoleManagementFacet__factory,
} from '@hashgraph/stablecoin-npm-contracts';
import {
	GRANT_ROLES_GAS,
	REVOKE_ROLES_GAS,
	MAX_ROLES_GAS,
} from '../../../../core/Constants';
import { StableCoinRole } from '../../../../domain/context/stablecoin/StableCoinRole';
import type { TransactionExecutor } from '../TransactionExecutor';
import type { EvmAddressResolver } from '../EvmAddressResolver';

export class RoleOperations {
	constructor(
		private executor: TransactionExecutor,
		private evmResolver: EvmAddressResolver,
	) {}

	async grantRole(
		coin: StableCoinCapabilities,
		targetId: HederaId,
		role: StableCoinRole,
	): Promise<TransactionResponse> {
		try {
			const contractId = coin.coin.proxyAddress?.value;
			const evmAddress = coin.coin.evmProxyAddress?.value;
			if (!contractId) {
				throw new Error(
					`StableCoin ${coin.coin.name} does not have a proxy address`,
				);
			}

			const iface = new ethers.Interface(RolesFacet__factory.abi);
			const params = [role, await this.evmResolver.resolve(targetId)];
			return await this.executor.executeContractCall(
				contractId,
				iface,
				'grantRole',
				params,
				GRANT_ROLES_GAS,
				undefined,
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
		role: StableCoinRole,
	): Promise<TransactionResponse> {
		try {
			const contractId = coin.coin.proxyAddress?.value;
			const evmAddress = coin.coin.evmProxyAddress?.value;
			if (!contractId) {
				throw new Error(
					`StableCoin ${coin.coin.name} does not have a proxy address`,
				);
			}

			const iface = new ethers.Interface(RolesFacet__factory.abi);
			const params = [role, await this.evmResolver.resolve(targetId)];
			return await this.executor.executeContractCall(
				contractId,
				iface,
				'revokeRole',
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
				`Unexpected error in revokeRole(): ${error}`,
			);
		}
	}

	async grantRoles(
		coin: StableCoinCapabilities,
		targetsId: HederaId[],
		roles: StableCoinRole[],
		amounts: BigDecimal[],
	): Promise<TransactionResponse> {
		try {
			const accounts: string[] = [];
			for (const id of targetsId)
				accounts.push(await this.evmResolver.resolve(id));
			const amountsFormatted = amounts.map((a) => a.toBigInt());

			const contractId = coin.coin.proxyAddress?.value;
			const evmAddress = coin.coin.evmProxyAddress?.value;
			if (!contractId) {
				throw new Error(
					`StableCoin ${coin.coin.name} does not have a proxy address`,
				);
			}

			let gas = targetsId.length * roles.length * GRANT_ROLES_GAS;
			const maxRolesGas = MAX_ROLES_GAS;
			gas = gas > maxRolesGas ? maxRolesGas : gas;

			return await this.executor.executeContractCall(
				contractId,
				new ethers.Interface(RoleManagementFacet__factory.abi),
				'grantRoles',
				[roles, accounts, amountsFormatted],
				gas,
				undefined,
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
		roles: StableCoinRole[],
	): Promise<TransactionResponse> {
		try {
			const accounts: string[] = [];
			for (const id of targetsId)
				accounts.push(await this.evmResolver.resolve(id));

			const contractId = coin.coin.proxyAddress?.value;
			const evmAddress = coin.coin.evmProxyAddress?.value;
			if (!contractId) {
				throw new Error(
					`StableCoin ${coin.coin.name} does not have a proxy address`,
				);
			}

			let gas = targetsId.length * roles.length * REVOKE_ROLES_GAS;
			const maxRolesGas = MAX_ROLES_GAS;
			gas = gas > maxRolesGas ? maxRolesGas : gas;

			return await this.executor.executeContractCall(
				contractId,
				new ethers.Interface(RoleManagementFacet__factory.abi),
				'revokeRoles',
				[roles, accounts],
				gas,
				undefined,
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
