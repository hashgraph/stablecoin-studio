import { Account } from '../../../../port/in/sdk/sdk.js';

export interface IAccountWithKeyRequestModel {
	account: Account;
}

export interface IAmountRequestModel {
	amount: string;
}

export interface IAmountOptionalRequestModel {
	amount?: string;
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
