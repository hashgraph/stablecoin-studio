export default class DomainError extends Error {
	/**
	 * Domain Error Constructor
	 */
	constructor(cause?: string) {
		super(cause);
		Object.setPrototypeOf(this, DomainError.prototype);
	}
}
