export interface BaseRequest {
	[n: string]: any;
}

export interface IAccount {
	accountId: string;
	privateKey?: IKey;
	evmAddress?: string;
}

export interface IKey {
	key: string;
	type: 'ECDSA' | 'ED25519';
}

export interface AccountBaseRequest {
	account: IAccount;
}

export interface ContractBaseRequest extends BaseRequest, AccountBaseRequest {
	proxyContractId: string;
}
