import BaseError from '../../../../../core/error/BaseError.js';

export default class ValidationResponse {
	name: string;
	errors: BaseError[];

	constructor(name: string, errors: BaseError[]) {
		this.name = name;
		this.errors = errors;
		Object.setPrototypeOf(this, ValidationResponse.prototype);
	}
}
