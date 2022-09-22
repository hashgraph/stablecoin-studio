import { StableCoinRole } from '../sdk.js';

export interface IRequestContracts {
	proxyContractId: string;
	privateKey: string;
	accountId: string;
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

export interface IRequestRole extends IRequestContracts, ITargetIdRequestModel {
	role: StableCoinRole;
	amount?: number;
}

export interface IAllowanceRequest
	extends IRequestContracts,
		ITargetIdRequestModel {
	amount: number;
}
