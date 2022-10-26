import { FixedFormat, parseFixed } from '@ethersproject/bignumber';
import { BigNumber, FixedNumber } from '@hashgraph/hethers';
import Long from 'long';

export type BigDecimalFormat = string | number | FixedFormat | undefined;

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

	#fn: FixedNumber;

	public static ZERO: BigDecimal = this.fromString('0');

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

	public isGreaterThan(other: BigDecimal): boolean {
		const a = parseFixed(this.#fn._value, this.#fn.format.decimals);
		const b = parseFixed(other.#fn._value, other.#fn.format.decimals);
		return a > b;
	}

	public isLowerThan(other: BigDecimal): boolean {
		const a = parseFixed(this.#fn._value, this.#fn.format.decimals);
		const b = parseFixed(other.#fn._value, other.#fn.format.decimals);
		return a < b;
	}

	public toBigNumber(): BigNumber {
		return parseFixed(this.#fn._value, this.#fn.format.decimals);
	}

	public toString(): string {
		let number = this.#fn.toString();

		if (number.endsWith('.0')) {
			number = number.substring(0, number.length - 2);
		}
		return number;

		// this.#fn.toString() => 10.0
	}

	private splitNumber(): string[] {
		const splitNumber = this.#fn.toString().split('.');
		splitNumber[1] = splitNumber[1].padEnd(this.format.decimals, '0');
		return splitNumber;
	}
	public toNumber(): number {
		return Number(this.toString());
	}

	public toLong(): Long {
		const number = this.splitNumber();
		return Long.fromString(number[0] + number[1]);
	}

	static fromString(
		value: string,
		format?: string | number | FixedFormat | undefined,
	): BigDecimal {
		return new BigDecimal(value, format);
	}
	static fromStringHedera(value: string, decimals: number): BigDecimal {
		const position = value.length - decimals;
		value = value.substring(0, position) + '.' + value.substring(position);
		return new BigDecimal(value, decimals);
	}

	static fromValue(
		value: BigNumber,
		decimals?: number,
		format?: FixedFormat | string | number,
	): BigDecimal {
		return new BigDecimal(value, format, decimals);
	}
}
