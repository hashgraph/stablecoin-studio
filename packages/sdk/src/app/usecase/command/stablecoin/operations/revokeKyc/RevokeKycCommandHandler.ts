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

import { ICommandHandler } from '../../../../../../core/command/CommandHandler.js';
import { CommandHandler } from '../../../../../../core/decorator/CommandHandlerDecorator.js';
import { lazyInject } from '../../../../../../core/decorator/LazyInjectDecorator.js';
import { KycStatus } from '../../../../../../domain/context/stablecoin/TokenRelation.js';
import AccountService from '../../../../../service/AccountService.js';
import StableCoinService from '../../../../../service/StableCoinService.js';
import TransactionService from '../../../../../service/TransactionService.js';
import { GetAccountTokenRelationshipQuery } from '../../../../query/account/tokenRelationship/GetAccountTokenRelationshipQuery.js';
import { KycNotActive } from '../../error/KycNotActive.js';
import { OperationNotAllowed } from '../../error/OperationNotAllowed.js';
import { StableCoinNotAssociated } from '../../error/StableCoinNotAssociated.js';
import { AbstractMirrorNodeAdapter } from '../../../../../../port/out/mirror/AbstractMirrorNodeAdapter.js';
import {
	RevokeKycCommand,
	RevokeKycCommandResponse,
} from './RevokeKycCommand.js';

@CommandHandler(RevokeKycCommand)
export class RevokeKycCommandHandler
	implements ICommandHandler<RevokeKycCommand>
{
	constructor(
		@lazyInject(StableCoinService)
		public readonly stableCoinService: StableCoinService,
		@lazyInject(AccountService)
		public readonly accountService: AccountService,
		@lazyInject(TransactionService)
		public readonly transactionService: TransactionService,
		@lazyInject(AbstractMirrorNodeAdapter)
		public readonly mirrorNode: AbstractMirrorNodeAdapter,
	) {}

	async execute(
		command: RevokeKycCommand,
	): Promise<RevokeKycCommandResponse> {
		const { targetId, tokenId } = command;
		const account = this.accountService.getCurrentAccount();
		const capabilities = await this.stableCoinService.getCapabilities(
			account,
			tokenId,
		);
		const coin = capabilities.coin;

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

		if (!coin.kycKey) {
			throw new KycNotActive(tokenId.value);
		}

		if (tokenRelationship.kycStatus !== KycStatus.GRANTED) {
			throw new OperationNotAllowed(
				`KYC cannot be revoked from account ${targetId} on token ${tokenId}`,
			);
		}

		const targetEvmAddress = (
			await this.mirrorNode.accountToEvmAddress(targetId)
		).toString();
		const res = await this.transactionService.executeOperation(
			'revokeKyc',
			{
				contractAddress: capabilities.coin.evmProxyAddress?.toString(),
				targetId: targetEvmAddress,
			},
		);
		return Promise.resolve(
			new RevokeKycCommandResponse(res.error === undefined, res.id, res.serializedTransactionData),
		);
	}
}
