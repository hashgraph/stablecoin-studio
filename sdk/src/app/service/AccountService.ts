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

import { singleton } from 'tsyringe';
import { CommandBus } from '../../core/command/CommandBus.js';
import Injectable from '../../core/Injectable.js';
import { QueryBus } from '../../core/query/QueryBus.js';
import Account from '../../domain/context/account/Account.js';
import { AccountIdNotValid } from '../../domain/context/account/error/AccountIdNotValid.js';
import { HederaId } from '../../domain/context/shared/HederaId.js';
import { GetAccountInfoQuery } from '../usecase/query/account/info/GetAccountInfoQuery.js';
import NetworkService from './NetworkService.js';
import Service from './Service.js';
import TransactionService from './TransactionService.js';

@singleton()
export default class AccountService extends Service {
	constructor(
		public readonly queryBus: QueryBus = Injectable.resolve(QueryBus),
		public readonly commandBus: CommandBus = Injectable.resolve(CommandBus),
		public readonly networkService: NetworkService = Injectable.resolve(
			NetworkService,
		),
		public readonly transactionService: TransactionService = Injectable.resolve(
			TransactionService,
		),
	) {
		super();
	}

	getCurrentAccount(): Account {
		return this.transactionService.getHandler().getAccount();
	}

	async getAccountInfo(id: HederaId): Promise<Account> {
		const account = (
			await this.queryBus.execute(
				new GetAccountInfoQuery(id),
			)
		).account;
		if (!account.id) throw new AccountIdNotValid(id.toString());
		return new Account({
			id: account.id,
			publicKey: account.publicKey,
			evmAddress: account.accountEvmAddress
		})
	}
}
