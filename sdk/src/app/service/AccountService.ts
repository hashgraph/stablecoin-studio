import { singleton } from 'tsyringe';
import { Injectable } from '../../core/Injectable.js';
import { QueryBus } from '../../core/query/QueryBus.js';
import Account from '../../domain/context/account/Account.js';
import NetworkService from './NetworkService.js';
import Service from './Service.js';

@singleton()
export default class AccountService extends Service {
	constructor(
		public readonly queryBus: QueryBus = Injectable.resolve(QueryBus),
		public readonly networkService: NetworkService = Injectable.resolve(
			NetworkService,
		),
	) {
		super();
	}

	getCurrentAccount(): Account {
		// TODO
		return new Account({
			id: '0.0.1',
			environment: this.networkService.environment,
		});
	}
}
