import LogService from '../../../../../app/service/log/LogService.js';
import BaseError, { ErrorCode } from '../../../../../core/error/BaseError.js';

const REGEX_TRANSACTION =
	/^(0|(?:[1-9]\d*))\.(0|(?:[1-9]\d*))\.(0|(?:[1-9]\d*))(?:-([a-z]{5}))?@([1-9]\d*)\.([1-9]\d*)$/;
const HASHSCAN_URL = 'https://hashscan.io/testnet/transaction/';
type TransactionResponseErrorPayload = {
	message: string;
	name?: string;
	status?: string;
	transactionId?: string;
};

export class TransactionResponseError extends BaseError {
	error: TransactionResponseErrorPayload;
	transactionUrl: string;
	constructor(val: TransactionResponseErrorPayload) {
		super(ErrorCode.TransactionError, `Transaction failed: ${val.message}`);
		this.error = val;
		if (val.transactionId) {
			const transaction =
				val.transactionId.match(REGEX_TRANSACTION) ?? [];
			this.transactionUrl = `${HASHSCAN_URL}${transaction[1]}.${transaction[2]}.${transaction[3]}-${transaction[5]}-${transaction[6]}`;
			LogService.logError(this);
		}
	}
}
