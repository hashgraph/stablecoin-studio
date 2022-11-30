/* eslint-disable @typescript-eslint/no-explicit-any */
import { TransactionType } from './TransactionResponse.js';
import {
    Client,
	TransactionResponse as HTransactionResponse,
	TransactionReceipt,
	TransactionRecord,
	TransactionId
} from '@hashgraph/sdk';
import TransactionResponse from '../../../../domain/context/transaction/TransactionResponse.js';
import { TransactionResponseHandler } from './TransactionResponseHandler.js';
import { TransactionResponseError } from './error/TransactionResponseError.js';

export class HTSTransactionResponseHandler extends TransactionResponseHandler {
	public static async manageResponse(
		transactionResponse: HTransactionResponse,
		responseType: TransactionType,
		client: Client,
		nameFunction?: string,
		abi?: object[],
	): Promise<TransactionResponse> {
		let results: Uint8Array = new Uint8Array();
		if (responseType === TransactionType.RECEIPT) {
			const transactionReceipt: TransactionReceipt | undefined = await this.getReceipt(client, transactionResponse);
			let transId;
			transId = transactionResponse.transactionId;
			return this.createTransactionResponse(
				transId,
				responseType,
				results,
				transactionReceipt,
			);
		}

		if (responseType === TransactionType.RECORD) {
			const transactionRecord:
				| TransactionRecord
				| Uint32Array
				| undefined = await this.getRecord(
				client,
				transactionResponse,
			);
			let record: Uint8Array | Uint32Array | undefined;
			if (nameFunction) {
				if (transactionRecord instanceof TransactionRecord) {
					record = transactionRecord?.contractFunctionResult?.bytes;
				} else if (transactionRecord instanceof Uint32Array) {
					record = transactionRecord;
				}
				if (!record)
					throw new TransactionResponseError({
						message: 'Invalid response type',
					});
				results = this.decodeFunctionResult(nameFunction, record, abi);
			}
			if (record instanceof Uint32Array) {
				return this.createTransactionResponse(
					undefined,
					responseType,
					results,
					undefined,
				);
			} else {
				const tr = transactionRecord as TransactionRecord;
				return this.createTransactionResponse(
					tr?.transactionId,
					responseType,
					results,
					tr?.receipt,
				);
			}
		}

		throw new TransactionResponseError({
			message: 'The response type is neither RECORD nor RECEIPT.',
		});
	}

	private static async getRecord(
		client: Client,
		transactionResponse: HTransactionResponse
	): Promise<TransactionRecord | Uint32Array | undefined> {
	    return await transactionResponse.getRecord(client);
	}

	private static async getReceipt(
		client: Client,
		transactionResponse: HTransactionResponse
	): Promise<TransactionReceipt | undefined> {
 		return await transactionResponse.getReceipt(client);
	}

	public static createTransactionResponse(
		transactionId: TransactionId | undefined,
		responseType: TransactionType,
		responseParam: Uint8Array,
		receipt?: TransactionReceipt,
	): TransactionResponse {
		const record: Record<string, any> = {"value": "value"};
		return new TransactionResponse(
			record,
			transactionId!.toString()
		);
	}
}
