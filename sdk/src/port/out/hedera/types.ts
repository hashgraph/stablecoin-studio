import {
	AccountId as HAccount,
	DelegateContractId,
	PublicKey as HPublicKey,
	TokenId,
} from '@hashgraph/sdk';
import { HashConnectTypes } from 'hashconnect';

export interface ICallContractRequest {
	contractId: string;
	parameters: any[];
	gas: number;
	abi: any[];
}

export interface ICallContractWithAccountRequest extends ICallContractRequest {
	account: {
		privateKey: string;
		accountId: string;
	};
}

export interface ICreateTokenResponse {
	name: string;
	symbol: string;
	decimals: number;
	initialSupply: Long;
	maxSupply: Long;
	memo: string;
	freezeDefault: boolean;
	treasuryAccountId: HAccount;
	adminKey: HPublicKey;
	freezeKey: HPublicKey;
	wipeKey: HPublicKey;
	supplyKey: DelegateContractId;
	tokenId: TokenId;
}

export type InitializationData = HashConnectTypes.InitilizationData;