/* eslint-disable @typescript-eslint/no-explicit-any */
import { COMMAND_HANDLER_METADATA, COMMAND_METADATA } from '../Constants.js';
import { CommandMetadata } from '../decorator/CommandMetadata.js';
import { Injectable } from '../Injectable.js';
import { Type } from '../Type.js';
import { Command } from './Command.js';
import { CommandHandler } from './CommandHandler.js';
import { CommandHandlerNotFoundException } from './error/CommandHandlerNotFoundException.js';
import { InvalidCommandHandlerException } from './error/InvalidCommandHandlerException.js';

export type CommandHandlerType = Type<CommandHandler<Command>>;
export type CommandBase = Command;

export interface CommandBus<CommandBase extends Command = Command> {
	execute<T extends CommandBase, R = any>(command: T): Promise<R>;
}

export class CommandBus<CommandBase extends Command = Command>
	implements CommandBus<CommandBase>
{
	public handlers = new Map<string, CommandHandler<CommandBase>>();

	constructor(handlers: CommandHandlerType[]) {
		this.registerHandlers(handlers);
	}

	execute<T extends CommandBase, R = any>(command: T): Promise<R> {
		try {
			const commandId = this.getCommandId(command);
			const handler = this.handlers.get(commandId);
			if (!handler) {
				throw new CommandHandlerNotFoundException(commandId);
			}
			return handler.execute(command);
		} catch (err) {
			console.error(err);
			throw err;
		}
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

	protected registerHandlers(handlers: CommandHandlerType[]): void {
		handlers.forEach((handler) => {
			const instance = Injectable.getHandler(handler);
			if (!instance) {
				return;
			}
			const target = this.reflectCommandId(handler);
			if (!target) {
				throw new InvalidCommandHandlerException();
			}
			this.bind(instance, target);
		});
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
