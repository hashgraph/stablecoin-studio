import { ICommandHandler } from '../../../../../../core/command/CommandHandler.js';
import { CommandHandler } from '../../../../../../core/decorator/CommandHandlerDecorator.js';
import { lazyInject } from '../../../../../../core/decorator/LazyInjectDecorator.js';
import AccountService from '../../../../../service/AccountService.js';
import StableCoinService from '../../../../../service/StableCoinService.js';
import TransactionService from '../../../../../service/TransactionService.js';
import {
	GrantUnlimitedSupplierRoleCommand,
	GrantUnlimitedSupplierRoleCommandResponse,
} from './GrantUnlimitedSupplierRoleCommand.js';

@CommandHandler(GrantUnlimitedSupplierRoleCommand)
export class GrantUnlimitedSupplierRoleCommandHandler
	implements ICommandHandler<GrantUnlimitedSupplierRoleCommand>
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
		command: GrantUnlimitedSupplierRoleCommand,
	): Promise<GrantUnlimitedSupplierRoleCommandResponse> {
		const { targetId, tokenId } = command;
		const handler = this.transactionService.getHandler();
		const account = this.accountService.getCurrentAccount();
		const capabilities = await this.stableCoinService.getCapabilities(
			account,
			tokenId,
		);
		const res = await handler.grantUnlimitedSupplierRole(capabilities, targetId);
		return Promise.resolve({ payload: res.response });
	}
}
