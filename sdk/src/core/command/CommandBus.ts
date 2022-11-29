/* eslint-disable @typescript-eslint/no-explicit-any */
import { injectable } from 'tsyringe';
import { CashInCommandHandler } from '../../app/usecase/stablecoin/cashin/CashInCommandHandler.js';
import { COMMAND_HANDLER_METADATA, COMMAND_METADATA } from '../Constants.js';
import { CommandMetadata } from '../decorator/CommandMetadata.js';
import { Injectable } from '../Injectable.js';
import { Type } from '../Type.js';
import { Command } from './Command.js';
import { ICommandHandler } from './CommandHandler.js';
import { CommandResponse } from './CommandResponse.js';
import { CommandHandlerNotFoundException } from './error/CommandHandlerNotFoundException.js';
import { InvalidCommandHandlerException } from './error/InvalidCommandHandlerException.js';

export type CommandHandlerType = Type<
	ICommandHandler<Command<CommandResponse>>
>;

export interface ICommandBus<T extends CommandResponse> {
	execute<X extends T>(command: Command<X>): Promise<X>;
	bind<X extends T>(handler: ICommandHandler<Command<X>>, id: string): void;
}

@injectable()
export class CommandBus<T extends CommandResponse = CommandResponse>
	implements ICommandBus<T>
{
	public handlers = new Map<string, ICommandHandler<Command<T>>>();

	constructor() {
		this.registerHandlers([CashInCommandHandler]);
	}

	execute<X extends T>(command: Command<X>): Promise<X> {
		try {
			const commandId = this.getCommandId(command);
			const handler = this.handlers.get(commandId);
			if (!handler) {
				throw new CommandHandlerNotFoundException(commandId);
			}
			return handler.execute(command) as Promise<X>;
		} catch (err) {
			console.error(err);
			throw err;
		}
	}

	bind<X extends T>(handler: ICommandHandler<Command<X>>, id: string): void {
		this.handlers.set(id, handler);
	}

	private getCommandId<X>(command: Command<X>): string {
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
			this.bind(instance as ICommandHandler<Command<T>>, target);
		});
	}

	private reflectCommandId(handler: CommandHandlerType): string | undefined {
		const command: Type<Command<CommandResponse>> = Reflect.getMetadata(
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
