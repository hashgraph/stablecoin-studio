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

import { BaseRequest } from './BaseRequest.js';
import ValidatedRequest from './validation/ValidatedRequest.js';
import Validation from './validation/Validation.js';

export default class CashInRequest
	extends ValidatedRequest<CashInRequest>
	implements BaseRequest
{
	amount: string;
	targetId: string;
	tokenId: string;

	constructor({
		amount,
		targetId,
		tokenId,
	}: {
		amount: string;
		targetId: string;
		tokenId: string;
	}) {
		super({
			amount: Validation.checkAmount(),
			targetId: Validation.checkHederaIdFormat(),
			tokenId: Validation.checkHederaIdFormat(),
		});
		this.amount = amount;
		this.targetId = targetId;
		this.tokenId = tokenId;
	}
}
