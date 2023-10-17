import BaseError, { ErrorCode } from '../../../../core/error/BaseError.js';

export class InitSupplyInvalid extends BaseError {
	constructor(initSupply: string, maxSupply: string = 'max supply') {
		super(
			ErrorCode.InvalidRange,
			`Initial supply ${initSupply} is not within 0 and ${maxSupply}`,
		);
	}
}
