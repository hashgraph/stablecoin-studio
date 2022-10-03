import DomainError from '../../../error/DomainError.js';

export class AccountNotValid extends DomainError {
	constructor(cause: string) {
		super(`Account is not valid: ${cause}`);
	}
}
