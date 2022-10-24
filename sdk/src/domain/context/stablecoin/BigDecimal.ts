import { FixedFormat, parseFixed } from '@ethersproject/bignumber';
import { FixedNumber, BigNumber } from '@hashgraph/hethers';

export default class BigDecimal extends FixedNumber {
	public isGreaterThan(other: BigDecimal): boolean {
		const a = parseFixed(this._value, this.format.decimals);
		const b = parseFixed(other._value, other.format.decimals);
		return a > b;
	}

	public isLowerThan(other: BigDecimal): boolean {
		const a = parseFixed(this._value, this.format.decimals);
		const b = parseFixed(other._value, other.format.decimals);
		return a < b;
	}

	public toBigInt(): bigint {
		console.log(parseFixed(this._value, this.format.decimals));

		return BigInt('2');
	}

	public toString(): string {
		return parseFixed(this._value, this.format.decimals).toString();
	}

	static ZERO: BigDecimal = super.fromString('0');

	static fromString(
		value: string,
		format?: string | number | FixedFormat | undefined,
	): BigDecimal {
		const a = super.from(value, format);
		return new BigDecimal({}, a._hex, a._value, a.format);
	}
}
