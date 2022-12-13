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
import { IsLimitedCommand } from '../../app/usecase/command/stablecoin/roles/isLimited/IsLimitedCommand.js';
import { IsUnlimitedCommand } from '../../app/usecase/command/stablecoin/roles/isUnlimited/IsUnlimitedCommand.js';

interface IRole {
	hasRole(request: HasRoleRequest): Promise<boolean>;
	grantRole(request: GrantRoleRequest): Promise<boolean>;
	revokeRole(request: RevokeRoleRequest): Promise<boolean>;
	getRoles(request: GetRolesRequest): Promise<string[]>;
	//Supplier: {
		getAllowance(request: GetSupplierAllowanceRequest): Promise<BigDecimal>;
		resetAllowance(request: ResetSupplierAllowanceRequest): Promise<boolean>;
		increaseAllowance(request: IncreaseSupplierAllowanceRequest): Promise<boolean>;
		decreaseAllowance(request: DecreaseSupplierAllowanceRequest): Promise<boolean>;
		isLimited(request: CheckSupplierLimitRequest): Promise<boolean>;
		isUnlimited(request: CheckSupplierLimitRequest): Promise<boolean>;
	//};
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
		// TODO return validation
		if (validation.length > 0) return false;

		return !!(await this.commandBus.execute(
			new HasRoleCommand(
				role!,
				HederaId.from(targetId),
				HederaId.from(tokenId)
			)
		));
	}

	async grantRole(request: GrantRoleRequest): Promise<boolean> {
		const { tokenId, targetId, role } = request;
		const validation = request.validate();
		// TODO return validation
		if (validation.length > 0) return false;

		return !!(await this.commandBus.execute(
			new GrantRoleCommand(
				role!,
				HederaId.from(targetId),
				HederaId.from(tokenId)
			)
		));
	}

	async revokeRole(request: RevokeRoleRequest): Promise<boolean> {
		const { tokenId, targetId, role } = request;
		const validation = request.validate();
		// TODO return validation
		if (validation.length > 0) return false;

		return !!(await this.commandBus.execute(
			new RevokeRoleCommand(
				role!,
				HederaId.from(targetId),
				HederaId.from(tokenId)
			)
		));
	}

	async getRoles(request: GetRolesRequest): Promise<string[]> {
		const { tokenId, targetId } = request;
		const validation = request.validate();
		// TODO return validation
		if (validation.length > 0) return [];

		return (await this.commandBus.execute(
			new GetRolesCommand(
				HederaId.from(targetId),
				HederaId.from(tokenId)
			)
		)).payload;
	}

	//Supplier: {
		async getAllowance(request: GetSupplierAllowanceRequest): Promise<BigDecimal> {
			const { tokenId, targetId } = request;
			const validation = request.validate();
			// TODO return validation
			if (validation.length > 0) return BigDecimal.ZERO;
	
			return (await this.commandBus.execute(
				new GetAllowanceCommand(
					HederaId.from(targetId),
					HederaId.from(tokenId)
				)
			)).payload;
		}

		async resetAllowance(request: ResetSupplierAllowanceRequest): Promise<boolean> {
			const { tokenId, targetId } = request;
			const validation = request.validate();
			// TODO return validation
			if (validation.length > 0) return false;
	
			return !!(await this.commandBus.execute(
				new ResetAllowanceCommand(
					HederaId.from(targetId),
					HederaId.from(tokenId)
				)
			));			
		}

		async increaseAllowance(request: IncreaseSupplierAllowanceRequest): Promise<boolean> {
			const { tokenId, amount, targetId } = request;
			const validation = request.validate();
			// TODO return validation
			if (validation.length > 0) return false;
	
			return !!(await this.commandBus.execute(
				new IncreaseAllowanceCommand(
					BigDecimal.fromString(amount),
					HederaId.from(targetId),
					HederaId.from(tokenId)
				)
			));						
		}

		async decreaseAllowance(request: DecreaseSupplierAllowanceRequest): Promise<boolean> {
			const { tokenId, amount, targetId } = request;
			const validation = request.validate();
			// TODO return validation
			if (validation.length > 0) return false;
	
			return !!(await this.commandBus.execute(
				new DecreaseAllowanceCommand(
					BigDecimal.fromString(amount),
					HederaId.from(targetId),
					HederaId.from(tokenId)
				)
			));			
		}

		async isLimited(request: CheckSupplierLimitRequest): Promise<boolean> {
			const { tokenId, targetId } = request;
			const validation = request.validate();
			// TODO return validation
			if (validation.length > 0) return false;
	
			return !!(await this.commandBus.execute(
				new IsLimitedCommand(
					HederaId.from(targetId),
					HederaId.from(tokenId)
				)
			));			
		}

		async isUnlimited(request: CheckSupplierLimitRequest): Promise<boolean> {
			const { tokenId, targetId } = request;
			const validation = request.validate();
			// TODO return validation
			if (validation.length > 0) return false;
	
			return !!(await this.commandBus.execute(
				new IsUnlimitedCommand(
					HederaId.from(targetId),
					HederaId.from(tokenId)
				)
			));			
		}
	//};
}

const Role = new RoleInPort();
export default Role;
