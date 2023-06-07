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

import { HederaId } from '../../../../../domain/context/shared/HederaId.js';
import { ICommandHandler } from '../../../../../core/command/CommandHandler.js';
import { CommandHandler } from '../../../../../core/decorator/CommandHandlerDecorator.js';
import { lazyInject } from '../../../../../core/decorator/LazyInjectDecorator.js';
import StableCoinService from '../../../../service/StableCoinService.js';
import TransactionService from '../../../../service/TransactionService.js';
import {
	ChangeFactoryOwnerCommand,
	ChangeFactoryOwnerCommandResponse,
} from './ChangeFactoryOwnerCommand.js';
import { MirrorNodeAdapter } from '../../../../../port/out/mirror/MirrorNodeAdapter.js';
import EvmAddress from '../../../../../domain/context/contract/EvmAddress.js';

@CommandHandler(ChangeFactoryOwnerCommand)
export class ChangeFactoryOwnerCommandHandler
	implements ICommandHandler<ChangeFactoryOwnerCommand>
{
	constructor(
		@lazyInject(StableCoinService)
		public readonly stableCoinService: StableCoinService,
		@lazyInject(TransactionService)
		public readonly transactionService: TransactionService,
		@lazyInject(MirrorNodeAdapter)
		public readonly mirrorNodeAdapter: MirrorNodeAdapter,
	) {}

	async execute(
		command: ChangeFactoryOwnerCommand,
	): Promise<ChangeFactoryOwnerCommandResponse> {
		const { factoryId, targetId } = command;
		const handler = this.transactionService.getHandler();

		if (!factoryId) throw new Error('No proxy Address found');

		const memo: string = await this.mirrorNodeAdapter.getContractMemo(
			factoryId,
		);
		const proxyAdminAddress: HederaId = new HederaId(
			new EvmAddress(memo).toContractId().toString(),
		);

		if (!proxyAdminAddress) throw new Error('No proxy Admin Address found');

		const res = await handler.changeOwner(proxyAdminAddress, targetId);

		return Promise.resolve(
			new ChangeFactoryOwnerCommandResponse(res.error === undefined),
		);
	}
}
