import { FactoryKey } from "./FactoryKey.js";

export class FactoryStableCoin {
	/**
	 * Name of the token
	 */
	public tokenName: string;

	/**
	 * Symbol of the token
	 */
	public tokenSymbol: string;

	/**
	 * Freeze account by default
	 */
	public freeze: boolean;

	/**
	 * Token supply type
	 */
	public supplyType: boolean;

	/**
	 * Maximum Supply
	 */
	public tokenMaxSupply: string;

	/**
	 * Initial Supply
	 */
	public tokenInitialSupply: string;

	/**
	 * Decimals the token will have, must be at least 0 and less than 18
	 */
	public tokenDecimals: number;

	/**
	 * Token auto-renew account
	 */
	public autoRenewAccountAddress: string;

	/**
	 * Token treasury account
	 */
	public treasuryAddress: string;

	/**
	 * Token Keys
	 */
	public keys: FactoryKey[];

	constructor(
		tokenName: string,
		tokenSymbol: string,
		freeze: boolean,
		supplyType: boolean,
		tokenMaxSupply: string,
		tokenInitialSupply: string,
		tokenDecimals: number,
		autoRenewAccountAddress: string,
		treasuryAddress: string,
		keys: FactoryKey[],
	) {
		this.tokenName = tokenName;
		this.tokenSymbol = tokenSymbol;
		this.freeze = freeze;
		this.supplyType = supplyType;
		this.tokenMaxSupply = tokenMaxSupply;
		this.tokenInitialSupply = tokenInitialSupply;
		this.tokenDecimals = tokenDecimals;
		this.autoRenewAccountAddress = autoRenewAccountAddress;
		this.treasuryAddress = treasuryAddress;
		this.keys = keys;
	}
}