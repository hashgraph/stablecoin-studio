export interface IAccountRequestModel {
	accountId: string;
}

export interface IPrivateKeyRequestModel {
	privateKey: string;
}

export interface IAccountWithKeyRequestModel
	extends IAccountRequestModel,
		IPrivateKeyRequestModel {}

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
