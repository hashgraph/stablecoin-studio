export default class HederaError extends Error {
	/**
	 * Domain Error Constructor
	 */
	constructor(cause?: string) {
		super(`🛑 ${cause}`);
		Object.setPrototypeOf(this, HederaError.prototype);
	}
}
