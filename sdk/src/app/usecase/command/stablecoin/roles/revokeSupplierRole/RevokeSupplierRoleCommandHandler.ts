import { ICommandHandler } from '../../../../../../core/command/CommandHandler.js';
import { CommandHandler } from '../../../../../../core/decorator/CommandHandlerDecorator.js';
import { lazyInject } from '../../../../../../core/decorator/LazyInjectDecorator.js';
import AccountService from '../../../../../service/AccountService.js';
import StableCoinService from '../../../../../service/StableCoinService.js';
import TransactionService from '../../../../../service/TransactionService.js';
import {
	RevokeSupplierRoleCommand,
	RevokeSupplierRoleCommandResponse,
} from './RevokeSupplierRoleCommand.js';

@CommandHandler(RevokeSupplierRoleCommand)
export class RevokeSupplierRoleCommandHandler
	implements ICommandHandler<RevokeSupplierRoleCommand>
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
		command: RevokeSupplierRoleCommand,
	): Promise<RevokeSupplierRoleCommandResponse> {
		const { targetId, tokenId } = command;
		const handler = this.transactionService.getHandler();
		const account = this.accountService.getCurrentAccount();
		const capabilities = await this.stableCoinService.getCapabilities(
			account,
			tokenId,
		);
		const res = await handler.revokeSupplierRole(capabilities, targetId);
		// return Promise.resolve({ payload: res.response ?? false });
		return Promise.resolve(
			new RevokeSupplierRoleCommandResponse(res.error === undefined),
		);
	}
}
