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
