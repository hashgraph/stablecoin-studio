/* eslint-disable @typescript-eslint/no-explicit-any */
import { ICommandHandler } from '../../../../../core/command/CommandHandler.js';
import { CommandHandler } from '../../../../../core/decorator/CommandHandlerDecorator.js';
import { Injectable } from '../../../../../core/Injectable.js';
import { SupportedWallets } from '../../../../../domain/context/network/Wallet.js';
import RPCTransactionHandler from '../../../../../port/out/handler/RPCTransactionHandler.js';
import { ConnectCommand, ConnectCommandResponse } from './ConnectCommand.js';

@CommandHandler(ConnectCommand)
export class ConnectCommandHandler implements ICommandHandler<ConnectCommand> {

	execute(command: ConnectCommand): Promise<ConnectCommandResponse> {
		const res = new ConnectCommandResponse(
			'=dsaihiueh231213khfjds',
			SupportedWallets.METAMASK,
		);
		const handler = Injectable.resolve(RPCTransactionHandler);
		handler.register()
		// TODO Do some work here
		return Promise.resolve(res);
	}
}
