/* eslint-disable @typescript-eslint/no-explicit-any */
import {
	TransactionResponse as HTransactionResponse,
	TransactionReceipt,
	TransactionRecord,
} from '@hashgraph/sdk';
import { MessageTypes } from 'hashconnect';
import TransactionResponse from '../../../../domain/context/transaction/TransactionResponse.js';
import { TransactionResponseError } from '../../error/TransactionResponseError.js';
import { TransactionType } from '../../TransactionResponseEnums.js';
import { TransactionResponseAdapter } from '../../TransactionResponseAdapter.js';
import LogService from '../../../../app/service/LogService.js';

export class HashpackTransactionResponseAdapter extends TransactionResponseAdapter {
	public static async manageResponse(
		transactionResponse: MessageTypes.TransactionResponse,
		responseType: TransactionType,
		nameFunction?: string,
		abi?: object[],
	): Promise<TransactionResponse> {
		let results: Uint8Array = new Uint8Array();
		LogService.logTrace(
			'Managing HashPack Transaction response: ',
			transactionResponse,
			responseType,
			nameFunction,
			abi,
		);
		if (responseType === TransactionType.RECEIPT) {
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
			);
		}

		if (responseType === TransactionType.RECORD) {
			const transactionRecord:
				| TransactionRecord
				| Uint32Array
				| undefined = this.getRecord(transactionResponse);
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
			LogService.logTrace(
				`Creating RECORD response from TRX (${transactionResponse.id}) from record: `,
				record?.toString(),
				' with decoded result:',
				results,
			);
			return this.createTransactionResponse(
				transactionResponse.id,
				responseType,
				results,
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
		response: Uint8Array,
	): TransactionResponse {
		return new TransactionResponse(
			transactionId ? transactionId : '',
			response,
		);
	}
}
