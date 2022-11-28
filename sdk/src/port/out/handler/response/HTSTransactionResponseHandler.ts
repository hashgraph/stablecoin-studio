/* eslint-disable @typescript-eslint/no-explicit-any */
import { TransactionType, HTSResponse } from './TransactionResponse.js';
import {
    Client,
	TransactionResponse,
	TransactionReceipt,
	TransactionRecord,
	TransactionId
} from '@hashgraph/sdk';
import { MessageTypes } from 'hashconnect';
import { TransactionResponseHandler } from './TransactionResponseHandler.js';
import { TransactionResponseError } from './error/TransactionResponseError.js';

export class HTSTransactionResponseHandler {
	public static async manageResponse(
		transactionResponse:
			| TransactionResponse
			| MessageTypes.TransactionResponse,
		responseType: TransactionType,
		client: Client,
		nameFunction?: string,
		abi?: object[],
	): Promise<HTSResponse> {
		let results: Uint8Array = new Uint8Array();
		if (responseType === TransactionType.RECEIPT) {
			const transactionReceipt: TransactionReceipt | undefined =
				await this.getReceipt(client, transactionResponse);
			let transId;
			if (transactionResponse instanceof TransactionResponse) {
				transId = transactionResponse.transactionId;
			} else {
				transId = transactionResponse.id;
			}
			return this.createHTSResponse(
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
				results = TransactionResponseHandler.decodeFunctionResult(nameFunction, record, abi);
			}
			if (record instanceof Uint32Array) {
				return this.createHTSResponse(
					undefined,
					responseType,
					results,
					undefined,
				);
			} else {
				const tr = transactionRecord as TransactionRecord;
				return this.createHTSResponse(
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
		transactionResponse:
			| TransactionResponse
			| MessageTypes.TransactionResponse,
	): Promise<TransactionRecord | Uint32Array | undefined> {
		let transactionRecord: TransactionRecord | Uint32Array | undefined;
        if (transactionResponse instanceof TransactionResponse) {
		    transactionRecord = await transactionResponse.getRecord(
			    client
		    );
        }
		return transactionRecord;
	}

	private static async getReceipt(
		client: Client,
		transactionResponse:
			| TransactionResponse
			| MessageTypes.TransactionResponse,
	): Promise<TransactionReceipt | undefined> {
		let transactionReceipt: TransactionReceipt | undefined;
        if (transactionResponse instanceof TransactionResponse) {
		    transactionReceipt = await transactionResponse.getReceipt(
			    client
		    );
        }
		return transactionReceipt;
	}

	public static createHTSResponse(
		transactionId: string | TransactionId | undefined,
		responseType: TransactionType,
		responseParam: Uint8Array,
		receipt?: TransactionReceipt,
	): HTSResponse {
		return new HTSResponse(
			transactionId,
			responseType,
			responseParam,
			receipt,
		);
	}
}
