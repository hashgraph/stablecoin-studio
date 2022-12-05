/* eslint-disable @typescript-eslint/no-explicit-any */
import { ICommandHandler } from '../../../../../core/command/CommandHandler.js';
import { CommandHandler } from '../../../../../core/decorator/CommandHandlerDecorator.js';
import {
	Access,
	Capability,
	Operation,
} from '../../../../../domain/context/stablecoin/Capability.js';
import AccountService from '../../../../service/AccountService.js';
import StableCoinService from '../../../../service/StableCoinService.js';
import { DeleteCommand, DeleteCommandResponse } from './DeleteCommand.js';
import TransactionService from '../../../../service/TransactionService.js';
import { lazyInject } from '../../../../../core/decorator/LazyInjectDecorator.js';

@CommandHandler(DeleteCommand)
export class DeleteCommandHandler implements ICommandHandler<DeleteCommand> {
	constructor(
		@lazyInject(StableCoinService)
		public readonly stableCoinService: StableCoinService,
		@lazyInject(AccountService)
		public readonly accountService: AccountService,
		@lazyInject(TransactionService)
		public readonly transactionService: TransactionService,
	) {}

	async execute(command: DeleteCommand): Promise<DeleteCommandResponse> {
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
			targetId.value,
			amount,
		);
		// TODO Do some work here
		return Promise.resolve(res.response);
	}
}
