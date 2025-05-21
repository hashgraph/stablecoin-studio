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

import BigDecimal from '../../../../../../../domain/context/shared/BigDecimal.js';
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
	ExecuteHoldCommand,
	ExecuteHoldCommandResponse,
} from './ExecuteHoldCommand.js';
import { AccountNotKyc } from '../../../error/AccountNotKyc.js';
import { AccountFreeze } from '../../../error/AccountFreeze.js';
import CheckNums from '../../../../../../../core/checks/numbers/CheckNums.js';
import { DecimalsOverRange } from '../../../error/DecimalsOverRange.js';
import ValidationService from '../../../../../../service/ValidationService.js';
import { StableCoinNotAssociated } from '../../../error/StableCoinNotAssociated.js';

@CommandHandler(ExecuteHoldCommand)
export class ExecuteHoldCommandHandler
	implements ICommandHandler<ExecuteHoldCommand>
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
		command: ExecuteHoldCommand,
	): Promise<ExecuteHoldCommandResponse> {
		const { tokenId, holdId, sourceId, amount, targetId } = command;
		const handler = this.transactionService.getHandler();
		const account = this.accountService.getCurrentAccount();
		const capabilities = await this.stableCoinService.getCapabilities(
			account,
			tokenId,
		);
		const coin = capabilities.coin;

		const tokenRelationshipSource = (
			await this.queryBus.execute(
				new GetAccountTokenRelationshipQuery(sourceId, tokenId),
			)
		).payload;

		if (!tokenRelationshipSource) {
			throw new StableCoinNotAssociated(
				sourceId.toString(),
				tokenId.toString(),
			);
		}

		if (targetId) {
			const tokenRelationshipTarget = (
				await this.queryBus.execute(
					new GetAccountTokenRelationshipQuery(targetId, tokenId),
				)
			).payload;

			if (!tokenRelationshipTarget) {
				throw new StableCoinNotAssociated(
					targetId.toString(),
					tokenId.toString(),
				);
			}

			if (tokenRelationshipTarget.kycStatus == KycStatus.REVOKED) {
				throw new AccountNotKyc(targetId);
			}

			if (tokenRelationshipTarget.freezeStatus == FreezeStatus.FROZEN) {
				throw new AccountFreeze(targetId);
			}
		}

		if (tokenRelationshipSource.kycStatus == KycStatus.REVOKED) {
			throw new AccountNotKyc(sourceId);
		}

		if (tokenRelationshipSource.freezeStatus == FreezeStatus.FROZEN) {
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
		await this.validationService.checkHoldTarget(
			tokenId,
			sourceId,
			holdId,
			targetId,
		);
		await this.validationService.checkHoldExpiration(
			tokenId,
			sourceId,
			holdId,
		);

		const res = await handler.executeHold(
			capabilities,
			amountBd,
			sourceId,
			holdId,
			targetId,
		);

		return Promise.resolve(
			new ExecuteHoldCommandResponse(res.error === undefined),
		);
	}
}
