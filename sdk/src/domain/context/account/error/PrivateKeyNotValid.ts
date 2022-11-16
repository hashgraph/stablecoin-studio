import BaseError, { ErrorCode } from "../../../../core/error/BaseError.js";

export class PrivateKeyNotValid extends BaseError {
	constructor(privateKey: string) {
		super(ErrorCode.PrivateKeyInvalid, `Private Key ${privateKey} is not a valid key`);
	}
}