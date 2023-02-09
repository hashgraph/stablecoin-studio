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
import { InvalidValue } from './error/InvalidValue.js';
import BigDecimal from '../../../domain/context/shared/BigDecimal.js';
import { InvalidRange } from './error/InvalidRange.js';
import CheckNums from '../../../core/checks/numbers/CheckNums.js';
import InvalidDecimalRange from '../../../domain/context/stablecoin/error/InvalidDecimalRange.js';

export default class AddFractionalFeeRequest extends ValidatedRequest<AddFractionalFeeRequest> {
	tokenId: string;
	collectorId: string;
	amountNumerator: string;
	amountDenominator: string;
	min: string;
	max: string;
	decimals: number;
	net: boolean;
	collectorsExempt: boolean;

	constructor({
		tokenId,
		collectorId,
		amountNumerator,
		amountDenominator,
		min,
		max,
		decimals,
		net,
		collectorsExempt,
	}: {
		tokenId: string;
		collectorId: string;
		amountNumerator: string;
		amountDenominator: string;
		min: string;
		max: string;
		decimals: number;
		net: boolean;
		collectorsExempt: boolean;
	}) {
		super({
			tokenId: Validation.checkHederaIdFormat(),
			collectorId: Validation.checkHederaIdFormat(),
			amountNumerator: (val) => {
				const numerator = parseInt(val);

				if (isNaN(numerator)) return [new InvalidType(val, 'integer')];

				if (CheckNums.hasMoreDecimals(val, 0)) {
					return [new InvalidDecimalRange(val, 0)];
				}

				if (numerator < 1)
					return [new InvalidRange(val, '1', undefined)];
			},
			amountDenominator: (val) => {
				const denominator = parseInt(val);

				if (isNaN(denominator))
					return [new InvalidType(val, 'integer')];

				if (CheckNums.hasMoreDecimals(val, 0)) {
					return [new InvalidDecimalRange(val, 0)];
				}

				const numerator = parseInt(this.amountNumerator);
				if (numerator >= denominator)
					return [
						new InvalidValue(
							`The denominator (${denominator}) should be greater than the numerator (${numerator}).`,
						),
					];
			},
			min: (val) => {
				if (!BigDecimal.isBigDecimal(val)) {
					return [new InvalidType(val, 'BigDecimal')];
				}
				if (CheckNums.hasMoreDecimals(val, this.decimals)) {
					return [new InvalidDecimalRange(val, this.decimals)];
				}

				const zero = BigDecimal.fromString('0', this.decimals);
				const value = BigDecimal.fromString(val, this.decimals);

				if (value.isLowerThan(zero)) {
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
				const minimum = BigDecimal.fromString(this.min, this.decimals);

				if (minimum.isGreaterThan(maximum))
					return [
						new InvalidValue(
							`The maximum (${val}) should be greater than or equal to the minimum (${this.min}).`,
						),
					];
			},
		});
		this.tokenId = tokenId;
		this.collectorId = collectorId;
		this.amountNumerator = amountNumerator;
		this.amountDenominator = amountDenominator;
		this.min = min;
		this.max = max;
		this.decimals = decimals;
		this.net = net;
		this.collectorsExempt = collectorsExempt;
	}
}
