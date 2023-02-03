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

/* eslint-disable @typescript-eslint/no-unused-vars */
import CheckNums from '../../../core/checks/numbers/CheckNums.js';
import { OptionalField } from '../../../core/decorator/OptionalDecorator.js';
import Injectable from '../../../core/Injectable.js';
import { RESERVE_DECIMALS } from '../../../domain/context/reserve/Reserve.js';
import BigDecimal from '../../../domain/context/shared/BigDecimal.js';
import InvalidDecimalRange from '../../../domain/context/stablecoin/error/InvalidDecimalRange.js';
import { StableCoin } from '../../../domain/context/stablecoin/StableCoin.js';
import { TokenSupplyType } from '../../../domain/context/stablecoin/TokenSupply.js';
import { RequestPublicKey } from './BaseRequest.js';
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

	@OptionalField()
	stableCoinFactory?: string;

	@OptionalField()
	hederaERC20?: string;

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
	autoRenewAccount?: string;

	@OptionalField()
	adminKey?: RequestPublicKey;

	@OptionalField()
	freezeKey?: RequestPublicKey;

	@OptionalField()
	kycKey?: RequestPublicKey;

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

	@OptionalField()
	grantKYCToOriginalSender?: boolean;

	constructor({
		name,
		symbol,
		decimals,
		initialSupply,
		maxSupply,
		freezeDefault,
		autoRenewAccount,
		adminKey,
		freezeKey,
		kycKey,
		wipeKey,
		pauseKey,
		supplyKey,
		treasury,
		supplyType,
		stableCoinFactory,
		hederaERC20,
		reserveAddress,
		reserveInitialAmount,
		createReserve,
		grantKYCToOriginalSender,
	}: {
		name: string;
		symbol: string;
		decimals: number | string;
		initialSupply?: string;
		maxSupply?: string;
		freezeDefault?: boolean;
		autoRenewAccount?: string;
		adminKey?: RequestPublicKey;
		freezeKey?: RequestPublicKey;
		kycKey?: RequestPublicKey;
		wipeKey?: RequestPublicKey;
		pauseKey?: RequestPublicKey;
		supplyKey?: RequestPublicKey;
		treasury?: string;
		supplyType?: TokenSupplyType;
		stableCoinFactory?: string;
		hederaERC20?: string;
		reserveAddress?: string;
		reserveInitialAmount?: string;
		createReserve: boolean;
		grantKYCToOriginalSender?: boolean;
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
			autoRenewAccount: (val) => {
				const err = Validation.checkHederaIdFormat()(val);
				const handler = Injectable.resolveTransactionHandler();
				const id = handler.getAccount().id.toString();
				if (err.length > 0) {
					return err;
				} else {
					if (val !== id) {
						return [
							new InvalidValue(
								`The autorenew account (${val}) should be your current account (${id}).`,
							),
						];
					}
				}
			},
			adminKey: Validation.checkPublicKey(),
			freezeKey: Validation.checkPublicKey(),
			kycKey: Validation.checkPublicKey(),
			wipeKey: Validation.checkPublicKey(),
			pauseKey: Validation.checkPublicKey(),
			supplyKey: Validation.checkPublicKey(),
			treasury: Validation.checkHederaIdFormat(),
			stableCoinFactory: Validation.checkContractId(),
			hederaERC20: Validation.checkContractId(),
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
		this.kycKey = kycKey;
		this.wipeKey = wipeKey;
		this.pauseKey = pauseKey;
		this.supplyKey = supplyKey;
		this.treasury = treasury;
		this.supplyType = supplyType;
		this.stableCoinFactory = stableCoinFactory;
		this.hederaERC20 = hederaERC20;
		this.reserveAddress = reserveAddress;
		this.reserveInitialAmount = reserveInitialAmount;
		this.createReserve = createReserve;
		this.grantKYCToOriginalSender = grantKYCToOriginalSender;
	}
}
