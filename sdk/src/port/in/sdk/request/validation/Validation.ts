/* eslint-disable @typescript-eslint/no-explicit-any */
import CheckNums from '../../../../../core/checks/numbers/CheckNums.js';
import CheckStrings from '../../../../../core/checks/strings/CheckStrings.js';
import BaseError from '../../../../../core/error/BaseError.js';
import {
	Account,
	BigDecimal,
	ContractId,
	PrivateKey,
	PublicKey,
} from '../../sdk.js';
import {
	RequestAccount,
	RequestPrivateKey,
	RequestPublicKey,
} from '../BaseRequest.js';
import { EmptyValue } from '../error/EmptyValue.js';
import { InvalidLength } from '../error/InvalidLength.js';
import { InvalidRange } from '../error/InvalidRange.js';
import { InvalidFormatHedera as InvalidIdFormatHedera } from '../error/InvalidFormatHedera.js';
import { InvalidType } from '../error/InvalidType.js';

export default class Validation {
	public static checkPublicKey = () => {
		return (val: any): BaseError[] => {
			const key = val as RequestPublicKey;
			return PublicKey.validate(key);
		};
	};

	public static checkPrivateKey = () => {
		return (val: any): BaseError[] => {
			const key = val as RequestPrivateKey;
			return PrivateKey.validate(key);
		};
	};

	public static checkContractId = () => {
		return (val: any): BaseError[] => {
			return ContractId.validate(val as string);
		};
	};

	public static checkString = ({
		max = Number.MAX_VALUE,
		min = 0,
		emptyCheck = true,
	}) => {
		return (val: any): BaseError[] => {
			const err: BaseError[] = [];
			if (typeof val !== 'string') {
				err.push(new InvalidType(val, 'string'));
			} else {
				if (emptyCheck && !CheckStrings.isNotEmpty(val)) {
					err.push(new EmptyValue(val));
				} else if (!CheckStrings.isLengthBetween(val, min, max)) {
					err.push(new InvalidLength(val, min, max));
				}
			}
			return err;
		};
	};

	public static checkNumber = <T extends string | number | bigint>({
		max,
		min,
	}: { max?: T; min?: T } = {}) => {
		return (val: any): BaseError[] => {
			const err: BaseError[] = [];
			const iMax = max || max === 0;
			const iMin = min || min === 0;
			const isBigDecimal: boolean = CheckNums.isBigDecimal(val);
			if (typeof val !== 'number' && !isBigDecimal) {
				err.push(new InvalidType(val, 'string | number | BigDecimal'));
			} else {
				let v = val;
				if (typeof v !== 'number') v = BigDecimal.fromString(v);
				if (iMin && !iMax) {
					if (CheckNums.isLessThan(v, min)) {
						err.push(new InvalidRange(v, min));
					}
				} else if (!iMin && iMax) {
					if (CheckNums.isGreaterThan(v, max)) {
						err.push(new InvalidRange(v, undefined, max));
					}
				} else if (iMin && iMax) {
					if (!CheckNums.isWithinRange(v, min, max)) {
						err.push(new InvalidRange(v, min, max));
					}
				}
			}
			return err;
		};
	};

	public static checkAccount = () => {
		return (val: any): void => {
			const { accountId, privateKey, evmAddress } = val as RequestAccount;
			if (privateKey) {
				new Account(
					accountId,
					new PrivateKey(privateKey.key, privateKey.type),
					evmAddress,
				);
			} else {
				new Account(accountId, undefined, evmAddress);
			}
		};
	};

	public static checkHederaIdFormat = () => {
		return (val: any): BaseError[] => {
			const regEx = /0\.0\.[1-9]*/;
			const err: BaseError[] = [];
			if (!regEx.exec(val)) {
				err.push(new InvalidIdFormatHedera(val));
			}
			return err;
		};
	};

	public static checkAmount = () => {
		return (val: any): BaseError[] => {
			const err: BaseError[] = [];
			const isBigDecimal: boolean = CheckNums.isBigDecimal(val);
			if (!isBigDecimal) {
				err.push(new InvalidType(val, 'BigDecimal'));
				return err;
			}
			const valueDecimals = BigDecimal.getDecimalsFromString(val);
			const zero = BigDecimal.fromString('0', valueDecimals);
			const value = BigDecimal.fromString(val);
			if (value.isLowerOrEqualThan(zero)) {
				err.push(new InvalidRange(val, '0', undefined));
			}
			return err;
		};
	};
}
