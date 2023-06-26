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

import CheckNums from '../../../core/checks/numbers/CheckNums.js';
import { OptionalField } from '../../../core/decorator/OptionalDecorator.js';
import { RESERVE_DECIMALS } from '../../../domain/context/reserve/Reserve.js';
import BigDecimal from '../../../domain/context/shared/BigDecimal.js';
import InvalidDecimalRange from '../../../domain/context/stablecoin/error/InvalidDecimalRange.js';
import { StableCoin } from '../../../domain/context/stablecoin/StableCoin.js';
import { TokenSupplyType } from '../../../domain/context/stablecoin/TokenSupply.js';
import { RequestPublicKey } from './BaseRequest.js';
import { InvalidType } from './error/InvalidType.js';
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

	@OptionalField()
	stableCoinFactory?: string;

	@OptionalField()
	hederaTokenManager?: string;

	createReserve: boolean;

	@OptionalField()
	reserveAddress?: string;

	@OptionalField()
	reserveInitialAmount?: string | undefined;

	@OptionalField()
	initialSupply?: string | undefined;

	@OptionalField()
	maxSupply?: string | undefined;

	@OptionalField()
	freezeDefault?: boolean;

	@OptionalField()
	freezeKey?: RequestPublicKey;

	@OptionalField()
	kycKey?: RequestPublicKey;

	@OptionalField()
	wipeKey?: RequestPublicKey;

	@OptionalField()
	pauseKey?: RequestPublicKey;

	@OptionalField()
	feeScheduleKey?: RequestPublicKey;

	@OptionalField()
	supplyType?: TokenSupplyType;

	@OptionalField()
	grantKYCToOriginalSender?: boolean;

	@OptionalField()
	burnRoleAccount?: string | undefined;

	@OptionalField()
	wipeRoleAccount?: string | undefined;

	@OptionalField()
	rescueRoleAccount?: string | undefined;

	@OptionalField()
	pauseRoleAccount?: string | undefined;

	@OptionalField()
	freezeRoleAccount?: string | undefined;

	@OptionalField()
	deleteRoleAccount?: string | undefined;

	@OptionalField()
	kycRoleAccount?: string | undefined;

	@OptionalField()
	cashInRoleAccount?: string | undefined;

	@OptionalField()
	cashInRoleAllowance?: string | undefined;

	@OptionalField()
	metadata?: string | undefined;

	constructor({
		name,
		symbol,
		decimals,
		initialSupply,
		maxSupply,
		freezeDefault,
		freezeKey,
		kycKey,
		wipeKey,
		pauseKey,
		supplyType,
		feeScheduleKey,
		stableCoinFactory,
		hederaTokenManager,
		reserveAddress,
		reserveInitialAmount,
		createReserve,
		grantKYCToOriginalSender,
		burnRoleAccount,
		wipeRoleAccount,
		rescueRoleAccount,
		pauseRoleAccount,
		freezeRoleAccount,
		deleteRoleAccount,
		kycRoleAccount,
		cashInRoleAccount,
		cashInRoleAllowance,
		metadata,
	}: {
		name: string;
		symbol: string;
		decimals: number | string;
		initialSupply?: string;
		maxSupply?: string;
		freezeDefault?: boolean;
		freezeKey?: RequestPublicKey;
		kycKey?: RequestPublicKey;
		wipeKey?: RequestPublicKey;
		pauseKey?: RequestPublicKey;
		feeScheduleKey?: RequestPublicKey;
		supplyType?: TokenSupplyType;
		stableCoinFactory?: string;
		hederaTokenManager?: string;
		reserveAddress?: string;
		reserveInitialAmount?: string;
		createReserve: boolean;
		grantKYCToOriginalSender?: boolean;
		burnRoleAccount?: string;
		wipeRoleAccount?: string;
		rescueRoleAccount?: string;
		pauseRoleAccount?: string;
		freezeRoleAccount?: string;
		deleteRoleAccount?: string;
		kycRoleAccount?: string;
		cashInRoleAccount?: string;
		cashInRoleAllowance?: string;
		metadata?: string;
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
			freezeKey: Validation.checkPublicKey(),
			kycKey: Validation.checkPublicKey(),
			wipeKey: Validation.checkPublicKey(),
			pauseKey: Validation.checkPublicKey(),
			feeScheduleKey: Validation.checkPublicKey(),
			stableCoinFactory: Validation.checkContractId(),
			hederaTokenManager: Validation.checkContractId(),
			reserveAddress: Validation.checkContractId(),
			reserveInitialAmount: (val) => {
				if (
					val === undefined ||
					val === '' ||
					this.createReserve == false
				) {
					return;
				}
				if (!BigDecimal.isBigDecimal(val)) {
					return [new InvalidType(val, 'BigDecimal')];
				}
				if (CheckNums.hasMoreDecimals(val, RESERVE_DECIMALS)) {
					return [new InvalidDecimalRange(val, RESERVE_DECIMALS)];
				}

				const commonDecimals =
					RESERVE_DECIMALS > this.decimals
						? RESERVE_DECIMALS
						: this.decimals;

				const reserveInitialAmount = BigDecimal.fromString(
					val,
					commonDecimals,
				);

				const bInitialSupply =
					this.initialSupply &&
					BigDecimal.isBigDecimal(this.initialSupply) &&
					!CheckNums.hasMoreDecimals(
						this.initialSupply,
						this.decimals,
					)
						? BigDecimal.fromString(
								this.initialSupply,
								commonDecimals,
						  )
						: undefined;

				return StableCoin.checkReserveInitialAmount(
					reserveInitialAmount,
					commonDecimals,
					bInitialSupply,
				);
			},
			burnRoleAccount: Validation.checkHederaIdFormat(true),
			wipeRoleAccount: Validation.checkHederaIdFormat(true),
			rescueRoleAccount: Validation.checkHederaIdFormat(true),
			pauseRoleAccount: Validation.checkHederaIdFormat(true),
			freezeRoleAccount: Validation.checkHederaIdFormat(true),
			deleteRoleAccount: Validation.checkHederaIdFormat(true),
			kycRoleAccount: Validation.checkHederaIdFormat(true),
			cashInRoleAccount: Validation.checkHederaIdFormat(true),
			cashInRoleAllowance: (val) => {
				if (val === undefined || val === '') {
					return;
				}
				if (!BigDecimal.isBigDecimal(val)) {
					return [new InvalidType(val, 'BigDecimal')];
				}
				if (CheckNums.hasMoreDecimals(val, this.decimals)) {
					return [new InvalidDecimalRange(val, this.decimals)];
				}
				return StableCoin.checkCashInAllowance(
					BigDecimal.fromString(val, this.decimals),
					this.decimals,
				);
			},
			metadata: Validation.checkString({ max: 100, emptyCheck: false }),
		});
		this.name = name;
		this.symbol = symbol;
		this.decimals =
			typeof decimals === 'number' ? decimals : parseInt(decimals);
		this.initialSupply = initialSupply;
		this.maxSupply = maxSupply;
		this.freezeDefault = freezeDefault;
		this.freezeKey = freezeKey;
		this.kycKey = kycKey;
		this.wipeKey = wipeKey;
		this.pauseKey = pauseKey;
		this.feeScheduleKey = feeScheduleKey;
		this.supplyType = supplyType;
		this.stableCoinFactory = stableCoinFactory;
		this.hederaTokenManager = hederaTokenManager;
		this.reserveAddress = reserveAddress;
		this.reserveInitialAmount = reserveInitialAmount;
		this.createReserve = createReserve;
		this.grantKYCToOriginalSender = grantKYCToOriginalSender;
		this.burnRoleAccount = burnRoleAccount;
		this.wipeRoleAccount = wipeRoleAccount;
		this.rescueRoleAccount = rescueRoleAccount;
		this.pauseRoleAccount = pauseRoleAccount;
		this.freezeRoleAccount = freezeRoleAccount;
		this.deleteRoleAccount = deleteRoleAccount;
		this.kycRoleAccount = kycRoleAccount;
		this.cashInRoleAccount = cashInRoleAccount;
		this.cashInRoleAllowance = cashInRoleAllowance;
		this.metadata = metadata;
	}
}
