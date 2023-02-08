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

import { CommandBus } from '../../core/command/CommandBus.js';
import Injectable from '../../core/Injectable.js';
import {
	AddFixedFeeRequest,
	AddFractionalFeeRequest,
	UpdateCustomFeesRequest,
} from './request/index.js';
import { LogError } from '../../core/decorator/LogErrorDecorator.js';
import { handleValidation } from './Common.js';
import { HederaId } from '../../domain/context/shared/HederaId.js';
import { addFixedFeesCommand } from '../../app/usecase/command/stablecoin/fees/addCustomFees/addFixedFeesCommand.js';
import {
	CustomFee,
	FixedFee,
	FractionalFee,
} from '../../domain/context/fee/CustomFee.js';
import BigDecimal from '../../domain/context/shared/BigDecimal.js';
import { addFractionalFeesCommand } from '../../app/usecase/command/stablecoin/fees/addCustomFees/addFractionalFeesCommand.js';
import { UpdateCustomFeesCommand } from '../../app/usecase/command/stablecoin/fees/updateCustomFees/UpdateCustomFeesCommand.js';

export { CustomFee, FixedFee, FractionalFee };

interface ICustomFees {
	addFixedFee(request: AddFixedFeeRequest): Promise<boolean>;
	addFractionalFee(request: AddFractionalFeeRequest): Promise<boolean>;
	updateCustomFees(request: UpdateCustomFeesRequest): Promise<boolean>;
}

class CustomFeesInPort implements ICustomFees {
	constructor(
		private readonly commandBus: CommandBus = Injectable.resolve(
			CommandBus,
		),
	) {}

	@LogError
	async addFixedFee(request: AddFixedFeeRequest): Promise<boolean> {
		const {
			tokenId,
			collectorId,
			tokenIdCollected,
			amount,
			collectorsExempt,
		} = request;
		handleValidation('AddFixedFeeRequest', request);

		return (
			await this.commandBus.execute(
				new addFixedFeesCommand(
					HederaId.from(tokenId),
					HederaId.from(collectorId),
					HederaId.from(tokenIdCollected),
					BigDecimal.fromString(amount),
					collectorsExempt,
				),
			)
		).payload;
	}

	@LogError
	async addFractionalFee(request: AddFractionalFeeRequest): Promise<boolean> {
		const {
			tokenId,
			collectorId,
			amountNumerator,
			amountDenominator,
			min,
			max,
			net,
			collectorsExempt,
		} = request;
		handleValidation('AddFractionalFeeRequest', request);

		return (
			await this.commandBus.execute(
				new addFractionalFeesCommand(
					HederaId.from(tokenId),
					HederaId.from(collectorId),
					parseInt(amountNumerator),
					parseInt(amountDenominator),
					BigDecimal.fromString(min),
					BigDecimal.fromString(max),
					net,
					collectorsExempt,
				),
			)
		).payload;
	}

	@LogError
	async updateCustomFees(request: UpdateCustomFeesRequest): Promise<boolean> {
		const { tokenId, customFees } = request;
		handleValidation('UpdateCustomFeesRequest', request);

		return (
			await this.commandBus.execute(
				new UpdateCustomFeesCommand(HederaId.from(tokenId), customFees),
			)
		).payload;
	}
}

const Fees = new CustomFeesInPort();
export default Fees;
