/* eslint-disable @typescript-eslint/no-unused-vars */
import Injectable from '../../core/Injectable.js';
import NetworkService from '../../app/service/NetworkService.js';
import { QueryBus } from '../../core/query/QueryBus.js';
import { CommandBus } from '../../core/command/CommandBus.js';
import TransactionService from '../../app/service/TransactionService.js';
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
import BigDecimal from '../../domain/context/shared/BigDecimal.js';
import { DecreaseAllowanceCommand } from '../../app/usecase/command/stablecoin/roles/decreaseAllowance/DecreaseAllowanceCommand.js';
import { IsUnlimitedCommand } from '../../app/usecase/command/stablecoin/roles/isUnlimited/IsUnlimitedCommand.js';
import { StableCoinRole } from '../../domain/context/stablecoin/StableCoinRole.js';
import { GrantSupplierRoleCommand } from '../../app/usecase/command/stablecoin/roles/grantSupplierRole/GrantSupplierRoleCommand.js';
import { GrantUnlimitedSupplierRoleCommand } from '../../app/usecase/command/stablecoin/roles/granUnlimitedSupplierRole/GrantUnlimitedSupplierRoleCommand.js';
import { RevokeSupplierRoleCommand } from '../../app/usecase/command/stablecoin/roles/revokeSupplierRole/RevokeSupplierRoleCommand.js';

export { StableCoinRole };

interface IRole {
	hasRole(request: HasRoleRequest): Promise<boolean>;
	grantRole(request: GrantRoleRequest): Promise<boolean>;
	revokeRole(request: RevokeRoleRequest): Promise<boolean>;
	getRoles(request: GetRolesRequest): Promise<string[]>;

	supplier: {
		getAllowance(request: GetSupplierAllowanceRequest): Promise<BigDecimal>;
		resetAllowance(
			request: ResetSupplierAllowanceRequest,
		): Promise<boolean>;
		increaseAllowance(
			request: IncreaseSupplierAllowanceRequest,
		): Promise<boolean>;
		decreaseAllowance(
			request: DecreaseSupplierAllowanceRequest,
		): Promise<boolean>;
		isLimited(request: CheckSupplierLimitRequest): Promise<boolean>;
		isUnlimited(request: CheckSupplierLimitRequest): Promise<boolean>;
	};
}

class RoleInPort implements IRole {
	constructor(
		private readonly networkService: NetworkService = Injectable.resolve(
			NetworkService,
		),
		private readonly queryBus: QueryBus = Injectable.resolve(QueryBus),
		private readonly commandBus: CommandBus = Injectable.resolve(
			CommandBus,
		),
		private readonly transactionService: TransactionService = Injectable.resolve(
			TransactionService,
		),
	) {}

	async hasRole(request: HasRoleRequest): Promise<boolean> {
		const { tokenId, targetId, role } = request;
		const validation = request.validate();

		if (validation.length > 0) throw new Error('validation error');

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
		const validation = request.validate();

		if (validation.length > 0) throw new Error('validation error');

		if (role === StableCoinRole.CASHIN_ROLE) {
			if (supplierType == 'limited') {
				return (
					await this.commandBus.execute(
						new GrantSupplierRoleCommand(
							HederaId.from(targetId),
							HederaId.from(tokenId),
							BigDecimal.fromString(amount!),
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
		const validation = request.validate();

		if (validation.length > 0) throw new Error('validation error');

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
		const validation = request.validate();

		if (validation.length > 0) throw new Error('validation error');

		return (
			await this.commandBus.execute(
				new GetRolesCommand(
					HederaId.from(targetId),
					HederaId.from(tokenId),
				),
			)
		).payload;
	}

	supplier: {
		getAllowance(request: GetSupplierAllowanceRequest): Promise<BigDecimal>;
		resetAllowance(
			request: ResetSupplierAllowanceRequest,
		): Promise<boolean>;
		increaseAllowance(
			request: IncreaseSupplierAllowanceRequest,
		): Promise<boolean>;
		decreaseAllowance(
			request: DecreaseSupplierAllowanceRequest,
		): Promise<boolean>;
		isLimited(request: CheckSupplierLimitRequest): Promise<boolean>;
		isUnlimited(request: CheckSupplierLimitRequest): Promise<boolean>;
	} = {
		async getAllowance(
			request: GetSupplierAllowanceRequest,
		): Promise<BigDecimal> {
			const { tokenId, targetId } = request;
			const validation = request.validate();

			if (validation.length > 0) throw new Error('validation error');

			return (
				await super.commandBus.execute(
					new GetAllowanceCommand(
						HederaId.from(targetId),
						HederaId.from(tokenId),
					),
				)
			).payload;
		},

		async resetAllowance(
			request: ResetSupplierAllowanceRequest,
		): Promise<boolean> {
			const { tokenId, targetId } = request;
			const validation = request.validate();

			if (validation.length > 0) return false;

			return (
				await super.commandBus.execute(
					new ResetAllowanceCommand(
						HederaId.from(targetId),
						HederaId.from(tokenId),
					),
				)
			).payload;
		},

		async increaseAllowance(
			request: IncreaseSupplierAllowanceRequest,
		): Promise<boolean> {
			const { tokenId, amount, targetId } = request;
			const validation = request.validate();

			if (validation.length > 0) throw new Error('validation error');

			return (
				await super.commandBus.execute(
					new IncreaseAllowanceCommand(
						BigDecimal.fromString(amount),
						HederaId.from(targetId),
						HederaId.from(tokenId),
					),
				)
			).payload;
		},

		async decreaseAllowance(
			request: DecreaseSupplierAllowanceRequest,
		): Promise<boolean> {
			const { tokenId, amount, targetId } = request;
			const validation = request.validate();

			if (validation.length > 0) throw new Error('validation error');

			return (
				await super.commandBus.execute(
					new DecreaseAllowanceCommand(
						BigDecimal.fromString(amount),
						HederaId.from(targetId),
						HederaId.from(tokenId),
					),
				)
			).payload;
		},

		async isLimited(request: CheckSupplierLimitRequest): Promise<boolean> {
			const { tokenId, targetId } = request;
			const validation = request.validate();

			if (validation.length > 0) throw new Error('validation error');

			return super.hasRole(
				new HasRoleRequest({
					targetId: targetId,
					tokenId: tokenId,
					role: StableCoinRole.CASHIN_ROLE,
				}),
			);
		},

		async isUnlimited(
			request: CheckSupplierLimitRequest,
		): Promise<boolean> {
			const { tokenId, targetId } = request;
			const validation = request.validate();

			if (validation.length > 0) throw new Error('validation error');

			return (
				await super.commandBus.execute(
					new IsUnlimitedCommand(
						HederaId.from(targetId),
						HederaId.from(tokenId),
					),
				)
			).payload;
		},
	};
}

const Role = new RoleInPort();
export default Role;
