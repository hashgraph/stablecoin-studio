export default class CheckNums {
	public static isWithinRange<T extends number | bigint>(
		value: T,
		min: T,
		max: T,
	): boolean {
		if (value < min || value > max) return false;
		return true;
	}
}
