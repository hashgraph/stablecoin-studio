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
	MAX_CUSTOM_FEES,
} from '../../domain/context/fee/CustomFee.js';
import BigDecimal from '../../domain/context/shared/BigDecimal.js';
import { addFractionalFeesCommand } from '../../app/usecase/command/stablecoin/fees/addCustomFees/addFractionalFeesCommand.js';
import { UpdateCustomFeesCommand } from '../../app/usecase/command/stablecoin/fees/updateCustomFees/UpdateCustomFeesCommand.js';
import {
	isRequestFractionalFee,
	isRequestFixedFee,
} from './request/BaseRequest.js';

export { HBAR_DECIMALS, MAX_PERCENTAGE_DECIMALS, MAX_CUSTOM_FEES };

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
			decimals,
			collectorsExempt,
		} = request;
		handleValidation('AddFixedFeeRequest', request);

		return (
			await this.commandBus.execute(
				new addFixedFeesCommand(
					HederaId.from(tokenId),
					HederaId.from(collectorId),
					HederaId.from(tokenIdCollected),
					BigDecimal.fromString(amount, decimals),
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
			percentage,
			amountNumerator,
			amountDenominator,
			min,
			max,
			decimals,
			collectorsExempt,
			net,
		} = request;
		handleValidation('AddFractionalFeeRequest', request);

		let _amountNumerator = amountNumerator ?? '';
		let _amountDenominator = amountDenominator ?? '';
		const _min = min ?? '0';
		const _max = min ?? '0';

		if (_amountNumerator === '') {
			[_amountNumerator, _amountDenominator] =
				this.getFractionFromPercentage(percentage ?? '');
		}

		return (
			await this.commandBus.execute(
				new addFractionalFeesCommand(
					HederaId.from(tokenId),
					HederaId.from(collectorId),
					parseInt(_amountNumerator),
					parseInt(_amountDenominator),
					BigDecimal.fromString(_min, decimals),
					BigDecimal.fromString(_max, decimals),
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

		const requestedCustomFee: CustomFee[] = [];

		customFees.forEach((customFee) => {
			if (isRequestFixedFee(customFee)) {
				requestedCustomFee.push(
					new FixedFee(
						HederaId.from(customFee.collectorId),
						BigDecimal.fromString(
							customFee.amount,
							customFee.decimals,
						),
						HederaId.from(customFee.tokenIdCollected),
						customFee.collectorsExempt,
					),
				);
			} else if (isRequestFractionalFee(customFee)) {
				let _amountNumerator = customFee.amountNumerator ?? '';
				let _amountDenominator = customFee.amountDenominator ?? '';

				if (_amountNumerator === '') {
					[_amountNumerator, _amountDenominator] =
						this.getFractionFromPercentage(customFee.percentage);
				}

				requestedCustomFee.push(
					new FractionalFee(
						HederaId.from(customFee.collectorId),
						parseInt(_amountNumerator),
						parseInt(_amountDenominator),
						customFee.min ? BigDecimal.fromString(
							customFee.min,
							customFee.decimals,
						) : undefined,
						customFee.max ? BigDecimal.fromString(
							customFee.max,
							customFee.decimals,
						) : undefined,
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

	getFractionFromPercentage(percentage: string): string[] {
		const fraction: string[] = [];

		const exponential = 10 ** MAX_PERCENTAGE_DECIMALS;

		const amountDenominator = (100 * exponential).toString();

		const numerator = BigDecimal.fromString(
			percentage,
			MAX_PERCENTAGE_DECIMALS,
		);
		const amountNumerator = Math.round(
			numerator.toUnsafeFloat() * exponential,
		).toString();

		fraction.push(amountNumerator);
		fraction.push(amountDenominator);

		return fraction;
	}
}

const Fees = new CustomFeesInPort();
export default Fees;
