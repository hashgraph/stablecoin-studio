/* eslint-disable @typescript-eslint/no-explicit-any */

import { ICommandHandler } from "../../../../../../core/command/CommandHandler.js";
import { CommandHandler } from "../../../../../../core/decorator/CommandHandlerDecorator.js";
import { lazyInject } from "../../../../../../core/decorator/LazyInjectDecorator.js";
import AccountService from "../../../../../service/AccountService.js";
import StableCoinService from "../../../../../service/StableCoinService.js";
import TransactionService from "../../../../../service/TransactionService.js";
import { DeleteCommand, DeleteCommandResponse } from "./DeleteCommand.js";


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
		const { tokenId } = command;
		const handler = this.transactionService.getHandler();
		const coin = await this.stableCoinService.get(tokenId);
		const account = this.accountService.getCurrentAccount();
		const capabilities = await this.stableCoinService.getCapabilities(
			account,
			coin,
		);
		const res = await handler.delete(
			{
				account: account,
				capabilities: capabilities.capabilities,
				coin: coin,
			},
		);
		return Promise.resolve(res.response);
	}
}
