import DomainError from "../../../error/DomainError.js";

export class PrivateKeyNotValid extends DomainError {
	constructor(val: string) {
		super(`Private Key ${val} is not a valid key`);
	}
}