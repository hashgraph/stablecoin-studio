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

import { Command } from '../../../../../core/command/Command.js';
import { CommandResponse } from '../../../../../core/command/CommandResponse.js';
import ContractId from '../../../../../domain/context/contract/ContractId.js';
import { StableCoinProps } from '../../../../../domain/context/stablecoin/StableCoin.js';
import BigDecimal from '../../../../../domain/context/shared/BigDecimal.js';

export class CreateCommandResponse implements CommandResponse {
	public readonly tokenId: ContractId;
	public readonly reserveProxy: ContractId;
	public readonly reserveProxyAdmin: ContractId;

	constructor(
		tokenId: ContractId,
		reserveProxy: ContractId,
		reserveProxyAdmin: ContractId,
	) {
		this.tokenId = tokenId;
		this.reserveProxy = reserveProxy;
		this.reserveProxyAdmin = reserveProxyAdmin;
	}
}

export class CreateCommand extends Command<CreateCommandResponse> {
	constructor(
		public readonly coin: StableCoinProps,
		public readonly createReserve: boolean,
		public readonly factory?: ContractId,
		public readonly hederaTokenManager?: ContractId,
		public readonly reserveAddress?: ContractId,
		public readonly reserveInitialAmount?: BigDecimal,
		public readonly proxyAdminOwnerAccount?: ContractId,
	) {
		super();
	}
}
