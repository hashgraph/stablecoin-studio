/*
 *
 * Hedera Stable Coin SDK
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

/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-non-null-assertion */
import Injectable from '../../core/Injectable.js';
import { QueryBus } from '../../core/query/QueryBus.js';
import { CommandBus } from '../../core/command/CommandBus.js';
import {
	GetRolesRequest,
	GrantRoleRequest,
	HasRoleRequest,
	RevokeRoleRequest,
} from './request/index.js';
import GetSupplierAllowanceRequest from './request/GetSupplierAllowanceRequest.js';
import ResetSupplierAllowanceRequest from './request/ResetSupplierAllowanceRequest.js';
import IncreaseSupplierAllowanceRequest from './request/IncreaseSupplierAllowanceRequest.js';
import DecreaseSupplierAllowanceRequest from './request/DecreaseSupplierAllowanceRequest.js';
import CheckSupplierLimitRequest from './request/CheckSupplierLimitRequest.js';
import { HasRoleQuery } from '../../app/usecase/query/stablecoin/roles/hasRole/HasRoleQuery.js';
import { HederaId } from '../../domain/context/shared/HederaId.js';
import { GrantRoleCommand } from '../../app/usecase/command/stablecoin/roles/grantRole/GrantRoleCommand.js';
import { RevokeRoleCommand } from '../../app/usecase/command/stablecoin/roles/revokeRole/RevokeRoleCommand.js';
import { GetRolesQuery } from '../../app/usecase/query/stablecoin/roles/getRoles/GetRolesQuery.js';
import { GetAllowanceQuery } from '../../app/usecase/query/stablecoin/roles/getAllowance/GetAllowanceQuery.js';
import { ResetAllowanceCommand } from '../../app/usecase/command/stablecoin/roles/resetAllowance/ResetAllowanceCommand.js';
import { IncreaseAllowanceCommand } from '../../app/usecase/command/stablecoin/roles/increaseAllowance/IncreaseAllowanceCommand.js';
import { DecreaseAllowanceCommand } from '../../app/usecase/command/stablecoin/roles/decreaseAllowance/DecreaseAllowanceCommand.js';
import {
	StableCoinRole,
	StableCoinRoleLabel,
	MAX_ACCOUNTS_ROLES,
} from '../../domain/context/stablecoin/StableCoinRole.js';
import { GrantSupplierRoleCommand } from '../../app/usecase/command/stablecoin/roles/grantSupplierRole/GrantSupplierRoleCommand.js';
import { GrantUnlimitedSupplierRoleCommand } from '../../app/usecase/command/stablecoin/roles/granUnlimitedSupplierRole/GrantUnlimitedSupplierRoleCommand.js';
import { RevokeSupplierRoleCommand } from '../../app/usecase/command/stablecoin/roles/revokeSupplierRole/RevokeSupplierRoleCommand.js';
import { handleValidation } from './Common.js';
import { Balance } from '../../domain/context/stablecoin/Balance.js';
import { IsUnlimitedQuery } from '../../app/usecase/query/stablecoin/isUnlimited/IsUnlimitedQuery.js';
import LogService from '../../app/service/LogService.js';
import { LogError } from '../../core/decorator/LogErrorDecorator.js';
import GrantMultiRolesRequest from './request/GrantMultiRolesRequest.js';
import RevokeMultiRolesRequest from './request/RevokeMultiRolesRequest.js';
import { GrantMultiRolesCommand } from '../../app/usecase/command/stablecoin/roles/grantMultiRoles/GrantMultiRolesCommand.js';
import { RevokeMultiRolesCommand } from '../../app/usecase/command/stablecoin/roles/revokeMultiRoles/RevokeMultiRolesCommand.js';
import GetAccountsWithRolesRequest from './request/GetAccountsWithRolesRequest.js';
import { GetAccountsWithRolesQuery } from '../../app/usecase/query/stablecoin/roles/getAccountsWithRole/GetAccountsWithRolesQuery.js';

export { StableCoinRole, StableCoinRoleLabel, MAX_ACCOUNTS_ROLES };

interface IRole {
	hasRole(request: HasRoleRequest): Promise<boolean>;
	grantRole(request: GrantRoleRequest): Promise<boolean>;
	revokeRole(request: RevokeRoleRequest): Promise<boolean>;
	grantMultiRoles(request: GrantMultiRolesRequest): Promise<boolean>;
	revokeMultiRoles(request: RevokeMultiRolesRequest): Promise<boolean>;
	getRoles(request: GetRolesRequest): Promise<string[]>;
	getAccountsWithRole(
		request: GetAccountsWithRolesRequest,
	): Promise<string[]>;
	//Supplier
	getAllowance(request: GetSupplierAllowanceRequest): Promise<Balance>;
	resetAllowance(request: ResetSupplierAllowanceRequest): Promise<boolean>;
	increaseAllowance(
		request: IncreaseSupplierAllowanceRequest,
	): Promise<boolean>;
	decreaseAllowance(
		request: DecreaseSupplierAllowanceRequest,
	): Promise<boolean>;
	isLimited(request: CheckSupplierLimitRequest): Promise<boolean>;
	isUnlimited(request: CheckSupplierLimitRequest): Promise<boolean>;
}

class RoleInPort implements IRole {
	constructor(
		private readonly queryBus: QueryBus = Injectable.resolve(QueryBus),
		private readonly commandBus: CommandBus = Injectable.resolve(
			CommandBus,
		),
	) {}

	@LogError
	async hasRole(request: HasRoleRequest): Promise<boolean> {
		const { tokenId, targetId, role } = request;
		handleValidation('HasRoleRequest', request);
		return (
			await this.queryBus.execute(
				new HasRoleQuery(
					role!,
					HederaId.from(targetId),
					HederaId.from(tokenId),
				),
			)
		).payload;
	}

	@LogError
	async grantRole(request: GrantRoleRequest): Promise<boolean> {
		const { tokenId, targetId, role, supplierType, amount } = request;
		handleValidation('GrantRoleRequest', request);

		if (role === StableCoinRole.CASHIN_ROLE) {
			if (supplierType == 'limited') {
				return (
					await this.commandBus.execute(
						new GrantSupplierRoleCommand(
							HederaId.from(targetId),
							HederaId.from(tokenId),
							amount!,
						),
					)
				).payload;
			} else {
				return (
					await this.commandBus.execute(
						new GrantUnlimitedSupplierRoleCommand(
							HederaId.from(targetId),
							HederaId.from(tokenId),
						),
					)
				).payload;
			}
		} else {
			return (
				await this.commandBus.execute(
					new GrantRoleCommand(
						role!,
						HederaId.from(targetId),
						HederaId.from(tokenId),
					),
				)
			).payload;
		}
	}

	@LogError
	async revokeRole(request: RevokeRoleRequest): Promise<boolean> {
		const { tokenId, targetId, role } = request;
		handleValidation('HasRoleRequest', request);

		if (role === StableCoinRole.CASHIN_ROLE) {
			return (
				await this.commandBus.execute(
					new RevokeSupplierRoleCommand(
						HederaId.from(targetId),
						HederaId.from(tokenId),
					),
				)
			).payload;
		} else {
			return (
				await this.commandBus.execute(
					new RevokeRoleCommand(
						role!,
						HederaId.from(targetId),
						HederaId.from(tokenId),
					),
				)
			).payload;
		}
	}

	@LogError
	async grantMultiRoles(request: GrantMultiRolesRequest): Promise<boolean> {
		const { tokenId, targetsId, roles, amounts } = request;
		handleValidation('GrantMultiRolesRequest', request);

		const targetsIdHederaIds: HederaId[] = [];
		targetsId.forEach((targetId) => {
			targetsIdHederaIds.push(HederaId.from(targetId));
		});

		return (
			await this.commandBus.execute(
				new GrantMultiRolesCommand(
					roles,
					targetsIdHederaIds,
					amounts ?? [],
					HederaId.from(tokenId),
				),
			)
		).payload;
	}

	@LogError
	async revokeMultiRoles(request: RevokeMultiRolesRequest): Promise<boolean> {
		const { tokenId, targetsId, roles } = request;
		handleValidation('HasRoleRequest', request);

		const targetsIdHederaIds: HederaId[] = [];
		targetsId.forEach((targetId) => {
			targetsIdHederaIds.push(HederaId.from(targetId));
		});

		return (
			await this.commandBus.execute(
				new RevokeMultiRolesCommand(
					roles,
					targetsIdHederaIds,
					HederaId.from(tokenId),
				),
			)
		).payload;
	}

	@LogError
	async getRoles(request: GetRolesRequest): Promise<string[]> {
		const { tokenId, targetId } = request;
		handleValidation('GetRolesRequest', request);

		return (
			await this.queryBus.execute(
				new GetRolesQuery(
					HederaId.from(targetId),
					HederaId.from(tokenId),
				),
			)
		).payload;
	}
	@LogError
	async getAccountsWithRole(
		request: GetAccountsWithRolesRequest,
	): Promise<string[]> {
		const { roleId, tokenId } = request;
		handleValidation('GetAccountsWithRolesRequest', request);

		return (
			await this.queryBus.execute(
				new GetAccountsWithRolesQuery(roleId, tokenId),
			)
		).payload;
	}

	@LogError
	async getAllowance(request: GetSupplierAllowanceRequest): Promise<Balance> {
		const { tokenId, targetId } = request;
		handleValidation('GetSupplierAllowanceRequest', request);

		const res = await this.queryBus.execute(
			new GetAllowanceQuery(
				HederaId.from(targetId),
				HederaId.from(tokenId),
			),
		);

		return new Balance(res.payload);
	}

	@LogError
	async resetAllowance(
		request: ResetSupplierAllowanceRequest,
	): Promise<boolean> {
		const { tokenId, targetId } = request;
		handleValidation('ResetSupplierAllowanceRequest', request);

		return (
			await this.commandBus.execute(
				new ResetAllowanceCommand(
					HederaId.from(targetId),
					HederaId.from(tokenId),
				),
			)
		).payload;
	}

	@LogError
	async increaseAllowance(
		request: IncreaseSupplierAllowanceRequest,
	): Promise<boolean> {
		const { tokenId, amount, targetId } = request;
		handleValidation('IncreaseSupplierAllowanceRequest', request);

		return (
			await this.commandBus.execute(
				new IncreaseAllowanceCommand(
					amount,
					HederaId.from(targetId),
					HederaId.from(tokenId),
				),
			)
		).payload;
	}

	@LogError
	async decreaseAllowance(
		request: DecreaseSupplierAllowanceRequest,
	): Promise<boolean> {
		const { tokenId, amount, targetId } = request;
		handleValidation('DecreaseSupplierAllowanceRequest', request);

		return (
			await this.commandBus.execute(
				new DecreaseAllowanceCommand(
					amount,
					HederaId.from(targetId),
					HederaId.from(tokenId),
				),
			)
		).payload;
	}

	@LogError
	async isLimited(request: CheckSupplierLimitRequest): Promise<boolean> {
		const { tokenId, targetId } = request;
		handleValidation('CheckSupplierLimitRequest', request);
		const hasRole = (
			await this.queryBus.execute(
				new HasRoleQuery(
					StableCoinRole.CASHIN_ROLE,
					HederaId.from(targetId),
					HederaId.from(tokenId),
				),
			)
		).payload;
		const unlimited = (
			await this.queryBus.execute(
				new IsUnlimitedQuery(
					HederaId.from(targetId),
					HederaId.from(tokenId),
				),
			)
		).payload;
		return hasRole && !unlimited;
	}

	@LogError
	async isUnlimited(request: CheckSupplierLimitRequest): Promise<boolean> {
		const { tokenId, targetId } = request;
		handleValidation('CheckSupplierLimitRequest', request);
		return (
			await this.queryBus.execute(
				new IsUnlimitedQuery(
					HederaId.from(targetId),
					HederaId.from(tokenId),
				),
			)
		).payload;
	}
}

const Role = new RoleInPort();
export default Role;
