import { Account } from '../../../../port/in/sdk/sdk.js';

export interface IAccountWithKeyRequestModel {
	account: Account;
}

export interface IAmountRequestModel {
	amount: number;
}

export interface IAmountOptionalRequestModel {
	amount?: number;
}

export interface IProxyContractIdRequestModel {
	// TODO rename to something more appropiate
	proxyContractId: string;
}

export interface ITokenIdRequestModel {
	tokenId: string;
}

export interface ITargetIdRequestModel {
	targetId: string;
}
