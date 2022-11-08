import BigDecimal from '../../../domain/context/stablecoin/BigDecimal.js';

/* eslint-disable @typescript-eslint/no-explicit-any */
export default class CheckNums {
	public static isWithinRange<T extends number | bigint | BigDecimal>(
		value: T,
		min: T,
		max: T,
	): boolean {
		if (this.isLessThan(value, min) || this.isGreaterThan(value, max))
			return false;
		return true;
	}

	public static isLessThan<T extends number | bigint | BigDecimal>(
		value: T,
		max: T,
	): boolean {
		if (value instanceof BigDecimal && max instanceof BigDecimal)
			return value.isLowerThan(max);
		if (value > max) return false;
		return true;
	}

	public static isGreaterThan<T extends number | bigint | BigDecimal>(
		value: T,
		max: T,
	): boolean {
		if (value instanceof BigDecimal && max instanceof BigDecimal)
			return value.isGreaterThan(max);
		if (value < max) return false;
		return true;
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
