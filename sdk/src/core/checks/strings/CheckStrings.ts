import { HederaId } from "../../../domain/context/shared/HederaId.js";

export default class CheckStrings {
	public static isNotEmpty(value?: string): boolean {
		if (!value) return false;
		if (value.length == 0) return false;
		return true;
	}

	public static isLengthUnder(value: string, maxLength: number): boolean {
		if (value.length > maxLength) return false;
		return true;
	}

	public static isLengthBetween(
		value: string,
		min: number,
		max: number,
	): boolean {
		if (value.length > max || value.length < min) return false;
		return true;
	}

	public static isAccountId(value: string): boolean {
		try {
			HederaId.from(value);
			return true;
		} catch (err) {
			return false
		}
	}
}
