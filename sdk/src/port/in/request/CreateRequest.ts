/* eslint-disable @typescript-eslint/no-unused-vars */
import CheckNums from '../../../core/checks/numbers/CheckNums.js';
import { OptionalField } from '../../../core/decorator/OptionalDecorator.js';
import BigDecimal from '../../../domain/context/shared/BigDecimal.js';
import InvalidDecimalRange from '../../../domain/context/stablecoin/error/InvalidDecimalRange.js';
import { StableCoin } from '../../../domain/context/stablecoin/StableCoin.js';
import { TokenSupplyType } from '../../../domain/context/stablecoin/TokenSupply.js';
import {
	AccountBaseRequest,
	RequestAccount,
	RequestPublicKey,
} from './BaseRequest.js';
import { InvalidType } from './error/InvalidType.js';
import { InvalidValue } from './error/InvalidValue.js';
import ValidatedRequest from './validation/ValidatedRequest.js';
import Validation from './validation/Validation.js';

export default class CreateRequest extends ValidatedRequest<CreateRequest> {
	name: string;
	symbol: string;
	private _decimals: number;
	public get decimals(): number {
		return this._decimals;
	}
	public set decimals(value: number | string) {
		this._decimals = typeof value === 'number' ? value : parseFloat(value);
	}

	stableCoinFactory: string;

	hederaERC20: string;

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
		stableCoinFactory,
		hederaERC20,
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
		stableCoinFactory: string;
		hederaERC20: string;
	}) {
		super({
			name: (val) => {
				return StableCoin.checkName(val);
			},
			symbol: (val) => {
				return StableCoin.checkSymbol(val);
			},
			decimals: (val) => {
				return StableCoin.checkInteger(val);
			},
			initialSupply: (val) => {
				if (val === undefined || val === '') {
					return;
				}
				if (!BigDecimal.isBigDecimal(val)) {
					return [new InvalidType(val, 'BigDecimal')];
				}
				if (CheckNums.hasMoreDecimals(val, this.decimals)) {
					return [new InvalidDecimalRange(val, this.decimals)];
				}

				const bInitialSupply = BigDecimal.fromString(
					val,
					this.decimals,
				);
				const bMaxSupply =
					this.maxSupply &&
					BigDecimal.isBigDecimal(this.maxSupply) &&
					!CheckNums.hasMoreDecimals(this.maxSupply, this.decimals)
						? BigDecimal.fromString(this.maxSupply, this.decimals)
						: undefined;

				return StableCoin.checkInitialSupply(
					bInitialSupply,
					this.decimals,
					bMaxSupply,
				);
			},
			maxSupply: (val) => {
				if (val === undefined) {
					return;
				}
				if (!BigDecimal.isBigDecimal(val)) {
					return [new InvalidType(val, 'BigDecimal')];
				}
				if (CheckNums.hasMoreDecimals(val, this.decimals)) {
					return [new InvalidDecimalRange(val, this.decimals)];
				}

				const bMaxSupply = BigDecimal.fromString(val, this.decimals);
				const bInitialSupply =
					this.initialSupply &&
					BigDecimal.isBigDecimal(this.initialSupply) &&
					!CheckNums.hasMoreDecimals(
						this.initialSupply,
						this.decimals,
					)
						? BigDecimal.fromString(
								this.initialSupply,
								this.decimals,
						  )
						: undefined;

				return StableCoin.checkMaxSupply(
					bMaxSupply,
					this.decimals,
					bInitialSupply,
					this.supplyType,
				);
			},
			autoRenewAccount: Validation.checkHederaIdFormat(),
			adminKey: Validation.checkPublicKey(),
			freezeKey: Validation.checkPublicKey(),
			KYCKey: Validation.checkPublicKey(),
			wipeKey: Validation.checkPublicKey(),
			pauseKey: Validation.checkPublicKey(),
			supplyKey: Validation.checkPublicKey(),
			treasury: Validation.checkHederaIdFormat(),
			stableCoinFactory: Validation.checkContractId(),
			hederaERC20: Validation.checkContractId(),
		});
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
		this.stableCoinFactory = stableCoinFactory;
		this.hederaERC20 = hederaERC20;
	}
}
