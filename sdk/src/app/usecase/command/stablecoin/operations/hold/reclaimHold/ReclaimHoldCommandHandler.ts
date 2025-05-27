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
	ReclaimHoldCommand,
	ReclaimHoldCommandResponse,
} from './ReclaimHoldCommand.js';
import { AccountNotKyc } from '../../../error/AccountNotKyc.js';
import { AccountFreeze } from '../../../error/AccountFreeze.js';
import { StableCoinNotAssociated } from '../../../error/StableCoinNotAssociated.js';
import ValidationService from '../../../../../../service/ValidationService.js';

@CommandHandler(ReclaimHoldCommand)
export class ReclaimHoldCommandHandler
	implements ICommandHandler<ReclaimHoldCommand>
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
		command: ReclaimHoldCommand,
	): Promise<ReclaimHoldCommandResponse> {
		const { tokenId, holdId, sourceId } = command;
		const handler = this.transactionService.getHandler();
		const account = this.accountService.getCurrentAccount();
		const capabilities = await this.stableCoinService.getCapabilities(
			account,
			tokenId,
		);

		const tokenRelationship = (
			await this.queryBus.execute(
				new GetAccountTokenRelationshipQuery(account.id, tokenId),
			)
		).payload;

		if (!tokenRelationship) {
			throw new StableCoinNotAssociated(
				sourceId.toString(),
				tokenId.toString(),
			);
		}

		if (tokenRelationship.kycStatus == KycStatus.REVOKED) {
			throw new AccountNotKyc(sourceId);
		}

		if (tokenRelationship.freezeStatus == FreezeStatus.FROZEN) {
			throw new AccountFreeze(sourceId);
		}

		await this.validationService.checkValidHoldId(
			tokenId,
			sourceId,
			holdId,
		);
		await this.validationService.checkHoldExpiration(
			tokenId,
			sourceId,
			holdId,
			true,
		);

		const res = await handler.reclaimHold(capabilities, sourceId, holdId);

		return Promise.resolve(
			new ReclaimHoldCommandResponse(res.error === undefined),
		);
	}
}
