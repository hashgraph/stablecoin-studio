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

/* eslint-disable @typescript-eslint/no-unused-vars */

import {
	MultiSigTransaction,
	MultiSigTransactions,
} from '../../../domain/context/transaction/MultiSigTransaction.js';
import BackendEndpoint from '../../../domain/context/network/BackendEndpoint.js';
import { Environment } from '../../../domain/context/network/Environment.js';

export class AbstractBackendAdapter {
	set(_be: BackendEndpoint): void {
		throw new Error('Method not implemented.');
	}

	addTransaction(
		_transactionMessage: string,
		_description: string,
		_HederaAccountId: string,
		_keyList: string[],
		_threshold: number,
		_network: Environment,
		_startDate: Date,
		_consensusNodes?: { url: string; nodeId: string }[],
	): Promise<string> {
		throw new Error('Method not implemented.');
	}

	signTransaction(
		_transactionId: string,
		_transactionSignature: string,
		_publicKey: string,
	): Promise<void> {
		throw new Error('Method not implemented.');
	}

	updateTransaction(
		_transactionId: string,
		_status: string,
	): Promise<void> {
		throw new Error('Method not implemented.');
	}

	deleteTransaction(_transactionId: string): Promise<void> {
		throw new Error('Method not implemented.');
	}

	getTransactions(
		_page: number,
		_limit: number,
		_network: Environment,
		_publicKey?: string,
		_status?: string,
		_accountId?: string,
	): Promise<MultiSigTransactions> {
		throw new Error('Method not implemented.');
	}

	getTransaction(
		_transactionId: string,
	): Promise<MultiSigTransaction> {
		throw new Error('Method not implemented.');
	}
}
