import { ICommandHandler } from '../../../../../../core/command/CommandHandler.js';
import { CommandHandler } from '../../../../../../core/decorator/CommandHandlerDecorator.js';
import { lazyInject } from '../../../../../../core/decorator/LazyInjectDecorator.js';
import AccountService from '../../../../../service/AccountService.js';
import StableCoinService from '../../../../../service/StableCoinService.js';
import TransactionService from '../../../../../service/TransactionService.js';
import {
	IsLimitedCommand,
	IsLimitedCommandResponse,
} from './IsLimitedCommand.js';

@CommandHandler(IsLimitedCommand)
export class IsLimitedCommandHandler
	implements ICommandHandler<IsLimitedCommand>
{
	constructor(
		@lazyInject(StableCoinService)
		public readonly stableCoinService: StableCoinService,
		@lazyInject(AccountService)
		public readonly accountService: AccountService,
		@lazyInject(TransactionService)
		public readonly transactionService: TransactionService,
	) {}

	async execute(
		command: IsLimitedCommand,
	): Promise<IsLimitedCommandResponse> {
		const { targetId, tokenId } = command;
		const handler = this.transactionService.getHandler();
		const account = this.accountService.getCurrentAccount();
		const capabilities = await this.stableCoinService.getCapabilities(
			account,
			tokenId,
		);
		const res = await handler.isUnlimitedSupplierAllowance(
			capabilities,
			targetId.value,
		);
		return Promise.resolve({ payload: res.response === false ?? false });
	}
}
