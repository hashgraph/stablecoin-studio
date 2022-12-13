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

interface IRole {
	hasRole(request: HasRoleRequest): Promise<boolean>;
	grantRole(request: GrantRoleRequest): Promise<boolean>;
	revokeRole(request: RevokeRoleRequest): Promise<boolean>;
	getRoles(request: GetRolesRequest): Promise<string[]>;
	Supplier: {
		getAllowance(request: GetSupplierAllowanceRequest): Promise<string>;
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
	hasRole(request: HasRoleRequest): Promise<boolean> {
		throw new Error('Method not implemented.');
	}
	grantRole(request: GrantRoleRequest): Promise<boolean> {
		throw new Error('Method not implemented.');
	}
	revokeRole(request: RevokeRoleRequest): Promise<boolean> {
		throw new Error('Method not implemented.');
	}
	getRoles(request: GetRolesRequest): Promise<string[]> {
		throw new Error('Method not implemented.');
	}
	Supplier: {
		getAllowance(request: GetSupplierAllowanceRequest): Promise<string>;
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

const Role = new RoleInPort();
export default Role;
