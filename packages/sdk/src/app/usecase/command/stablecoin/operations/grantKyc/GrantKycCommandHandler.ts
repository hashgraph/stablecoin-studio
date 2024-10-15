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

import { CommandBus } from '../../../../../../core/command/CommandBus.js';
import { ICommandHandler } from '../../../../../../core/command/CommandHandler.js';
import { CommandHandler } from '../../../../../../core/decorator/CommandHandlerDecorator.js';
import { lazyInject } from '../../../../../../core/decorator/LazyInjectDecorator.js';
import { QueryBus } from '../../../../../../core/query/QueryBus.js';
import { KycStatus } from '../../../../../../port/out/mirror/response/AccountTokenRelationViewModel.js';
import AccountService from '../../../../../service/AccountService.js';
import StableCoinService from '../../../../../service/StableCoinService.js';
import TransactionService from '../../../../../service/TransactionService.js';
import { GetAccountTokenRelationshipQuery } from '../../../../query/account/tokenRelationship/GetAccountTokenRelationshipQuery.js';
import { KycNotActive } from '../../error/KycNotActive.js';
import { OperationNotAllowed } from '../../error/OperationNotAllowed.js';
import { StableCoinNotAssociated } from '../../error/StableCoinNotAssociated.js';
import { GrantKycCommand, GrantKycCommandResponse } from './GrantKycCommand.js';

@CommandHandler(GrantKycCommand)
export class GrantKycCommandHandler
	implements ICommandHandler<GrantKycCommand>
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

	async execute(command: GrantKycCommand): Promise<GrantKycCommandResponse> {
		const { targetId, tokenId } = command;
		const handler = this.transactionService.getHandler();
		const account = this.accountService.getCurrentAccount();
		const capabilities = await this.stableCoinService.getCapabilities(
			account,
			tokenId,
		);
		const coin = capabilities.coin;

		if (!coin.kycKey) {
			throw new KycNotActive(tokenId.value);
		}

		let tokenRelationship = (
			await this.queryBus.execute(
				new GetAccountTokenRelationshipQuery(targetId, tokenId),
			)
		).payload;

		let retry = 0;

		while (!tokenRelationship && retry < 3) {
			await new Promise((f) => setTimeout(f, 1000));

			tokenRelationship = (
				await this.queryBus.execute(
					new GetAccountTokenRelationshipQuery(targetId, tokenId),
				)
			).payload;

			retry++;
		}

		if (!tokenRelationship) {
			throw new StableCoinNotAssociated(
				targetId.toString(),
				tokenId.toString(),
			);
		}

		if (
			tokenRelationship?.kycStatus !== undefined &&
			tokenRelationship?.kycStatus !== KycStatus.REVOKED
		) {
			throw new OperationNotAllowed(
				`KYC cannot be granted for account ${targetId} on token ${tokenId}`,
			);
		}

		const res = await handler.grantKyc(capabilities, targetId);
		return Promise.resolve(
			new GrantKycCommandResponse(res.error === undefined),
		);
	}
}
