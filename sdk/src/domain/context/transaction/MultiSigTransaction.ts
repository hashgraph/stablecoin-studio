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

export const EXECUTED = 'EXECUTED';

export class Pagination {
	totalItems: number;
	itemCount: number;
	itemsPerPage: number;
	totalPages: number;
	currentPage: number;
}

export class MultiSigTransaction {
	id: string;
	transaction_message: string;
	description: string;
	status: string;
	threshold: number;
	key_list: string[];
	signed_keys: string[];
	signatures: string[];
	network: string;
	hedera_account_id: string;
	start_date: string;

	constructor(
		id: string,
		transaction_message: string,
		description: string,
		status: string,
		threshold: number,
		key_list: string[],
		signed_keys: string[],
		signatures: string[],
		network: string,
		hedera_account_id: string,
		start_date: string,
	) {
		this.id = id;
		this.transaction_message = transaction_message;
		this.description = description;
		this.status = status;
		this.threshold = threshold;
		this.key_list = key_list;
		this.signed_keys = signed_keys;
		this.signatures = signatures;
		this.network = network;
		this.hedera_account_id = hedera_account_id;
		this.start_date = start_date;
	}
}

export class MultiSigTransactions {
	transactions: MultiSigTransaction[];
	pagination: Pagination;

	constructor(transactions: MultiSigTransaction[], pagination: Pagination) {
		this.transactions = transactions;
		this.pagination = pagination;
	}
}
