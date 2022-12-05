import { singleton } from 'tsyringe';
import { CommandBus } from '../../core/command/CommandBus.js';
import { Injectable } from '../../core/Injectable.js';
import { QueryBus } from '../../core/query/QueryBus.js';
import Account from '../../domain/context/account/Account.js';
import { Environment } from '../../domain/context/network/Environment.js';
import { SupportedWallets } from '../../domain/context/network/Wallet.js';
import {
	ConnectCommand,
	ConnectCommandResponse,
} from '../usecase/command/network/connect/ConnectCommand.js';
import NetworkService from './NetworkService.js';
import Service from './Service.js';

@singleton()
export default class AccountService extends Service {
	private account: Account;

	constructor(
		public readonly queryBus: QueryBus = Injectable.resolve(QueryBus),
		public readonly commandBus: CommandBus = Injectable.resolve(CommandBus),
		public readonly networkService: NetworkService = Injectable.resolve(
			NetworkService,
		),
	) {
		super();
	}

	async connect(
		account: Account,
		wallet: SupportedWallets,
	): Promise<ConnectCommandResponse> {
		const res = await this.commandBus.execute(
			new ConnectCommand(account, wallet),
		);
		this.account = account;
		return res;
	}

	getCurrentAccount(): Account {
		// TODO
		return this.account;
	}

	getAccountById(accountId: string, env: Environment): Account {
		return new Account({ id: accountId, environment: env });
	}
}
