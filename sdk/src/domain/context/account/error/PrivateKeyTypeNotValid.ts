import DomainError from '../../../error/DomainError.js';

export class PrivateKeyTypeNotValid extends DomainError {
	constructor(val: string) {
		super(`Private Key Type ${val} is not a valid type`);
	}
}
