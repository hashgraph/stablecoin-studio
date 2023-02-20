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

/* eslint-disable @typescript-eslint/no-explicit-any */
import ValidatedRequest from './validation/ValidatedRequest.js';
import Validation from './validation/Validation.js';
import { InvalidType } from './error/InvalidType.js';
import InvalidDecimalRange from '../../../domain/context/stablecoin/error/InvalidDecimalRange.js';
import { InvalidValue } from './error/InvalidValue.js';
import CheckNums from '../../../core/checks/numbers/CheckNums.js';
import { InvalidRange } from './error/InvalidRange.js';
import BigDecimal from '../../../domain/context/shared/BigDecimal.js';
import { MAX_PERCENTAGE_DECIMALS } from '../../../domain/context/fee/CustomFee.js';
import { OptionalField } from '../../../core/decorator/OptionalDecorator.js';

export default class AddFractionalFeeRequest extends ValidatedRequest<AddFractionalFeeRequest> {
	tokenId: string;
	collectorId: string;
	collectorsExempt: boolean;
	decimals: number;
	@OptionalField()
	percentage?: string;
	@OptionalField()
	amountNumerator?: string;
	@OptionalField()
	amountDenominator?: string;
	min: string;
	max: string;
	net: boolean;

	constructor({
		tokenId,
		collectorId,
		collectorsExempt,
		decimals,
		percentage,
		amountNumerator,
		amountDenominator,
		min,
		max,
		net,
	}: {
		tokenId: string;
		collectorId: string;
		collectorsExempt: boolean;
		decimals: number;
		percentage?: string;
		amountNumerator?: string;
		amountDenominator?: string;
		min: string;
		max: string;
		net: boolean;
	}) {
		super({
			tokenId: Validation.checkHederaIdFormat(),
			collectorId: Validation.checkHederaIdFormat(),
			amountNumerator: (val) => {
				if (val === undefined || val === '') {
					return;
				}

				const numerator = parseInt(val);

				if (isNaN(numerator)) return [new InvalidType(val, 'integer')];

				if (CheckNums.hasMoreDecimals(val, 0)) {
					return [new InvalidDecimalRange(val, 0)];
				}

				if (numerator < 1)
					return [new InvalidRange(val, '1', undefined)];
			},
			amountDenominator: (val) => {
				if (val === undefined || val === '') {
					if (
						this.amountNumerator === undefined ||
						this.amountNumerator === ''
					)
						return;
					else return [new InvalidType(val, 'integer')];
				}

				const denominator = parseInt(val);

				if (isNaN(denominator))
					return [new InvalidType(val, 'integer')];

				if (CheckNums.hasMoreDecimals(val, 0)) {
					return [new InvalidDecimalRange(val, 0)];
				}

				const numerator = parseInt(this.amountNumerator!);

				if (numerator >= denominator)
					return [
						new InvalidValue(
							`The denominator (${denominator}) should be greater than the numerator (${numerator}).`,
						),
					];
			},
			percentage: (val) => {
				if (
					this.amountNumerator !== undefined &&
					this.amountNumerator !== ''
				) {
					return;
				}

				if (val === undefined || val === '') {
					return [new InvalidType(val, 'integer')];
				}

				if (!BigDecimal.isBigDecimal(val)) {
					return [new InvalidType(val, 'BigDecimal')];
				}

				if (CheckNums.hasMoreDecimals(val, MAX_PERCENTAGE_DECIMALS)) {
					return [
						new InvalidDecimalRange(val, MAX_PERCENTAGE_DECIMALS),
					];
				}

				const zero = BigDecimal.fromString(
					'0',
					MAX_PERCENTAGE_DECIMALS,
				);
				const oneHundred = BigDecimal.fromString(
					'100',
					MAX_PERCENTAGE_DECIMALS,
				);
				const value = BigDecimal.fromString(
					val,
					MAX_PERCENTAGE_DECIMALS,
				);

				if (
					value.isLowerOrEqualThan(zero) ||
					value.isGreaterOrEqualThan(oneHundred)
				) {
					return [new InvalidRange(value, '0+..100', undefined)];
				}
			},
			min: (val) => {
				if (!BigDecimal.isBigDecimal(val)) {
					return [new InvalidType(val, 'BigDecimal')];
				}
				if (CheckNums.hasMoreDecimals(val, this.decimals)) {
					return [new InvalidDecimalRange(val, this.decimals)];
				}

				const zero = BigDecimal.fromString('0', this.decimals);
				const minimum = BigDecimal.fromString(val, this.decimals);

				if (minimum.isLowerThan(zero)) {
					return [new InvalidRange(val, '0', undefined)];
				}
			},
			max: (val) => {
				if (val === undefined || val === '') {
					return [
						new InvalidValue(
							`The maximum (${val}) should not be empty.`,
						),
					];
				}
				if (!BigDecimal.isBigDecimal(val)) {
					return [new InvalidType(val, 'BigDecimal')];
				}
				if (CheckNums.hasMoreDecimals(val, this.decimals)) {
					return [new InvalidDecimalRange(val, this.decimals)];
				}
				const maximum = BigDecimal.fromString(val, this.decimals);

				if (this.min !== undefined && this.min !== '') {
					const minimum = BigDecimal.fromString(
						this.min,
						this.decimals,
					);
					if (minimum.isGreaterThan(maximum))
						return [
							new InvalidValue(
								`The maximum (${val}) should be greater than or equal to the minimum (${this.min}).`,
							),
						];
				}
			},
		});
		this.tokenId = tokenId;
		this.collectorId = collectorId;
		this.collectorsExempt = collectorsExempt;
		this.decimals = decimals;
		this.percentage = percentage;
		this.amountDenominator = amountDenominator;
		this.amountNumerator = amountNumerator;
		this.min = min;
		this.max = max;
		this.net = net;
	}
}
