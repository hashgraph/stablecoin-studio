import { ethers } from 'ethers';
import { HederaERC20 } from 'hedera-stable-coin-contracts/typechain-types/contracts/index.js';
import { HederaERC20__factory } from 'hedera-stable-coin-contracts/typechain-types/index.js';
import TransactionResponse from '../../../../domain/context/transaction/TransactionResponse.js';
import { TransactionResponseHandler } from './TransactionResponseHandler.js';

const ERROR_STATUS = 0;

export class RPCTransactionResponseHandler extends TransactionResponseHandler {
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
