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
import BigDecimal from '../../../../../../domain/context/shared/BigDecimal.js';
import { StableCoinNotAssociated } from '../../error/StableCoinNotAssociated.js';
import AccountService from '../../../../../service/AccountService.js';
import StableCoinService from '../../../../../service/StableCoinService.js';
import TransactionService from '../../../../../service/TransactionService.js';

import { DecimalsOverRange } from '../../error/DecimalsOverRange.js';
import { OperationNotAllowed } from '../../error/OperationNotAllowed.js';
import { RescueCommand, RescueCommandResponse } from './RescueCommand.js';
import { QueryBus } from '../../../../../../core/query/QueryBus.js';
import { BalanceOfQuery } from '../../../../query/stablecoin/balanceof/BalanceOfQuery.js';
import { GetAccountTokenRelationshipQuery } from '../../../../query/account/tokenRelationship/GetAccountTokenRelationshipQuery.js';
import {
	FreezeStatus,
	KycStatus,
} from '../../../../../../port/out/mirror/response/AccountTokenRelationViewModel.js';
import { AccountNotKyc } from '../../error/AccountNotKyc.js';
import { AccountFreeze } from '../../error/AccountFreeze.js';

@CommandHandler(RescueCommand)
export class RescueCommandHandler implements ICommandHandler<RescueCommand> {
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

	async execute(command: RescueCommand): Promise<RescueCommandResponse> {
		const { amount, tokenId } = command;
		const handler = this.transactionService.getHandler();
		const account = this.accountService.getCurrentAccount();
		const tokenRelationship = (
			await this.stableCoinService.queryBus.execute(
				new GetAccountTokenRelationshipQuery(account.id, tokenId),
			)
		).payload;

		if (!tokenRelationship) {
			throw new StableCoinNotAssociated(
				account.id.toString(),
				tokenId.toString(),
			);
		}

		if (tokenRelationship.freezeStatus === FreezeStatus.FROZEN) {
			throw new AccountFreeze(account.id.toString());
		}

		if (tokenRelationship.kycStatus === KycStatus.REVOKED) {
			throw new AccountNotKyc(account.id.toString());
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
		if (!coin.treasury || !coin.tokenId)
			throw new OperationNotAllowed(`The stablecoin is not valid`);

		const treasuryBalance = (
			await this.queryBus.execute(
				new BalanceOfQuery(coin.tokenId, coin.treasury),
			)
		).payload;

		if (amountBd.isGreaterThan(treasuryBalance)) {
			throw new OperationNotAllowed(
				'The rescue amount is bigger than the treasury account balance',
			);
		}
		const res = await handler.rescue(capabilities, amountBd);
		return Promise.resolve(
			new RescueCommandResponse(res.error === undefined),
		);
	}
}
