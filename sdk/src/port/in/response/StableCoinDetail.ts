import { AccountId, ContractId, PublicKey } from "@hashgraph/sdk";


export default interface StableCoinDetail {
	tokenId?: string;
	name?: string;
	symbol?: string;
	decimals?: number;
	totalSupply?: string;
	maxSupply?: string;
	initialSupply?: string;
	treasuryId?: string;
	expirationTime?: string;
	freezeDefault?: boolean;
	// kycStatus: string;
	autoRenewAccount?: AccountId;
	autoRenewAccountPeriod?: number;
	paused?: string;
	deleted?: boolean;
	adminKey?: ContractId | PublicKey | undefined;
	kycKey?: ContractId | PublicKey | undefined;
	freezeKey?: ContractId | PublicKey | undefined;
	wipeKey?: ContractId | PublicKey | undefined;
	supplyKey?: ContractId | PublicKey | undefined;
	pauseKey?: ContractId | PublicKey | undefined;
}
