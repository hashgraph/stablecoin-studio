
import { ICommandHandler } from '../../../../../core/command/CommandHandler.js';
import { CommandHandler } from '../../../../../core/decorator/CommandHandlerDecorator.js';
import { Injectable } from '../../../../../core/Injectable.js';
import {
	DisconnectCommand,
	DisconnectCommandResponse,
} from './DisconnectCommand.js';

@CommandHandler(DisconnectCommand)
export class DisconnectCommandHandler
	implements ICommandHandler<DisconnectCommand>
{
	async execute(): Promise<DisconnectCommandResponse> {
		const handler = Injectable.resolveTransactionHandler();
		const res = await handler.stop();
		return Promise.resolve({ payload: res });
	}
}
