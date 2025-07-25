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

import CheckEvmAddress from '../../../core/checks/evmaddress/CheckEvmAddress.js';
import { EVM_ZERO_ADDRESS } from '../../../core/Constants.js';
import BigDecimal from '../shared/BigDecimal.js';
import { HederaId } from '../shared/HederaId.js';
import {
	CustomFee as HCustomFee,
	CustomFixedFee as HCustomFixedFee,
	CustomFractionalFee as HCustomFractionalFee,
	FeeAssessmentMethod,
} from '@hashgraph/sdk';

export const MAX_CUSTOM_FEES = 10;
export const MAX_PERCENTAGE_DECIMALS = 2;

export class SC_FixedFee {
	amount: number;
	tokenId: string;
	useHbarsForPayment: boolean;
	useCurrentTokenForPayment: boolean;
	feeCollector: string;

	constructor(
		amount: number,
		tokenId: string,
		useHbarsForPayment: boolean,
		useCurrentTokenForPayment: boolean,
		feeCollector: string,
	) {
		this.amount = amount;
		this.tokenId = tokenId;
		this.useHbarsForPayment = useHbarsForPayment;
		this.useCurrentTokenForPayment = useCurrentTokenForPayment;
		this.feeCollector = feeCollector;
	}
}

export class SC_FractionalFee {
	numerator: number;
	denominator: number;
	minimumAmount: number;
	maximumAmount: number;
	netOfTransfers: boolean;
	feeCollector: string;

	constructor(
		numerator: number,
		denominator: number,
		minimumAmount: number,
		maximumAmount: number,
		netOfTransfers: boolean,
		feeCollector: string,
	) {
		this.numerator = numerator;
		this.denominator = denominator;
		this.minimumAmount = minimumAmount;
		this.maximumAmount = maximumAmount;
		this.netOfTransfers = netOfTransfers;
		this.feeCollector = feeCollector;
	}
}

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
		min?: BigDecimal,
		max?: BigDecimal,
		net?: boolean,
		collectorsExempt = true,
	) {
		super(collectorId, collectorsExempt);
		this.amountNumerator = amountNumerator;
		this.amountDenominator = amountDenominator;
		if (min) this.min = min;
		if (max) this.max = max;
		if (net) this.net = net;
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
					.setAssessmentMethod(
						new FeeAssessmentMethod(customFee.net ?? false),
					)
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

export function fromHCustomFeeToSCFee(
	customFee: HCustomFee,
	currentTokenId: string,
	feeCollector: string,
): SC_FixedFee | SC_FractionalFee {
	if (customFee instanceof HCustomFixedFee) {
		const fee = customFee as HCustomFixedFee;

		const amount = fee.amount ? fee.amount.toNumber() : 0;
		const tokenId =
			fee.denominatingTokenId &&
			fee.denominatingTokenId.toString() != '0.0.0'
				? CheckEvmAddress.toEvmAddress(
						fee.denominatingTokenId.toSolidityAddress(),
				  )
				: EVM_ZERO_ADDRESS;
		const useHbarsForPayment = tokenId === EVM_ZERO_ADDRESS;
		const useCurrentTokenForPayment =
			!useHbarsForPayment &&
			fee.denominatingTokenId?.toString() === currentTokenId;

		return new SC_FixedFee(
			amount,
			tokenId,
			useHbarsForPayment,
			useCurrentTokenForPayment,
			feeCollector,
		);
	}
	const fee = customFee as HCustomFractionalFee;

	const numerator = fee.numerator ? fee.numerator.toNumber() : 0;
	const denominator = fee.denominator ? fee.denominator.toNumber() : 0;
	const minimumAmount = fee.min ? fee.min.toNumber() : 0;
	const maximumAmount = fee.max ? fee.max.toNumber() : 0;
	const netOfTransfers = fee.assessmentMethod
		? fee.assessmentMethod.valueOf()
		: false;

	return new SC_FractionalFee(
		numerator,
		denominator,
		minimumAmount,
		maximumAmount,
		netOfTransfers,
		feeCollector,
	);
}
