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
import { lazyInject } from '../../../../../core/decorator/LazyInjectDecorator.js';
import StableCoinService from '../../../../service/StableCoinService.js';
import TransactionService from '../../../../service/TransactionService.js';
import {
	ChangeOwnerCommand,
	ChangeOwnerCommandResponse,
} from './ChangeOwnerCommand.js';

@CommandHandler(ChangeOwnerCommand)
export class ChangeOwnerCommandHandler
	implements ICommandHandler<ChangeOwnerCommand>
{
	constructor(
		@lazyInject(StableCoinService)
		public readonly stableCoinService: StableCoinService,
		@lazyInject(TransactionService)
		public readonly transactionService: TransactionService,
	) {}

	async execute(
		command: ChangeOwnerCommand,
	): Promise<ChangeOwnerCommandResponse> {
		const { tokenId, targetId } = command;
		const handler = this.transactionService.getHandler();

		const coin = await this.stableCoinService.get(tokenId);

		if (!coin.proxyAddress) throw new Error('No proxy Address found');

		if (!coin.proxyAdminAddress)
			throw new Error('No proxy Owner Address found');

		const res = await handler.changeOwner(coin.proxyAdminAddress, targetId);

		return Promise.resolve(
			new ChangeOwnerCommandResponse(res.error === undefined),
		);
	}
}
