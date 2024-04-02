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
import {
	MultiSigTransaction,
	MultiSigTransactions,
	Pagination,
} from '../../../domain/context/transaction/MultiSigTransaction.js';
import { BackendError } from './error/BackendError.js';
import BackendEndpoint from '../../../domain/context/network/BackendEndpoint.js';
import Injectable from '../../../core/Injectable.js';
import { Environment } from '../../../domain/context/network/Environment.js';

@singleton()
export class BackendAdapter {
	private httpClient: AxiosInstance;
	private backendEndpoint: BackendEndpoint;

	public set(be: BackendEndpoint): void {
		this.backendEndpoint = be;

		this.backendEndpoint.url = be.url.endsWith('/') ? be.url : `${be.url}/`;

		this.httpClient = axios.create({
			baseURL: this.backendEndpoint.url,
		});
	}

	public async addTransaction(
		transactionMessage: string,
		description: string,
		HederaAccountId: string,
		keyList: string[],
		threshold: number,
		network: Environment,
	): Promise<string> {
		try {
			const body = {
				transaction_message: transactionMessage,
				description: description,
				hedera_account_id: HederaAccountId,
				key_list: keyList,
				threshold: threshold,
				network: network,
			};

			const response = await this.httpClient.post(
				'',
				body,
				this.configureHeaders(),
			);

			if (response.status == 201) {
				if (!response.data)
					throw new BackendError(
						`add transaction api call succeeded but returned no data....`,
					);
				return response.data.transactionId;
			} else
				throw new BackendError(
					`add transaction api call returned error ${response.status}, ${response.statusText}`,
				);
		} catch (error) {
			if (error instanceof BackendError) {
				throw error;
			} else {
				throw new BackendError(
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
				throw new BackendError(
					`sign transaction api call returned error ${response.status}, ${response.statusText}`,
				);
		} catch (error) {
			if (error instanceof BackendError) {
				throw error;
			} else {
				throw new BackendError(
					`Failed to sign transaction ${transactionId}: Unknown error`,
				);
			}
		}
	}

	public async deleteTransaction(transactionId: string): Promise<void> {
		try {
			const response = await this.httpClient.delete(
				`${transactionId}`,
				this.configureHeaders(),
			);

			if (response.status == 200) return;
			else
				throw new BackendError(
					`delete api call returned error ${response.status}, ${response.statusText}`,
				);
		} catch (error) {
			if (error instanceof BackendError) {
				throw error;
			} else {
				throw new BackendError(
					`Failed to delete transaction ${transactionId}: Unknown error`,
				);
			}
		}
	}

	public async getTransactions(
		page: number,
		limit: number,
		network: Environment,
		publicKey?: string,
		status?: string,
		accountId?: string,
	): Promise<MultiSigTransactions> {
		try {
			const queryParams = {
				publicKey: publicKey,
				page: page,
				limit: limit,
				status: status,
				network: network,
				hederaAccountId: accountId,
			};

			const response = await this.httpClient.get('', {
				params: queryParams,
			});

			if (response.status == 200) {
				if (!response.data)
					throw new BackendError(
						`get transactions by public key api call succeeded but returned no data....`,
					);

				const returnedTrx = response.data;
				const pagination = returnedTrx.meta as Pagination;

				const transaction_list: MultiSigTransaction[] = [];
				const transactions: MultiSigTransactions =
					new MultiSigTransactions(transaction_list, pagination);

				if (returnedTrx && returnedTrx.items)
					returnedTrx.items.forEach(
						(transaction: MultiSigTransaction) => {
							transactions.transactions.push(transaction);
						},
					);

				return transactions;
			} else
				throw new BackendError(
					`get transactions by public key api call returned error ${response.status}, ${response.statusText}`,
				);
		} catch (error) {
			if (error instanceof BackendError) {
				throw error;
			} else {
				throw new BackendError(
					`Failed to get transactions for ${publicKey}: Unknown error`,
				);
			}
		}
	}

	public async getTransaction(
		transactionId: string,
	): Promise<MultiSigTransaction> {
		try {
			const response = await this.httpClient.get(`${transactionId}`);

			if (response.status == 200) {
				if (!response.data)
					throw new BackendError(
						`get transaction by transaction id api call succeeded but returned no data....`,
					);

				return response.data;
			} else
				throw new BackendError(
					`get transaction by transaction id api call returned error ${response.status}, ${response.statusText}`,
				);
		} catch (error) {
			if (error instanceof BackendError) {
				throw error;
			} else {
				throw new BackendError(
					`Failed to get transaction with transaction Id ${transactionId}: Unknown error`,
				);
			}
		}
	}

	private configureHeaders(): any {
		const originHeaderValue = !Injectable.isWeb()
			? 'http://localhost:3000'
			: undefined;

		const config = {
			headers: {} as { [key: string]: string | undefined }, // Type assertion
		};

		if (originHeaderValue) {
			config.headers['Origin'] = originHeaderValue;
		}

		return config;
	}
}
