import { Account, StableCoinRole, PublicKey } from '../sdk.js';

export interface IRequestContracts {
	proxyContractId: string;
	account: Account;
}
export interface IRequestContractsAmount extends IRequestContracts {
	amount: string;
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
	amount: string;
	role: StableCoinRole;
}

export interface IAllowanceRequest
	extends IRequestContracts,
		ITargetIdRequestModel,
		ITokenIdRequestModel {
	amount: string;
}

export interface ICoreOperation
	extends IRequestContractsAmount,
		ITokenIdRequestModel {
	publicKey?: PublicKey;
}
