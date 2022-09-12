import DomainError from '../../../error/DomainError.js';

export default class InvalidKeyForContractIdDomainError extends DomainError {
	constructor(val: unknown) {
		super(`Invalid Key ${val}.`);
	}
}