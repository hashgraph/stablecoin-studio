import { ICommandHandler } from '../../../../../../core/command/CommandHandler.js';
import { CommandHandler } from '../../../../../../core/decorator/CommandHandlerDecorator.js';
import { lazyInject } from '../../../../../../core/decorator/LazyInjectDecorator.js';
import AccountService from '../../../../../service/AccountService.js';
import StableCoinService from '../../../../../service/StableCoinService.js';
import TransactionService from '../../../../../service/TransactionService.js';
import {
	IncreaseAllowanceCommand,
	IncreaseAllowanceCommandResponse,
} from './IncreaseAllowanceCommand.js';

@CommandHandler(IncreaseAllowanceCommand)
export class IncreaseAllowanceCommandHandler
	implements ICommandHandler<IncreaseAllowanceCommand>
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
		command: IncreaseAllowanceCommand,
	): Promise<IncreaseAllowanceCommandResponse> {
		const { amount, targetId, tokenId } = command;
		const handler = this.transactionService.getHandler();
		const account = this.accountService.getCurrentAccount();
		const capabilities = await this.stableCoinService.getCapabilities(
			account,
			tokenId,
		);
		const res = await handler.increaseSupplierAllowance(
			capabilities,
			targetId.value,
			amount,
		);
		return Promise.resolve({ payload: res.response });
	}
}
