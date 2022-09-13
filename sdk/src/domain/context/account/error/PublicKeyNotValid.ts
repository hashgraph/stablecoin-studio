import DomainError from "../../../error/DomainError.js";

export class PublicKeyNotValid extends DomainError {
	constructor(val: string) {
		super(`Public Key ${val} is not a valid key`);
	}
}