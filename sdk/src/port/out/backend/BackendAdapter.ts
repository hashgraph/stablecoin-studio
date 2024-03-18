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

import { singleton } from 'tsyringe';
import axios, { AxiosInstance } from 'axios';
import BackendTransaction from '../../../domain/context/transaction/BackendTransaction.js';

@singleton()
export class BackendAdapter {
	private readonly apiUrl: string;
	private readonly httpClient: AxiosInstance;

	constructor(apiUrl: string) {
		this.apiUrl = apiUrl;
		this.httpClient = axios.create({
			baseURL: this.apiUrl,
		});
	}

	public async addTransaction(
		transactionMessage: string,
		description: string,
		HederaAccountId: string,
		keyList: string[],
		threshold: number,
	): Promise<string> {
		try {
			const body = {
				transaction_message: transactionMessage,
				description: description,
				hedera_account_id: HederaAccountId,
				key_list: keyList,
				threshold: threshold,
			};

			const response = await this.httpClient.post('', body);

			if (response.status == 201) {
				if (!response.data)
					throw new Error(
						`add transaction api call succeeded but returned no data....`,
					);
				return response.data.transactionId;
			} else
				throw new Error(
					`add transaction api call returned error ${response.status}, ${response.statusText}`,
				);
		} catch (error) {
			if (
				typeof error === 'object' &&
				error !== null &&
				'message' in error
			) {
				throw new Error(
					`Failed to add transaction ${transactionMessage}: ${
						(error as Error).message
					}`,
				);
			} else {
				throw new Error(
					`Failed to add transaction ${transactionMessage}: Unknown error`,
				);
			}
		}
	}

	public async signTransaction(
		transactionId: string,
		transactionSignature: string,
		publicKey: string,
	): Promise<void> {
		try {
			const body = {
				signature: transactionSignature,
				public_key: publicKey,
			};

			const response = await this.httpClient.put(
				`${transactionId}`,
				body,
			);

			if (response.status == 204) return;
			else
				throw new Error(
					`sign transaction api call returned error ${response.status}, ${response.statusText}`,
				);
		} catch (error) {
			if (
				typeof error === 'object' &&
				error !== null &&
				'message' in error
			) {
				throw new Error(
					`Failed to sign transaction ${transactionId}: ${
						(error as Error).message
					}`,
				);
			} else {
				throw new Error(
					`Failed to sign transaction ${transactionId}: Unknown error`,
				);
			}
		}
	}

	public async deleteTransaction(transactionId: string): Promise<void> {
		try {
			const response = await this.httpClient.delete(`${transactionId}`);

			if (response.status == 200) return;
			else
				throw new Error(
					`delete api call returned error ${response.status}, ${response.statusText}`,
				);
		} catch (error) {
			if (
				typeof error === 'object' &&
				error !== null &&
				'message' in error
			) {
				throw new Error(
					`Failed to delete transaction ${transactionId}: ${
						(error as Error).message
					}`,
				);
			} else {
				throw new Error(
					`Failed to delete transaction ${transactionId}: Unknown error`,
				);
			}
		}
	}

	public async getTransactions(
		publicKey: string,
		page: number,
		limit: number,
		status: string,
	): Promise<BackendTransaction[]> {
		try {
			const queryParams = {
				page: page,
				limit: limit,
				status: status,
			};

			const response = await this.httpClient.get(`${publicKey}`, {
				params: queryParams,
			});

			if (response.status == 200) {
				if (!response.data)
					throw new Error(
						`get transaction api call succeeded but returned no data....`,
					);

				const transactions: BackendTransaction[] = [];

				const returnedTrx = response.data;

				returnedTrx.array.forEach((transaction: BackendTransaction) => {
					transactions.push(transaction);
				});

				return transactions;
			} else
				throw new Error(
					`get transactions api call returned error ${response.status}, ${response.statusText}`,
				);
		} catch (error) {
			if (
				typeof error === 'object' &&
				error !== null &&
				'message' in error
			) {
				throw new Error(
					`Failed to get transactions for ${publicKey}: ${
						(error as Error).message
					}`,
				);
			} else {
				throw new Error(
					`Failed to get transactions for ${publicKey}: Unknown error`,
				);
			}
		}
	}
}
