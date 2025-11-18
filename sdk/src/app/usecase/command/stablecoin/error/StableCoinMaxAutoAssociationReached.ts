import BaseError, { ErrorCode } from '../../../../../core/error/BaseError';

export class StableCoinMaxAutoAssociationReached extends BaseError {
	constructor(targetId: unknown, maxAssociations: number) {
		super(
			ErrorCode.OperationNotAllowed,
			`The account ${targetId} has reached the maximum auto-association limit of ${maxAssociations} tokens. ` +
				`To proceed, either: (1) increase the account's max_automatic_token_associations limit, or (2) manually associate the token to the account.`,
		);
	}
}
