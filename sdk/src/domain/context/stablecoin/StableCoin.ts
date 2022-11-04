import BaseEntity from '../../BaseEntity.js';
import AccountId from '../account/AccountId.js';
import PublicKey from '../account/PublicKey.js';
import ContractId from '../contract/ContractId.js';
import BigDecimal from './BigDecimal.js';
import InvalidAmountDomainError from './error/InvalidAmountDomainError.js';
import InvalidDecimalRangeDomainError from './error/InvalidDecimalRangeDomainError.js';
import { StableCoinMemo } from './StableCoinMemo.js';
import { TokenSupplyType } from './TokenSupply.js';
import { TokenType } from './TokenType.js';

const MAX_SUPPLY = 9_223_372_036_854_775_807n; // eslint-disable-line
const TEN = 10;

export class StableCoin extends BaseEntity {
	/**
	 * Admin PublicKey for the token
	 */
	private _adminKey: ContractId | PublicKey | undefined;
	public get adminKey(): ContractId | PublicKey | undefined {
		return this._adminKey;
	}
	public set adminKey(value: ContractId | PublicKey | undefined) {
		this._adminKey = value;
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
	private _id: string;
	public get id(): string {
		return this._id;
	}
	public set id(value: string) {
		this._id = value;
	}

	/**
	 * Initial Supply
	 */
	private _initialSupply: BigDecimal;
	public get initialSupply(): BigDecimal {
		return this._initialSupply;
	}
	public set initialSupply(value: BigDecimal) {
		this._initialSupply = value;
	}

	/**
	 * Maximum Supply
	 */
	private _maxSupply: BigDecimal | undefined;
	public get maxSupply(): BigDecimal | undefined {
		return this._maxSupply;
	}
	public set maxSupply(value: BigDecimal | undefined) {
		this._maxSupply = value;
	}

	/**
	 * Total Supply
	 */
	private _totalSupply: BigDecimal;
	public get totalSupply(): BigDecimal {
		return this._totalSupply;
	}
	public set totalSupply(value: BigDecimal) {
		this._totalSupply = value;
	}

	/**
	 * Memo field
	 */
	private _memo: StableCoinMemo;
	public get memo(): StableCoinMemo {
		return this._memo;
	}
	public set memo(value: StableCoinMemo) {
		this._memo = value;
	}

	/**
	 * Freeze key
	 */
	private _freezeKey: ContractId | PublicKey | undefined;
	public get freezeKey(): ContractId | PublicKey | undefined {
		return this._freezeKey;
	}
	public set freezeKey(value: ContractId | PublicKey | undefined) {
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
	private _kycKey: ContractId | PublicKey | undefined;
	public get kycKey(): ContractId | PublicKey | undefined {
		return this._kycKey;
	}
	public set kycKey(value: ContractId | PublicKey | undefined) {
		this._kycKey = value;
	}

	/**
	 * Wipe key
	 */
	private _wipeKey: ContractId | PublicKey | undefined;
	public get wipeKey(): ContractId | PublicKey | undefined {
		return this._wipeKey;
	}
	public set wipeKey(value: ContractId | PublicKey | undefined) {
		this._wipeKey = value;
	}

	/**
	 * Pause key
	 */
	private _pauseKey: ContractId | PublicKey | undefined;
	public get pauseKey(): ContractId | PublicKey | undefined {
		return this._pauseKey;
	}
	public set pauseKey(value: ContractId | PublicKey | undefined) {
		this._pauseKey = value;
	}

	/**
	 * Supply key
	 */
	private _supplyKey: ContractId | PublicKey | undefined;
	public get supplyKey(): ContractId | PublicKey | undefined {
		return this._supplyKey;
	}
	public set supplyKey(value: ContractId | PublicKey | undefined) {
		this._supplyKey = value;
	}

	/**
	 * Treasury account
	 */
	private _treasury: AccountId;
	public get treasury(): AccountId {
		return this._treasury;
	}
	public set treasury(value: AccountId) {
		this._treasury = value;
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

	/**
	 * Token auto-renew account
	 */
	private _autoRenewAccount: AccountId;
	public get autoRenewAccount(): AccountId {
		return this._autoRenewAccount;
	}
	public set autoRenewAccount(value: AccountId) {
		this._autoRenewAccount = value;
	}

	/**
	 * Expiration Time
	 */
	private _autoRenewAccountPeriod: number;
	public get autoRenewAccountPeriod(): number {
		return this._autoRenewAccountPeriod;
	}
	public set autoRenewAccountPeriod(value: number) {
		this._autoRenewAccountPeriod = value;
	}

	/**
	 * pause Status
	 */
	private _paused: string;
	public get paused(): string {
		return this._paused;
	}
	public set paused(value: string) {
		this._paused = value;
	}

	/**
	 * deleted Status
	 */
	private _deleted: string;
	public get deleted(): string {
		return this._deleted;
	}
	public set deleted(value: string) {
		this._deleted = value;
	}
	constructor(params: {
		name: string;
		symbol: string;
		decimals: number;
		adminKey?: PublicKey | ContractId;
		initialSupply?: BigDecimal;
		totalSupply?: BigDecimal;
		maxSupply?: BigDecimal;
		memo?: string;
		freezeKey?: PublicKey | ContractId;
		freezeDefault?: boolean;
		kycKey?: PublicKey | ContractId;
		wipeKey?: PublicKey | ContractId;
		pauseKey?: PublicKey | ContractId;
		paused?: string;
		supplyKey?: PublicKey | ContractId;
		treasury?: AccountId;
		tokenType?: TokenType;
		supplyType?: TokenSupplyType;
		id?: string;
		autoRenewAccount?: AccountId;
		autoRenewAccountPeriod?: number;
		deleted?: string;
	}) {
		super();
		const {
			adminKey,
			name,
			symbol,
			decimals,
			initialSupply,
			totalSupply,
			maxSupply,
			memo,
			freezeKey,
			freezeDefault,
			kycKey,
			wipeKey,
			pauseKey,
			supplyKey,
			treasury,
			tokenType,
			supplyType,
			id,
			autoRenewAccount,
			autoRenewAccountPeriod,
			deleted,
			paused,
		} = params;
		this.adminKey = adminKey;
		this.name = name;
		this.symbol = symbol;
		this.decimals = this.checkDecimals(decimals);
		this.initialSupply = initialSupply ?? BigDecimal.ZERO;
		this.totalSupply = totalSupply ?? BigDecimal.ZERO;
		this.maxSupply = maxSupply ?? undefined;
		this.memo = memo
			? StableCoinMemo.fromJson(memo)
			: StableCoinMemo.empty();
		this.freezeKey = freezeKey;
		this.freezeDefault = freezeDefault ?? false;
		this.kycKey = kycKey;
		this.wipeKey = wipeKey;
		this.pauseKey = pauseKey;
		this.supplyKey = supplyKey;
		this.treasury = treasury ?? new AccountId('0.0.0');
		this.tokenType = tokenType ?? TokenType.FUNGIBLE_COMMON;
		this.supplyType =
			(supplyType && !maxSupply) || !supplyType
				? TokenSupplyType.INFINITE
				: TokenSupplyType.FINITE;
		this.id = id ?? '0.0.0';
		this.autoRenewAccount = autoRenewAccount ?? new AccountId('0.0.0');
		this.autoRenewAccountPeriod = autoRenewAccountPeriod ?? 0;
		this.paused = paused ?? '';
		this.deleted = deleted ?? '';
	}

	public checkDecimals(value: number): number {
		if (value < 0 || value > 18) {
			throw new InvalidDecimalRangeDomainError(value);
		} else {
			return value;
		}
	}

	public getDecimalOperator(): number {
		return TEN ** this.decimals;
	}

	public fromInteger(amount: number): number {
		const res = amount / this.getDecimalOperator();
		if (!this.isValidAmount(res)) {
			throw new InvalidAmountDomainError(res, this.decimals);
		}
		return res;
	}

	public isValidAmount(amount: number): boolean {
		return this.getDecimals(amount) <= this.decimals;
	}

	private getDecimals(amount: number): number {
		const val = amount.toString().split('.');
		const decimals = val.length > 1 ? val[1]?.length : 0;
		return decimals;
	}
}
