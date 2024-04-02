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

import { BackendAdapter } from '../../../src/port/out/backend/BackendAdapter.js';

const URL = 'http://example.com/';

const TRANSACTION = {
	transaction_message: 'transaction_message',
	description: 'description',
	hedera_account_id: '0.0.1',
	key_list: ['key1', 'key2'],
	threshold: 2,
	network: 'testnet',
	originHeader: 'http://localhost:3000',
};

const SIGNATURE = {
	transactionId: 'transactionId',
	transactionSignature: 'transactionSignature',
	publicKey: 'publicKey',
};

const DELETE = {
	transactionId: 'transactionId',
	originHeader: 'http://localhost:3000',
};

const GET_TRANSACTIONS = {
	page: 1,
	limit: 10,
	network: 'testnet',
	publicKey: 'publicKey',
	status: 'status',
	accountId: '0.0.1',
};

const GET_TRANSACTION = {
	id: 'id',
	transaction_message: 'transaction_message',
	description: 'description',
	status: 'status',
	threshold: 3,
	key_list: ['key_1', 'key_2'],
	signed_keys: ['signed_key_1', 'signed_key_2'],
	signatures: ['signature_1', 'signature_2'],
	network: 'testnet',
	hedera_account_id: '0.0.1',
};

jest.mock('axios', () => {
	return {
		create: jest.fn(() => ({
			post: jest.fn((url, body, config) => {
				if (
					url == '' &&
					body.transaction_message ==
						TRANSACTION.transaction_message &&
					body.description == TRANSACTION.description &&
					body.hedera_account_id == TRANSACTION.hedera_account_id &&
					body.key_list.length == TRANSACTION.key_list.length &&
					body.key_list[0] == TRANSACTION.key_list[0] &&
					body.key_list[1] == TRANSACTION.key_list[1] &&
					body.threshold == TRANSACTION.threshold &&
					body.network == TRANSACTION.network &&
					config.headers.Origin == TRANSACTION.originHeader
				)
					return {
						status: 201,
						data: {
							transactionId: 'transactionId',
						},
					};
				return {
					status: 400,
				};
			}),
			put: jest.fn((url, body) => {
				if (
					url == SIGNATURE.transactionId &&
					body.signature == SIGNATURE.transactionSignature &&
					body.public_key == SIGNATURE.publicKey
				)
					return {
						status: 204,
					};
				return {
					status: 400,
				};
			}),
			get: jest.fn((url, body) => {
				if (url == GET_TRANSACTION.id)
					return {
						status: 200,
						data: GET_TRANSACTION,
					};
				if (
					body.params.page == GET_TRANSACTIONS.page &&
					body.params.limit == GET_TRANSACTIONS.limit &&
					body.params.network == GET_TRANSACTIONS.network
				) {
					if (
						!body.params.publicKey &&
						!body.params.status &&
						!body.params.hederaAccountId
					)
						return {
							status: 200,
							data: {
								items: [GET_TRANSACTION],
							},
						};

					if (
						body.params.publicKey == GET_TRANSACTIONS.publicKey &&
						body.params.status == GET_TRANSACTIONS.status &&
						body.params.hederaAccountId ==
							GET_TRANSACTIONS.accountId
					)
						return {
							status: 200,
							data: {
								items: [GET_TRANSACTION],
							},
						};
				}

				return {
					status: 400,
				};
			}),
			delete: jest.fn((url, config) => {
				if (
					url == DELETE.transactionId &&
					config.headers.Origin == DELETE.originHeader
				)
					return {
						status: 200,
					};
				return {
					status: 400,
				};
			}),
		})),
	};
});

describe('🧪 BackendAdapter test', () => {
	let backendAdapter: BackendAdapter;

	beforeEach(() => {
		backendAdapter = new BackendAdapter();
		backendAdapter.set({ url: URL }); // The URL here is not used in actual HTTP requests
	});

	it('Add a transaction', async () => {
		const result = await backendAdapter.addTransaction(
			TRANSACTION.transaction_message,
			TRANSACTION.description,
			TRANSACTION.hedera_account_id,
			TRANSACTION.key_list,
			TRANSACTION.threshold,
			TRANSACTION.network,
		);

		expect(result).toEqual('transactionId');
	}, 60_000);

	it('Sign transaction', async () => {
		await backendAdapter.signTransaction(
			SIGNATURE.transactionId,
			SIGNATURE.transactionSignature,
			SIGNATURE.publicKey,
		);

		expect(true).toBe(true);
	}, 60_000);

	it('Delete transaction', async () => {
		await backendAdapter.deleteTransaction(DELETE.transactionId);

		expect(true).toBe(true);
	}, 60_000);

	it('Get transactions', async () => {
		const transactions = [];

		transactions.push(
			await backendAdapter.getTransactions(
				GET_TRANSACTIONS.page,
				GET_TRANSACTIONS.limit,
				GET_TRANSACTIONS.network,
				GET_TRANSACTIONS.publicKey,
				GET_TRANSACTIONS.status,
				GET_TRANSACTIONS.accountId,
			),
		);

		transactions.push(
			await backendAdapter.getTransactions(
				GET_TRANSACTIONS.page,
				GET_TRANSACTIONS.limit,
				GET_TRANSACTIONS.network,
			),
		);

		transactions.forEach((trans) => {
			expect(trans[0].id).toEqual(GET_TRANSACTION.id);
			expect(trans[0].transaction_message).toEqual(
				GET_TRANSACTION.transaction_message,
			);
			expect(trans[0].description).toEqual(GET_TRANSACTION.description);
			expect(trans[0].status).toEqual(GET_TRANSACTION.status);
			expect(trans[0].threshold).toEqual(GET_TRANSACTION.threshold);
			expect(trans[0].key_list.length).toEqual(
				GET_TRANSACTION.key_list.length,
			);
			expect(trans[0].signed_keys.length).toEqual(
				GET_TRANSACTION.signed_keys.length,
			);
			expect(trans[0].signatures.length).toEqual(
				GET_TRANSACTION.signatures.length,
			);
			expect(trans[0].network).toEqual(GET_TRANSACTION.network);
			expect(trans[0].hedera_account_id).toEqual(
				GET_TRANSACTION.hedera_account_id,
			);

			for (let i = 0; i < trans[0].key_list.length; i++) {
				expect(trans[0].key_list[i]).toEqual(
					GET_TRANSACTION.key_list[i],
				);
			}
			for (let i = 0; i < trans[0].signed_keys.length; i++) {
				expect(trans[0].signed_keys[i]).toEqual(
					GET_TRANSACTION.signed_keys[i],
				);
			}
			for (let i = 0; i < trans[0].signatures.length; i++) {
				expect(trans[0].signatures[i]).toEqual(
					GET_TRANSACTION.signatures[i],
				);
			}
		});
	}, 60_000);

	it('Get transaction', async () => {
		const trans = await backendAdapter.getTransaction(GET_TRANSACTION.id);

		expect(trans.id).toEqual(GET_TRANSACTION.id);
		expect(trans.transaction_message).toEqual(
			GET_TRANSACTION.transaction_message,
		);
		expect(trans.description).toEqual(GET_TRANSACTION.description);
		expect(trans.status).toEqual(GET_TRANSACTION.status);
		expect(trans.threshold).toEqual(GET_TRANSACTION.threshold);
		expect(trans.key_list.length).toEqual(GET_TRANSACTION.key_list.length);
		expect(trans.signed_keys.length).toEqual(
			GET_TRANSACTION.signed_keys.length,
		);
		expect(trans.signatures.length).toEqual(
			GET_TRANSACTION.signatures.length,
		);
		expect(trans.network).toEqual(GET_TRANSACTION.network);
		expect(trans.hedera_account_id).toEqual(
			GET_TRANSACTION.hedera_account_id,
		);

		for (let i = 0; i < trans.key_list.length; i++) {
			expect(trans.key_list[i]).toEqual(GET_TRANSACTION.key_list[i]);
		}
		for (let i = 0; i < trans.signed_keys.length; i++) {
			expect(trans.signed_keys[i]).toEqual(
				GET_TRANSACTION.signed_keys[i],
			);
		}
		for (let i = 0; i < trans.signatures.length; i++) {
			expect(trans.signatures[i]).toEqual(GET_TRANSACTION.signatures[i]);
		}
	}, 60_000);
});
