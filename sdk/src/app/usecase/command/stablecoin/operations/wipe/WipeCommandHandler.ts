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
import { ICommandHandler } from '../../../../../../core/command/CommandHandler.js';
import { CommandHandler } from '../../../../../../core/decorator/CommandHandlerDecorator.js';
import { lazyInject } from '../../../../../../core/decorator/LazyInjectDecorator.js';
import BigDecimal from '../../../../../../domain/context/shared/BigDecimal.js';
import AccountService from '../../../../../service/AccountService.js';
import StableCoinService from '../../../../../service/StableCoinService.js';
import TransactionService from '../../../../../service/TransactionService.js';
import { GetAccountTokenRelationshipQuery } from '../../../../query/account/tokenRelationship/GetAccountTokenRelationshipQuery.js';
import { DecimalsOverRange } from '../../error/DecimalsOverRange.js';
import { OperationNotAllowed } from '../../error/OperationNotAllowed.js';
import { StableCoinNotAssociated } from '../../error/StableCoinNotAssociated.js';
import { WipeCommand, WipeCommandResponse } from './WipeCommand.js';

@CommandHandler(WipeCommand)
export class WipeCommandHandler implements ICommandHandler<WipeCommand> {
	constructor(
		@lazyInject(StableCoinService)
		public readonly stableCoinService: StableCoinService,
		@lazyInject(AccountService)
		public readonly accountService: AccountService,
		@lazyInject(TransactionService)
		public readonly transactionService: TransactionService,
	) {}

	async execute(command: WipeCommand): Promise<WipeCommandResponse> {
		const { amount, targetId, tokenId, startDate } = command;
		const handler = this.transactionService.getHandler();
		const account = this.accountService.getCurrentAccount();

		const tokenRelationship = (
			await this.stableCoinService.queryBus.execute(
				new GetAccountTokenRelationshipQuery(targetId, tokenId),
			)
		).payload;

		if (!tokenRelationship) {
			throw new StableCoinNotAssociated(
				targetId.toString(),
				tokenId.toString(),
			);
		}

		const capabilities = await this.stableCoinService.getCapabilities(
			account,
			tokenId,
		);
		const coin = capabilities.coin;

		const amountBd = BigDecimal.fromString(amount, coin.decimals);

		if (CheckNums.hasMoreDecimals(amount, coin.decimals)) {
			throw new DecimalsOverRange(coin.decimals);
		}

		if (amountBd.isGreaterThan(tokenRelationship.balance)) {
			throw new OperationNotAllowed(
				'The wipe amount is bigger than the account balance',
			);
		}

		const res = await handler.wipe(
			capabilities,
			targetId,
			BigDecimal.fromString(amount, capabilities.coin.decimals),
			startDate,
		);
		return Promise.resolve(
			new WipeCommandResponse(res.error === undefined),
		);
	}
}
