/*
 *
 * Hedera Stable Coin SDK
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

/* eslint-disable @typescript-eslint/no-unused-vars */
import Injectable from '../../core/Injectable.js';
import BigDecimal from '../../domain/context/shared/BigDecimal.js';
import ContractId from '../../domain/context/contract/ContractId.js';
import { CommandBus } from '../../core/command/CommandBus.js';
import { handleValidation } from './Common.js';
import { UpdateReserveAmountCommand } from '../../app/usecase/command/reserve/operations/updateReserveAmount/UpdateReserveAmountCommand.js';
import { Balance } from '../../domain/context/stablecoin/Balance.js';
import { HederaId } from '../../domain/context/shared/HederaId.js';
import UpdateReserveAmountRequest from './request/UpdateReserveAmountRequest.js';
import GetReserveAmountRequest from './request/GetReserveAmountRequest.js';
import { GetReserveAmountCommand } from '../../app/usecase/command/reserve/operations/getReserveAmount/GetReserveAmountCommand.js';
import { RESERVE_DECIMALS } from '../../domain/context/reserve/Reserve.js';

interface IReserveDataFeedInPort {
	getReserveAmount(request: GetReserveAmountRequest): Promise<Balance>;
	updateReserveAmount(request: UpdateReserveAmountRequest): Promise<boolean>
}

class ReserveDataFeedInPort implements IReserveDataFeedInPort {
	constructor(
		private readonly commandBus: CommandBus = Injectable.resolve(
			CommandBus,
		)
	) {}

	async getReserveAmount(
		request: GetReserveAmountRequest,
	): Promise<Balance> {
		handleValidation('GetReserveAmountRequest', request);

		const res = await this.commandBus.execute(
			new GetReserveAmountCommand(
				HederaId.from(request.tokenId)
			)
		);

		return new Balance(res.payload);
	}

	async updateReserveAmount(
		request: UpdateReserveAmountRequest,
	): Promise<boolean> {
		handleValidation('UpdateReserveAmountRequest', request);

		return (
			await this.commandBus.execute(
				new UpdateReserveAmountCommand(
					new ContractId(request.reserveAddress),
					BigDecimal.fromString(request.reserveAmount, RESERVE_DECIMALS)
				),
			)
		).payload;
	}
}

const ReserveDataFeed = new ReserveDataFeedInPort();
export default ReserveDataFeed;
