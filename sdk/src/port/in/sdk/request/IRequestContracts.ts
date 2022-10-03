import { Account, StableCoinRole } from '../sdk.js';

export interface IRequestContracts {
	proxyContractId: string;
	account: Account;
}
export interface IRequestContractsAmount extends IRequestContracts {
	amount: number;
}

export interface IRequestBalanceOf extends IRequestContracts {
	targetId: string;
}

export interface ITokenIdRequestModel {
	tokenId: string;
}

export interface ITargetIdRequestModel {
	targetId: string;
}

export interface IRequestRole
	extends IRequestContracts,
		ITargetIdRequestModel,
		ITokenIdRequestModel {
	role: StableCoinRole;
}

export interface ISupplierRequestRoleModel extends IRequestRole {
	amount: number;
	role: StableCoinRole;
}

export interface IAllowanceRequest
	extends IRequestContracts,
		ITargetIdRequestModel,
		ITokenIdRequestModel {
	amount: number;
}
