import BaseError, { ErrorCode } from '../../../../../core/error/BaseError.js';

export class StableCoinNotAssociated extends BaseError {
	constructor(targetId: unknown, tokenId: unknown) {
		super(
			ErrorCode.AccountNotAssociatedToToken,
			`The account ${targetId} is not associated to the token ${tokenId}`,
		);
	}
}
