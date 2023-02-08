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
import {
	CustomFee,
	FixedFee,
	FractionalFee,
	MAX_CUSTOM_FEES,
} from '../../../domain/context/fee/CustomFee.js';
import { InvalidLength } from './error/InvalidLength.js';
import AddFixedFeeRequest from './AddFixedFeeRequest.js';
import AddFractionalFeeRequest from './AddFractionalFeeRequest.js';
import { InvalidType } from './error/InvalidType.js';

export default class UpdateCustomFeesRequest extends ValidatedRequest<UpdateCustomFeesRequest> {
	customFees: CustomFee[];
	tokenId: string;

	constructor({
		customFees,
		tokenId,
	}: {
		customFees: CustomFee[];
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
					if (customFee instanceof FixedFee)
						return new AddFixedFeeRequest({
							tokenId: this.tokenId,
							collectorId: customFee.collectorId
								? customFee.collectorId.toString()
								: '',
							tokenIdCollected: customFee.tokenId
								? customFee.tokenId.toString()
								: '',
							amount: customFee.amount
								? customFee.amount.toString()
								: '',
							collectorsExempt:
								customFee.collectorsExempt ?? false,
						});
					else if (customFee instanceof FractionalFee)
						return new AddFractionalFeeRequest({
							tokenId: this.tokenId,
							collectorId: customFee.collectorId
								? customFee.collectorId.toString()
								: '',
							amountNumerator: customFee.amountNumerator
								? customFee.amountNumerator.toString()
								: '',
							amountDenominator: customFee.amountDenominator
								? customFee.amountDenominator.toString()
								: '',
							min: customFee.min ? customFee.min.toString() : '',
							max: customFee.max ? customFee.max.toString() : '',
							net: customFee.net ?? false,
							collectorsExempt:
								customFee.collectorsExempt ?? false,
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
