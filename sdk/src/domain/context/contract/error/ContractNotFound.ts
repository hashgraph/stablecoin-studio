import BaseError, { ErrorCode } from '../../../../core/error/BaseError.js';

export class ContractNotFound extends BaseError {
	constructor(contractId: string) {
		super(ErrorCode.ContractNotFound, `Contract ${contractId} not found`);
	}
}
