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
	CustomFee,
	FixedFee,
	FractionalFee,
} from '../../../domain/context/fee/CustomFee.js';
import BigDecimal from '../../../domain/context/shared/BigDecimal.js';
import { HederaId } from '../../../domain/context/shared/HederaId.js';

/* eslint-disable @typescript-eslint/no-explicit-any */
export interface BaseRequest {
	[n: string]: any;
}

export interface RequestAccount {
	accountId: string;
	privateKey?: RequestPrivateKey;
	evmAddress?: string;
}

interface RequestKey {
	key: string;
	type?: string;
}

// Extend as empty interface for future changes
// eslint-disable-next-line @typescript-eslint/no-empty-interface
export interface RequestPrivateKey extends RequestKey {
	type: string;
}
// eslint-disable-next-line @typescript-eslint/no-empty-interface
export interface RequestPublicKey extends RequestKey {}

export interface AccountBaseRequest {
	account: RequestAccount;
}

export interface ContractBaseRequest extends BaseRequest, AccountBaseRequest {
	proxyContractId: string;
}

export interface RequestCustomFee {
	collectorId: string;
	collectorsExempt: boolean;
	decimals: number;
}

export interface RequestFractionalFee extends RequestCustomFee {
	percentage: string;
	amountNumerator: string;
	amountDenominator: string;
	min: string;
	max: string;
	net: boolean;
}

export interface RequestFixedFee extends RequestCustomFee {
	tokenIdCollected: string;
	amount: string;
}

export const isRequestFractionalFee = (
	fee: RequestCustomFee,
): fee is RequestFractionalFee => {
	return 'amountNumerator' in fee;
};

export const isRequestFixedFee = (
	fee: RequestCustomFee,
): fee is RequestFixedFee => {
	return 'amount' in fee;
};

export const toCustomFees = (
	customFees: RequestCustomFee[] | undefined,
): CustomFee[] | undefined => {
	if (customFees) {
		const customFeesToReturn: CustomFee[] = [];

		customFees.forEach((customFee) => {
			const CF = toCustomFee(customFee);
			if (CF) customFeesToReturn.push(CF);
		});

		return customFeesToReturn;
	}
};

const toCustomFee = (customFee: RequestCustomFee): CustomFee | undefined => {
	if (isRequestFixedFee(customFee))
		return new FixedFee(
			HederaId.from(customFee.collectorId),
			BigDecimal.fromString(customFee.amount, customFee.decimals),
			HederaId.from(customFee.tokenIdCollected),
			customFee.collectorsExempt,
		);
	else if (isRequestFractionalFee(customFee))
		return new FractionalFee(
			HederaId.from(customFee.collectorId),
			parseInt(customFee.amountNumerator),
			parseInt(customFee.amountDenominator),
			BigDecimal.fromString(customFee.min, customFee.decimals),
			BigDecimal.fromString(customFee.max, customFee.decimals),
			customFee.net,
			customFee.collectorsExempt,
		);
};
