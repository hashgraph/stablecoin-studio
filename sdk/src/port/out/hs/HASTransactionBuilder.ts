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

import { Transaction, AccountUpdateTransaction, Client } from '@hashgraph/sdk';
import LogService from '../../../app/service/LogService.js';
import PublicKey from '../../../domain/context/account/PublicKey.js';
import { HederaId } from '../../../domain/context/shared/HederaId.js';

import { TransactionBuildingError } from './error/TransactionBuildingError.js';

export class HASTransactionBuilder {
	public static changeAccountKeyTransaction(
		accountId: HederaId,
		key: PublicKey,
	): Transaction {
		try {
			return new AccountUpdateTransaction()
				.setAccountId(accountId.toHederaAddress())
				.setKey(key.toHederaKey());
		} catch (error) {
			LogService.logError(error);
			throw new TransactionBuildingError(error);
		}
	}
}
