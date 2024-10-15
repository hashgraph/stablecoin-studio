import BaseError, { ErrorCode } from '../../../../core/error/BaseError.js';

export class AccountIdNotValid extends BaseError {
	constructor(accountId: string) {
		super(
			ErrorCode.AccountIdInValid,
			`AccountId ${accountId} is not a valid ID`,
		);
	}
}
