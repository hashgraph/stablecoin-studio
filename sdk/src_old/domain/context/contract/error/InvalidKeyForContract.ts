import BaseError, { ErrorCode } from "../../../../core/error/BaseError.js";

export default class InvalidKeyForContract extends BaseError {
	constructor(val: unknown) {
		super(ErrorCode.ContractKeyInvalid, `Invalid Key ${val}.`);
	}
}