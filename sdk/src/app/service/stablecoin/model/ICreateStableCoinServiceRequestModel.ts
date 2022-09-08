import { TokenType, TokenSupplyType } from '@hashgraph/sdk';
import AccountId from '../../../../domain/context/account/AccountId.js';
import { PublicKey } from '../../../../domain/context/account/PublicKey.js';
import { IAccountWithKeyRequestModel } from './CoreRequestModel.js';

export default interface ICreateStableCoinServiceRequestModel
	extends IAccountWithKeyRequestModel {
	name: string;
	symbol: string;
	decimals: number;
	initialSupply?: bigint;
	maxSupply?: bigint;
	memo?: string;
	freezeKey?: PublicKey;
	freezeDefault?: boolean;
	kycKey?: PublicKey;
	wipeKey?: PublicKey;
	supplyKey?: PublicKey;
	treasury?: AccountId;
	tokenType?: TokenType;
	supplyType?: TokenSupplyType;
	id?: string;
	autoRenewAccount?: AccountId;
}
