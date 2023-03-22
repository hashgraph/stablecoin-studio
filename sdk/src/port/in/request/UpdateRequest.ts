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

export default class UpdateRequest extends ValidatedRequest<UpdateRequest> {
	tokenId: string;

	@OptionalField()
	name?: string;

	@OptionalField()
	symbol?: string;

	@OptionalField()
	autoRenewAccount?: string;

	@OptionalField()
	autoRenewPeriod?: number;

	@OptionalField()
	expirationTime?: number;

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
		autoRenewAccount,
		autoRenewPeriod,
		expirationTime,
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
		autoRenewAccount?: string;
		autoRenewPeriod?: number;
		expirationTime?: number;
		freezeKey?: RequestPublicKey;
		kycKey?: RequestPublicKey;
		wipeKey?: RequestPublicKey;
		pauseKey?: RequestPublicKey;
		supplyKey?: RequestPublicKey;
		feeScheduleKey?: RequestPublicKey;
	}) {
		super({
			tokenId: Validation.checkHederaIdFormat(),
			autoRenewAccount: Validation.checkHederaIdFormat(),
			// validate autoRenewPeriod
			// The minimum period of time is approximately 30 days (2592000 seconds)
			// and the maximum period of time is approximately 92 days (8000001 seconds).
			//Any other value outside of this range will return the following error: AUTORENEW_DURATION_NOT_IN_RANGE.
			/* autoRenewPeriod: (val) => {
				if (val) {

				}
			}, */
			// validate expirationTime:
			//If the provided expiry is earlier than the current token expiry,
			//the transaction will resolve to INVALID_EXPIRATION_TIME
			/* expirationTime: (val) => {
				if (val) {

				}
			}, */
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
		this.autoRenewAccount = autoRenewAccount;
		this.autoRenewPeriod = autoRenewPeriod;
		this.expirationTime = expirationTime;
		this.freezeKey = freezeKey;
		this.kycKey = kycKey;
		this.wipeKey = wipeKey;
		this.pauseKey = pauseKey;
		this.supplyKey = supplyKey;
		this.feeScheduleKey = feeScheduleKey;
	}
}
