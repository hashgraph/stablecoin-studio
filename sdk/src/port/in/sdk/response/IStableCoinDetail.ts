import ContractId from '../../../../domain/context/contract/ContractId.js';
import { ICustomFees } from '../../../../app/service/stablecoin/model/stablecoindetail/ICustomFees.js';
import PublicKey from '../../../../domain/context/account/PublicKey.js';

export default interface IStableCoinDetail {
	tokenId?: string;
	name?: string;
	symbol?: string;
	decimals?: number;
	totalSupply?: bigint;
	maxSupply?: bigint;
	customFee?: ICustomFees;
	treasuryId?: string;
	expirationTime?: string;
	memo?: string;
	paused?: string;
	freezeDefault?: boolean;
	// kycStatus: string;
	deleted?: boolean;
	adminKey?: ContractId | PublicKey | undefined;
	kycKey?: ContractId | PublicKey | undefined;
	freezeKey?: ContractId | PublicKey | undefined;
	wipeKey?: ContractId | PublicKey | undefined;
	supplyKey?: ContractId | PublicKey | undefined;
	pauseKey?: ContractId | PublicKey | undefined;
}
