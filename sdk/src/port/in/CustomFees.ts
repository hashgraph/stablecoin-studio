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
	HBAR_DECIMALS,
	MAX_PERCENTAGE_DECIMALS,
} from '../../domain/context/fee/CustomFee.js';
import BigDecimal from '../../domain/context/shared/BigDecimal.js';
import { addFractionalFeesCommand } from '../../app/usecase/command/stablecoin/fees/addCustomFees/addFractionalFeesCommand.js';
import { UpdateCustomFeesCommand } from '../../app/usecase/command/stablecoin/fees/updateCustomFees/UpdateCustomFeesCommand.js';
import {
	isRequestFractionalFee,
	isRequestFixedFee,
} from './request/BaseRequest.js';

export { HBAR_DECIMALS, MAX_PERCENTAGE_DECIMALS };

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
		const { tokenId, fee } = request;
		handleValidation('AddFixedFeeRequest', request);

		return (
			await this.commandBus.execute(
				new addFixedFeesCommand(
					HederaId.from(tokenId),
					HederaId.from(fee.collectorId),
					HederaId.from(fee.tokenIdCollected),
					BigDecimal.fromString(fee.amount, fee.decimals),
					fee.collectorsExempt,
				),
			)
		).payload;
	}

	@LogError
	async addFractionalFee(request: AddFractionalFeeRequest): Promise<boolean> {
		const { tokenId, fee } = request;
		handleValidation('AddFractionalFeeRequest', request);

		return (
			await this.commandBus.execute(
				new addFractionalFeesCommand(
					HederaId.from(tokenId),
					HederaId.from(fee.collectorId),
					parseInt(fee.amountNumerator),
					parseInt(fee.amountDenominator),
					BigDecimal.fromString(fee.min, fee.decimals),
					BigDecimal.fromString(fee.max, fee.decimals),
					fee.net,
					fee.collectorsExempt,
				),
			)
		).payload;
	}

	@LogError
	async updateCustomFees(request: UpdateCustomFeesRequest): Promise<boolean> {
		const { tokenId, customFees } = request;
		handleValidation('UpdateCustomFeesRequest', request);

		const requestedCustomFee: CustomFee[] = [];

		customFees.forEach((customFee) => {
			if (isRequestFixedFee(customFee)) {
				requestedCustomFee.push(
					new FixedFee(
						HederaId.from(customFee.collectorId),
						BigDecimal.fromString(customFee.amount),
						HederaId.from(customFee.tokenIdCollected),
						customFee.collectorsExempt,
					),
				);
			} else if (isRequestFractionalFee(customFee)) {
				requestedCustomFee.push(
					new FractionalFee(
						HederaId.from(customFee.collectorId),
						parseInt(customFee.amountNumerator),
						parseInt(customFee.amountDenominator),
						BigDecimal.fromString(customFee.min),
						BigDecimal.fromString(customFee.max),
						customFee.net,
						customFee.collectorsExempt,
					),
				);
			}
		});

		return (
			await this.commandBus.execute(
				new UpdateCustomFeesCommand(
					HederaId.from(tokenId),
					requestedCustomFee,
				),
			)
		).payload;
	}
}

const Fees = new CustomFeesInPort();
export default Fees;
