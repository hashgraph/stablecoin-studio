import { Account, StableCoinRole, PublicKey } from '../../sdk.js';

export interface AccountRequestModel {
	account: Account;
}

export interface RequestContracts extends AccountRequestModel {
	proxyContractId: string;
}
export interface RequestContractsAmount extends RequestContracts {
	amount: string;
}

export interface RequestBalanceOf extends RequestContracts {
	targetId: string;
}

export interface TokenIdRequestModel {
	tokenId: string;
}

export interface TargetIdRequestModel {
	targetId: string;
}

export interface RequestRole
	extends RequestContracts,
		TargetIdRequestModel,
		TokenIdRequestModel {
	role: StableCoinRole;
}

export interface RequestRoles
	extends RequestContracts,
		TargetIdRequestModel {}

export interface SupplierRequestRoleModel extends RequestRole {
	amount: string;
	role: StableCoinRole;
}

export interface AllowanceRequest
	extends RequestContracts,
		TargetIdRequestModel,
		TokenIdRequestModel {
	amount: string;
}

export interface ICoreOperation
	extends RequestContractsAmount,
		TokenIdRequestModel {
	publicKey?: PublicKey;
}
