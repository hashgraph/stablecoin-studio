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

import CheckNums from '../../../core/checks/numbers/CheckNums.js';
import BigDecimal from '../../../domain/context/shared/BigDecimal.js';
import InvalidDecimalRange from '../../../domain/context/stablecoin/error/InvalidDecimalRange.js';
import { StableCoin } from '../../../domain/context/stablecoin/StableCoin.js';
import { InvalidType } from './error/InvalidType.js';
import ValidatedRequest from './validation/ValidatedRequest.js';
import Validation from './validation/Validation.js';
import { RESERVE_DECIMALS } from '../../../domain/context/reserve/Reserve.js';

export default class UpdateReserveAmountRequest extends ValidatedRequest<UpdateReserveAmountRequest> {
	reserveAddress: string;
	reserveAmount: string;

	constructor({
		reserveAddress,
		reserveAmount,
	}: {
		reserveAddress: string;
		reserveAmount: string;
	}) {
		super({
			reserveAddress: Validation.checkContractId(),
			reserveAmount: (val) => {
				if (!BigDecimal.isBigDecimal(val)) {
					return [new InvalidType(val)];
				}
				if (CheckNums.hasMoreDecimals(val, RESERVE_DECIMALS)) {
					return [new InvalidDecimalRange(val, RESERVE_DECIMALS)];
				}

				const reserveAmount = BigDecimal.fromString(
					val,
					RESERVE_DECIMALS,
				);

				return StableCoin.checkReserveAmount(
					reserveAmount,
					RESERVE_DECIMALS,
				);
			},
		});
		this.reserveAddress = reserveAddress;
		this.reserveAmount = reserveAmount;
	}
}
