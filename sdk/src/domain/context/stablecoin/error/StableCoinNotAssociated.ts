import BaseError, { ErrorCode } from '../../../../core/error/BaseError.js';

export class StableCoinNotAssociated extends BaseError {
	constructor(targetId: unknown, tokenId: unknown) {
		super(
			ErrorCode.AccountNotAssociatedToToken,
			`Account ${targetId} not associated to token ${tokenId}`,
		);
	}
}
