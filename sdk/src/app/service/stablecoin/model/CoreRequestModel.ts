import AccountId from '../../../../domain/context/account/AccountId.js';
import PrivateKey from '../../../../domain/context/account/PrivateKey.js';

export interface IAccountRequestModel {
	accountId: AccountId;
}

export interface IPrivateKeyRequestModel {
	privateKey: PrivateKey;
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

export interface ITargetIdRequestModel {
	targetId: string;
}
