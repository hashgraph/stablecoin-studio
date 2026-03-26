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

/* eslint-disable @typescript-eslint/no-unused-vars */

import { StableCoinRole } from '../../../domain/context/stablecoin/StableCoinRole.js';
import ContractId from '../../../domain/context/contract/ContractId.js';
import EvmAddress from '../../../domain/context/contract/EvmAddress.js';
import BigDecimal from '../../../domain/context/shared/BigDecimal.js';
import { HoldDetails } from '../../../domain/context/hold/Hold.js';

export class AbstractRPCQueryAdapter {
	init(_urlRpcProvider?: string, _apiKey?: string): Promise<string> {
		throw new Error('Method not implemented.');
	}

	balanceOf(
		_address: EvmAddress,
		_target: EvmAddress,
	): Promise<bigint> {
		throw new Error('Method not implemented.');
	}

	getReserveAddress(_address: EvmAddress): Promise<ContractId> {
		throw new Error('Method not implemented.');
	}

	getReserveAmount(_address: EvmAddress): Promise<bigint> {
		throw new Error('Method not implemented.');
	}

	getReserveLatestRoundData(
		_address: EvmAddress,
	): Promise<bigint[]> {
		throw new Error('Method not implemented.');
	}

	isLimited(
		_address: EvmAddress,
		_target: EvmAddress,
	): Promise<boolean> {
		throw new Error('Method not implemented.');
	}

	isUnlimited(
		_address: EvmAddress,
		_target: EvmAddress,
	): Promise<boolean> {
		throw new Error('Method not implemented.');
	}

	getRoles(
		_address: EvmAddress,
		_target: EvmAddress,
	): Promise<string[]> {
		throw new Error('Method not implemented.');
	}

	getAccountsWithRole(
		_address: EvmAddress,
		_role: string,
	): Promise<string[]> {
		throw new Error('Method not implemented.');
	}

	hasRole(
		_address: EvmAddress,
		_target: EvmAddress,
		_role: StableCoinRole,
	): Promise<boolean> {
		throw new Error('Method not implemented.');
	}

	supplierAllowance(
		_address: EvmAddress,
		_target: EvmAddress,
	): Promise<bigint> {
		throw new Error('Method not implemented.');
	}

	getReserveDecimals(_address: EvmAddress): Promise<number> {
		throw new Error('Method not implemented.');
	}

	getMetadata(_address: EvmAddress): Promise<string> {
		throw new Error('Method not implemented.');
	}

	getConfigInfo(
		_address: EvmAddress,
	): Promise<[string, string, number]> {
		throw new Error('Method not implemented.');
	}

	getHoldFor(
		_address: EvmAddress,
		_target: EvmAddress,
		_holdId: number,
	): Promise<HoldDetails> {
		throw new Error('Method not implemented.');
	}

	getHoldsIdFor(
		_address: EvmAddress,
		_target: EvmAddress,
		_start: number,
		_end: number,
	): Promise<number[]> {
		throw new Error('Method not implemented.');
	}

	getHeldAmountFor(
		_address: EvmAddress,
		_target: EvmAddress,
	): Promise<BigDecimal> {
		throw new Error('Method not implemented.');
	}

	getHoldCountFor(
		_address: EvmAddress,
		_target: EvmAddress,
	): Promise<number> {
		throw new Error('Method not implemented.');
	}

	getBurnableAmount(_address: EvmAddress): Promise<string> {
		throw new Error('Method not implemented.');
	}
}
