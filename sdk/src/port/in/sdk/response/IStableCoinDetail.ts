import ContractId from '../../../../domain/context/contract/ContractId.js';
import { ICustomFees } from '../../../../app/service/stablecoin/model/stablecoindetail/ICustomFees.js';
import PublicKey from '../../../../domain/context/account/PublicKey.js';

import { StableCoinMemo } from '../../../../domain/context/stablecoin/StableCoinMemo.js';
import { AccountId } from '../sdk.js';

export default interface IStableCoinDetail {
	tokenId?: string;
	name?: string;
	symbol?: string;
	decimals?: number;
	totalSupply?: string;
	maxSupply?: string;
	initialSupply?: string;
	customFee?: ICustomFees;
	treasuryId?: string;
	memo?: StableCoinMemo;
	expirationTime?: string;
	freezeDefault?: boolean;
	// kycStatus: string;
	autoRenewAccount?: AccountId;
	autoRenewAccountPeriod?: number;
	paused?: string;
	deleted?: string;
	adminKey?: ContractId | PublicKey | undefined;
	kycKey?: ContractId | PublicKey | undefined;
	freezeKey?: ContractId | PublicKey | undefined;
	wipeKey?: ContractId | PublicKey | undefined;
	supplyKey?: ContractId | PublicKey | undefined;
	pauseKey?: ContractId | PublicKey | undefined;
}
