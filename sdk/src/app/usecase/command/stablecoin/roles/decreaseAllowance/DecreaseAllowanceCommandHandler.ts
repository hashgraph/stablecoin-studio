import { ICommandHandler } from '../../../../../../core/command/CommandHandler.js';
import { CommandHandler } from '../../../../../../core/decorator/CommandHandlerDecorator.js';
import { lazyInject } from '../../../../../../core/decorator/LazyInjectDecorator.js';
import BigDecimal from '../../../../../../domain/context/shared/BigDecimal.js';
import AccountService from '../../../../../service/AccountService.js';
import StableCoinService from '../../../../../service/StableCoinService.js';
import TransactionService from '../../../../../service/TransactionService.js';
import {
	DecreaseAllowanceCommand,
	DecreaseAllowanceCommandResponse,
} from './DecreaseAllowanceCommand.js';

@CommandHandler(DecreaseAllowanceCommand)
export class DecreaseAllowanceCommandHandler
	implements ICommandHandler<DecreaseAllowanceCommand>
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
		command: DecreaseAllowanceCommand,
	): Promise<DecreaseAllowanceCommandResponse> {
		const { amount, targetId, tokenId } = command;
		const handler = this.transactionService.getHandler();
		const account = this.accountService.getCurrentAccount();
		const capabilities = await this.stableCoinService.getCapabilities(
			account,
			tokenId,
		);
		const res = await handler.decreaseSupplierAllowance(
			capabilities,
			targetId,
			BigDecimal.fromString(amount, capabilities.coin.decimals),
		);
		// return Promise.resolve({ payload: res.response });
		return Promise.resolve(
			new DecreaseAllowanceCommandResponse(res.error === undefined),
		);
	}
}
