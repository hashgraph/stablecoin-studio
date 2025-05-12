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

import BaseError from '../../../core/error/BaseError';
import InvalidExpirationTimestamp from '../stablecoin/error/InvalidExpirationTimestamp';
import { BigDecimal } from '../../../port/in';
import { BigNumber } from 'ethers';

export class Hold {
	constructor(
		public readonly amount: BigNumber,
		public readonly expirationTimestamp: string,
		public readonly escrow: string,
		public readonly to: string,
		public readonly data: string,
	) {}

	public static checkExpirationTimestamp(
		value: number,
		minTimeStamp?: number,
		maxTimeStamp?: number,
	): BaseError[] {
		const errorList: BaseError[] = [];

		const minDate = minTimeStamp ? minTimeStamp : 0;
		const maxDate = maxTimeStamp ? maxTimeStamp : 0;

		if (value < minDate || (maxTimeStamp && value > maxDate)) {
			errorList.push(
				new InvalidExpirationTimestamp(
					new Date(value),
					new Date(minDate),
					new Date(maxDate),
				),
			);
		}
		return errorList;
	}
}

export class HoldIdentifier {
	public tokenHolder: string;
	public holdId: number;
}

export class HoldDetails {
	expirationTimeStamp: number;
	amount: BigDecimal;
	escrowAddress: string;
	tokenHolderAddress: string;
	destinationAddress: string;
	data: string;
	constructor(
		executionTimeStamp: number,
		amount: BigDecimal,
		escrowAddress: string,
		tokenHolderAddress: string,
		destinationAddress: string,
		data: string,
	) {
		this.expirationTimeStamp = executionTimeStamp;
		this.amount = amount;
		this.escrowAddress = escrowAddress;
		this.tokenHolderAddress = tokenHolderAddress;
		this.destinationAddress = destinationAddress;
		this.data = data;
	}
}
