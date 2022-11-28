import 'reflect-metadata';
import { COMMAND_HANDLER_METADATA, COMMAND_METADATA } from '../Constants';
import { v4 } from 'uuid';
import { Command } from '../command/Command.interface.js';

/**
 * This decorator determines that a class is a command handler
 *
 * The decorated class must implement the `CommandHandler` interface.
 *
 * @param command command *type* to be handled by this handler.
 */
export const CommandHandler = (command: Command): ClassDecorator => {
	return (target: object) => {
		if (!Reflect.hasMetadata(COMMAND_METADATA, command)) {
			Reflect.defineMetadata(COMMAND_METADATA, { id: v4() }, command);
		}
		Reflect.defineMetadata(COMMAND_HANDLER_METADATA, command, target);
	};
};
