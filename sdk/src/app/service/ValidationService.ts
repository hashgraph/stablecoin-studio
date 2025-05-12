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

import { QueryBus } from 'core/query/QueryBus';
import Service from './Service';
import { BigDecimal, HederaId } from 'port/in';
import Injectable from 'core/Injectable';
import { InsufficientHoldBalance } from 'app/usecase/command/stablecoin/operations/hold/error/InsufficientHoldBalance';
import AccountService from './AccountService';
import { NotEscrow } from 'app/usecase/command/stablecoin/operations/hold/error/NotEscrow';
import { GetHoldForQuery } from 'app/usecase/query/stablecoin/hold/getHoldFor/GetHoldForQuery';

export default class ValidationService extends Service {
	constructor(
		public readonly queryBus: QueryBus = Injectable.resolve<QueryBus>(
			QueryBus,
		),
		public readonly accountService: AccountService = Injectable.resolve<AccountService>(
			AccountService,
		),
	) {
		super();
	}

	async checkHoldBalance(
		tokenId: HederaId,
		sourceId: HederaId,
		holdId: number,
		amount: BigDecimal,
	): Promise<void> {
		const holdDetails = await this.queryBus.execute(
			new GetHoldForQuery(tokenId, sourceId, holdId),
		);
		if (holdDetails.payload.amount.toBigNumber().lt(amount.toBigNumber())) {
			throw new InsufficientHoldBalance();
		}
	}

	async checkEscrow(
		tokenId: HederaId,
		sourceId: HederaId,
		holdId: number,
	): Promise<void> {
		const holdDetails = await this.queryBus.execute(
			new GetHoldForQuery(tokenId, sourceId, holdId),
		);
		if (
			holdDetails.payload.escrowAddress.toLowerCase() !=
			this.accountService.getCurrentAccount().evmAddress?.toLowerCase()
		) {
			throw new NotEscrow();
		}
	}
}
