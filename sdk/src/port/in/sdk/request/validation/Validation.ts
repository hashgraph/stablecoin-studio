/* eslint-disable @typescript-eslint/no-explicit-any */
import CheckNums from '../../../../../core/checks/numbers/CheckNums.js';
import CheckStrings from '../../../../../core/checks/strings/CheckStrings.js';
import BaseError from '../../../../../core/error/BaseError.js';
import { Account, ContractId, PrivateKey, PublicKey } from '../../sdk.js';
import {
	RequestAccount,
	RequestPrivateKey,
	RequestPublicKey,
} from '../BaseRequest.js';
import { EmptyValue } from '../error/EmptyValue.js';
import { InvalidLength } from '../error/InvalidLength.js';
import { InvalidRange } from '../error/InvalidRange.js';
import { InvalidFormatHedera } from '../error/InvalidFormatHedera.js';
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
			const isBigInt: boolean = CheckNums.isBigInt(val);
			if (typeof val !== 'number' && !isBigInt) {
				err.push(new InvalidType(val, 'string | number | bigint'));
			} else {
				let v = val;
				if (typeof v !== 'number') v = BigInt(v);
				if (iMin && !iMax) {
					if (CheckNums.isLessThan(v, min)) {
						err.push(new InvalidRange(v, min));
					}
				} else if (!iMin && iMax) {
					if (CheckNums.isMoreThan(v, max)) {
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

	public static checkAccountId = () => {
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

	public static checkHederaFormat = () => {
		return (val: any): BaseError[] => {
			const regEx = /0\.0\.[1-9]*/;
			const err: BaseError[] = [];
			if (regEx.exec(val)) {
				return err;
			} else {
				err.push(new InvalidFormatHedera(val));
			}
			return err;
		};
	};
}
