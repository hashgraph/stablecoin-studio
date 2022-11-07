/* eslint-disable @typescript-eslint/no-unused-vars */
import CheckNums from '../../../../core/checks/numbers/CheckNums.js';
import CheckStrings from '../../../../core/checks/strings/CheckStrings.js';
import { OptionalField } from '../../../../core/decorators/OptionalDecorator.js';
import InvalidDecimalRange from '../../../../domain/context/stablecoin/error/InvalidDecimalRange.js';
import { AccountId, BigDecimal, StableCoin, TokenSupplyType } from '../sdk.js';
import {
	AccountBaseRequest,
	RequestAccount,
	RequestPublicKey,
} from './BaseRequest.js';
import { InvalidRange } from './error/InvalidRange.js';
import { InvalidType } from './error/InvalidType.js';
import ValidatedRequest from './validation/ValidatedRequest.js';
import Validation from './validation/Validation.js';

export default class CreateStableCoinRequest
	extends ValidatedRequest<CreateStableCoinRequest>
	implements AccountBaseRequest
{
	account: RequestAccount;
	name: string;
	symbol: string;
	private _decimals: number;
	public get decimals(): number {
		return this._decimals;
	}
	public set decimals(value: number | string) {
		this._decimals = typeof value === 'number' ? value : parseInt(value);
	}

	@OptionalField()
	initialSupply?: string | undefined;

	@OptionalField()
	maxSupply?: string | undefined;

	@OptionalField()
	freezeDefault?: boolean;

	@OptionalField()
	autoRenewAccount?: string;

	@OptionalField()
	adminKey?: RequestPublicKey;

	@OptionalField()
	freezeKey?: RequestPublicKey;

	@OptionalField()
	KYCKey?: RequestPublicKey;

	@OptionalField()
	wipeKey?: RequestPublicKey;

	@OptionalField()
	pauseKey?: RequestPublicKey;

	@OptionalField()
	supplyKey?: RequestPublicKey;

	@OptionalField()
	treasury?: string | undefined;

	@OptionalField()
	supplyType?: TokenSupplyType;

	constructor({
		account,
		name,
		symbol,
		decimals,
		initialSupply,
		maxSupply,
		freezeDefault,
		autoRenewAccount,
		adminKey,
		freezeKey,
		KYCKey,
		wipeKey,
		pauseKey,
		supplyKey,
		treasury,
		supplyType,
	}: {
		account: RequestAccount;
		name: string;
		symbol: string;
		decimals: number | string;
		initialSupply?: string;
		maxSupply?: string;
		freezeDefault?: boolean;
		autoRenewAccount?: string;
		adminKey?: RequestPublicKey;
		freezeKey?: RequestPublicKey;
		KYCKey?: RequestPublicKey;
		wipeKey?: RequestPublicKey;
		pauseKey?: RequestPublicKey;
		supplyKey?: RequestPublicKey;
		treasury?: string;
		supplyType?: TokenSupplyType;
	}) {
		super({
			account: Validation.checkAccount(),
			name: (val) => {
				return StableCoin.checkName(val as string);
			},
			symbol: (val) => {
				return StableCoin.checkSymbol(val as string);
			},
			decimals: (val) => {
				if (isNaN(this.decimals))
					return [new InvalidType(this.decimals, 'number')];
				return StableCoin.checkDecimals(val as number);
			},
			initialSupply: (val) => {
				if (this.initialSupply === undefined) {
					return;
				}
				if (!BigDecimal.isBigDecimal(this.initialSupply)) {
					return [new InvalidType(this.initialSupply, 'BigDecimal')];
				}

				const bInitialSupply = BigDecimal.fromString(
					this.initialSupply,
				);
				const bMaxSupply =
					this.maxSupply && BigDecimal.isBigDecimal(this.maxSupply)
						? BigDecimal.fromString(this.maxSupply)
						: undefined;

				if (CheckNums.hasMoreDecimals(bInitialSupply, this.decimals)) {
					return [
						new InvalidDecimalRange(
							this.initialSupply,
							this.decimals,
						),
					];
				}
				if (bMaxSupply && bInitialSupply.isGreaterThan(bMaxSupply)) {
					return [
						new InvalidRange(
							'Initial supply cannot be more than the max supply',
						),
					];
				}
				return StableCoin.checkInitialSupply(
					bInitialSupply,
					bMaxSupply,
					this.supplyType,
				);
			},
			maxSupply: (val) => {
				if (this.maxSupply === undefined) {
					return;
				}
				if (!BigDecimal.isBigDecimal(this.maxSupply)) {
					return [new InvalidType(this.maxSupply, 'BigDecimal')];
				}

				const bMaxSupply = BigDecimal.fromString(this.maxSupply);
				const bInitialSupply =
					this.initialSupply &&
					BigDecimal.isBigDecimal(this.initialSupply)
						? BigDecimal.fromString(this.initialSupply)
						: undefined;

				if (CheckNums.hasMoreDecimals(bMaxSupply, this.decimals)) {
					return [
						new InvalidDecimalRange(this.maxSupply, this.decimals),
					];
				}
				if (
					bInitialSupply &&
					bInitialSupply.isGreaterThan(bMaxSupply)
				) {
					return [
						new InvalidRange(
							'Initial supply cannot be more than the max supply',
						),
					];
				}
				return StableCoin.checkMaxSupply(
					bMaxSupply,
					bInitialSupply,
					this.supplyType,
				);
			},
			autoRenewAccount: (val) => {
				new AccountId(val as string);
			},
			adminKey: Validation.checkPublicKey(),
			freezeKey: Validation.checkPublicKey(),
			KYCKey: Validation.checkPublicKey(),
			wipeKey: Validation.checkPublicKey(),
			pauseKey: Validation.checkPublicKey(),
			supplyKey: Validation.checkPublicKey(),
			treasury: (val) => {
				new AccountId(val as string);
			},
		});
		this.account = account;
		this.name = name;
		this.symbol = symbol;
		this.decimals =
			typeof decimals === 'number' ? decimals : parseInt(decimals);
		this.initialSupply = initialSupply;
		this.maxSupply = maxSupply;
		this.freezeDefault = freezeDefault;
		this.autoRenewAccount = autoRenewAccount;
		this.adminKey = adminKey;
		this.freezeKey = freezeKey;
		this.KYCKey = KYCKey;
		this.wipeKey = wipeKey;
		this.pauseKey = pauseKey;
		this.supplyKey = supplyKey;
		this.treasury = treasury;
		this.supplyType = supplyType;
	}
}
