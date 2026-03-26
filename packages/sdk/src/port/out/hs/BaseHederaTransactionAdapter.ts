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

import { Transaction } from '@hiero-ledger/sdk';
import TransactionAdapter from '../TransactionAdapter';
import TransactionResponse from '../../../domain/context/transaction/TransactionResponse';
import { TransactionType } from '../TransactionResponseEnums';
import Account from '../../../domain/context/account/Account';
import { AbstractMirrorNodeAdapter } from '../mirror/AbstractMirrorNodeAdapter.js';
import { AbstractNetworkService } from '../../../core/service/AbstractNetworkService.js';

/**
 * Base adapter for Hedera-native wallet types.
 *
 * After migration to TransactionOrchestrator + Pipeline,
 * this class only provides wallet lifecycle (init/register/stop),
 * account access, and the processTransaction hook used by multi-sig.
 *
 * Subclasses: ClientTransactionAdapter, CustodialTransactionAdapter,
 * MultiSigTransactionAdapter, ExternalHederaTransactionAdapter, etc.
 */
export abstract class BaseHederaTransactionAdapter extends TransactionAdapter {
	public abstract processTransaction(
		tx: Transaction,
		transactionType: TransactionType,
		startDate?: string,
	): Promise<TransactionResponse>;

	public abstract getAccount(): Account;

	public abstract supportsEvmOperations(): boolean;

	public abstract getNetworkService(): AbstractNetworkService;

	public abstract getMirrorNodeAdapter(): AbstractMirrorNodeAdapter;
}
