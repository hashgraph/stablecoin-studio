/*
 *
 * Hedera Stable Coin SDK
 *
 * Copyright (C) 2023 Hedera Hashgraph, LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 *
 */

import { BigNumber } from 'ethers';
import MemoLength from './error/MemoLength.js';
import CheckNums from '../../../core/checks/numbers/CheckNums.js';
import CheckStrings from '../../../core/checks/strings/CheckStrings.js';
import BaseError from '../../../core/error/BaseError.js';
import { InvalidType } from '../../../port/in/request/error/InvalidType.js';
import PublicKey from '../account/PublicKey.js';
import BaseEntity from '../BaseEntity.js';
import { StableCoinMemo } from './StableCoinMemo.js';
import ContractId from '../contract/ContractId.js';
import BigDecimal from '../shared/BigDecimal.js';
import { HederaId } from '../shared/HederaId.js';
import { InitSupplyInvalid } from './error/InitSupplyInvalid.js';
import { InitSupplyLargerThanMaxSupply } from './error/InitSupplyLargerThanMaxSupply.js';
import { InitSupplyLargerThanReserveAmount } from './error/InitSupplyLargerThanReserveAmount.js';
import InvalidAmount from './error/InvalidAmount.js';
import InvalidDecimalRange from './error/InvalidDecimalRange.js';
import InvalidMaxSupplySupplyType from './error/InvalidMaxSupplySupplyType.js';
import { MaxSupplyOverLimit } from './error/MaxSupplyOverLimit.js';
import { ReserveAmountOverLimit } from './error/ReserveAmountOverLimit.js';
import NameEmpty from './error/NameEmpty.js';
import NameLength from './error/NameLength.js';
import SymbolEmpty from './error/SymbolEmpty.js';
import SymbolLength from './error/SymbolLength.js';
import { TokenSupplyType } from './TokenSupply.js';
import { TokenType } from './TokenType.js';
import EvmAddress from '../contract/EvmAddress.js';
import { CustomFee } from '../fee/CustomFee.js';
import { CashInAllowanceInvalid } from './error/CashInAllowanceInvalid.js';
import InvalidAutoRenewPeriod from './error/InvalidAutoRenewPeriod.js';
import InvalidExpirationTimestamp from './error/InvalidExpirationTimestamp.js';

const MAX_SUPPLY = 9_223_372_036_854_775_807n;
const TEN = 10;
const ONE_HUNDRED = 100;
const EIGHTEEN = 18;
const ZERO = 0;
export const TRANSFER_LIST_SIZE = 10;

export interface StableCoinProps {
	name: string;
	symbol: string;
	decimals: number;
	adminKey?: PublicKey | ContractId;
	initialSupply?: BigDecimal;
	totalSupply?: BigDecimal;
	maxSupply?: BigDecimal;
	memo?: string;
	proxyAddress?: HederaId;
	evmProxyAddress?: EvmAddress;
	freezeKey?: PublicKey | ContractId;
	freezeDefault?: boolean;
	kycKey?: PublicKey | ContractId;
	wipeKey?: PublicKey | ContractId;
	pauseKey?: PublicKey | ContractId;
	feeScheduleKey?: PublicKey;
	paused?: boolean;
	supplyKey?: PublicKey | ContractId;
	treasury?: HederaId;
	tokenType?: TokenType;
	supplyType?: TokenSupplyType;
	tokenId?: HederaId;
	grantKYCToOriginalSender?: boolean;
	autoRenewAccount?: HederaId;
	autoRenewPeriod?: number;
	expirationTimestamp?: number;
	deleted?: boolean;
	customFees?: CustomFee[];
	burnRoleAccount?: HederaId;
	wipeRoleAccount?: HederaId;
	rescueRoleAccount?: HederaId;
	pauseRoleAccount?: HederaId;
	freezeRoleAccount?: HederaId;
	deleteRoleAccount?: HederaId;
	kycRoleAccount?: HederaId;
	cashInRoleAccount?: HederaId;
	cashInRoleAllowance?: BigDecimal;
}

export class StableCoin extends BaseEntity implements StableCoinProps {
	public static MAX_SUPPLY: bigint = MAX_SUPPLY;
	name: string;
	symbol: string;
	decimals: number;
	adminKey?: PublicKey | ContractId;
	initialSupply?: BigDecimal;
	totalSupply?: BigDecimal;
	maxSupply?: BigDecimal;
	memo?: string;
	proxyAddress?: HederaId;
	evmProxyAddress?: EvmAddress;
	freezeKey?: PublicKey | ContractId;
	freezeDefault?: boolean;
	kycKey?: PublicKey | ContractId;
	wipeKey?: PublicKey | ContractId;
	pauseKey?: PublicKey | ContractId;
	feeScheduleKey?: PublicKey;
	paused?: boolean;
	supplyKey?: PublicKey | ContractId;
	treasury?: HederaId;
	tokenType?: TokenType;
	supplyType?: TokenSupplyType;
	tokenId?: HederaId;
	grantKYCToOriginalSender?: boolean;
	autoRenewAccount?: HederaId;
	autoRenewPeriod?: number;
	expirationTimestamp?: number;
	deleted?: boolean;
	customFees?: CustomFee[];
	burnRoleAccount?: HederaId;
	wipeRoleAccount?: HederaId;
	rescueRoleAccount?: HederaId;
	pauseRoleAccount?: HederaId;
	freezeRoleAccount?: HederaId;
	deleteRoleAccount?: HederaId;
	kycRoleAccount?: HederaId;
	cashInRoleAccount?: HederaId;
	cashInRoleAllowance?: BigDecimal;

	constructor(params: StableCoinProps) {
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
			feeScheduleKey,
			treasury,
			tokenType,
			supplyType,
			tokenId,
			autoRenewAccount,
			autoRenewPeriod,
			expirationTimestamp,
			deleted,
			paused,
			evmProxyAddress,
			proxyAddress,
			grantKYCToOriginalSender,
			customFees,
			burnRoleAccount,
			wipeRoleAccount,
			rescueRoleAccount,
			freezeRoleAccount,
			pauseRoleAccount,
			deleteRoleAccount,
			kycRoleAccount,
			cashInRoleAccount,
			cashInRoleAllowance,
		} = params;
		super();
		this.adminKey = adminKey;
		this.name = name;
		this.symbol = symbol;
		this.decimals = decimals;
		this.initialSupply = initialSupply ?? BigDecimal.ZERO;
		this.totalSupply = totalSupply ?? BigDecimal.ZERO;
		this.maxSupply = maxSupply ?? undefined;
		this.memo = memo ? memo : StableCoinMemo.empty().toJson();
		this.freezeKey = freezeKey;
		this.freezeDefault = freezeDefault ?? false;
		this.kycKey = kycKey;
		this.wipeKey = wipeKey;
		this.pauseKey = pauseKey;
		this.supplyKey = supplyKey;
		this.feeScheduleKey = feeScheduleKey;
		this.treasury = treasury;
		this.tokenType = tokenType ?? TokenType.FUNGIBLE_COMMON;
		this.supplyType = supplyType
			? supplyType
			: maxSupply && maxSupply.isGreaterThan(BigDecimal.ZERO)
			? TokenSupplyType.FINITE
			: TokenSupplyType.INFINITE;
		this.tokenId = tokenId ?? HederaId.from('0.0.0');
		this.autoRenewAccount = autoRenewAccount ?? HederaId.from('0.0.0');
		this.autoRenewPeriod = autoRenewPeriod ?? 0;
		this.expirationTimestamp = expirationTimestamp ?? 0;
		this.paused = paused ?? false;
		this.deleted = deleted ?? false;
		this.evmProxyAddress = evmProxyAddress;
		this.proxyAddress = proxyAddress;
		this.grantKYCToOriginalSender = grantKYCToOriginalSender;
		this.customFees = customFees;
		this.burnRoleAccount = burnRoleAccount ?? HederaId.from('0.0.0');
		this.wipeRoleAccount = wipeRoleAccount ?? HederaId.from('0.0.0');
		this.rescueRoleAccount = rescueRoleAccount ?? HederaId.from('0.0.0');
		this.freezeRoleAccount = freezeRoleAccount ?? HederaId.from('0.0.0');
		this.pauseRoleAccount = pauseRoleAccount ?? HederaId.from('0.0.0');
		this.deleteRoleAccount = deleteRoleAccount ?? HederaId.from('0.0.0');
		this.kycRoleAccount = kycRoleAccount ?? HederaId.from('0.0.0');
		this.cashInRoleAccount = cashInRoleAccount ?? HederaId.from('0.0.0');
		this.cashInRoleAllowance = cashInRoleAllowance;
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

	public static checkCashInAllowance(
		cashInAllowance: BigDecimal,
		decimals: number,
	): BaseError[] {
		const list: BaseError[] = [];
		const max = BigDecimal.fromValue(BigNumber.from(MAX_SUPPLY), decimals);
		if (!CheckNums.isWithinRange(cashInAllowance, BigDecimal.ZERO, max)) {
			list.push(new CashInAllowanceInvalid(cashInAllowance.toString()));
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

	public static checkReserveInitialAmount(
		reserveInitialAmount: BigDecimal,
		decimals: number,
		initialSupply?: BigDecimal,
	): BaseError[] {
		const list: BaseError[] = [];

		const min = initialSupply ?? BigDecimal.ZERO;
		const max = BigDecimal.fromValue(BigNumber.from(MAX_SUPPLY), decimals);

		if (!CheckNums.isWithinRange(reserveInitialAmount, min, max)) {
			list.push(
				new InitSupplyLargerThanReserveAmount(
					min.toString(),
					reserveInitialAmount.toString(),
				),
			);
		}

		return list;
	}

	public static checkReserveAmount(
		reserveAmount: BigDecimal,
		decimals: number,
	): BaseError[] {
		const list: BaseError[] = [];

		const min = BigDecimal.ZERO;
		const max = BigDecimal.fromValue(BigNumber.from(MAX_SUPPLY), decimals);

		if (CheckNums.isLessThan(reserveAmount, min)) {
			list.push(
				new InvalidAmount(reserveAmount.toString(), min.toString()),
			);
		}
		if (CheckNums.isGreaterThan(reserveAmount, max)) {
			list.push(
				new ReserveAmountOverLimit(
					reserveAmount.toString(),
					max.toString(),
				),
			);
		}

		return list;
	}

	public static checkMemo(value: string): BaseError[] {
		const maxMemoLength = ONE_HUNDRED;
		const errorList: BaseError[] = [];

		if (
			CheckStrings.isNotEmpty(value) &&
			!CheckStrings.isLengthUnder(value, maxMemoLength)
		)
			errorList.push(new MemoLength(value, maxMemoLength));

		return errorList;
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

	public static checkExpirationTimestamp(value: string): BaseError[] {
		const errorList: BaseError[] = [];

		const regexp = /^\d{19}$/;
		if (!value.match(regexp)) {
			return [new InvalidType(value, 'timestamp')];
		}

		const epochTimestamp: number = Number(value) / 1000000;
		const date = new Date(epochTimestamp);
		const minDate: Date = new Date();
		minDate.setDate(minDate.getDate() + 1);
		const maxDate: Date = new Date();
		maxDate.setDate(maxDate.getDate() + 730);

		if (date < minDate || date > maxDate) {
			errorList.push(
				new InvalidExpirationTimestamp(date, minDate, maxDate),
			);
		}

		return errorList;
	}

	public static checkAutoRenewPeriod(value: string): BaseError[] {
		const errorList: BaseError[] = [];

		const v: number = Number(value) / 60 / 60 / 24;
		if (!Number.isInteger(v)) {
			return [new InvalidType(v, 'integer')];
		}

		const min = 30;
		const max = 92;
		if (!CheckNums.isWithinRange(v, min, max)) {
			errorList.push(new InvalidAutoRenewPeriod(v, min, max));
		}
		return errorList;
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
