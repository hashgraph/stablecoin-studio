import BaseError from '../../../../../core/error/BaseError.js';

export default class ValidationResponse {
	errors: BaseError[];

	constructor(errors: BaseError[]) {
		this.errors = errors;
		Object.setPrototypeOf(this, ValidationResponse.prototype);
	}
}
