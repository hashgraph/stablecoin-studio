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

import {QueryResponse} from "../../../../core/query/QueryResponse";


export default interface AccountDetailViewModel extends QueryResponse {
	account_id: string;
	alias?: string;
	auto_renew_period?: number;
	balance?: {
		balance: number;
		timestamp: string;
		tokens?: Array<{
			token_id: string;
			balance: number;
		}>;
	};
	created_timestamp?: string;
	decline_reward?: boolean;
	deleted?: boolean;
	ethereum_nonce?: number;
	evm_address?: string;
	expiry_timestamp?: string;
	key?: {
		_type: string;
		key: string;
	};
	max_automatic_token_associations: number;
	memo?: string;
	pending_reward?: number;
	receiver_sig_required?: boolean;
	staked_account_id?: string | null;
	staked_node_id?: string | null;
	stake_period_start?: string | null;
	transactions?: Array<any>;
	links?: {
		next?: string;
	};
}

