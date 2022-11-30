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
		response.data;
		response.value;
		const r = HederaERC20__factory.createInterface().parseTransaction({
			data: response.data,
			value: response.value,
		});
		// console.log(r);

		//let decodedData = iface.parseTransaction();
		const receipt = await response.wait();
		console.log(receipt);
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
			new TransactionResponse(receipt.transactionHash),
		);
	}
}
