import BaseError, { ErrorCode } from '../../../../core/error/BaseError.js';

export class PublicKeyNotValid extends BaseError {
	constructor(val: string, type?: string) {
		let msg = `Public Key ${val} is not a valid key`;
		if (type) {
			msg = `Public Key ${val} of type ${type}, is not a valid key`;
		}
		super(ErrorCode.PublicKeyInvalid, msg);
	}
}
