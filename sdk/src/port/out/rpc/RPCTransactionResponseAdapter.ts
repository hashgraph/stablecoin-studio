import { ethers } from 'ethers';
import LogService from '../../../app/service/LogService.js';
import TransactionResponse from '../../../domain/context/transaction/TransactionResponse.js';
import { TransactionResponseError } from '../error/TransactionResponseError.js';
import { TransactionResponseAdapter } from '../TransactionResponseAdapter.js';

const ERROR_STATUS = 0;

export class RPCTransactionResponseAdapter extends TransactionResponseAdapter {
	public static async manageResponse(
		response: ethers.ContractTransaction,
		eventName?: string,
	): Promise<TransactionResponse> {
		LogService.logTrace('Constructing response from:', response);
		const receipt = await response.wait();
		LogService.logTrace('Recepit:', receipt);
		if (receipt.status === ERROR_STATUS) {
			return Promise.reject(
				new TransactionResponse(
					receipt.transactionHash,
					undefined,
					new TransactionResponseError({
						message: eventName ?? 'Error in response',
						name: eventName,
						status: 'error',
						transactionId: receipt.transactionHash,
					}),
				),
			);
		}
		if (receipt.events && eventName) {
			const returnEvent = receipt.events.filter(
				(e) => e.event && e.event === eventName,
			);
			if (returnEvent.length > 0 && returnEvent[0].args) {
				return new TransactionResponse(
					receipt.transactionHash,
					returnEvent[0].args,
				);
			}
		}
		return Promise.resolve(
			new TransactionResponse(receipt.transactionHash, receipt.status),
		);
	}
}
