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

import { QueryBus } from '../../core/query/QueryBus';
import Service from './Service';
import { BigDecimal, HederaId } from '../../port/in';
import Injectable from '../../core/Injectable';
import { InsufficientHoldBalance } from '../../app/usecase/command/stablecoin/operations/hold/error/InsufficientHoldBalance';
import AccountService from './AccountService';
import { NotEscrow } from '../../app/usecase/command/stablecoin/operations/hold/error/NotEscrow';
import { GetHoldForQuery } from '../../app/usecase/query/stablecoin/hold/getHoldFor/GetHoldForQuery';
import { EVM_ZERO_ADDRESS } from '../../core/Constants';
import { InvalidHoldDestination } from '../../app/usecase/command/stablecoin/operations/hold/error/InvalidHoldDestination';
import { MirrorNodeAdapter } from '../../port/out/mirror/MirrorNodeAdapter';
import { InvalidHoldId } from '../../app/usecase/command/stablecoin/operations/hold/error/InvalidHoldId';
import { GetHoldsIdForQuery } from '../../app/usecase/query/stablecoin/hold/getHoldsIdFor/GetHoldsIdForQuery';
import { ExpiredHold } from '../../app/usecase/command/stablecoin/operations/hold/error/ExpiredHold';
import { HoldNotExpired } from '../../app/usecase/command/stablecoin/operations/hold/error/HoldNotExpired';
import { GetBurnableAmountQuery } from '../../app/usecase/query/stablecoin/burn/getBurnableAmount/GetBurnableAmountQuery';
import { BurnableAmountExceeded } from '../../app/usecase/command/stablecoin/operations/burn/error/BurnableAmountExceeded';

export default class ValidationService extends Service {
	constructor(
		public readonly queryBus: QueryBus = Injectable.resolve<QueryBus>(
			QueryBus,
		),
		public readonly accountService: AccountService = Injectable.resolve<AccountService>(
			AccountService,
		),
		public readonly mirrorNodeAdapter: MirrorNodeAdapter = Injectable.resolve<MirrorNodeAdapter>(
			MirrorNodeAdapter,
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

	async checkValidHoldId(
		tokenId: HederaId,
		sourceId: HederaId,
		holdId: number,
	): Promise<void> {
		const holdIds = await this.queryBus.execute(
			new GetHoldsIdForQuery(tokenId, sourceId, 0, 100),
		);
		if (!holdIds.payload.includes(holdId)) {
			throw new InvalidHoldId();
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
		const callerAccount = this.accountService.getCurrentAccount();
		const caller =
			callerAccount.evmAddress !== undefined
				? callerAccount.evmAddress.toLowerCase()
				: (
						await this.accountService.getAccountInfo(
							callerAccount.id,
						)
				  ).evmAddress
						?.toString()
						.toLowerCase();
		const escrow = holdDetails.payload.escrowAddress.toLowerCase();
		if (caller != escrow) {
			throw new NotEscrow(caller ?? EVM_ZERO_ADDRESS, escrow);
		}
	}

	async checkHoldTarget(
		tokenId: HederaId,
		sourceId: HederaId,
		holdId: number,
		targetId?: HederaId,
	): Promise<void> {
		const holdDetails = await this.queryBus.execute(
			new GetHoldForQuery(tokenId, sourceId, holdId),
		);
		const destinationAddress =
			holdDetails.payload.destinationAddress.toLowerCase();

		if (destinationAddress === EVM_ZERO_ADDRESS && !targetId) {
			throw new InvalidHoldDestination();
		}

		if (targetId && destinationAddress != EVM_ZERO_ADDRESS) {
			const targetEvmAddress =
				await this.mirrorNodeAdapter.accountToEvmAddress(targetId);

			if (
				destinationAddress != targetEvmAddress.toString().toLowerCase()
			) {
				throw new InvalidHoldDestination();
			}
		}
	}

	async checkHoldExpiration(
		tokenId: HederaId,
		sourceId: HederaId,
		holdId: number,
		isReclaim = false,
	): Promise<void> {
		const holdDetails = await this.queryBus.execute(
			new GetHoldForQuery(tokenId, sourceId, holdId),
		);

		const currentTimestamp = Math.floor(Date.now() / 1000);
		const { expirationTimeStamp } = holdDetails.payload;

		// Check expiration based on reclaim flag
		if (!isReclaim && expirationTimeStamp < currentTimestamp) {
			throw new ExpiredHold();
		}

		if (isReclaim && expirationTimeStamp > currentTimestamp) {
			throw new HoldNotExpired();
		}
	}

	async checkBurnableAmount(
		tokenId: HederaId,
		amount: string,
	): Promise<void> {
		const burnableAmount = (
			await this.queryBus.execute(new GetBurnableAmountQuery(tokenId))
		).payload;
		if (burnableAmount.isLowerThan(BigDecimal.fromString(amount))) {
			throw new BurnableAmountExceeded();
		}
	}
}
