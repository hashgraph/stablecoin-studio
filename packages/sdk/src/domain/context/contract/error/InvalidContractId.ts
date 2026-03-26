import BaseError, { ErrorCode } from '../../../shared/error/BaseError.js';

export class InvalidContractId extends BaseError {
	constructor(contractId: string) {
		super(
			ErrorCode.InvalidContractId,
			`Contract ${contractId} is not valid`,
		);
	}
}
