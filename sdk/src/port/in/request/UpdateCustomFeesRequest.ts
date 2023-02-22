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

/* eslint-disable @typescript-eslint/no-explicit-any */
import ValidatedRequest from './validation/ValidatedRequest.js';
import Validation from './validation/Validation.js';
import { MAX_CUSTOM_FEES } from '../../../domain/context/fee/CustomFee.js';
import { InvalidLength } from './error/InvalidLength.js';
import AddFixedFeeRequest from './AddFixedFeeRequest.js';
import AddFractionalFeeRequest from './AddFractionalFeeRequest.js';
import { InvalidType } from './error/InvalidType.js';
import {
	RequestCustomFee,
	isRequestFractionalFee,
	isRequestFixedFee,
} from './BaseRequest.js';

export default class UpdateCustomFeesRequest extends ValidatedRequest<UpdateCustomFeesRequest> {
	customFees: RequestCustomFee[];
	tokenId: string;

	constructor({
		customFees,
		tokenId,
	}: {
		customFees: RequestCustomFee[];
		tokenId: string;
	}) {
		super({
			tokenId: Validation.checkHederaIdFormat(),
			customFees: (val) => {
				if (val === undefined || val.length == 0) return;
				if (val.length > MAX_CUSTOM_FEES)
					return [
						new InvalidLength(
							val.length.toString(),
							0,
							MAX_CUSTOM_FEES,
						),
					];

				val.forEach((customFee) => {
					if (isRequestFixedFee(customFee))
						return new AddFixedFeeRequest({
							tokenId: this.tokenId,
							collectorId: customFee.collectorId,
							collectorsExempt: customFee.collectorsExempt,
							decimals: customFee.decimals,
							tokenIdCollected: customFee.tokenIdCollected,
							amount: customFee.amount,
						});
					else if (isRequestFractionalFee(customFee))
						return new AddFractionalFeeRequest({
							tokenId: this.tokenId,
							collectorId: customFee.collectorId,
							collectorsExempt: customFee.collectorsExempt,
							decimals: customFee.decimals,
							percentage: customFee.percentage,
							amountNumerator: customFee.amountNumerator,
							amountDenominator: customFee.amountDenominator,
							min: customFee.min,
							max: customFee.max,
							net: customFee.net,
						});
					else
						return [
							new InvalidType(val, 'FixedFee / FractionalFee'),
						];
				});
			},
		});
		this.customFees = customFees;
		this.tokenId = tokenId;
	}
}
