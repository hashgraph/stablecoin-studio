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
import { HasRoleCommand } from '../../app/usecase/command/stablecoin/roles/hasRole/HasRoleCommand.js';
import { HederaId } from '../../domain/context/shared/HederaId.js';
import { GrantRoleCommand } from '../../app/usecase/command/stablecoin/roles/grantRole/GrantRoleCommand.js';
import { RevokeRoleCommand } from '../../app/usecase/command/stablecoin/roles/revokeRole/RevokeRoleCommand.js';
import { GetRolesCommand } from '../../app/usecase/command/stablecoin/roles/getRoles/GetRolesCommand.js';
import { GetAllowanceCommand } from '../../app/usecase/command/stablecoin/roles/getAllowance/GetAllowanceCommand.js';
import { ResetAllowanceCommand } from '../../app/usecase/command/stablecoin/roles/resetAllowance/ResetAllowanceCommand.js';
import { IncreaseAllowanceCommand } from '../../app/usecase/command/stablecoin/roles/increaseAllowance/IncreaseAllowanceCommand.js';
import { DecreaseAllowanceCommand } from '../../app/usecase/command/stablecoin/roles/decreaseAllowance/DecreaseAllowanceCommand.js';
import { IsUnlimitedCommand } from '../../app/usecase/command/stablecoin/roles/isUnlimited/IsUnlimitedCommand.js';
import {
	StableCoinRole,
	StableCoinRoleLabel,
} from '../../domain/context/stablecoin/StableCoinRole.js';
import { GrantSupplierRoleCommand } from '../../app/usecase/command/stablecoin/roles/grantSupplierRole/GrantSupplierRoleCommand.js';
import { GrantUnlimitedSupplierRoleCommand } from '../../app/usecase/command/stablecoin/roles/granUnlimitedSupplierRole/GrantUnlimitedSupplierRoleCommand.js';
import { RevokeSupplierRoleCommand } from '../../app/usecase/command/stablecoin/roles/revokeSupplierRole/RevokeSupplierRoleCommand.js';
import { handleValidation } from './Common.js';
import { Balance } from '../../domain/context/stablecoin/Balance.js';

export { StableCoinRole, StableCoinRoleLabel };

interface IRole {
	hasRole(request: HasRoleRequest): Promise<boolean>;
	grantRole(request: GrantRoleRequest): Promise<boolean>;
	revokeRole(request: RevokeRoleRequest): Promise<boolean>;
	getRoles(request: GetRolesRequest): Promise<string[]>;
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
		private readonly commandBus: CommandBus = Injectable.resolve(
			CommandBus,
		),
	) {}

	async hasRole(request: HasRoleRequest): Promise<boolean> {
		const { tokenId, targetId, role } = request;
		handleValidation('HasRoleRequest', request);
		return (
			await this.commandBus.execute(
				new HasRoleCommand(
					role!,
					HederaId.from(targetId),
					HederaId.from(tokenId),
				),
			)
		).payload;
	}

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

	async getRoles(request: GetRolesRequest): Promise<string[]> {
		const { tokenId, targetId } = request;
		handleValidation('GetRolesRequest', request);

		return (
			await this.commandBus.execute(
				new GetRolesCommand(
					HederaId.from(targetId),
					HederaId.from(tokenId),
				),
			)
		).payload;
	}

	async getAllowance(request: GetSupplierAllowanceRequest): Promise<Balance> {
		const { tokenId, targetId } = request;
		handleValidation('GetSupplierAllowanceRequest', request);

		const res = await this.commandBus.execute(
			new GetAllowanceCommand(
				HederaId.from(targetId),
				HederaId.from(tokenId),
			),
		);

		return new Balance(res.payload);
	}

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

	async isLimited(request: CheckSupplierLimitRequest): Promise<boolean> {
		const { tokenId, targetId } = request;
		handleValidation('CheckSupplierLimitRequest', request);
		const hasRole = (
			await this.commandBus.execute(
				new HasRoleCommand(
					StableCoinRole.CASHIN_ROLE,
					HederaId.from(targetId),
					HederaId.from(tokenId),
				),
			)
		).payload;
		const unlimited = (
			await this.commandBus.execute(
				new IsUnlimitedCommand(
					HederaId.from(targetId),
					HederaId.from(tokenId),
				),
			)
		).payload;
		return hasRole && !unlimited;
	}

	async isUnlimited(request: CheckSupplierLimitRequest): Promise<boolean> {
		const { tokenId, targetId } = request;
		handleValidation('CheckSupplierLimitRequest', request);
		return (
			await this.commandBus.execute(
				new IsUnlimitedCommand(
					HederaId.from(targetId),
					HederaId.from(tokenId),
				),
			)
		).payload;
	}
}

const Role = new RoleInPort();
export default Role;
