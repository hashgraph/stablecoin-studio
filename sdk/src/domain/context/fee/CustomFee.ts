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

import BigDecimal from '../shared/BigDecimal.js';
import { HederaId } from '../shared/HederaId.js';
import {
	CustomFee as HCustomFee,
	CustomFixedFee as HCustomFixedFee,
	CustomFractionalFee as HCustomFractionalFee,
} from '@hashgraph/sdk';

export const MAX_CUSTOM_FEES = 10;

export class CustomFee {
	collectorId?: HederaId;
	collectorsExempt?: boolean;

	constructor(collectorId: HederaId, collectorsExempt: boolean) {
		this.collectorId = collectorId;
		this.collectorsExempt = collectorsExempt;
	}
}

export class FractionalFee extends CustomFee {
	amountNumerator?: number;
	amountDenominator?: number;
	min?: BigDecimal;
	max?: BigDecimal;
	net?: boolean;

	constructor(
		collectorId: HederaId,
		amountNumerator: number,
		amountDenominator: number,
		min: BigDecimal,
		max: BigDecimal,
		net: boolean,
		collectorsExempt: boolean,
	) {
		super(collectorId, collectorsExempt);
		this.amountNumerator = amountNumerator;
		this.amountDenominator = amountDenominator;
		this.min = min;
		this.max = max;
		this.net = net;
	}
}

export class FixedFee extends CustomFee {
	amount?: BigDecimal;
	tokenId?: HederaId;

	constructor(
		collectorId: HederaId,
		amount: BigDecimal,
		tokenId: HederaId,
		collectorsExempt: boolean,
	) {
		super(collectorId, collectorsExempt);
		this.amount = amount;
		this.tokenId = tokenId;
	}
}

export function fromCustomFeesToHCustomFees(
	customFees: CustomFee[] | undefined,
): HCustomFee[] {
	const HcustomFee: HCustomFee[] = [];

	if (customFees) {
		customFees.forEach((customFee) => {
			if (customFee instanceof FixedFee) {
				const newFee = new HCustomFixedFee()
					.setAmount(customFee.amount ? customFee.amount.toLong() : 0)
					.setFeeCollectorAccountId(
						customFee.collectorId
							? customFee.collectorId.toString()
							: HederaId.NULL.toString(),
					)
					.setAllCollectorsAreExempt(
						customFee.collectorsExempt ?? false,
					);

				if (customFee.tokenId && !customFee.tokenId.isNull()) {
					newFee.setDenominatingTokenId(customFee.tokenId.toString());
				}

				HcustomFee.push(newFee);
			} else if (customFee instanceof FractionalFee) {
				const newFee = new HCustomFractionalFee()
					.setNumerator(
						customFee.amountNumerator
							? customFee.amountNumerator
							: 0,
					)
					.setDenominator(
						customFee.amountDenominator
							? customFee.amountDenominator
							: 0,
					)
					.setMin(customFee.min ? customFee.min.toLong() : 0)
					/*.setAssessmentMethod(
							new FeeAssessmentMethod(customFee.net ?? false),
					)*/
					.setFeeCollectorAccountId(
						customFee.collectorId
							? customFee.collectorId.toString()
							: HederaId.NULL.toString(),
					)
					.setAllCollectorsAreExempt(
						customFee.collectorsExempt ?? false,
					);

				if (customFee.max) {
					(newFee as HCustomFractionalFee).setMax(
						customFee.max.toLong(),
					);
				}

				HcustomFee.push(newFee);
			}
		});
	}

	return HcustomFee;
}
