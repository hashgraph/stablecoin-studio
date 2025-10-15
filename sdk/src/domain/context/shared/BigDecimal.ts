/*
 *
 * Hedera Stablecoin SDK
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

import { Long } from '@hashgraph/sdk';
import CheckNums from '../../../core/checks/numbers/CheckNums.js';
import { FixedNumber, FixedFormat, toQuantity } from 'ethers';
export type BigDecimalFormat = string | number | FixedFormat | undefined;

const SEPARATOR = '.';

export default class BigDecimal {
	public get _hex(): string {
		return toQuantity(this.#fn.value);
	}

	public get _value(): string {
		return this.#fn.toString();
	}

	public get _isFixedNumber(): boolean {
		return true; // Always true for this wrapper.
	}

	#fn: FixedNumber; // The internal instance of FixedNumber from Ethers v6

	// Public getters for the API you expect
	public get format(): string {
		return this.#fn.format; // FixedNumber.format in v6 is already FixedFormat.
	}

	public set format(value: FixedFormat) {
		this.#fn = this.#fn.toFormat(value); // This returns a new FixedNumber.
	}

	public get hex(): string {
		return this._hex; // Just expose the _hex getter.
	}

	public get value(): string {
		return this._value; // Just expose the _value getter.
	}

	public get isFixedNumber(): boolean {
		return this._isFixedNumber; // Just expose the _isFixedNumber getter.
	}

	public get decimals(): number {
		// Access decimals directly from the internal FixedFormat object
		return this.#fn.decimals;
	}

	public static ZERO: BigDecimal = BigDecimal.fromString('0', 0);
	public static MINUSONE: BigDecimal = BigDecimal.fromString('-1', 0);

	constructor(
		value: string | bigint, // Use the alias for compatibility
		format?: BigDecimalFormat,
		decimals?: number,
	) {
		if (typeof value === 'string') {
			if (value.length > 50) {
				// crude check for huge numbers
				this.#fn = new FixedNumber({}, BigInt(value), this.#fn.format);
			} else this.#fn = FixedNumber.fromString(value, format);
		} else {
			this.#fn = FixedNumber.fromValue(value, decimals, format);
		}
	}

	addUnsafe(other: BigDecimal): BigDecimal {
		return this.fromFixedNumber(this.#fn.addUnsafe(other.#fn));
	}

	subUnsafe(other: BigDecimal): BigDecimal {
		return this.fromFixedNumber(this.#fn.subUnsafe(other.#fn));
	}

	mulUnsafe(other: BigDecimal): BigDecimal {
		return this.fromFixedNumber(this.#fn.mulUnsafe(other.#fn));
	}

	divUnsafe(other: BigDecimal): BigDecimal {
		return this.fromFixedNumber(this.#fn.divUnsafe(other.#fn));
	}

	floor(): BigDecimal {
		return this.fromFixedNumber(this.#fn.floor());
	}

	ceiling(): BigDecimal {
		return this.fromFixedNumber(this.#fn.ceiling());
	}

	round(decimals?: number | undefined): BigDecimal {
		return this.fromFixedNumber(this.#fn.round(decimals));
	}

	isZero(): boolean {
		return this.#fn.isZero();
	}

	toUnsafeFloat(): number {
		return this.#fn.toUnsafeFloat();
	}

	toFormat(format: string | FixedFormat): FixedNumber {
		return this.#fn.toFormat(format);
	}

	private fromFixedNumber(number: FixedNumber): BigDecimal {
		return new BigDecimal(
			number.toString(),
			number.format,
			number.decimals,
		);
	}

	public isGreaterOrEqualThan(other: BigDecimal): boolean {
		return this.#fn.gte(other.#fn);
	}

	public isGreaterThan(other: BigDecimal): boolean {
		return this.#fn.gt(other.#fn);
	}

	public isLowerThan(other: BigDecimal): boolean {
		return this.#fn.lt(other.#fn);
	}

	public isLowerOrEqualThan(other: BigDecimal): boolean {
		return this.#fn.lte(other.#fn);
	}

	public isEqualThan(other: BigDecimal): boolean {
		return this.#fn.eq(other.#fn);
	}

	public toBigInt(): bigint {
		return this.#fn.value;
	}

	public toFixedNumber(): string {
		return this.toBigInt().toString();
	}

	public toString(): string {
		let number = this.#fn.toString();

		if (number.endsWith('.0')) {
			number = number.substring(0, number.length - 2);
		}
		return number;
	}

	public setDecimals(value: number): BigDecimal {
		// eslint-disable-next-line prefer-const
		let [int, float] = this.value.split(SEPARATOR);
		if (float && float.length && float.length > value) {
			float = float.substring(0, float.length - value);
			return BigDecimal.fromString(
				`${int}${SEPARATOR}${float}`,
				Math.max(float?.length ?? 0, value),
			);
		} else {
			return BigDecimal.fromString(int, Math.max(0, value));
		}
	}

	private splitNumber(): string[] {
		const splitNumber = this.#fn.toString().split('.');
		if (splitNumber.length > 1) {
			splitNumber[1] = splitNumber[1].padEnd(this.#fn.decimals, '0');
		} else {
			splitNumber[1] = '';
		}
		return splitNumber;
	}

	static getDecimalsFromString(val: string): number {
		if (val.length === 0) return 0;
		const [, dec] = val.split(SEPARATOR);
		if (!dec) return 0;
		if (!CheckNums.isNumber(dec)) return 0;
		return (dec as string).replace(/\.0+$/, '').length;
	}

	public toLong(): Long {
		const number = this.splitNumber();
		return Long.fromString(number[0] + number[1]);
	}

	static fromString(
		value: string,
		format?: string | number | FixedFormat | undefined,
	): BigDecimal {
		if (format === undefined) {
			format = this.getDecimalsFromString(value);
		}
		return new BigDecimal(value, format);
	}

	static fromStringFixed(value: string, decimals: number): BigDecimal {
		let formattedValue: string;
		if (value.length < decimals) {
			formattedValue = '0.' + value.padStart(decimals, '0');
		} else {
			const position = value.length - decimals;
			formattedValue =
				value.substring(0, position) + '.' + value.substring(position);
		}
		return new BigDecimal(formattedValue, decimals);
	}

	static fromValue(
		value: bigint,
		decimals?: number,
		format?: FixedFormat | string | number,
	): BigDecimal {
		return new BigDecimal(value, format, decimals);
	}

	public static isBigDecimal(value: string | BigDecimal): boolean {
		try {
			if (value instanceof BigDecimal) return true;
			FixedNumber.fromString(value as string);
			return true;
		} catch (err) {
			return false;
		}
	}
}
