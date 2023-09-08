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

/* eslint-disable @typescript-eslint/no-explicit-any */
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
import BaseError from '../../../../core/error/BaseError.js';
import PublicKey from '../../../../domain/context/account/PublicKey.js';
import PrivateKey from '../../../../domain/context/account/PrivateKey.js';
import CheckStrings from '../../../../core/checks/strings/CheckStrings.js';
import CheckNums from '../../../../core/checks/numbers/CheckNums.js';
import { AccountIdNotValid } from '../../../../domain/context/account/error/AccountIdNotValid.js';
import BigDecimal from '../../../../domain/context/shared/BigDecimal.js';
import Account from '../../../../domain/context/account/Account.js';
import ContractId from '../../../../domain/context/contract/ContractId.js';
import InvalidDecimalRange from '../../../../domain/context/stablecoin/error/InvalidDecimalRange.js';
import { StableCoinRole } from '../../../../domain/context/stablecoin/StableCoinRole.js';
import { InvalidRole } from '../../../../domain/context/stablecoin/error/InvalidRole.js';

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

	public static checkRole = () => {
		return (val: any): BaseError[] => {
			const err: BaseError[] = [];
			const roles: string[] = Object.values(StableCoinRole);
			if (!roles.includes(val)) {
				err.push(new InvalidRole(val));
			}
			return err;
		};
	};

	/*public static checkFractionalFee = () => {
		return (val: any): BaseError[] => {
			const {
				collectorId,
				collectorsExempt,
				amountNumerator,
				amountDenominator,
				min,
				max,
				decimals,
				net,
			} = val as RequestFractionalFee;

			let err: BaseError[] = [];

			err = err.concat(Validation.checkHederaIdFormat()(collectorId));

			const numerator = parseInt(amountNumerator);

			if (isNaN(numerator))
				err.push(new InvalidType(amountNumerator, 'integer'));

			if (CheckNums.hasMoreDecimals(amountNumerator, 0)) {
				err.push(new InvalidDecimalRange(amountNumerator, 0));
			}

			if (numerator < 1)
				err.push(new InvalidRange(amountNumerator, '1', undefined));

			const denominator = parseInt(amountDenominator);

			if (isNaN(denominator))
				err.push(new InvalidType(amountDenominator, 'integer'));

			if (CheckNums.hasMoreDecimals(amountDenominator, 0)) {
				err.push(new InvalidDecimalRange(amountDenominator, 0));
			}

			if (numerator >= denominator)
				err.push(
					new InvalidValue(
						`The denominator (${denominator}) should be greater than the numerator (${numerator}).`,
					),
				);

			if (!BigDecimal.isBigDecimal(min)) {
				err.push(new InvalidType(min, 'BigDecimal'));
			}
			if (CheckNums.hasMoreDecimals(min, decimals)) {
				err.push(new InvalidDecimalRange(min, decimals));
			}

			const zero = BigDecimal.fromString('0', decimals);
			const minimum = BigDecimal.fromString(min, decimals);

			if (minimum.isLowerThan(zero)) {
				err.push(new InvalidRange(min, '0', undefined));
			}

			if (max === undefined || max === '') {
				err.push(
					new InvalidValue(
						`The maximum (${max}) should not be empty.`,
					),
				);
			}
			if (!BigDecimal.isBigDecimal(max)) {
				err.push(new InvalidType(max, 'BigDecimal'));
			}
			if (CheckNums.hasMoreDecimals(max, decimals)) {
				err.push(new InvalidDecimalRange(max, decimals));
			}
			const maximum = BigDecimal.fromString(max, decimals);

			if (minimum.isGreaterThan(maximum))
				err.push(
					new InvalidValue(
						`The maximum (${max}) should be greater than or equal to the minimum (${min}).`,
					),
				);

			return err;
		};
	};*/

	/*public static checkFixedFee = () => {
		return (val: any): BaseError[] => {
			const {
				collectorId,
				collectorsExempt,
				tokenIdCollected,
				amount,
				decimals,
			} = val as RequestFixedFee;

			let err: BaseError[] = [];

			err = err.concat(Validation.checkHederaIdFormat()(collectorId));
			err = err.concat(
				Validation.checkHederaIdFormat(true)(tokenIdCollected),
			);

			if (!BigDecimal.isBigDecimal(amount)) {
				err.push(new InvalidType(amount, 'BigDecimal'));
			}

			if (CheckNums.hasMoreDecimals(amount, decimals)) {
				err.push(new InvalidDecimalRange(amount, decimals));
			}

			const zero = BigDecimal.fromString('0', decimals);
			const value = BigDecimal.fromString(amount, decimals);

			if (value.isLowerOrEqualThan(zero)) {
				err.push(new InvalidRange(value, '0..', undefined));
			}

			return err;
		};
	};*/

	public static checkAccount = () => {
		return (val: any): void => {
			const { accountId, privateKey, evmAddress } = val as RequestAccount;
			if (privateKey) {
				new Account({
					id: accountId,
					privateKey: new PrivateKey(privateKey),
					publicKey: new PrivateKey(privateKey).publicKey,
					evmAddress,
				});
			} else {
				new Account({
					id: accountId,
					evmAddress,
				});
			}
		};
	};

	public static checkHederaIdFormat = (zeroIsValid = false) => {
		return (val: any): BaseError[] => {
			// Account Id defined in hip-15 : https://hips.hedera.com/hip/hip-15
			const regEx =
				/^(0|(?:[1-9]\d*))\.(0|(?:[1-9]\d*))\.(0|(?:[1-9]\d*))(?:-([a-z]{5}))?$/;
			const err: BaseError[] = [];
			if (!regEx.exec(val)) {
				err.push(new InvalidIdFormatHedera(val));
			} else if (!zeroIsValid && val === '0.0.0') {
				err.push(new AccountIdNotValid(val));
			}
			return err;
		};
	};

	public static checkAmount = (zeroIsValid = false, decimals = 18) => {
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

			if (zeroIsValid && value.isLowerThan(zero))
				err.push(new InvalidRange(val, '0', undefined));
			else if (!zeroIsValid && value.isLowerOrEqualThan(zero))
				err.push(new InvalidRange(val, '0', undefined));

			if (valueDecimals > decimals) {
				err.push(new InvalidDecimalRange(val, 0, decimals));
			}
			return err;
		};
	};
}
