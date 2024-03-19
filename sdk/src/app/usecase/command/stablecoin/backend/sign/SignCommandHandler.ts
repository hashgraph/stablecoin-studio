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

import CheckNums from '../../../../../../core/checks/numbers/CheckNums.js';
import { CommandBus } from '../../../../../../core/command/CommandBus.js';
import { ICommandHandler } from '../../../../../../core/command/CommandHandler.js';
import { CommandHandler } from '../../../../../../core/decorator/CommandHandlerDecorator.js';
import { lazyInject } from '../../../../../../core/decorator/LazyInjectDecorator.js';
import { QueryBus } from '../../../../../../core/query/QueryBus.js';
import BigDecimal from '../../../../../../domain/context/shared/BigDecimal.js';
import { BackendAdapter } from '../../../../../../port/out/backend/BackendAdapter.js';
import AccountService from '../../../../../service/AccountService.js';
import StableCoinService from '../../../../../service/StableCoinService.js';
import TransactionService from '../../../../../service/TransactionService.js';
import { BalanceOfQuery } from '../../../../query/stablecoin/balanceof/BalanceOfQuery.js';
import { DecimalsOverRange } from '../../error/DecimalsOverRange.js';
import { OperationNotAllowed } from '../../error/OperationNotAllowed.js';
import { SignCommand, SignCommandResponse } from './SignCommand.js';

@CommandHandler(SignCommand)
export class SignCommandHandler implements ICommandHandler<SignCommand> {
	constructor(
		@lazyInject(BackendAdapter)
		public readonly backendAdapter: BackendAdapter,
		@lazyInject(TransactionService)
		public readonly transactionService: TransactionService,
	) {}

	async execute(command: SignCommand): Promise<SignCommandResponse> {
		throw new Error('not implemented');

		/*const { transactionId } = command;
		const handler = this.transactionService.getHandler();




		
		const account = this.accountService.getCurrentAccount();
		const capabilities = await this.stableCoinService.getCapabilities(
			account,
			tokenId,
		);
		const coin = capabilities.coin;
		const amountBd = BigDecimal.fromString(amount, coin.decimals);

		if (CheckNums.hasMoreDecimals(amount, coin.decimals)) {
			throw new DecimalsOverRange(coin.decimals);
		}

		if (!coin.treasury || !coin.tokenId)
			throw new OperationNotAllowed(`The stablecoin is not valid`);

		const treasuryBalance = (
			await this.queryBus.execute(
				new BalanceOfQuery(coin.tokenId, coin.treasury),
			)
		).payload;

		if (amountBd.isGreaterThan(treasuryBalance)) {
			throw new OperationNotAllowed(
				'The amount is bigger than the treasury account balance',
			);
		}

		const res = await handler.burn(capabilities, amountBd);
		return Promise.resolve(
			new SignCommandResponse(res.error === undefined),
		);*/
	}
}
