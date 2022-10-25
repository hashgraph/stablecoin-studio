import BaseError, { ErrorCode } from "../../../../core/error/BaseError.js";

export class AccountNotValid extends BaseError {
	constructor(cause: string) {
		super(ErrorCode.AmountInvalid, `Account is not valid: ${cause}`);
	}
}
