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

import CheckNums from '../../../../../../domain/shared/checks/numbers/CheckNums.js';
import { ICommandHandler } from '../../../../../../core/command/CommandHandler.js';
import { CommandHandler } from '../../../../../../core/decorator/CommandHandlerDecorator.js';
import { lazyInject } from '../../../../../../core/decorator/LazyInjectDecorator.js';
import BigDecimal from '../../../../../../domain/context/shared/BigDecimal.js';
import AccountService from '../../../../../service/AccountService.js';
import StableCoinService from '../../../../../service/StableCoinService.js';
import TransactionService from '../../../../../service/TransactionService.js';
import { DecimalsOverRange } from '../../error/DecimalsOverRange.js';
import { AbstractMirrorNodeAdapter } from '../../../../../../port/out/mirror/AbstractMirrorNodeAdapter.js';
import {
	IncreaseAllowanceCommand,
	IncreaseAllowanceCommandResponse,
} from './IncreaseAllowanceCommand.js';

@CommandHandler(IncreaseAllowanceCommand)
export class IncreaseAllowanceCommandHandler
	implements ICommandHandler<IncreaseAllowanceCommand>
{
	constructor(
		@lazyInject(StableCoinService)
		public readonly stableCoinService: StableCoinService,
		@lazyInject(AccountService)
		public readonly accountService: AccountService,
		@lazyInject(TransactionService)
		public readonly transactionService: TransactionService,
		@lazyInject(AbstractMirrorNodeAdapter)
		public readonly mirrorNode: AbstractMirrorNodeAdapter,
	) {}

	async execute(
		command: IncreaseAllowanceCommand,
	): Promise<IncreaseAllowanceCommandResponse> {
		const { amount, targetId, tokenId } = command;
		const account = this.accountService.getCurrentAccount();
		const capabilities = await this.stableCoinService.getCapabilities(
			account,
			tokenId,
		);
		const coin = capabilities.coin;
		if (CheckNums.hasMoreDecimals(amount, coin.decimals)) {
			throw new DecimalsOverRange(coin.decimals);
		}
		const targetEvmAddress = (
			await this.mirrorNode.accountToEvmAddress(targetId)
		).toString();
		const res = await this.transactionService.executeOperation('increaseAllowance', {
			contractAddress: capabilities.coin.evmProxyAddress?.toString(),
			targetId: targetEvmAddress,
			amount: BigDecimal.fromString(amount, coin.decimals).toLong().toString(),
		});
		return Promise.resolve(
			new IncreaseAllowanceCommandResponse(res.error === undefined, res.id, res.serializedTransactionData),
		);
	}
}
