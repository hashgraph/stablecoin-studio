import BaseError, { ErrorCode } from '../../../shared/error/BaseError.js';

export class ContractNotFound extends BaseError {
	constructor(contractId: string) {
		super(ErrorCode.ContractNotFound, `Contract ${contractId} not found`);
	}
}
