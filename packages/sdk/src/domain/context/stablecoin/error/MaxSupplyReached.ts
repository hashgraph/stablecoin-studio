import BaseError, { ErrorCode } from '../../../shared/error/BaseError.js';

export class MaxSupplyReached extends BaseError {
	constructor(maxSupply: string) {
		super(ErrorCode.MaxSupplyReached, `max supply ${maxSupply} reached`);
	}
}
