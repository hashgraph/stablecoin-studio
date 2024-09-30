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

import LogService from '../../../../../../app/service/LogService.js';
import Hex from '../../../../../../core/Hex.js';
import { ICommandHandler } from '../../../../../../core/command/CommandHandler.js';
import { CommandHandler } from '../../../../../../core/decorator/CommandHandlerDecorator.js';
import { lazyInject } from '../../../../../../core/decorator/LazyInjectDecorator.js';
import { BackendAdapter } from '../../../../../../port/out/backend/BackendAdapter.js';
import { BladeTransactionAdapter } from '../../../../../../port/out/hs/blade/BladeTransactionAdapter.js';
// import { HashpackTransactionAdapter } from '../../../../../../port/out/hs/hashpack/HashpackTransactionAdapter.js';
import { HTSTransactionAdapter } from '../../../../../../port/out/hs/hts/HTSTransactionAdapter.js';
import { HederaWalletConnectTransactionAdapter } from '../../../../../../port/out/hs/walletconnect/HederaWalletConnectTransactionAdapter.js';
import AccountService from '../../../../../service/AccountService.js';
import TransactionService from '../../../../../service/TransactionService.js';
import { SignCommand, SignCommandResponse } from './SignCommand.js';
import { Transaction } from '@hashgraph/sdk';

@CommandHandler(SignCommand)
export class SignCommandHandler implements ICommandHandler<SignCommand> {
	constructor(
		@lazyInject(AccountService)
		public readonly accountService: AccountService,
		@lazyInject(BackendAdapter)
		public readonly backendAdapter: BackendAdapter,
		@lazyInject(TransactionService)
		public readonly transactionService: TransactionService,
	) {}

	async execute(command: SignCommand): Promise<SignCommandResponse> {
		const { transactionId } = command;
		const handler = this.transactionService.getHandler();
		const account = this.accountService.getCurrentAccount();

		if (!account.publicKey) {
			throw new Error('❌ 🔎 No public key found in the account');
		}

		if (!account || !account.publicKey) {
			LogService.logError('No account or public key found');
			return Promise.resolve(new SignCommandResponse(false));
		}

		// retrieves transansaction from Backend
		const transaction = await this.backendAdapter.getTransaction(
			transactionId,
		);

		// extracts bytes to sign
		const deserializedTransaction = Transaction.fromBytes(
			Hex.toUint8Array(transaction.transaction_message),
		);
		if (
			!deserializedTransaction ||
			!deserializedTransaction._signedTransactions
		) {
			LogService.logError('No transaction found');
			return Promise.resolve(new SignCommandResponse(false));
		}
		const bytesToSign =
			deserializedTransaction._signedTransactions.get(0).bodyBytes;
		if (!bytesToSign) {
			LogService.logError('No bytes to sign found');
			return Promise.resolve(new SignCommandResponse(false));
		}
		const serializedBytes = Hex.fromUint8Array(bytesToSign);

		// signs
		let signature = '';

		if (
			// handler instanceof HashpackTransactionAdapter ||
			handler instanceof BladeTransactionAdapter ||
			handler instanceof HTSTransactionAdapter ||
			handler instanceof HederaWalletConnectTransactionAdapter
		) {
			signature = await handler.sign(deserializedTransaction);
		} else signature = await handler.sign(serializedBytes);

		// update the backend
		await this.backendAdapter.signTransaction(
			transactionId,
			signature,
			account.publicKey.key,
		);

		return Promise.resolve(new SignCommandResponse(true));
	}
}
