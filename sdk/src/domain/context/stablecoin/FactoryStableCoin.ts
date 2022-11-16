import { FactoryKey } from "./FactoryKey.js";

export class FactoryStableCoin {

	/**
	 * Name of the token
	 */
	private _tokenName: string;
	public get tokenName(): string {
		return this._tokenName;
	}
	public set tokenName(value: string) {
		this._tokenName = value;
	}

	/**
	 * Symbol of the token
	 */
	private _tokenSymbol: string;
	public get tokenSymbol(): string {
		return this._tokenSymbol;
	}
	public set tokenSymbol(value: string) {
		this._tokenSymbol = value;
	}

    /**
	 * Freeze account by default
	 */
	private _freeze: boolean;
	public get freeze(): boolean {
		return this._freeze;
	}
	public set freeze(value: boolean) {
		this._freeze = value;
	}

    /**
	 * Token supply type
	 */
	private _supplyType: boolean;
	public get supplyType(): boolean {
		return this._supplyType;
	}
	public set supplyType(value: boolean) {
		this._supplyType = value;
	}

    /**
	 * Maximum Supply
	 */
	private _tokenMaxSupply: Long | undefined;
	public get tokenMaxSupply(): Long | undefined {
		return this._tokenMaxSupply;
	}
	public set tokenMaxSupply(value: Long | undefined) {
		this._tokenMaxSupply = value;
	}

	/**
	 * Initial Supply
	 */
	private _tokenInitialSupply: Long;
	public get tokenInitialSupply(): Long {
		return this._tokenInitialSupply;
	}
	public set tokenInitialSupply(value: Long) {
		this._tokenInitialSupply = value;
	}
	

    /**
	 * Decimals the token will have, must be at least 0 and less than 18
	 */
	private _tokenDecimals: number;
	public get tokenDecimals(): number {
		return this._tokenDecimals;
	}
	public set tokenDecimals(value: number) {
		this._tokenDecimals = value;
	}


	/**
	 * Token auto-renew account
	 */
	private _autoRenewAccountAddress: string;
	public get autoRenewAccountAddress(): string {
		return this._autoRenewAccountAddress;
	}
	public set autoRenewAccountAddress(value: string) {
		this._autoRenewAccountAddress = value;
	}

    /**
	 * Token Keys
	 */
	private _keys: FactoryKey[];
	public get keys(): FactoryKey[] {
		return this._keys;
	}
	public set keys(value: FactoryKey[]) {
		this._keys = value;
	}

	constructor(
        tokenName: string,
		tokenSymbol: string,
        freeze: boolean,
        supplyType: boolean,
        tokenMaxSupply: Long | undefined,
        tokenInitialSupply: Long,
        tokenDecimals: number,
		autoRenewAccountAddress: string,
        keys: FactoryKey[]
    ) {

		this.tokenName = tokenName;
		this.tokenSymbol = tokenSymbol;
		this.freeze = freeze;
        this.supplyType = supplyType;
		this.tokenMaxSupply = tokenMaxSupply ?? undefined;
        this.tokenInitialSupply = tokenInitialSupply;
        this.tokenDecimals = tokenDecimals;
        this.autoRenewAccountAddress = autoRenewAccountAddress;
        this.keys = keys;
	}

}