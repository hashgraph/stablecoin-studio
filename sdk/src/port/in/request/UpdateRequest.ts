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

import { OptionalField } from '../../../core/decorator/OptionalDecorator.js';
import { RequestPublicKey } from './BaseRequest.js';
import ValidatedRequest from './validation/ValidatedRequest.js';
import Validation from './validation/Validation.js';
import { StableCoin } from '../../../domain/context/stablecoin/StableCoin.js';

export default class UpdateRequest extends ValidatedRequest<UpdateRequest> {
	tokenId: string;

	@OptionalField()
	name?: string;

	@OptionalField()
	symbol?: string;

	@OptionalField()
	autoRenewPeriod?: string;

	@OptionalField()
	expirationTimestamp?: string;

	@OptionalField()
	freezeKey?: RequestPublicKey;

	@OptionalField()
	kycKey?: RequestPublicKey;

	@OptionalField()
	wipeKey?: RequestPublicKey;

	@OptionalField()
	pauseKey?: RequestPublicKey;

	@OptionalField()
	supplyKey?: RequestPublicKey;

	@OptionalField()
	feeScheduleKey?: RequestPublicKey;

	constructor({
		tokenId,
		name,
		symbol,
		autoRenewPeriod,
		expirationTimestamp,
		freezeKey,
		kycKey,
		wipeKey,
		pauseKey,
		supplyKey,
		feeScheduleKey,
	}: {
		tokenId: string;
		name?: string;
		symbol?: string;
		autoRenewPeriod?: string;
		expirationTimestamp?: string;
		freezeKey?: RequestPublicKey;
		kycKey?: RequestPublicKey;
		wipeKey?: RequestPublicKey;
		pauseKey?: RequestPublicKey;
		supplyKey?: RequestPublicKey;
		feeScheduleKey?: RequestPublicKey;
	}) {
		super({
			name: (val) => {
				if (val === undefined || val === '') {
					return;
				}
				return StableCoin.checkName(val);
			},
			symbol: (val) => {
				if (val === undefined || val === '') {
					return;
				}
				return StableCoin.checkSymbol(val);
			},
			tokenId: Validation.checkHederaIdFormat(),
			autoRenewPeriod: (val) => {
				if (val === undefined || val === '') {
					return;
				}
				return StableCoin.checkAutoRenewPeriod(val);
			},
			expirationTimestamp: (val) => {
				if (val === undefined || val === '') {
					return;
				}
				return StableCoin.checkExpirationTimestamp(val);
			},
			freezeKey: Validation.checkPublicKey(),
			kycKey: Validation.checkPublicKey(),
			wipeKey: Validation.checkPublicKey(),
			pauseKey: Validation.checkPublicKey(),
			supplyKey: Validation.checkPublicKey(),
			feeScheduleKey: Validation.checkPublicKey(),
		});
		this.tokenId = tokenId;
		this.name = name;
		this.symbol = symbol;
		this.autoRenewPeriod = autoRenewPeriod;
		this.expirationTimestamp = expirationTimestamp;
		this.freezeKey = freezeKey;
		this.kycKey = kycKey;
		this.wipeKey = wipeKey;
		this.pauseKey = pauseKey;
		this.supplyKey = supplyKey;
		this.feeScheduleKey = feeScheduleKey;
	}
}
