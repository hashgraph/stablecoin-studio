import IAccount from '../../../out/hedera/account/types/IAccount.js';
import { Account, StableCoinRole, PublicKey } from '../sdk.js';

export interface IAccountRequestModel {
	account: Account;
}

export interface IRequestContracts extends IAccountRequestModel {
	proxyContractId: string;
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

export interface IRequestRoles
	extends IRequestContracts,
		ITargetIdRequestModel {}

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
