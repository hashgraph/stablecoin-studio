import { ethers } from 'ethers';
import TransactionResponse from '../../../domain/context/transaction/TransactionResponse.js';
import { TransactionResponseAdapter } from '../TransactionResponseAdapter.js';

const ERROR_STATUS = 0;

export class RPCTransactionResponseAdapter extends TransactionResponseAdapter {
	public static async manageResponse(
		response: ethers.ContractTransaction,
	): Promise<TransactionResponse> {
		const receipt = await response.wait();
		if (receipt.status === ERROR_STATUS) {
			return Promise.reject(
				new TransactionResponse(
					receipt.transactionHash,
					undefined,
					new Error('Some error'),
				),
			);
		}

		return Promise.resolve(
			new TransactionResponse(receipt.transactionHash, receipt.status),
		);
	}
}
