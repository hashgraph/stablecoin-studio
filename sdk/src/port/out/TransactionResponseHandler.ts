import Transaction from '../../domain/context/transaction/Transaction.js';

export default interface TransactionResponseHandler {
	manageResponse(): Transaction;
}
