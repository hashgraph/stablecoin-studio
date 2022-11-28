import { CommandBase, CommandHandlerType } from './command/CommandBus.js';
import { CommandHandler } from './command/CommandHandler.js';

export class Injectable {

	static getHandler<T extends CommandBase, K extends T>(
		handler: CommandHandlerType,
	): CommandHandler<K> {
		return new handler();
	}


}
