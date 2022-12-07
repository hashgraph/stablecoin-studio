import PublicKey from "../../../domain/context/account/PublicKey.js";
import { HederaId } from "../../../domain/context/shared/HederaId.js";


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
	autoRenewAccount?: HederaId;
	autoRenewAccountPeriod?: number;
	paused?: string;
	deleted?: boolean;
	adminKey?: HederaId | PublicKey | undefined;
	kycKey?: HederaId | PublicKey | undefined;
	freezeKey?: HederaId | PublicKey | undefined;
	wipeKey?: HederaId | PublicKey | undefined;
	supplyKey?: HederaId | PublicKey | undefined;
	pauseKey?: HederaId | PublicKey | undefined;
}
