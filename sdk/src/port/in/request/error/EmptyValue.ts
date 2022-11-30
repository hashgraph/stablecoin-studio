import BaseError, { ErrorCode } from "../../../../core/error/BaseError.js";

export class EmptyValue extends BaseError {
	constructor(val: unknown) {
		super(
			ErrorCode.EmptyValue,
			`Value ${val} cannot be empty`,
		);
	}
}
