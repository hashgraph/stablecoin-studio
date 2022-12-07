import { ICommandHandler } from '../../../../../../core/command/CommandHandler.js';
import { CommandHandler } from '../../../../../../core/decorator/CommandHandlerDecorator.js';
import { lazyInject } from '../../../../../../core/decorator/LazyInjectDecorator.js';
import AccountService from '../../../../../service/AccountService.js';
import StableCoinService from '../../../../../service/StableCoinService.js';
import TransactionService from '../../../../../service/TransactionService.js';
import { FreezeCommand, FreezeCommandResponse } from './FreezeCommand.js';

@CommandHandler(FreezeCommand)
export class FreezeCommandHandler implements ICommandHandler<FreezeCommand> {
	constructor(
		@lazyInject(StableCoinService)
		public readonly stableCoinService: StableCoinService,
		@lazyInject(AccountService)
		public readonly accountService: AccountService,
		@lazyInject(TransactionService)
		public readonly transactionService: TransactionService,
	) {}

	async execute(command: FreezeCommand): Promise<FreezeCommandResponse> {
		const { targetId, tokenId } = command;
		const handler = this.transactionService.getHandler();
		const coin = await this.stableCoinService.get(tokenId);
		const account = this.accountService.getCurrentAccount();
		const capabilities = await this.stableCoinService.getCapabilities(
			account,
			coin,
		);
		const res = await handler.freeze(
			{
				account: account,
				capabilities: capabilities.capabilities,
				coin: coin,
			},
			targetId.value,
		);
		return Promise.resolve(res.response);
	}
}
