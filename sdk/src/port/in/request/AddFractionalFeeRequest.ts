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

export default class AddFractionalFeeRequest extends ValidatedRequest<AddFractionalFeeRequest> {
	collectorId: string;
	amountNumerator: string;
	amountDenominator: string;
	min: string;
	max: string;
	net: boolean;

	constructor({
		collectorId,
		amountNumerator,
		amountDenominator,
		min,
		max,
		net,
	}: {
		collectorId: string;
		amountNumerator: string;
		amountDenominator: string;
		min: string;
		max: string;
		net: boolean;
	}) {
		super({
			collectorId: Validation.checkHederaIdFormat(),
			amountNumerator: (val) => {
				const numerator = parseInt(val);
				if (isNaN(numerator)) return [new InvalidType(val, 'integer')];
				if (numerator < 0)
					return [new InvalidRange(val, '0', undefined)];
			},
			amountDenominator: (val) => {
				const denominator = parseInt(val);
				if (isNaN(denominator))
					return [new InvalidType(val, 'integer')];

				const numerator = parseInt(this.amountNumerator);
				if (numerator >= denominator)
					return [
						new InvalidValue(
							`The denominator (${denominator}) should be greater than the numerator (${numerator}).`,
						),
					];
			},
			min: Validation.checkAmount(true),
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
				const maximum = BigDecimal.fromString(val);
				const minimum = BigDecimal.fromString(this.min);

				if (minimum.isGreaterThan(maximum))
					return [
						new InvalidValue(
							`The maximum (${val}) should be greater than or equal to the minimum (${this.min}).`,
						),
					];
			},
		});
		this.collectorId = collectorId;
		this.amountNumerator = amountNumerator;
		this.amountDenominator = amountDenominator;
		this.min = min;
		this.max = max;
		this.net = net;
	}
}
