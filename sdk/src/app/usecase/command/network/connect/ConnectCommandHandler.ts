/*
 *
 * Hedera Stablecoin SDK
 *
 * Copyright (C) 2023 Hedera Hashgraph, LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 *
 */

import { access } from 'fs';
import { ICommandHandler } from '../../../../../core/command/CommandHandler.js';
import { CommandHandler } from '../../../../../core/decorator/CommandHandlerDecorator.js';
import TransactionService from '../../../../service/TransactionService.js';
import { ConnectCommand, ConnectCommandResponse } from './ConnectCommand.js';

@CommandHandler(ConnectCommand)
export class ConnectCommandHandler implements ICommandHandler<ConnectCommand> {
	async execute(command: ConnectCommand): Promise<ConnectCommandResponse> {
		console.log('ConnectCommand Handler' + command.wallet);
		const handler = TransactionService.getHandlerClass(command.wallet);
		console.error(`The account publicKey in the command handler is ${command.account?.privateKey?.publicKey}`)
		const input =
			command.custodialSettings === undefined
				? command.hWCSettings === undefined
					? command.account
					: command.hWCSettings
				: command.custodialSettings;

		const registration = await handler.register(input);

		return Promise.resolve(
			new ConnectCommandResponse(registration, command.wallet),
		);
	}
}
