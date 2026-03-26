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

import {
	CustomFee as HCustomFee,
	CustomFixedFee as HCustomFixedFee,
} from '@hiero-ledger/sdk';
import {
	fromHCustomFeeToSCFee,
	SC_FixedFee,
	SC_FractionalFee,
} from '../../../../../domain/context/fee/CustomFee.js';
import { AbstractMirrorNodeAdapter } from '../../../../../port/out/mirror/AbstractMirrorNodeAdapter.js';
import { EVM_ZERO_ADDRESS } from '../../../../../core/Constants.js';
import type { UpdateCustomFeesParams } from '../../../../../core/operations/types.js';

/**
 * Converts HCustomFee[] to the flat arrays expected by the updateCustomFees operation.
 * Resolves fee collector account IDs to EVM addresses via mirror node.
 */
export async function prepareCustomFees(
	customFees: HCustomFee[],
	tokenId: string,
	mirrorNodeAdapter: AbstractMirrorNodeAdapter,
): Promise<{ fixedFees: UpdateCustomFeesParams['fixedFees']; fractionalFees: UpdateCustomFeesParams['fractionalFees'] }> {
	const fixedFees: UpdateCustomFeesParams['fixedFees'] = [];
	const fractionalFees: UpdateCustomFeesParams['fractionalFees'] = [];

	for (const cf of customFees) {
		const feeCollector = cf.feeCollectorAccountId
			? (
					await mirrorNodeAdapter.getAccountInfo(
						cf.feeCollectorAccountId.toString(),
					)
			  ).accountEvmAddress ?? EVM_ZERO_ADDRESS
			: EVM_ZERO_ADDRESS;

		const scFee = fromHCustomFeeToSCFee(cf, tokenId, feeCollector);

		if (scFee instanceof SC_FixedFee) {
			fixedFees.push({
				amount: scFee.amount,
				tokenId: scFee.tokenId,
				useHbarsForPayment: scFee.useHbarsForPayment,
				useCurrentTokenForPayment: scFee.useCurrentTokenForPayment,
				feeCollector: scFee.feeCollector,
			});
		} else {
			const ff = scFee as SC_FractionalFee;
			fractionalFees.push({
				numerator: ff.numerator,
				denominator: ff.denominator,
				minimumAmount: ff.minimumAmount,
				maximumAmount: ff.maximumAmount,
				netOfTransfers: ff.netOfTransfers,
				feeCollector: ff.feeCollector,
			});
		}
	}

	return { fixedFees, fractionalFees };
}
