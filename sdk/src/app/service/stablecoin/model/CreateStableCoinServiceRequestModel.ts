import { TokenType, TokenSupplyType } from '@hashgraph/sdk';

export default class CreateStableCoinServiceRequestModel {
	public accountId: string;
	public privateKey: string;
	public name: string;
	public symbol: string;
	public decimals: number;
	public initialSupply?: bigint;
	public maxSupply?: bigint;
	public memo?: string;
	public freeze?: string;
	public freezeDefault?: boolean;
	public kycKey?: string;
	public wipeKey?: string;
	public supplyKey?: string;
	public treasury?: string;
	public expiry?: number;
	public tokenType?: TokenType;
	public supplyType?: TokenSupplyType;
	public id?: string | undefined;
}
