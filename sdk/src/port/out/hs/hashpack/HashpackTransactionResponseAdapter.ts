/*
 *
 * Hedera Stable Coin SDK
 *
 * Copyright (C) 2023 Hedera Hashgraph, LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 *
 */

/* eslint-disable @typescript-eslint/no-explicit-any */
import {
	TransactionResponse as HTransactionResponse,
	TransactionReceipt,
	TransactionRecord,
	Signer,
} from '@hashgraph/sdk';
import { MessageTypes } from '@hashgraph-dev/hashconnect';
import TransactionResponse from '../../../../domain/context/transaction/TransactionResponse.js';
import { TransactionResponseError } from '../../error/TransactionResponseError.js';
import { TransactionType } from '../../TransactionResponseEnums.js';
import { TransactionResponseAdapter } from '../../TransactionResponseAdapter.js';
import LogService from '../../../../app/service/LogService.js';

export class HashpackTransactionResponseAdapter extends TransactionResponseAdapter {
	public static async manageResponse(
		network: string,
		signer: Signer,
		transactionResponse:
			| MessageTypes.TransactionResponse
			| HTransactionResponse,
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
		);
		if (responseType === TransactionType.RECEIPT) {
			await this.getReceipt(network, signer, transactionResponse);
			let transId;
			if (transactionResponse instanceof HTransactionResponse) {
				transId = JSON.parse(
					JSON.stringify(transactionResponse),
				).response.transactionId.toString();
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
				| undefined = await this.getRecord(
				network,
				signer,
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
						network: network,
					});
				results = this.decodeFunctionResult(
					nameFunction,
					record,
					abi,
					network,
				);
			}
			const transactionId =
				transactionResponse instanceof HTransactionResponse
					? transactionResponse.transactionId.toString()
					: (transactionResponse as any).response.transactionId;
			LogService.logTrace(
				`Creating RECORD response from TRX (${transactionId}) from record: `,
				record?.toString(),
				' with decoded result:',
				results,
			);
			return this.createTransactionResponse(
				transactionId,
				responseType,
				results,
			);
		}

		throw new TransactionResponseError({
			message: 'The response type is neither RECORD nor RECEIPT.',
			network: network,
		});
	}
	private static async getHashconnectTransactionReceipt(
		network: string,
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
						network: network,
					});
				} else {
					throw new TransactionResponseError({
						transactionId: transactionResponse.id,
						message: transactionResponse.id ?? '',
						network: network,
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
					network: network,
				});
			}
		} catch (error) {
			const res: any = transactionResponse.error;
			LogService.logError(error);
			throw new TransactionResponseError({
				message: res.message,
				name: res.name,
				status: res.status,
				transactionId: res.transactionId,
				network: network,
			});
		}
	}

	private static async getReceipt(
		network: string,
		signer: Signer,
		transactionResponse:
			| MessageTypes.TransactionResponse
			| HTransactionResponse,
	): Promise<TransactionReceipt> {
		let transactionReceipt: TransactionReceipt;
		if (transactionResponse instanceof HTransactionResponse) {
			transactionReceipt = await transactionResponse.getReceiptWithSigner(
				signer,
			);
		} else {
			transactionReceipt = await this.getHashconnectTransactionReceipt(
				network,
				transactionResponse,
			);
		}
		return transactionReceipt;
	}

	private static async getRecord(
		network: string,
		signer: Signer,
		transactionResponse:
			| MessageTypes.TransactionResponse
			| HTransactionResponse,
	): Promise<Uint32Array | undefined> {
		let record;
		if (transactionResponse instanceof HTransactionResponse) {
			record = await transactionResponse.getRecordWithSigner(signer);
		} else {
			record = transactionResponse.record;
		}
		if (!record) {
			let transactionError;
			if (transactionResponse instanceof HTransactionResponse) {
				transactionError = {
					transactionId: transactionResponse.transactionId.toString(),
					message: transactionResponse.transactionHash.toString(),
					network: network,
				};
			} else {
				if (transactionResponse.error) {
					const res: any = transactionResponse.error;
					transactionError = {
						message: res.message,
						name: res.name,
						status: res.status,
						transactionId: res.transactionId,
						network: network,
					};
				} else if (transactionResponse.id) {
					transactionError = {
						message: transactionResponse.id,
						transactionId: transactionResponse.id,
						network: network,
					};
				} else {
					transactionError = {
						message: transactionResponse.topic,
						network: network,
					};
				}
			}

			throw new TransactionResponseError(transactionError);
		} else {
			try {
				return new Uint32Array(Object.values(record));
			} catch (err) {
				LogService.logError(err);
				throw new TransactionResponseError({
					message: `Could not determine response type for: ${record}`,
					network: network,
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
