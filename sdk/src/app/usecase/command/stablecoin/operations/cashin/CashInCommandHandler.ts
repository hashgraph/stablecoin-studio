import { ICommandHandler } from '../../../../../../core/command/CommandHandler.js';
import { CommandHandler } from '../../../../../../core/decorator/CommandHandlerDecorator.js';
import { lazyInject } from '../../../../../../core/decorator/LazyInjectDecorator.js';
import {
	Capability,
	Operation,
	Access,
} from '../../../../../../domain/context/stablecoin/Capability.js';
import AccountService from '../../../../../service/AccountService.js';
import NetworkService from '../../../../../service/NetworkService.js';
import StableCoinService from '../../../../../service/StableCoinService.js';
import TransactionService from '../../../../../service/TransactionService.js';
import { CashInCommand, CashInCommandResponse } from './CashInCommand.js';

@CommandHandler(CashInCommand)
export class CashInCommandHandler implements ICommandHandler<CashInCommand> {
	constructor(
		@lazyInject(StableCoinService)
		public readonly stableCoinService: StableCoinService,
		@lazyInject(AccountService)
		public readonly accountService: AccountService,
		@lazyInject(TransactionService)
		public readonly transactionService: TransactionService,
		@lazyInject(NetworkService)
		public readonly networkService: NetworkService,
	) {}

	async execute(command: CashInCommand): Promise<CashInCommandResponse> {
		const { amount, targetId, tokenId } = command;
		const handler = this.transactionService.getHandler();
		const coin = await this.stableCoinService.get(tokenId);
		const account = this.accountService.getCurrentAccount();
		const res = await handler.cashin(
			{
				account: account,
				capabilities: [
					new Capability(Operation.CASH_IN, Access.CONTRACT),
				],
				coin: coin,
			},
			this.accountService.getAccountById(targetId.value, this.networkService.environment),
			amount,
		);
		// TODO Do some work here
		return Promise.resolve(res.response);
	}
}
