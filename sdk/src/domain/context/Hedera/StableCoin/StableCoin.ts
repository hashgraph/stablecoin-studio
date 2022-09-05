import BaseEntity from '../../../BaseEntity.js';
import Account from '../account/Account.js';
import InvalidDecimalRangeDomainError from './error/InvalidDecimalRangeDomainError.js';

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

	constructor(
		admin: Account,
		name: string,
		symbol: string,
		decimals: number,
		id?: string | undefined,
	) {
		super();
		this.admin = admin;
		this.name = name;
		this.symbol = symbol;
		this.decimals = this.checkDecimals(decimals);
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
