import BaseError, { ErrorCode } from '../../../../core/error/BaseError.js';

export class InitSupplyInvalid extends BaseError {
	constructor(initSupply: string) {
		super(
			ErrorCode.InvalidRange,
			`Initial supply ${initSupply} is not within 0 and MAX_SUPPLY`,
		);
	}
}
