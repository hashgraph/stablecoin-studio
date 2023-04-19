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

import BaseError, { ErrorCode } from '../../../core/error/BaseError.js';

export const REGEX_TRANSACTION =
	/^(0|(?:[1-9]\d*))\.(0|(?:[1-9]\d*))\.(0|(?:[1-9]\d*))(?:-([a-z]{5}))?@([1-9]\d*)\.([1-9]\d*)$/;
const HASHSCAN_BASE = 'https://hashscan.io/';
const TRANSACTION_PATH = '/transactionsById/';
const RPC_RELAY_PATH = '/tx/';

type TransactionResponseErrorPayload = {
	message: string;
	network: string;
	name?: string;
	status?: string;
	transactionId?: string;
	RPC_relay?: boolean;
};

export class TransactionResponseError extends BaseError {
	error: TransactionResponseErrorPayload;
	transactionUrl: string | null;
	constructor(val: TransactionResponseErrorPayload) {
		super(ErrorCode.TransactionError, `Transaction failed: ${val.message}`);
		this.error = val;
		if (val.transactionId) {
			if (val.RPC_relay) {
				this.transactionUrl = `${HASHSCAN_BASE}${val.network}${RPC_RELAY_PATH}${val.transactionId}`;
			} else {
				this.transactionUrl = `${HASHSCAN_BASE}${val.network}${TRANSACTION_PATH}${val.transactionId}`;
			}
		}
	}
}
