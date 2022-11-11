import BaseError, { ErrorCode } from '../../../../core/error/BaseError.js';

export class DeploymentError extends BaseError {
	constructor(val: unknown) {
		super(
			ErrorCode.DeplymentError,
			`An error ocurred during deployment: ${val}`,
		);
	}
}
