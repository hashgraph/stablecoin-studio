export interface ICreateStableCoinRequest {
	accountId: string;
	privateKey: string;
	name: string;
	symbol: string;
	decimals: number;
	initialSupply?: bigint;
	maxSupply?: bigint;
	memo?: string;
	freeze?: string;
	freezeDefault?: boolean;
	autoRenewAccount?: string;
}
