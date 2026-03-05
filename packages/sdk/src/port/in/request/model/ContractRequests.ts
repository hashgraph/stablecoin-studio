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

import Account from '../../../../domain/context/account/Account.js';
import PublicKey from '../../../../domain/context/account/PublicKey.js';
import { StableCoinRole } from '../../../../domain/context/stablecoin/StableCoinRole.js';

export interface AccountRequestModel {
	account: Account;
}

export interface RequestContracts extends AccountRequestModel {
	proxyContractId: string;
}
export interface RequestContractsAmount extends RequestContracts {
	amount: string;
}

export interface RequestBalanceOf extends RequestContracts {
	targetId: string;
}

export interface TokenIdRequestModel {
	tokenId: string;
}

export interface TargetIdRequestModel {
	targetId: string;
}

export interface RequestRole
	extends RequestContracts,
		TargetIdRequestModel,
		TokenIdRequestModel {
	role: StableCoinRole;
}

export interface RequestRoles extends RequestContracts, TargetIdRequestModel {}

export interface SupplierRequestRoleModel extends RequestRole {
	amount: string;
	role: StableCoinRole;
}

export interface AllowanceRequest
	extends RequestContracts,
		TargetIdRequestModel,
		TokenIdRequestModel {
	amount: string;
}

export interface ICoreOperation
	extends RequestContractsAmount,
		TokenIdRequestModel {
	publicKey?: PublicKey;
}
