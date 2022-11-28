import BaseError, { ErrorCode } from "../../../../core/error/BaseError.js";


export class InvalidRole extends BaseError {
	constructor(role: string) {
		super(
			ErrorCode.InvalidRole,
			`Role ${role} does not exist`,
		);
	}
}