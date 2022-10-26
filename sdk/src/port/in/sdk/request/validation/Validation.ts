/* eslint-disable @typescript-eslint/no-explicit-any */
import BaseError from '../../../../../core/error/BaseError.js';
import { ContractId, PublicKey } from '../../sdk.js';
import { RequestKey } from '../BaseRequest.js';

export default class Validation {
	public static checkKey = () => {
		return (val: any): BaseError[] => {
			const key = val as RequestKey;
			return PublicKey.validate(key);
		};
	};

	public static checkContractId = () => {
		return (val: any): BaseError[] => {
			return ContractId.validate(val as string);
		};
	};
}
