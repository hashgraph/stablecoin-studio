import BaseError, { ErrorCode } from "../../../../core/error/BaseError.js";
import ValidationResponse from "../validation/ValidationResponse.js";

export class ValidationError extends BaseError {
	constructor(name: string, validations: ValidationResponse[]) {
		super(
			ErrorCode.ValidationChecks,
			`Validation for request ${name} was not successful: ${validations.toString()}`,
		);
	}
}
