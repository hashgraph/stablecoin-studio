import BaseError, { ErrorCode } from '../../../shared/error/BaseError.js';

export class PrivateKeyTypeNotValid extends BaseError {
	constructor(val: string) {
		super(
			ErrorCode.PrivateKeyTypeInvalid,
			`Private Key Type ${val} is not a valid type`,
		);
	}
}
