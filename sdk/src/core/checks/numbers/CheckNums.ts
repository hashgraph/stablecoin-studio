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

import BigDecimal from "../../../domain/context/shared/BigDecimal.js";


/* eslint-disable @typescript-eslint/no-explicit-any */
export default class CheckNums {
	public static isWithinRange<T extends number | bigint | BigDecimal>(
		value: T,
		min: T,
		max: T,
	): boolean {
		return this.isLessOrEqualThan(value, max) && this.isGreaterOrEqualThan(value, min);
	}

	public static isLessThan<T extends number | bigint | BigDecimal>(
		value: T,
		max: T,
	): boolean {
		if (value instanceof BigDecimal && max instanceof BigDecimal)
			return value.isLowerThan(max);
		return value < max;
	}

	public static isGreaterThan<T extends number | bigint | BigDecimal>(
		value: T,
		max: T,
	): boolean {
		if (value instanceof BigDecimal && max instanceof BigDecimal)
			return value.isGreaterThan(max);
		return value > max;
	}

	public static isLessOrEqualThan<T extends number | bigint | BigDecimal>(
		value: T,
		max: T,
	): boolean {
		if (value instanceof BigDecimal && max instanceof BigDecimal)
			return value.isLowerOrEqualThan(max);
		return value <= max;
	}

	public static isGreaterOrEqualThan<T extends number | bigint | BigDecimal>(
		value: T,
		max: T,
	): boolean {
		if (value instanceof BigDecimal && max instanceof BigDecimal)
			return value.isGreaterOrEqualThan(max);
		return value >= max;
	}

	public static isBigInt(value: any): boolean {
		try {
			BigInt(value);
			return true;
		} catch (err) {
			return false;
		}
	}

	public static isBigDecimal(value: any): boolean {
		try {
			BigDecimal.fromString(value);
			return true;
		} catch (err) {
			return false;
		}
	}

	public static hasMoreDecimals(
		from: BigDecimal | string,
		to: number,
	): boolean {
		let val = from;
		if (typeof val === 'string') val = BigDecimal.fromString(val);
		return val.format.decimals > to;
	}

	public static isNumber(value: any): value is number | bigint {
		try {
			return !isNaN(parseInt(value)) || !this.isBigInt(value);
		} catch (error) {
			return false;
		}
	}
}
