import BaseError, { ErrorCode } from '../../../../core/error/BaseError.js';

export default class ProviderError extends BaseError {
	/**
	 * Domain Error Constructor
	 */
	constructor(cause?: string) {
		super(ErrorCode.ProviderError, cause ?? 'An unexpected error ocurred');
	}
}
