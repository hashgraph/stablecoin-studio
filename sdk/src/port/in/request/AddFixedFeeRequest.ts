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
import CheckNums from '../../../core/checks/numbers/CheckNums.js';
import BigDecimal from '../../../domain/context/shared/BigDecimal.js';
import InvalidDecimalRange from '../../../domain/context/stablecoin/error/InvalidDecimalRange.js';
import { InvalidRange } from './error/InvalidRange.js';
import { InvalidType } from './error/InvalidType.js';
import ValidatedRequest from './validation/ValidatedRequest.js';
import Validation from './validation/Validation.js';

export default class AddFixedFeeRequest extends ValidatedRequest<AddFixedFeeRequest> {
	tokenId: string;
	collectorId: string;
	tokenIdCollected: string;
	amount: string;
	decimals: number;
	collectorsExempt: boolean;

	constructor({
		tokenId,
		collectorId,
		tokenIdCollected,
		amount,
		decimals,
		collectorsExempt,
	}: {
		tokenId: string;
		collectorId: string;
		tokenIdCollected: string;
		amount: string;
		decimals: number;
		collectorsExempt: boolean;
	}) {
		super({
			tokenId: Validation.checkHederaIdFormat(),
			collectorId: Validation.checkHederaIdFormat(),
			tokenIdCollected: Validation.checkHederaIdFormat(true),
			amount: (val) => {
				if (!BigDecimal.isBigDecimal(val)) {
					return [new InvalidType(val, 'BigDecimal')];
				}
				if (CheckNums.hasMoreDecimals(val, this.decimals)) {
					return [new InvalidDecimalRange(val, this.decimals)];
				}

				const zero = BigDecimal.fromString('0', this.decimals);
				const value = BigDecimal.fromString(val, this.decimals);

				if (value.isLowerOrEqualThan(zero)) {
					return [new InvalidRange(val, '0..', undefined)];
				}
			},
		});
		this.tokenId = tokenId;
		this.collectorId = collectorId;
		this.tokenIdCollected = tokenIdCollected;
		this.amount = amount;
		this.decimals = decimals;
		this.collectorsExempt = collectorsExempt;
	}
}
