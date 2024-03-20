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

import Hex from '../../../../../../core/Hex.js';
import { ICommandHandler } from '../../../../../../core/command/CommandHandler.js';
import { CommandHandler } from '../../../../../../core/decorator/CommandHandlerDecorator.js';
import { lazyInject } from '../../../../../../core/decorator/LazyInjectDecorator.js';
import { BackendAdapter } from '../../../../../../port/out/backend/BackendAdapter.js';
import AccountService from '../../../../../service/AccountService.js';
import TransactionService from '../../../../../service/TransactionService.js';
import { SubmitCommand, SubmitCommandResponse } from './SubmitCommand.js';
import { Transaction, PublicKey } from '@hashgraph/sdk';

@CommandHandler(SubmitCommand)
export class SubmitCommandHandler implements ICommandHandler<SubmitCommand> {
	constructor(
		@lazyInject(AccountService)
		public readonly accountService: AccountService,
		@lazyInject(BackendAdapter)
		public readonly backendAdapter: BackendAdapter,
		@lazyInject(TransactionService)
		public readonly transactionService: TransactionService,
	) {}

	async execute(command: SubmitCommand): Promise<SubmitCommandResponse> {
		const { transactionId } = command;
		const handler = this.transactionService.getHandler();

		// retrieves transansaction from Backend
		const transaction = await this.backendAdapter.getTransaction(
			transactionId,
		);

		if (transaction.signatures.length != transaction.signed_keys.length)
			throw new Error(
				'Unexpected error when submiting transaction : number of signatures should equal number of signed keys',
			);

		// submit transaction
		// CHECK IF TRANSACTION ALREADY SUBMITTED, SKIP THIS STEP
		let deserializedTransaction = Transaction.fromBytes(
			Hex.toUint8Array(transaction.transaction_message),
		);

		for (let i = 0; i < transaction.signatures.length; i++) {
			const publicKey_i = PublicKey.fromString(
				transaction.signed_keys[i],
			);
			deserializedTransaction = deserializedTransaction.addSignature(
				publicKey_i,
				Hex.toUint8Array(transaction.signatures[i]),
			);
		}

		await handler.submit(deserializedTransaction);

		// remove from the backend
		await this.backendAdapter.deleteTransaction(transactionId);

		return Promise.resolve(new SubmitCommandResponse(true));
	}
}
