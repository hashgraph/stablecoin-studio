import BaseError, { ErrorCode } from '../../../shared/error/BaseError.js';

export class PrivateKeyNotValid extends BaseError {
	constructor(privateKey: string) {
		super(
			ErrorCode.PrivateKeyInvalid,
			`Private Key ${privateKey} is not a valid key`,
		);
	}
}
