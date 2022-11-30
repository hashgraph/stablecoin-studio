import { BigNumber } from 'ethers';
import CheckNums from '../../../core/checks/numbers/CheckNums.js';
import CheckStrings from '../../../core/checks/strings/CheckStrings.js';
import BaseError from '../../../core/error/BaseError.js';
import { InvalidType } from '../../../port/in/request/error/InvalidType.js';
import PublicKey from '../account/PublicKey.js';
import BigDecimal from '../shared/BigDecimal.js';
import { HederaId } from '../shared/HederaId.js';
import { InitSupplyInvalid } from './error/InitSupplyInvalid.js';
import { InitSupplyLargerThanMaxSupply } from './error/InitSupplyLargerThanMaxSupply.js';
import InvalidAmount from './error/InvalidAmount.js';
import InvalidDecimalRange from './error/InvalidDecimalRange.js';
import InvalidMaxSupplySupplyType from './error/InvalidMaxSupplySupplyType.js';
import { MaxSupplyOverLimit } from './error/MaxSupplyOverLimit.js';
import NameEmpty from './error/NameEmpty.js';
import NameLength from './error/NameLength.js';
import SymbolEmpty from './error/SymbolEmpty.js';
import SymbolLength from './error/SymbolLength.js';
import { TokenSupplyType } from './TokenSupply.js';
import { TokenType } from './TokenType.js';

const MAX_SUPPLY = 9_223_372_036_854_775_807n;
const TEN = 10;
const ONE_HUNDRED = 100;
const EIGHTEEN = 18;
const ZERO = 0;

export interface StableCoinProps {
	name: string;
	symbol: string;
	decimals: number;
	adminKey?: PublicKey | HederaId;
	initialSupply?: BigDecimal;
	totalSupply?: BigDecimal;
	maxSupply?: BigDecimal;
	proxyAddress?: HederaId;
	evmProxyAddress?: HederaId;
	freezeKey?: PublicKey | HederaId;
	freezeDefault?: boolean;
	kycKey?: PublicKey | HederaId;
	wipeKey?: PublicKey | HederaId;
	pauseKey?: PublicKey | HederaId;
	paused?: string;
	supplyKey?: PublicKey | HederaId;
	treasury?: HederaId;
	tokenType?: TokenType;
	supplyType?: TokenSupplyType;
	tokenId?: HederaId;
	autoRenewAccount?: HederaId;
	autoRenewAccountPeriod?: number;
	deleted?: boolean;
}

export class StableCoin implements StableCoinProps {
	public static MAX_SUPPLY: bigint = MAX_SUPPLY;
	name: string;
	symbol: string;
	decimals: number;
	adminKey?: PublicKey | HederaId;
	initialSupply?: BigDecimal;
	totalSupply?: BigDecimal;
	maxSupply?: BigDecimal;
	proxyAddress?: HederaId;
	evmProxyAddress?: HederaId;
	freezeKey?: PublicKey | HederaId;
	freezeDefault?: boolean;
	kycKey?: PublicKey | HederaId;
	wipeKey?: PublicKey | HederaId;
	pauseKey?: PublicKey | HederaId;
	paused?: string;
	supplyKey?: PublicKey | HederaId;
	treasury?: HederaId;
	tokenType?: TokenType;
	supplyType?: TokenSupplyType;
	tokenId?: HederaId;
	autoRenewAccount?: HederaId;
	autoRenewAccountPeriod?: number;
	deleted?: boolean;

	constructor(params: StableCoinProps) {
		const {
			adminKey,
			name,
			symbol,
			decimals,
			initialSupply,
			totalSupply,
			maxSupply,
			freezeKey,
			freezeDefault,
			kycKey,
			wipeKey,
			pauseKey,
			supplyKey,
			treasury,
			tokenType,
			supplyType,
			tokenId,
			autoRenewAccount,
			autoRenewAccountPeriod,
			deleted,
			paused,
			evmProxyAddress,
			proxyAddress
		} = params;

		this.adminKey = adminKey;
		this.name = name;
		this.symbol = symbol;
		this.decimals = decimals;
		this.initialSupply = initialSupply ?? BigDecimal.ZERO;
		this.totalSupply = totalSupply ?? BigDecimal.ZERO;
		this.maxSupply = maxSupply ?? undefined;
		this.freezeKey = freezeKey;
		this.freezeDefault = freezeDefault ?? false;
		this.kycKey = kycKey;
		this.wipeKey = wipeKey;
		this.pauseKey = pauseKey;
		this.supplyKey = supplyKey;
		this.treasury = treasury;
		this.tokenType = tokenType ?? TokenType.FUNGIBLE_COMMON;
		this.supplyType =
			(supplyType && !maxSupply) || !supplyType
				? TokenSupplyType.INFINITE
				: TokenSupplyType.FINITE;
		this.tokenId = tokenId ?? HederaId.from('0.0.0');
		this.autoRenewAccount = autoRenewAccount ?? HederaId.from('0.0.0');
		this.autoRenewAccountPeriod = autoRenewAccountPeriod ?? 0;
		this.paused = paused ?? '';
		this.deleted = deleted ?? false;
		this.evmProxyAddress = evmProxyAddress;
		this.proxyAddress = proxyAddress;
	}

	public static checkName(value: string): BaseError[] {
		const maxNameLength = ONE_HUNDRED;
		const errorList: BaseError[] = [];

		if (!CheckStrings.isNotEmpty(value)) errorList.push(new NameEmpty());
		if (!CheckStrings.isLengthUnder(value, maxNameLength))
			errorList.push(new NameLength(value, maxNameLength));

		return errorList;
	}

	public static checkSymbol(value: string): BaseError[] {
		const maxSymbolLength = ONE_HUNDRED;
		const errorList: BaseError[] = [];

		if (!CheckStrings.isNotEmpty(value)) errorList.push(new SymbolEmpty());
		if (!CheckStrings.isLengthUnder(value, maxSymbolLength))
			errorList.push(new SymbolLength(value, maxSymbolLength));

		return errorList;
	}

	public static checkDecimals(value: number): BaseError[] {
		const errorList: BaseError[] = [];
		const min = ZERO;
		const max = EIGHTEEN;

		if (CheckNums.hasMoreDecimals(value.toString(), 0)) {
			errorList.push(new InvalidType(value, 'integer'));
		}
		if (!CheckNums.isWithinRange(value, min, max))
			errorList.push(new InvalidDecimalRange(value, min, max));

		return errorList;
	}
	public static checkInteger(value: number): BaseError[] {
		const errorList: BaseError[] = [];

		if (!Number.isInteger(value)) {
			return [new InvalidType(value, 'integer')];
		}

		return errorList;
	}

	public static checkInitialSupply(
		initialSupply: BigDecimal,
		decimals: number,
		maxSupply?: BigDecimal,
	): BaseError[] {
		const list: BaseError[] = [];
		const min = BigDecimal.ZERO;
		const max =
			maxSupply ??
			BigDecimal.fromValue(BigNumber.from(MAX_SUPPLY), decimals);
		if (!CheckNums.isWithinRange(initialSupply, min, max)) {
			list.push(new InitSupplyInvalid(initialSupply.toString()));
		}
		return list;
	}

	public static checkMaxSupply(
		maxSupply: BigDecimal,
		decimals: number,
		initialSupply?: BigDecimal,
		supplyType?: TokenSupplyType,
	): BaseError[] {
		let list: BaseError[] = [];
		const min = initialSupply ?? BigDecimal.ZERO;
		const max = BigDecimal.fromValue(BigNumber.from(MAX_SUPPLY), decimals);
		if (CheckNums.isLessThan(maxSupply, min)) {
			if (min.isZero()) {
				list.push(
					new InvalidAmount(maxSupply.toString(), min.toString()),
				);
			} else {
				list.push(
					new InitSupplyLargerThanMaxSupply(
						min.toString(),
						maxSupply.toString(),
					),
				);
			}
		}
		if (CheckNums.isGreaterThan(maxSupply, max)) {
			list.push(
				new MaxSupplyOverLimit(maxSupply.toString(), max.toString()),
			);
		}

		list = [...list, ...StableCoin.checkSupplyType(maxSupply, supplyType)];

		return list;
	}

	private static checkSupplyType(
		maxSupply: BigDecimal,
		supplyType?: TokenSupplyType,
	): BaseError[] {
		const list: BaseError[] = [];

		if (supplyType && supplyType !== TokenSupplyType.FINITE) {
			if (CheckNums.isGreaterThan(maxSupply, BigDecimal.ZERO)) {
				list.push(new InvalidMaxSupplySupplyType(maxSupply.toString()));
			}
			return list;
		}
		return list;
	}

	public getDecimalOperator(): number {
		return TEN ** this.decimals;
	}

	public fromInteger(amount: number): number {
		const res = amount / this.getDecimalOperator();
		if (!this.isValidAmount(res)) {
			throw new InvalidAmount(res, this.decimals);
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
