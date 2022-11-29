import Transaction from '../../domain/context/transaction/TransactionResponse.js';

export default interface TransactionResponseHandler {
	manageResponse(): Transaction;
}
