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

import { OptionalField } from '../../../core/decorator/OptionalDecorator.js';
import ValidatedRequest from './validation/ValidatedRequest.js';
import Validation from './validation/Validation.js';
import { Hold } from '../../../domain/context/hold/Hold.js';

export default class CreateHoldByControllerRequest extends ValidatedRequest<CreateHoldByControllerRequest> {
	amount: string;
	escrow: string;
	tokenId: string;
	expirationDate: string;
	sourceId: string;

	@OptionalField()
	targetId?: string;

	constructor({
		tokenId,
		amount,
		escrow,
		expirationDate,
		sourceId,
		targetId,
	}: {
		tokenId: string;
		amount: string;
		escrow: string;
		expirationDate: string;
		sourceId: string;
		targetId?: string;
	}) {
		super({
			tokenId: Validation.checkHederaIdFormat(),
			amount: Validation.checkAmount(),
			escrow: Validation.checkHederaIdFormat(true),
			targetId: Validation.checkHederaIdFormat(true),
			expirationDate: (val) => {
				return Hold.checkExpirationTimestamp(
					parseInt(val),
					Math.ceil(new Date().getTime() / 1000),
				);
			},
			sourceId: Validation.checkHederaIdFormat(),
		});
		this.tokenId = tokenId;
		this.amount = amount;
		this.escrow = escrow;
		this.expirationDate = expirationDate;
		this.sourceId = sourceId;
		this.targetId = targetId;
	}
}
