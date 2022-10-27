export default class CheckNums {
	public static isWithinRange<T extends number | bigint>(
		value: T,
		min: T,
		max: T,
	): boolean {
		if (this.isLessThan(value, min) || this.isMoreThan(value, max))
			return false;
		return true;
	}

	public static isLessThan<T extends number | bigint>(
		value: T,
		max: T,
	): boolean {
		if (value > max) return false;
		return true;
	}

	public static isMoreThan<T extends number | bigint>(
		value: T,
		max: T,
	): boolean {
		if (value < max) return false;
		return true;
	}

	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	public static isBigInt(value: any): boolean {
		try {
			BigInt(value);
			return true;
		} catch (err) {
			return false;
		}
	}
}
