import BaseEntity from '../../BaseEntity.js';
import Account from '../account/Account.js';
import InvalidDecimalRangeDomainError from './error/InvalidDecimalRangeDomainError.js';
import { TokenSupplyType } from './TokenSupply.js';
import { TokenType } from './TokenType.js';

const MAX_SUPPLY = 9_223_372_036_854_775_807n;

export class StableCoin extends BaseEntity {
	/**
	 * Admin Account for the token
	 */
	private _admin: Account;
	public get admin(): Account {
		return this._admin;
	}
	public set admin(value: Account) {
		this._admin = value;
	}

	/**
	 * Name of the token
	 */
	private _name: string;
	public get name(): string {
		return this._name;
	}
	public set name(value: string) {
		this._name = value;
	}

	/**
	 * Symbol of the token
	 */
	private _symbol: string;
	public get symbol(): string {
		return this._symbol;
	}
	public set symbol(value: string) {
		this._symbol = value;
	}

	/**
	 * Decimals the token will have, must be at least 0 and less than 18
	 */
	private _decimals: number;
	public get decimals(): number {
		return this._decimals;
	}
	public set decimals(value: number) {
		this._decimals = value;
	}

	/**
	 * Id
	 */
	private _id: string | undefined;
	public get id(): string | undefined {
		return this._id;
	}
	public set id(value: string | undefined) {
		this._id = value;
	}

	/**
	 * Initial Supply
	 */
	private _initialSupply: bigint;
	public get initialSupply(): bigint {
		return this._initialSupply;
	}
	public set initialSupply(value: bigint) {
		this._initialSupply = value;
	}

	/**
	 * Maximum Supply
	 */
	private _maxSupply?: bigint | undefined;
	public get maxSupply(): bigint | undefined {
		return this._maxSupply;
	}
	public set maxSupply(value: bigint | undefined) {
		this._maxSupply = value;
	}

	/**
	 * Memo field
	 */
	private _memo?: string | undefined;
	public get memo(): string | undefined {
		return this._memo;
	}
	public set memo(value: string | undefined) {
		this._memo = value;
	}

	/**
	 * Freeze key
	 */
	private _freezeKey: string | undefined;
	public get freeze(): string | undefined {
		return this._freezeKey;
	}
	public set freeze(value: string | undefined) {
		this._freezeKey = value;
	}

	/**
	 * Freeze account by default
	 */
	private _freezeDefault: boolean;
	public get freezeDefault(): boolean {
		return this._freezeDefault;
	}
	public set freezeDefault(value: boolean) {
		this._freezeDefault = value;
	}

	/**
	 * KYC key
	 */
	private _kycKey: string | undefined;
	public get kycKey(): string | undefined {
		return this._kycKey;
	}
	public set kycKey(value: string | undefined) {
		this._kycKey = value;
	}

	/**
	 * Wipe key
	 */
	private _wipeKey: string | undefined;
	public get wipeKey(): string | undefined {
		return this._wipeKey;
	}
	public set wipeKey(value: string | undefined) {
		this._wipeKey = value;
	}

	/**
	 * Supply key
	 */
	private _supplyKey?: string;
	public get supplyKey(): string | undefined {
		return this._supplyKey;
	}
	public set supplyKey(value: string | undefined) {
		this._supplyKey = value;
	}

	/**
	 * Treasury account
	 */
	private _treasury?: string;
	public get treasury(): string | undefined {
		return this._treasury;
	}
	public set treasury(value: string | undefined) {
		this._treasury = value;
	}

	/**
	 * Expiration of token
	 */
	private _expiry?: number;
	public get expiry(): number | undefined {
		return this._expiry;
	}
	public set expiry(value: number | undefined) {
		this._expiry = value;
	}

	/**
	 * Token type
	 */
	private _tokenType: TokenType;
	public get tokenType(): TokenType {
		return this._tokenType;
	}
	public set tokenType(value: TokenType) {
		this._tokenType = value;
	}

	/**
	 * Token supply type
	 */
	private _supplyType: TokenSupplyType;
	public get supplyType(): TokenSupplyType {
		return this._supplyType;
	}
	public set supplyType(value: TokenSupplyType) {
		this._supplyType = value;
	}

	constructor(
		admin: Account,
		name: string,
		symbol: string,
		decimals: number,
		initialSupply?: bigint,
		maxSupply?: bigint,
		memo?: string,
		freezeKey?: string,
		freezeDefault?: boolean,
		kycKey?: string,
		wipeKey?: string,
		supplyKey?: string,
		treasury?: string,
		expiry?: number,
		tokenType?: TokenType,
		supplyType?: TokenSupplyType,
		id?: string | undefined,
	) {
		super();
		this.admin = admin;
		this.name = name;
		this.symbol = symbol;
		this.decimals = this.checkDecimals(decimals);
		this.initialSupply = initialSupply ?? 0n;
		this.maxSupply = maxSupply;
		this.memo = memo;
		this.freeze = freezeKey ?? '';
		this.freezeDefault = freezeDefault ?? false;
		this.kycKey = kycKey;
		this.wipeKey = wipeKey;
		this.supplyKey = supplyKey;
		this.treasury = treasury;
		this.expiry = expiry;
		this.tokenType = tokenType ?? TokenType.FUNGIBLE_COMMON;
		this.supplyType =
			supplyType && !maxSupply
				? TokenSupplyType.INFINITE
				: TokenSupplyType.FINITE;
		this.id = id;
	}

	private checkDecimals(value: number): number {
		if (value < 0 || value > 18) {
			throw new InvalidDecimalRangeDomainError(value);
		} else {
			return value;
		}
	}
}
