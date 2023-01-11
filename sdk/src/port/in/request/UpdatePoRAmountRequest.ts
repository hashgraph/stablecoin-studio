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

import CheckNums from '../../../core/checks/numbers/CheckNums.js';
import BigDecimal from '../../../domain/context/shared/BigDecimal.js';
import InvalidDecimalRange from '../../../domain/context/stablecoin/error/InvalidDecimalRange.js';
import { StableCoin } from '../../../domain/context/stablecoin/StableCoin.js';
import { PoRAmountDecimals } from './CreateRequest.js';
import { InvalidType } from './error/InvalidType.js';
import ValidatedRequest from './validation/ValidatedRequest.js';
import Validation from './validation/Validation.js';

export default class UpdatePoRAmountRequest extends ValidatedRequest<UpdatePoRAmountRequest> {
	tokenId: string;
	PoR: string;
	PoRAmount: string;

	constructor({ 
		tokenId,
		PoR,
		PoRAmount,
	}: { 
		tokenId: string;
		PoR: string;
		PoRAmount: string;
	}) {
		super({
			tokenId: Validation.checkHederaIdFormat(),
			PoR: Validation.checkContractId(),
			PoRAmount: (val) => {
				if (!BigDecimal.isBigDecimal(val)) {
					return [new InvalidType(val, 'BigDecimal')];
				}
				if (CheckNums.hasMoreDecimals(val, PoRAmountDecimals)) {
					return [new InvalidDecimalRange(val, PoRAmountDecimals)];
				}

				const PoRAmount = BigDecimal.fromString(
					val,
					PoRAmountDecimals,
				);
			
				return StableCoin.checkPoRAmount(
					PoRAmount,
					PoRAmountDecimals
				);
			},
		});
		this.tokenId = tokenId;
		this.PoR = PoR;
		this.PoRAmount = PoRAmount;
	}
}