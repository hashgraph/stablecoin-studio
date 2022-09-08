import AccountId from "../../../../domain/context/account/AccountId.js";
import PrivateKey from "../../../../domain/context/account/PrivateKey.js";

export interface IRequestContracts {
	proxyContractId: string;
	privateKey: PrivateKey;
	accountId: AccountId;
}
export interface IRequestContractsAmount extends IRequestContracts {
	amount: number;
}

export interface IRequestSupplier extends IRequestContracts {
	amount?: number;
	address: string;
}

export interface IRequestBalanceOf extends IRequestContracts {
	targetId: string;
}

export interface ITokenIdRequestModel {
	tokenId: string;
}
