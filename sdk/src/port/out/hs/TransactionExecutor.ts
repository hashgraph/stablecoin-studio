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
import { ethers } from 'ethers';
import TransactionResponse from '../../../domain/context/transaction/TransactionResponse';
import { TransactionType } from '../TransactionResponseEnums';
import Account from '../../../domain/context/account/Account';

/**
 * Output port interface for transaction execution.
 * Operations depend on this interface, not on the concrete adapter.
 *
 * This breaks the circular dependency: adapter → operations → adapter.
 * Operations only see this interface, not BaseHederaTransactionAdapter.
 */
export interface TransactionExecutor {
	processTransaction(
		tx: Transaction,
		transactionType: TransactionType,
		startDate?: string,
	): Promise<TransactionResponse>;

	executeContractCall(
		contractId: string,
		iface: ethers.Interface,
		functionName: string,
		params: unknown[],
		gasLimit: number,
		transactionType?: TransactionType,
		payableAmountHbar?: string,
		startDate?: string,
		evmAddress?: string,
	): Promise<TransactionResponse>;

	getAccount(): Account;

	supportsEvmOperations(): boolean;
}
