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
import BigDecimal from '../../../../../../domain/context/shared/BigDecimal.js';
import AccountService from '../../../../../service/AccountService.js';
import StableCoinService from '../../../../../service/StableCoinService.js';
import TransactionService from '../../../../../service/TransactionService.js';
import { AccountsIdNotExists } from '../../error/AccountsIdNotExists.js';
import {
	GrantMultiRolesCommand,
	GrantMultiRolesCommandResponse,
} from './GrantMultiRolesCommand.js';

@CommandHandler(GrantMultiRolesCommand)
export class GrantMultiRolesCommandHandler
	implements ICommandHandler<GrantMultiRolesCommand>
{
	constructor(
		@lazyInject(StableCoinService)
		public readonly stableCoinService: StableCoinService,
		@lazyInject(AccountService)
		public readonly accountService: AccountService,
		@lazyInject(TransactionService)
		public readonly transactionService: TransactionService,
	) {}

	async execute(
		command: GrantMultiRolesCommand,
	): Promise<GrantMultiRolesCommandResponse> {
		const { roles, targetsId, amounts, tokenId, startDate } = command;
		const handler = this.transactionService.getHandler();
		const account = this.accountService.getCurrentAccount();
		const capabilities = await this.stableCoinService.getCapabilities(
			account,
			tokenId,
		);

		const noExistsAccounts: string[] = [];
		await Promise.all(
			targetsId.map(async (hederaId) => {
				try {
					await this.accountService.getAccountInfo(hederaId);
				} catch (error) {
					noExistsAccounts.push(hederaId.toString());
				}
			}),
		);

		if (noExistsAccounts.length) {
			throw new AccountsIdNotExists(noExistsAccounts);
		}

		const amountsFormatted: BigDecimal[] = [];
		amounts.forEach((amount) => {
			amountsFormatted.push(
				BigDecimal.fromString(amount, capabilities.coin.decimals),
			);
		});

		const res = await handler.grantRoles(
			capabilities,
			targetsId,
			roles,
			amountsFormatted,
			startDate
		);

		return Promise.resolve(
			new GrantMultiRolesCommandResponse(res.error === undefined),
		);
	}
}
