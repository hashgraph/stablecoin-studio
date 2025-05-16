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
import { AccountNotKyc } from '../../../error/AccountNotKyc.js';
import { AccountFreeze } from '../../../error/AccountFreeze.js';
import { BalanceOfQuery } from 'app/usecase/query/stablecoin/balanceof/BalanceOfQuery.js';
import CheckNums from 'core/checks/numbers/CheckNums.js';
import { DecimalsOverRange } from '../../../error/DecimalsOverRange.js';
import {
	CreateHoldByControllerCommand,
	CreateHoldByControllerCommandResponse,
} from './CreateHoldByControllerCommand.js';

@CommandHandler(CreateHoldByControllerCommand)
export class CreateHoldByControllerCommandHandler
	implements ICommandHandler<CreateHoldByControllerCommand>
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
		command: CreateHoldByControllerCommand,
	): Promise<CreateHoldByControllerCommandResponse> {
		const { tokenId, sourceId, amount, escrow, expirationDate, targetId } =
			command;
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

		const tokenRelationship = (
			await this.queryBus.execute(
				new GetAccountTokenRelationshipQuery(sourceId, tokenId),
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

		const tokenHolderBalance = (
			await this.queryBus.execute(new BalanceOfQuery(tokenId, sourceId))
		).payload;

		const amountBd = BigDecimal.fromString(amount, coin.decimals);

		if (amountBd.isGreaterThan(tokenHolderBalance)) {
			throw new OperationNotAllowed(
				'The token holder balance is less than held amount',
			);
		}

		const res = await handler.createHoldByController(
			capabilities,
			amountBd,
			escrow,
			expirationDate,
			sourceId,
			targetId,
		);

		const holdId = await this.transactionService.getTransactionResult({
			res,
			result: res.response?.holdId,
			className: CreateHoldByControllerCommandHandler.name,
			position: 1,
			numberOfResultsItems: 2,
		});

		return Promise.resolve(
			new CreateHoldByControllerCommandResponse(
				parseInt(holdId, 16),
				res.error == undefined,
			),
		);
	}
}
