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

/* eslint-disable @typescript-eslint/no-explicit-any */
export interface BaseRequest {
	[n: string]: any;
}

export interface RequestAccount {
	accountId: string;
	privateKey?: RequestPrivateKey;
	evmAddress?: string;
}

interface RequestKey {
	key: string;
	type?: string;
}

// Extend as empty interface for future changes
// eslint-disable-next-line @typescript-eslint/no-empty-interface
export interface RequestPrivateKey extends RequestKey {
	type: string;
}
// eslint-disable-next-line @typescript-eslint/no-empty-interface
export interface RequestPublicKey extends RequestKey {}

export interface AccountBaseRequest {
	account: RequestAccount;
}

export interface ContractBaseRequest extends BaseRequest, AccountBaseRequest {
	proxyContractId: string;
}
