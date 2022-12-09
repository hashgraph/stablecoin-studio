/* eslint-disable @typescript-eslint/no-explicit-any */
export interface BaseRequest {
	[n: string]: any;
}

export interface RequestAccount {
	accountId: string;
	network: 'testnet' | 'mainnet' | 'previewnet' | 'local';
	privateKey?: RequestPrivateKey;
	evmAddress?: string;
}

interface RequestKey {
	key: string;
	type: string;
}

// Extend as empty interface for future changes
// eslint-disable-next-line @typescript-eslint/no-empty-interface
export interface RequestPrivateKey extends RequestKey {}
// eslint-disable-next-line @typescript-eslint/no-empty-interface
export interface RequestPublicKey extends RequestKey {}

export interface AccountBaseRequest {
	account: RequestAccount;
}

export interface ContractBaseRequest extends BaseRequest, AccountBaseRequest {
	proxyContractId: string;
}
