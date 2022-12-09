import BaseError, { ErrorCode } from '../../../../../core/error/BaseError.js';

export class EmptyMetadata extends BaseError {
	constructor(val: unknown) {
		super(ErrorCode.InvalidValue, `App metadata cannot be empty: ${val}`);
	}
}
