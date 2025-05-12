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

import { BigDecimal } from '../../../../../../../port/in/StableCoin.js';
import { ICommandHandler } from '../../../../../../../core/command/CommandHandler.js';
import { CommandHandler } from '../../../../../../../core/decorator/CommandHandlerDecorator.js';
import { lazyInject } from '../../../../../../../core/decorator/LazyInjectDecorator.js';
import { QueryBus } from '../../../../../../../core/query/QueryBus.js';
import {
	FreezeStatus,
	KycStatus,
} from '../../../../../../../port/out/mirror/response/AccountTokenRelationViewModel.js';
import AccountService from '../../../../../../service/AccountService.js';
import StableCoinService from '../../../../../../service/StableCoinService.js';
import TransactionService from '../../../../../../service/TransactionService.js';
import { GetAccountTokenRelationshipQuery } from '../../../../../query/account/tokenRelationship/GetAccountTokenRelationshipQuery.js';
import {
	ReleaseHoldCommand,
	ReleaseHoldCommandResponse,
} from './ReleaseHoldCommand.js';
import { AccountNotKyc } from '../../../error/AccountNotKyc.js';
import { AccountFreeze } from '../../../error/AccountFreeze.js';
import CheckNums from 'core/checks/numbers/CheckNums.js';
import { DecimalsOverRange } from '../../../error/DecimalsOverRange.js';
import ValidationService from 'app/service/ValidationService.js';

@CommandHandler(ReleaseHoldCommand)
export class ReleaseHoldCommandHandler
	implements ICommandHandler<ReleaseHoldCommand>
{
	constructor(
		@lazyInject(StableCoinService)
		private readonly stableCoinService: StableCoinService,
		@lazyInject(QueryBus)
		private readonly queryBus: QueryBus,
		@lazyInject(AccountService)
		private readonly accountService: AccountService,
		@lazyInject(TransactionService)
		private readonly transactionService: TransactionService,
		@lazyInject(ValidationService)
		private readonly validationService: ValidationService,
	) {}

	async execute(
		command: ReleaseHoldCommand,
	): Promise<ReleaseHoldCommandResponse> {
		const { tokenId, holdId, sourceId, amount } = command;
		const handler = this.transactionService.getHandler();
		const account = this.accountService.getCurrentAccount();
		const capabilities = await this.stableCoinService.getCapabilities(
			account,
			tokenId,
		);
		const coin = capabilities.coin;

		let tokenRelationship = (
			await this.queryBus.execute(
				new GetAccountTokenRelationshipQuery(account.id, tokenId),
			)
		).payload;

		if (tokenRelationship?.kycStatus == KycStatus.REVOKED) {
			throw new AccountNotKyc(sourceId);
		}

		if (tokenRelationship?.freezeStatus == FreezeStatus.FROZEN) {
			throw new AccountFreeze(sourceId);
		}

		if (CheckNums.hasMoreDecimals(amount, coin.decimals)) {
			throw new DecimalsOverRange(coin.decimals);
		}

		const amountBd = BigDecimal.fromString(amount, coin.decimals);

		await this.validationService.checkHoldBalance(
			tokenId,
			sourceId,
			holdId,
			amountBd,
		);

		await this.validationService.checkEscrow(tokenId, sourceId, holdId);

		const res = await handler.releaseHold(capabilities, amountBd, sourceId);

		return Promise.resolve(
			new ReleaseHoldCommandResponse(res.error === undefined),
		);
	}
}
