import BaseError, { ErrorCode } from '../../../shared/error/BaseError.js';

export class AccountNotAssociatedToToken extends BaseError {
	constructor(accountId: string, tokenId: string) {
		super(
			ErrorCode.AccountNotAssociatedToToken,
			`Account ${accountId} is not associated to token ${tokenId}`,
		);
	}
}
