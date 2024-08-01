/*
 *
 * Hedera Stablecoin SDK
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
// import { MessageTypes } from '@hashgraph/hashconnect';
import TransactionResponse from '../../../domain/context/transaction/TransactionResponse.js';
import { TransactionResponseError } from '../error/TransactionResponseError.js';
import { TransactionType } from '../TransactionResponseEnums.js';
import { TransactionResponseAdapter } from '../TransactionResponseAdapter.js';
import LogService from '../../../app/service/LogService.js';

export class HederaTransactionResponseAdapter extends TransactionResponseAdapter {
	public static async manageResponse(
		network: string,
		signer: Signer,
		transactionResponse: HTransactionResponse,
		responseType: TransactionType,
		nameFunction?: string,
		abi?: object[],
	): Promise<TransactionResponse> {
		console.log('Manage Response BEFORE : ' + responseType.toString());

		let results: Uint8Array = new Uint8Array();
		LogService.logTrace(
			'Managing Hedera Transaction response: ',
			transactionResponse,
			responseType,
			nameFunction,
		);
		if (responseType === TransactionType.RECEIPT) {
			await this.getReceipt(network, signer, transactionResponse);
			let transId;
			if (transactionResponse?.transactionId) {
				transId = transactionResponse?.transactionId;
			} else {
				transId = JSON.parse(
					JSON.stringify(transactionResponse),
				).response.transactionId.toString();
			}
			console.log('Manage Response AFTER : ' + responseType.toString());

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
				| Uint8Array
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
				} else if (transactionRecord instanceof Uint8Array) {
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
			const transactionId = transactionResponse.transactionId.toString();
			LogService.logTrace(
				`Creating RECORD response from TRX (${transactionId}) from record: `,
				record?.toString(),
				' with decoded result:',
				results,
			);
			console.log('Manage Response AFTER : ' + responseType.toString());

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

	private static async getReceipt(
		network: string,
		signer: Signer,
		transactionResponse: HTransactionResponse,
	): Promise<TransactionReceipt> {
		return await transactionResponse.getReceiptWithSigner(signer);
	}

	private static async getRecord(
		network: string,
		signer: Signer,
		transactionResponse: HTransactionResponse,
	): Promise<Uint32Array | undefined | Uint8Array> {
		console.log('getRecordWithSigner');
		const record = await transactionResponse.getRecordWithSigner(signer);
		console.log('getRecordWithSigner : ' + JSON.stringify(record));

		if (!record) {
			const transactionError = {
				transactionId: transactionResponse.transactionId.toString(),
				message: transactionResponse.transactionHash.toString(),
				network: network,
			};

			throw new TransactionResponseError(transactionError);
		} else {
			try {
				if (record instanceof TransactionRecord) {
					return record.contractFunctionResult?.bytes;
				} else {
					return new Uint32Array(Object.values(record));
				}
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
