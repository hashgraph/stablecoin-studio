import { ICommandHandler } from '../../../../../core/command/CommandHandler.js';
import { CommandHandler } from '../../../../../core/decorator/CommandHandlerDecorator.js';
import { lazyInject } from '../../../../../core/decorator/LazyInjectDecorator.js';
import Injectable from '../../../../../core/Injectable.js';
import { WalletConnectError } from '../../../../../domain/context/network/error/WalletConnectError.js';
import { MirrorNodeAdapter } from '../../../../../port/out/mirror/MirrorNodeAdapter.js';
import LogService from '../../../../service/LogService.js';
import TransactionService from '../../../../service/TransactionService.js';
import {
	SelectWalletCommand,
	SelectWalletCommandResponse,
} from './SelectWalletCommand.js';

@CommandHandler(SelectWalletCommand)
export class SelectWalletCommandHandler
	implements ICommandHandler<SelectWalletCommand>
{
	constructor(
		@lazyInject(TransactionService)
		public readonly transactionService: TransactionService,
	) {}

	async execute(
		command: SelectWalletCommand,
	): Promise<SelectWalletCommandResponse> {
		try {
			const handler = TransactionService.getHandlerClass(command.wallet);
			this.transactionService.setHandler(handler);

			// Change mirror node adapter network
			const adapter = Injectable.resolve(MirrorNodeAdapter);
			adapter.setEnvironment(command.environment);

			return Promise.resolve(
				new SelectWalletCommandResponse(command.wallet),
			);
		} catch (error) {
			const err = new WalletConnectError((error as Error).message);
			LogService.logError(err);
			throw err;
		}
	}
}
