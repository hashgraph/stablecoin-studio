/* eslint-disable @typescript-eslint/no-explicit-any */
import { ICommandHandler } from '../../../../../../core/command/CommandHandler.js';
import { CommandHandler } from '../../../../../../core/decorator/CommandHandlerDecorator.js';
import { lazyInject } from '../../../../../../core/decorator/LazyInjectDecorator.js';
import {
	Capability,
	Operation,
	Access,
} from '../../../../../../domain/context/stablecoin/Capability.js';
import AccountService from '../../../../../service/AccountService.js';
import StableCoinService from '../../../../../service/StableCoinService.js';
import TransactionService from '../../../../../service/TransactionService.js';
import { HasRoleCommand, HasRoleCommandResponse } from './HasRoleCommand.js';

@CommandHandler(HasRoleCommand)
export class HasRoleCommandHandler implements ICommandHandler<HasRoleCommand> {
	constructor(
		@lazyInject(StableCoinService)
		public readonly stableCoinService: StableCoinService,
		@lazyInject(AccountService)
		public readonly accountService: AccountService,
		@lazyInject(TransactionService)
		public readonly transactionService: TransactionService,
	) {}

	async execute(command: HasRoleCommand): Promise<HasRoleCommandResponse> {
		const { role, targetId, tokenId } = command;
		const handler = this.transactionService.getHandler();
		const coin = await this.stableCoinService.get(tokenId);
		// const account = this.accountService.getCurrentAccount();
		// const res = await handler.cashin(
		// 	{
		// 		account: account,
		// 		capabilities: [
		// 			new Capability(Operation.CASH_IN, Access.CONTRACT),
		// 		],
		// 		coin: coin,
		// 	},
		// 	targetId.value,
		// 	role,
		// );
		// // TODO Do some work here
		return Promise.resolve({ payload: true });
	}
}
