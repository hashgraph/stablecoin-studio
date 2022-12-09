import BaseError, { ErrorCode } from '../../../../core/error/BaseError.js';

export class CapabilityError extends BaseError {
	constructor(accountId: string, operation: string, tokenId: string) {
		super(
			ErrorCode.OperationNotAllowed,
			`Account: ${accountId} does not have the right to execute operation: ${operation} on token: ${tokenId}`,
		);
	}
}
