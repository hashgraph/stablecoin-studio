import BaseError, { ErrorCode } from '../../../../core/error/BaseError.js';

export class InvalidContractId extends BaseError {
	constructor(contractId: string) {
		super(
			ErrorCode.InvalidContractId,
			`Contract ${contractId} is not valid`,
		);
	}
}
