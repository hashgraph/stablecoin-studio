import { ICommandHandler } from '../../../../../../core/command/CommandHandler.js';
import { CommandHandler } from '../../../../../../core/decorator/CommandHandlerDecorator.js';
import { lazyInject } from '../../../../../../core/decorator/LazyInjectDecorator.js';
import AccountService from '../../../../../service/AccountService.js';
import StableCoinService from '../../../../../service/StableCoinService.js';
import TransactionService from '../../../../../service/TransactionService.js';
import {
	GrantRoleCommand,
	GrantRoleCommandResponse,
} from './GrantRoleCommand.js';

@CommandHandler(GrantRoleCommand)
export class GrantRoleCommandHandler
	implements ICommandHandler<GrantRoleCommand>
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
		command: GrantRoleCommand,
	): Promise<GrantRoleCommandResponse> {
		const { role, targetId, tokenId } = command;
		const handler = this.transactionService.getHandler();
		const coin = await this.stableCoinService.get(tokenId);
		const account = this.accountService.getCurrentAccount();
		const capabilities = await this.stableCoinService.getCapabilities(
			account,
			coin,
		);
		const res = await handler.grantRole(
			{
				account: account,
				capabilities: capabilities.capabilities,
				coin: coin,
			},
			targetId.value,
			role,
		);
		return Promise.resolve({ payload: res.response });
	}
}
