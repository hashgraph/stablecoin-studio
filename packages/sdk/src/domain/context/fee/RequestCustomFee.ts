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
