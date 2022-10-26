/* eslint-disable @typescript-eslint/no-explicit-any */
export interface BaseRequest {
	[n: string]: any;
}

export interface RequestAccount {
	accountId: string;
	privateKey?: RequestKey;
	evmAddress?: string;
}

export interface RequestKey {
	key: string;
	type: 'ECDSA' | 'ED25519';
}

export interface AccountBaseRequest {
	account: RequestAccount;
}

export interface ContractBaseRequest extends BaseRequest, AccountBaseRequest {
	proxyContractId: string;
}
