import {
	TokenId,
} from '@hashgraph/sdk';
import { HashConnectTypes } from 'hashconnect';
import { AccountId, ContractId, PublicKey } from '../../in/sdk/sdk.js';

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
	treasuryAccountId: AccountId;
	adminKey?: PublicKey;
	freezeKey?: PublicKey;
	kycKey?: PublicKey;
	wipeKey?: PublicKey;
	pauseKey?: PublicKey;
	supplyKey?: PublicKey;
	tokenId: TokenId;
}

export type InitializationData = HashConnectTypes.InitilizationData;
export type SavedPairingData = HashConnectTypes.SavedPairingData;
