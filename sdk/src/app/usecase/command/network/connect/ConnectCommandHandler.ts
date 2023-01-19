/*
 *
 * Hedera Stable Coin SDK
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

import { ICommandHandler } from '../../../../../core/command/CommandHandler.js';
import { CommandHandler } from '../../../../../core/decorator/CommandHandlerDecorator.js';
import Injectable from '../../../../../core/Injectable.js';
import { MirrorNodeAdapter } from '../../../../../port/out/mirror/MirrorNodeAdapter.js';
import RPCQueryAdapter from '../../../../../port/out/rpc/RPCQueryAdapter.js';
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

			// Init RPC Query Adapter
			Injectable.resolve(RPCQueryAdapter).init();
			return Promise.resolve(
				new ConnectCommandResponse(registration, command.wallet),
			);
		} catch (error) {
			LogService.logError(error);
			throw error;
		}
	}
}
