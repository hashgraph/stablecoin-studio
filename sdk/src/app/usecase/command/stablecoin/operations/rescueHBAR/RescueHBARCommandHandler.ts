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

import CheckNums from '../../../../../../core/checks/numbers/CheckNums.js';
import { CommandBus } from '../../../../../../core/command/CommandBus.js';
import { ICommandHandler } from '../../../../../../core/command/CommandHandler.js';
import { CommandHandler } from '../../../../../../core/decorator/CommandHandlerDecorator.js';
import { lazyInject } from '../../../../../../core/decorator/LazyInjectDecorator.js';
import BigDecimal from '../../../../../../domain/context/shared/BigDecimal.js';
import AccountService from '../../../../../service/AccountService.js';
import StableCoinService from '../../../../../service/StableCoinService.js';
import TransactionService from '../../../../../service/TransactionService.js';

import { DecimalsOverRange } from '../../error/DecimalsOverRange.js';
import { OperationNotAllowed } from '../../error/OperationNotAllowed.js';
import {
	RescueHBARCommand,
	RescueHBARCommandResponse,
} from './RescueHBARCommand.js';
import { QueryBus } from '../../../../../../core/query/QueryBus.js';
import { BalanceOfHBARQuery } from '../../../../query/stablecoin/balanceOfHBAR/BalanceOfHBARQuery.js';
import { HBAR_DECIMALS } from '../../../../../../core/Constants.js';

@CommandHandler(RescueHBARCommand)
export class RescueHBARCommandHandler
	implements ICommandHandler<RescueHBARCommand>
{
	constructor(
		@lazyInject(StableCoinService)
		public readonly stableCoinService: StableCoinService,
		@lazyInject(CommandBus)
		public readonly commandBus: CommandBus,
		@lazyInject(QueryBus)
		public readonly queryBus: QueryBus,
		@lazyInject(AccountService)
		public readonly accountService: AccountService,
		@lazyInject(TransactionService)
		public readonly transactionService: TransactionService,
	) {}

	async execute(
		command: RescueHBARCommand,
	): Promise<RescueHBARCommandResponse> {
		const { amount, tokenId } = command;
		const decimals = HBAR_DECIMALS;
		const handler = this.transactionService.getHandler();
		const account = this.accountService.getCurrentAccount();

		const capabilities = await this.stableCoinService.getCapabilities(
			account,
			tokenId,
		);
		const coin = capabilities.coin;
		const amountBd = BigDecimal.fromString(amount, decimals);

		if (CheckNums.hasMoreDecimals(amount, decimals)) {
			throw new DecimalsOverRange(decimals);
		}

		if (!coin.treasury)
			throw new OperationNotAllowed(
				`The HBAR treasury account is not valid`,
			);

		const treasuryBalance = (
			await this.queryBus.execute(new BalanceOfHBARQuery(coin.treasury))
		).payload;

		if (amountBd.isGreaterThan(treasuryBalance)) {
			throw new OperationNotAllowed(
				'The rescue HBAR amount is bigger than the treasury account balance',
			);
		}

		const res = await handler.rescueHBAR(capabilities, amountBd);
		return Promise.resolve(
			new RescueHBARCommandResponse(res.error === undefined),
		);
	}
}
