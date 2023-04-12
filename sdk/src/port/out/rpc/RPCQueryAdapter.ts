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

/* eslint-disable no-case-declarations */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-non-null-assertion */

import { BigNumber, ethers } from 'ethers';
import { singleton } from 'tsyringe';
import { lazyInject } from '../../../core/decorator/LazyInjectDecorator.js';
import NetworkService from '../../../app/service/NetworkService.js';
import LogService from '../../../app/service/LogService.js';
import {
	AggregatorV3Interface__factory,
	HederaERC20__factory,
	StableCoinFactory__factory,
} from 'hedera-stable-coin-contracts';
import { StableCoinRole } from '../../../domain/context/stablecoin/StableCoinRole.js';
import ContractId from '../../../domain/context/contract/ContractId.js';
import EvmAddress from '../../../domain/context/contract/EvmAddress.js';
import { unrecognized } from '../../../domain/context/network/Environment.js';

const HederaERC20 = HederaERC20__factory;
const Reserve = AggregatorV3Interface__factory;
const Factory = StableCoinFactory__factory;

type StaticConnect = { connect: (...args: any[]) => any };

type FactoryContract<T extends StaticConnect> = T['connect'] extends (
	...args: any[]
) => infer K
	? K
	: never;

@singleton()
export default class RPCQueryAdapter {
	provider: ethers.providers.JsonRpcProvider;

	constructor(
		@lazyInject(NetworkService)
		private readonly networkService: NetworkService,
	) {}

	async init(customUrl?: string): Promise<string> {
		const url =
			customUrl ?? this.networkService.environment !== unrecognized
				? `https://${this.networkService.environment.toString()}.hashio.io/api`
				: undefined;
		this.provider = new ethers.providers.JsonRpcProvider(url);
		LogService.logTrace('RPC Query Adapter Initialized on: ', url);

		return this.networkService.environment;
	}

	connect<T extends StaticConnect>(
		fac: T,
		address: string,
	): FactoryContract<T> {
		return fac.connect(address, this.provider);
	}

	async balanceOf(
		address: EvmAddress,
		target: EvmAddress,
	): Promise<BigNumber> {
		LogService.logTrace(
			`Requesting balanceOf address: ${address.toString()}, target: ${target.toString()}`,
		);
		return await this.connect(HederaERC20, address.toString()).balanceOf(
			target.toString(),
		);
	}

	async getReserveAddress(address: EvmAddress): Promise<ContractId> {
		LogService.logTrace(
			`Requesting getReserveAddress address: ${address.toString()}`,
		);
		const val = await this.connect(
			HederaERC20,
			address.toString(),
		).getReserveAddress();
		return ContractId.fromHederaEthereumAddress(val);
	}
	async getReserveAmount(address: EvmAddress): Promise<BigNumber> {
		LogService.logTrace(`Requesting getReserveAmount address: ${address}`);
		return await this.connect(
			HederaERC20,
			address.toString(),
		).getReserveAmount();
	}

	async isLimited(address: EvmAddress, target: EvmAddress): Promise<boolean> {
		LogService.logTrace(
			`Requesting isLimited address: ${address.toString()}, target: ${target.toString()}`,
		);
		return await this.connect(
			HederaERC20,
			address.toString(),
		).isUnlimitedSupplierAllowance(target.toString());
	}

	async isUnlimited(
		address: EvmAddress,
		target: EvmAddress,
	): Promise<boolean> {
		LogService.logTrace(
			`Requesting isUnlimited address: ${address.toString()}, target: ${target.toString()}`,
		);
		return await this.connect(
			HederaERC20,
			address.toString(),
		).isUnlimitedSupplierAllowance(target.toString());
	}

	async getRoles(address: EvmAddress, target: EvmAddress): Promise<string[]> {
		LogService.logTrace(
			`Requesting getRoles address: ${address.toString()}, target: ${target.toString()}`,
		);
		return await this.connect(HederaERC20, address.toString()).getRoles(
			target.toString(),
		);
	}

	async getAccountsWithRole(address: EvmAddress, role: String, init :string, max:string): Promise<string[]> {
		LogService.logTrace(
			`Requesting getAccountsWithRole address: ${address.toString()}, target: ${role}`,
		);
		return await this.connect(HederaERC20, address.toString()).getAccountsForRole(
			role,
			init,
			max
		);
	}

	async hasRole(
		address: EvmAddress,
		target: EvmAddress,
		role: StableCoinRole,
	): Promise<boolean> {
		LogService.logTrace(
			`Requesting balanceOf address: ${address.toString()}, target: ${target.toString()}`,
		);
		return await this.connect(HederaERC20, address.toString()).hasRole(
			role,
			target.toString(),
		);
	}

	async supplierAllowance(
		address: EvmAddress,
		target: EvmAddress,
	): Promise<BigNumber> {
		LogService.logTrace(
			`Requesting balanceOf address: ${address.toString()}, target: ${target.toString()}`,
		);
		return await this.connect(
			HederaERC20,
			address.toString(),
		).getSupplierAllowance(target.toString());
	}

	async getReserveDecimals(address: EvmAddress): Promise<number> {
		LogService.logTrace(
			`Requesting balanceOf address: ${address.toString()}`,
		);
		return await this.connect(Reserve, address.toString()).decimals();
	}

	async getERC20List(factoryAddress: EvmAddress): Promise<string[]> {
		LogService.logTrace(
			`Requesting getERC20List factoryAddress: ${factoryAddress.toString()}`,
		);
		return await this.connect(
			Factory,
			factoryAddress.toString(),
		).getHederaERC20Address();
	}
}
