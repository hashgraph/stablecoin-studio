import {
	AccountId as HAccount,
	DelegateContractId,
	PublicKey as HPublicKey,
	TokenId,
} from '@hashgraph/sdk';

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
	adminKey: HPublicKey | DelegateContractId | undefined;
	freezeKey: HPublicKey | DelegateContractId | undefined;
	kycKey: HPublicKey | DelegateContractId | undefined;
	wipeKey: HPublicKey | DelegateContractId | undefined;
	pauseKey: HPublicKey | DelegateContractId | undefined;
	supplyKey: HPublicKey | DelegateContractId | undefined;
	tokenId: TokenId;
}
