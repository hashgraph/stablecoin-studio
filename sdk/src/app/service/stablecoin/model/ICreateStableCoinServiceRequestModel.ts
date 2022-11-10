import AccountId from '../../../../domain/context/account/AccountId.js';
import PublicKey from '../../../../domain/context/account/PublicKey.js';
import { TokenSupplyType } from '../../../../domain/context/stablecoin/TokenSupply.js';
import { TokenType } from '../../../../domain/context/stablecoin/TokenType.js';
import { IAccountWithKeyRequestModel } from './CoreRequestModel.js';

export default interface ICreateStableCoinServiceRequestModel
	extends IAccountWithKeyRequestModel {
	name: string;
	symbol: string;
	decimals: number;
	adminKey?: PublicKey;
	initialSupply?: string;
	maxSupply?: string;
	memo?: string;
	freezeKey?: PublicKey;
	freezeDefault?: boolean;
	KYCKey?: PublicKey;
	wipeKey?: PublicKey;
	pauseKey?: PublicKey;
	supplyKey?: PublicKey;
	treasury?: AccountId;
	tokenType?: TokenType;
	supplyType?: TokenSupplyType;
	id?: string;
	autoRenewAccount?: AccountId;
}
