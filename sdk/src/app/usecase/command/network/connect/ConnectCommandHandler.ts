import { ICommandHandler } from '../../../../../core/command/CommandHandler.js';
import { CommandHandler } from '../../../../../core/decorator/CommandHandlerDecorator.js';
import Injectable from '../../../../../core/Injectable.js';
import { MirrorNodeAdapter } from '../../../../../port/out/mirror/MirrorNodeAdapter.js';
import LogService from '../../../../service/LogService.js';
import TransactionService from '../../../../service/TransactionService.js';
import { ConnectCommand, ConnectCommandResponse } from './ConnectCommand.js';

@CommandHandler(ConnectCommand)
export class ConnectCommandHandler implements ICommandHandler<ConnectCommand> {
	async execute(command: ConnectCommand): Promise<ConnectCommandResponse> {
		try {
			const handler = TransactionService.getHandlerClass(command.wallet);
			const registration = await handler.register(command.account);

			// Change mirror node adapter network
			const adapter = Injectable.resolve(MirrorNodeAdapter);
			adapter.setEnvironment(command.environment);

			return Promise.resolve(
				new ConnectCommandResponse(registration, command.wallet),
			);
		} catch (error) {
			LogService.logError(error);
			throw error;
		}
	}
}
