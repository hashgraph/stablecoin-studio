/* eslint-disable @typescript-eslint/no-explicit-any */
import { COMMAND_HANDLER_METADATA, COMMAND_METADATA } from '../Constants.js';
import { CommandMetadata } from '../decorator/CommandMetadata.js';
import { Injectable } from '../Injectable.js';
import { Type } from '../Type.js';
import { Command } from './Command.interface.js';
import { ICommandHandler } from './CommandHandler.interface.js';
import { CommandResponse } from './CommandResponse.interface.js';
import { CommandHandlerNotFoundException } from './error/CommandHandlerNotFoundException.js';
import { InvalidCommandHandlerException } from './error/InvalidCommandHandlerException.js';

export type CommandHandlerType = Type<ICommandHandler<Command, CommandResponse>>;

export interface ICommandBus<
	CommandBase extends Command = Command,
	ResponseBase extends CommandResponse = CommandResponse,
> {
	execute<T extends CommandBase, K extends ResponseBase>(
		command: T,
	): Promise<K>;
}

export class CommandBus<
	CommandBase extends Command = Command,
	ResponseBase extends CommandResponse = CommandResponse,
> implements ICommandBus<CommandBase, ResponseBase>
{
	public handlers = new Map<
		string,
		ICommandHandler<CommandBase, ResponseBase>
	>();

	constructor(handlers: CommandHandlerType[]) {
		this.registerHandlers(handlers);
	}

	execute<T extends CommandBase, K extends ResponseBase>(
		command: T,
	): Promise<K> {
		try {
			const commandId = this.getCommandId(command);
			const handler = this.handlers.get(commandId);
			if (!handler) {
				throw new CommandHandlerNotFoundException(commandId);
			}
			return handler.execute(command) as Promise<K>;
		} catch (err) {
			console.error(err);
			throw err;
		}
	}

	bind<T extends CommandBase, K extends ResponseBase>(
		handler: ICommandHandler<T, K>,
		id: string,
	): void {
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
			const instance = Injectable.getCommandHandler(handler);
			if (!instance) {
				return;
			}
			const target = this.reflectCommandId(handler);
			if (!target) {
				throw new InvalidCommandHandlerException();
			}
			this.bind(
				instance as ICommandHandler<CommandBase, ResponseBase>,
				target,
			);
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
