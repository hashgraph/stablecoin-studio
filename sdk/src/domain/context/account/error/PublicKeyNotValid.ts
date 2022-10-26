import BaseError, { ErrorCode } from '../../../../core/error/BaseError.js';

export class PublicKeyNotValid extends BaseError {
	constructor(val: string, type?: string) {
		super(
			ErrorCode.PublicKeyInvalid,
			`Public Key ${val} ${type && '(' + type + ')'} is not a valid key`,
		);
	}
}
