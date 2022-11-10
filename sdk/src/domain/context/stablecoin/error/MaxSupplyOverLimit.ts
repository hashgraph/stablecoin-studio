import BaseError, { ErrorCode } from '../../../../core/error/BaseError.js';

export class MaxSupplyOverLimit extends BaseError {
	constructor(maxSupply: string, limit: string) {
		super(
			ErrorCode.InvalidAmount,
			`Max supply ${maxSupply} is over maximum limit ${limit}.`,
		);
	}
}
