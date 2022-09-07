import { TokenType, TokenSupplyType } from '@hashgraph/sdk';
import { IAccountWithKeyRequestModel } from './CoreRequestModel.js';

export default interface ICreateStableCoinServiceRequestModel extends IAccountWithKeyRequestModel {
	name: string;
	symbol: string;
	decimals: number;
	initialSupply?: bigint;
	maxSupply?: bigint;
	memo?: string;
	freeze?: string;
	freezeDefault?: boolean;
	kycKey?: string;
	wipeKey?: string;
	supplyKey?: string;
	treasury?: string;
	expiry?: number;
	tokenType?: TokenType;
	supplyType?: TokenSupplyType;
	id?: string | undefined;
}
