/* eslint-disable @typescript-eslint/no-explicit-any */
import { TransactionType } from './TransactionResponseEnums.js';
import {
	TransactionResponse as HTransactionResponse,
	TransactionReceipt,
	TransactionRecord
} from '@hashgraph/sdk';
import { MessageTypes } from 'hashconnect';
import { TransactionResponseHandler } from './TransactionResponseHandler.js';
import { TransactionResponseError } from './error/TransactionResponseError.js';
import TransactionResponse from '../../../../domain/context/transaction/TransactionResponse.js';


export class HashpackTransactionResponseHandler extends TransactionResponseHandler {
	public static async manageResponse(
		transactionResponse: MessageTypes.TransactionResponse,
		responseType: TransactionType,
		nameFunction?: string,
		abi?: object[],
	): Promise<TransactionResponse> {
		let results: Uint8Array = new Uint8Array();
		if (responseType === TransactionType.RECEIPT) {
			const transactionReceipt: TransactionReceipt | undefined =
				await this.getReceipt(transactionResponse);
			let transId;
			if (transactionResponse instanceof HTransactionResponse) {
				transId = transactionResponse.transactionId.toString();
			} else {
				transId = transactionResponse.id;
			}
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
				transactionResponse
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
            return this.createTransactionResponse(
                transactionResponse.id,
                responseType,
                results,
                undefined,
            );			
		}

		throw new TransactionResponseError({
			message: 'The response type is neither RECORD nor RECEIPT.',
		});
	}

	private static async getReceipt(
		transactionResponse: MessageTypes.TransactionResponse,
	): Promise<TransactionReceipt> {
		try {
			let receipt;
			if (
				(transactionResponse as MessageTypes.TransactionResponse)
					.receipt
			) {
				receipt = TransactionReceipt.fromBytes(
					(transactionResponse as MessageTypes.TransactionResponse)
						.receipt as Uint8Array,
				);
			} else {
				const res: any = transactionResponse.error;
				if (res) {
					throw new TransactionResponseError({
						message: res.message,
						name: res.name,
						status: res.status,
						transactionId: res.transactionId,
					});
				} else {
					throw new TransactionResponseError({
						transactionId: transactionResponse.id,
						message: transactionResponse.id ?? '',
					});
				}
			}
			if (receipt) {
				return receipt;
			} else {
				const res: any = transactionResponse.error;
				throw new TransactionResponseError({
					message: res.message,
					name: res.name,
					status: res.status,
					transactionId: res.transactionId,
				});
			}
		} catch (error) {
			const res: any = transactionResponse.error;
			throw new TransactionResponseError({
				message: res.message,
				name: res.name,
				status: res.status,
				transactionId: res.transactionId,
			});
		}
	}

	private static getRecord(
		transactionResponse: MessageTypes.TransactionResponse,
	): Uint32Array | undefined {
		const record = transactionResponse.record;
		if (!record) {
			let transactionError;
			if (transactionResponse.error) {
				const res: any = transactionResponse.error;
				transactionError = {
					message: res.message,
					name: res.name,
					status: res.status,
					transactionId: res.transactionId,
				};
			} else if (transactionResponse.id) {
				transactionError = {
					message: transactionResponse.id,
					transactionId: transactionResponse.id,
				};
			} else {
				transactionError = { message: transactionResponse.topic };
			}

			throw new TransactionResponseError(transactionError);
		} else {
			try {
				return new Uint32Array(Object.values(record));
			} catch (err) {
				throw new TransactionResponseError({
					message: `Could not determine response type for: ${record}`,
				});
			}
		}
	}

	public static createTransactionResponse(
		transactionId: string | undefined,
		responseType: TransactionType,
		responseParam: Uint8Array,
		receipt?: TransactionReceipt,
	): TransactionResponse {
		return new TransactionResponse(
			(transactionId) ? transactionId : ""
		);
	}
}
