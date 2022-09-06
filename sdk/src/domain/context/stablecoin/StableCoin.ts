import BaseEntity from '../../BaseEntity.js';
import Account from '../account/Account.js';
import InvalidDecimalRangeDomainError from './error/InvalidDecimalRangeDomainError.js';

const MAX_SUPPLY = 9_223_372_036_854_775_807n;

export default class StableCoin extends BaseEntity {
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
	private _maxSupply: bigint;
	public get maxSupply(): bigint {
		return this._maxSupply;
	}
	public set maxSupply(value: bigint) {
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
	private _freeze: string;
	public get freeze(): string {
		return this._freeze;
	}
	public set freeze(value: string) {
		this._freeze = value;
	}

	/**
	 * Freeze key
	 */
	private _freezeDefault: boolean;
	public get freezeDefault(): boolean {
		return this._freezeDefault;
	}
	public set freezeDefault(value: boolean) {
		this._freezeDefault = value;
	}

	constructor(
		admin: Account,
		name: string,
		symbol: string,
		decimals: number,
		initialSupply?: bigint,
		maxSupply?: bigint,
		memo?: string,
		freeze?: string,
		freezeDefault?: boolean,
		id?: string | undefined,
	) {
		super();
		this.admin = admin;
		this.name = name;
		this.symbol = symbol;
		this.decimals = this.checkDecimals(decimals);
		this.initialSupply = initialSupply ?? 0n;
		this.maxSupply = maxSupply ?? MAX_SUPPLY;
		this.memo = memo;
		this.freeze = freeze ?? '';
		this.freezeDefault = freezeDefault ?? false;
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
