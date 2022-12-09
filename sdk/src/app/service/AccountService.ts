import { singleton } from 'tsyringe';
import { CommandBus } from '../../core/command/CommandBus.js';
import { Injectable } from '../../core/Injectable.js';
import { QueryBus } from '../../core/query/QueryBus.js';
import Account from '../../domain/context/account/Account.js';
import { Environment } from '../../domain/context/network/Environment.js';
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

	getAccountById(accountId: string, env: Environment): Account {
		return new Account({ id: accountId, environment: env });
	}
}
