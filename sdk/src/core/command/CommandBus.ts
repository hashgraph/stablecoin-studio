/* eslint-disable @typescript-eslint/no-explicit-any */
import { COMMAND_HANDLER_METADATA, COMMAND_METADATA } from '../Constants.js';
import { CommandMetadata } from '../decorator/CommandMetadata.js';
import { Type } from '../Type.js';
import { Command } from './Command.js';
import { CommandHandler } from './CommandHandler.js';
import { CommandHandlerNotFoundException } from './error/CommandHandlerNotFoundException.js';
import { InvalidCommandHandlerException } from './error/InvalidCommandHandlerException.js';

export type CommandHandlerType = Type<CommandHandler<Command>>;

export interface CommandBus<CommandBase extends Command = Command> {
	execute<T extends CommandBase, R = any>(command: T): Promise<R>;
}

export class CommandBus<CommandBase extends Command = Command>
	implements CommandBus<CommandBase>
{
	private handlers = new Map<string, CommandHandler<CommandBase>>();

	execute<T extends CommandBase, R = any>(command: T): Promise<R> {
		const commandId = this.getCommandId(command);
		const handler = this.handlers.get(commandId);
		if (!handler) {
			throw new CommandHandlerNotFoundException(commandId);
		}
		return handler.execute(command);
	}

	bind<T extends CommandBase>(handler: CommandHandler<T>, id: string): void {
		this.handlers.set(id, handler);
	}

	private getCommandId(command: CommandBase): string {
		const { constructor: commandType } = Object.getPrototypeOf(command);
		const commandMetadata: CommandMetadata = Reflect.getMetadata(
			COMMAND_METADATA,
			commandType,
		);
		if (!commandMetadata) {
			throw new CommandHandlerNotFoundException(commandType.name);
		}

		return commandMetadata.id;
	}

	protected registerHandler(handler: CommandHandlerType): void {
		const instance = this.moduleRef.get(handler, { strict: false });
		if (!instance) {
			return;
		}
		const target = this.reflectCommandId(handler);
		if (!target) {
			throw new InvalidCommandHandlerException();
		}
		this.bind(instance as CommandHandler<CommandBase>, target);
	}

	private reflectCommandId(handler: CommandHandlerType): string | undefined {
		const command: Type<Command> = Reflect.getMetadata(
			COMMAND_HANDLER_METADATA,
			handler,
		);
		const commandMetadata: CommandMetadata = Reflect.getMetadata(
			COMMAND_METADATA,
			command,
		);
		return commandMetadata.id;
	}
}
