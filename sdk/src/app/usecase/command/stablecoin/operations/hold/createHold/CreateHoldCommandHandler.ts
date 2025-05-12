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
import { MissingProxySupplyKey } from '../../../error/MissingProxySupplyKey.js';
import { OperationNotAllowed } from '../../../error/OperationNotAllowed.js';
import {
	CreateHoldCommand,
	CreateHoldCommandResponse,
} from './CreateHoldCommand.js';
import { AccountNotKyc } from '../../../error/AccountNotKyc.js';
import { AccountFreeze } from '../../../error/AccountFreeze.js';
import { BalanceOfQuery } from 'app/usecase/query/stablecoin/balanceof/BalanceOfQuery.js';
import CheckNums from 'core/checks/numbers/CheckNums.js';
import { DecimalsOverRange } from '../../../error/DecimalsOverRange.js';
import { MissingProxyWipeKey } from '../../../error/MissingProxyWipeKey.js';

@CommandHandler(CreateHoldCommand)
export class CreateHoldCommandHandler
	implements ICommandHandler<CreateHoldCommand>
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
	) {}

	async execute(
		command: CreateHoldCommand,
	): Promise<CreateHoldCommandResponse> {
		const { tokenId, amount, escrow, expirationDate, targetId } = command;
		const handler = this.transactionService.getHandler();
		const account = this.accountService.getCurrentAccount();
		const capabilities = await this.stableCoinService.getCapabilities(
			account,
			tokenId,
		);
		const coin = capabilities.coin;

		if (coin.supplyKey != coin.evmProxyAddress) {
			throw new MissingProxySupplyKey();
		}

		if (coin.wipeKey != coin.evmProxyAddress) {
			throw new MissingProxyWipeKey();
		}

		let tokenRelationship = (
			await this.queryBus.execute(
				new GetAccountTokenRelationshipQuery(account.id, tokenId),
			)
		).payload;

		if (tokenRelationship?.kycStatus == KycStatus.REVOKED) {
			throw new AccountNotKyc(account.id);
		}

		if (tokenRelationship?.freezeStatus == FreezeStatus.FROZEN) {
			throw new AccountFreeze(account.id);
		}

		if (CheckNums.hasMoreDecimals(amount, coin.decimals)) {
			throw new DecimalsOverRange(coin.decimals);
		}

		const tokenHolderBalance = (
			await this.queryBus.execute(new BalanceOfQuery(tokenId, account.id))
		).payload;

		const amountBd = BigDecimal.fromString(amount, coin.decimals);

		if (amountBd.isGreaterThan(tokenHolderBalance)) {
			throw new OperationNotAllowed(
				'The token holder balance is less than held amount',
			);
		}

		const res = await handler.createHold(
			capabilities,
			amountBd,
			escrow,
			expirationDate,
			targetId,
		);

		return Promise.resolve(
			new CreateHoldCommandResponse(res.error === undefined),
		);
	}
}
