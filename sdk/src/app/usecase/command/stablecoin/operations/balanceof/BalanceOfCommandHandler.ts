/* eslint-disable @typescript-eslint/no-explicit-any */
import { ICommandHandler } from '../../../../../../core/command/CommandHandler.js';
import { CommandHandler } from '../../../../../../core/decorator/CommandHandlerDecorator.js';
import AccountService from '../../../../../service/AccountService.js';
import StableCoinService from '../../../../../service/StableCoinService.js';
import {
	BalanceOfCommand,
	BalanceOfCommandResponse,
} from './BalanceOfCommand.js';
import TransactionService from '../../../../../service/TransactionService.js';
import { lazyInject } from '../../../../../../core/decorator/LazyInjectDecorator.js';
import StableCoinCapabilities from '../../../../../../domain/context/stablecoin/StableCoinCapabilities.js';
import NetworkService from '../../../../../service/NetworkService.js';

@CommandHandler(BalanceOfCommand)
export class BalanceOfCommandHandler
	implements ICommandHandler<BalanceOfCommand>
{
	constructor(
		@lazyInject(StableCoinService)
		public readonly stableCoinService: StableCoinService,
		@lazyInject(AccountService)
		public readonly accountService: AccountService,
		@lazyInject(NetworkService)
		public readonly networkService: NetworkService,
		@lazyInject(TransactionService)
		public readonly transactionService: TransactionService,
	) {}

	async execute(
		command: BalanceOfCommand,
	): Promise<BalanceOfCommandResponse> {
		const { targetId, tokenId } = command;
		const handler = this.transactionService.getHandler();
		const coin = await this.stableCoinService.get(tokenId);
		const env = this.networkService.environment;
		const capabilities = new StableCoinCapabilities(
			coin,
			[],
			this.accountService.getAccountById(targetId.value, env),
		);
		const res = await handler.balanceOf(capabilities, targetId.value);
		// TODO Do some work here
		if(res.error || res.response === undefined){
			throw res.error;
		}
		return new BalanceOfCommandResponse(res.response);
	}
}
