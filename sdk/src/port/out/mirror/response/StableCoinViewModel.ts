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

import { QueryResponse } from '../../../../core/query/QueryResponse.js';
import PublicKey from '../../../../domain/context/account/PublicKey.js';
import ContractId from '../../../../domain/context/contract/ContractId.js';
import EvmAddress from '../../../../domain/context/contract/EvmAddress.js';
import BigDecimal from '../../../../domain/context/shared/BigDecimal.js';
import { HederaId } from '../../../../domain/context/shared/HederaId.js';
import { RequestCustomFee } from '../../../in/request/BaseRequest.js';

export default interface StableCoinViewModel extends QueryResponse {
	tokenId?: HederaId;
	name?: string;
	symbol?: string;
	decimals?: number;
	totalSupply?: BigDecimal;
	maxSupply?: BigDecimal;
	initialSupply?: BigDecimal;
	treasury?: HederaId;
	proxyAddress?: ContractId;
	proxyAdminAddress?: ContractId;
	evmProxyAddress?: EvmAddress;
	evmProxyAdminAddress?: EvmAddress;
	expirationTime?: string;
	freezeDefault?: boolean;
	autoRenewAccount?: HederaId;
	autoRenewPeriod?: number;
	expirationTimestamp?: number;
	paused?: boolean;
	deleted?: boolean;
	adminKey?: ContractId | PublicKey | undefined;
	kycKey?: ContractId | PublicKey | undefined;
	freezeKey?: ContractId | PublicKey | undefined;
	wipeKey?: ContractId | PublicKey | undefined;
	supplyKey?: ContractId | PublicKey | undefined;
	pauseKey?: ContractId | PublicKey | undefined;
	feeScheduleKey?: PublicKey | undefined;
	reserveAddress?: ContractId;
	reserveAmount?: BigDecimal;
	customFees?: RequestCustomFee[];
}
