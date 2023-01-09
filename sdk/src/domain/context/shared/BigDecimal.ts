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

import { FixedFormat, parseFixed } from '@ethersproject/bignumber';
import { BigNumber, FixedNumber } from '@hashgraph/hethers';
import Long from 'long';
import CheckNums from '../../../core/checks/numbers/CheckNums.js';

export type BigDecimalFormat = string | number | FixedFormat | undefined;

const SEPARATOR = '.';
export default class BigDecimal implements FixedNumber {
	readonly _hex: string;
	readonly _value: string;
	readonly _isFixedNumber: boolean;

	public get format(): FixedFormat {
		return this.#fn.format;
	}

	public set format(value: FixedFormat) {
		this.#fn = this.#fn.toFormat(value);
	}

	public get hex(): string {
		return this.#fn.toHexString();
	}

	public get value(): string {
		return this.#fn._value;
	}

	public get isFixedNumber(): boolean {
		return this.#fn._isFixedNumber;
	}

	public get decimals(): number {
		return this.format.decimals;
	}

	#fn: FixedNumber;

	public static ZERO: BigDecimal = this.fromString('0', 0);
	public static MINUSONE: BigDecimal = this.fromString('-1', 0);

	constructor(
		value: string | BigNumber,
		format?: BigDecimalFormat,
		decimals?: number,
	) {
		if (typeof value === 'string') {
			this.#fn = FixedNumber.fromString(value, format);
		} else {
			this.#fn = FixedNumber.fromValue(value, decimals, format);
		}
		this._hex = this.#fn._hex;
		this._value = this.#fn._value;
		this._isFixedNumber = this.#fn._isFixedNumber;
	}

	_checkFormat(other: BigDecimal): void {
		return this.#fn._checkFormat(other);
	}

	addUnsafe(other: BigDecimal): BigDecimal {
		return this.fromFixedNumber(this.#fn.addUnsafe(other));
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

	isNegative(): boolean {
		return this.#fn.isNegative();
	}

	toHexString(width?: number | undefined): string {
		return this.#fn.toHexString(width);
	}

	toUnsafeFloat(): number {
		return this.#fn.toUnsafeFloat();
	}

	toFormat(format: string | FixedFormat): FixedNumber {
		return this.#fn.toFormat(format);
	}

	private fromFixedNumber(number: FixedNumber): BigDecimal {
		return new BigDecimal(
			number._value,
			number.format,
			number.format.decimals,
		);
	}

	public isGreaterOrEqualThan(other: BigDecimal): boolean {
		const a = parseFixed(this.#fn._value, this.#fn.format.decimals);
		const b = parseFixed(other.#fn._value, other.#fn.format.decimals);
		return a.gte(b);
	}

	public isGreaterThan(other: BigDecimal): boolean {
		const a = parseFixed(this.#fn._value, this.#fn.format.decimals);
		const b = parseFixed(other.#fn._value, other.#fn.format.decimals);
		return a.gt(b);
	}
	public isLowerThan(other: BigDecimal): boolean {
		const a = parseFixed(this.#fn._value, this.#fn.format.decimals);
		const b = parseFixed(other.#fn._value, other.#fn.format.decimals);
		return b.gt(a);
	}

	public isLowerOrEqualThan(other: BigDecimal): boolean {
		const a = parseFixed(this.#fn._value, this.#fn.format.decimals);
		const b = parseFixed(other.#fn._value, other.#fn.format.decimals);
		return b.gte(a);
	}

	public isEqualThan(other: BigDecimal): boolean {
		const a = parseFixed(this.#fn._value, this.#fn.format.decimals);
		const b = parseFixed(other.#fn._value, other.#fn.format.decimals);
		return a.eq(b);
	}

	public toBigNumber(): BigNumber {
		return parseFixed(this.value, this.format.decimals);
	}

	public toFixedNumber(): string {
		return this.toBigNumber().toString();
	}

	public toString(): string {
		let number = this.#fn.toString();

		if (number.endsWith('.0')) {
			number = number.substring(0, number.length - 2);
		}
		return number;

		// this.#fn.toString() => 10.0
	}

	public setDecimals(value: number): BigDecimal {
		// eslint-disable-next-line prefer-const
		let [int, float] = this.value.split(SEPARATOR);
		if (float.length > value) {
			float = float.substring(0, float.length - value);
		}
		return BigDecimal.fromString(
			`${int}${SEPARATOR}${float}`,
			Math.max(float.length, value),
		);
	}

	private splitNumber(): string[] {
		const splitNumber = this.#fn.toString().split('.');
		if (splitNumber.length > 1) {
			splitNumber[1] = splitNumber[1].padEnd(this.format.decimals, '0');
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
		if (value.length < decimals) {
			value = '0.' + value.padStart(decimals - value.length + 1, '0');
		} else {
			const position = value.length - decimals;
			value =
				value.substring(0, position) + '.' + value.substring(position);
		}
		return new BigDecimal(value, decimals);
	}

	static fromValue(
		value: BigNumber,
		decimals?: number,
		format?: FixedFormat | string | number,
	): BigDecimal {
		return new BigDecimal(value, format, decimals);
	}

	public static isBigDecimal(value: string | BigDecimal): boolean {
		try {
			if (value instanceof BigDecimal) return true;
			BigDecimal.fromString(value);
			return true;
		} catch (err) {
			return false;
		}
	}
}
