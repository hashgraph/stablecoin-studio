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
import {
	GET_TRANSACTION,
	GET_TRANSACTIONS,
	SIGNATURE,
	TRANSACTION,
	UPDATE,
	PAGINATION,
	DELETE,
	URL,
} from '../../config.js';

describe('🧪 BackendAdapter test', () => {
	let backendAdapter: BackendAdapter;

	beforeAll(() => {
		process.env.MOCK_BACKEND = 'false';
	});

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
			new Date(TRANSACTION.startDate),
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

	it('Update transaction', async () => {
		await backendAdapter.updateTransaction(
			UPDATE.transactionId,
			UPDATE.status,
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
			expect(trans.transactions[0].id).toEqual(GET_TRANSACTION.id);
			expect(trans.transactions[0].transaction_message).toEqual(
				GET_TRANSACTION.transaction_message,
			);
			expect(trans.transactions[0].description).toEqual(
				GET_TRANSACTION.description,
			);
			expect(trans.transactions[0].status).toEqual(
				GET_TRANSACTION.status,
			);
			expect(trans.transactions[0].threshold).toEqual(
				GET_TRANSACTION.threshold,
			);
			expect(trans.transactions[0].key_list.length).toEqual(
				GET_TRANSACTION.key_list.length,
			);
			expect(trans.transactions[0].signed_keys.length).toEqual(
				GET_TRANSACTION.signed_keys.length,
			);
			expect(trans.transactions[0].signatures.length).toEqual(
				GET_TRANSACTION.signatures.length,
			);
			expect(trans.transactions[0].network).toEqual(
				GET_TRANSACTION.network,
			);
			expect(trans.transactions[0].hedera_account_id).toEqual(
				GET_TRANSACTION.hedera_account_id,
			);

			for (let i = 0; i < trans.transactions[0].key_list.length; i++) {
				expect(trans.transactions[0].key_list[i]).toEqual(
					GET_TRANSACTION.key_list[i],
				);
			}
			for (let i = 0; i < trans.transactions[0].signed_keys.length; i++) {
				expect(trans.transactions[0].signed_keys[i]).toEqual(
					GET_TRANSACTION.signed_keys[i],
				);
			}
			for (let i = 0; i < trans.transactions[0].signatures.length; i++) {
				expect(trans.transactions[0].signatures[i]).toEqual(
					GET_TRANSACTION.signatures[i],
				);
			}
			expect(trans.pagination.totalItems).toEqual(PAGINATION.totalItems);
			expect(trans.pagination.currentPage).toEqual(
				PAGINATION.currentPage,
			);
			expect(trans.pagination.itemCount).toEqual(PAGINATION.itemCount);
			expect(trans.pagination.itemsPerPage).toEqual(
				PAGINATION.itemsPerPage,
			);
			expect(trans.pagination.totalPages).toEqual(PAGINATION.totalPages);
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
