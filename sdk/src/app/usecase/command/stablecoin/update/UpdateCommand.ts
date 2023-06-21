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

import { Command } from '../../../../../core/command/Command.js';
import { CommandResponse } from '../../../../../core/command/CommandResponse.js';
import PublicKey from '../../../../../domain/context/account/PublicKey.js';
import { HederaId } from '../../../../../domain/context/shared/HederaId.js';

export class UpdateCommandResponse implements CommandResponse {
	constructor(public readonly payload: boolean) {}
}

export class UpdateCommand extends Command<UpdateCommandResponse> {
	constructor(
		public readonly tokenId: HederaId,
		public readonly name?: string,
		public readonly symbol?: string,
		public readonly autoRenewPeriod?: number,
		public readonly expirationTime?: number,
		public readonly kycKey?: PublicKey,
		public readonly freezeKey?: PublicKey,
		public readonly feeScheduleKey?: PublicKey,
		public readonly pauseKey?: PublicKey,
		public readonly wipeKey?: PublicKey,
		public readonly metadata?: string,
	) {
		super();
	}
}
