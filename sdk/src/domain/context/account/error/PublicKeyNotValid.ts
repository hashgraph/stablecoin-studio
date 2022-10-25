import BaseError, { ErrorCode } from "../../../../core/error/BaseError.js";

export class PublicKeyNotValid extends BaseError {
	constructor(val: string) {
		super(ErrorCode.PublicKeyInvalid, `Public Key ${val} is not a valid key`);
	}
}