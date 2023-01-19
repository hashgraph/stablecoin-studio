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

import { BigNumber, ContractFactory, ethers } from 'ethers';
import { singleton } from 'tsyringe';
import { lazyInject } from '../../../core/decorator/LazyInjectDecorator.js';
import NetworkService from '../../../app/service/NetworkService.js';
import LogService from '../../../app/service/LogService.js';
import { HederaERC20__factory } from 'hedera-stable-coin-contracts';
import { StableCoinRole } from '../../../domain/context/stablecoin/StableCoinRole.js';

const Factory = HederaERC20__factory;

@singleton()
export default class RPCQueryAdapter {
	provider: ethers.providers.JsonRpcProvider;

	constructor(
		@lazyInject(NetworkService)
		private readonly networkService: NetworkService,
	) {}

	async init(customUrl?: string): Promise<string> {
		const url =
			customUrl ??
			`https://${this.networkService.environment.toString()}.hashio.io/api`;
		this.provider = new ethers.providers.JsonRpcProvider(url);
		LogService.logTrace('RPC Query Adapter Initialized on: ', url);

		return this.networkService.environment;
	}

	async balanceOf(address: string, target: string): Promise<BigNumber> {
		return await Factory.connect(
			address,
			this.provider,
		).balanceOf(target);
	}

	async getReserveAddress(address: string): Promise<string> {
		return await Factory.connect(
			address,
			this.provider,
		).getReserveAddress();
	}
	async getReserveAmount(address: string): Promise<BigNumber> {
		return await Factory.connect(
			address,
			this.provider,
		).getReserveAmount();
	}

	async isLimited(address: string, target: string): Promise<boolean> {
		return await Factory.connect(
			address,
			this.provider,
		).isUnlimitedSupplierAllowance(target);
	}

	async isUnlimited(address: string, target: string): Promise<boolean> {
		return await Factory.connect(
			address,
			this.provider,
		).isUnlimitedSupplierAllowance(target);
	}

	async getRoles(address: string, target: string): Promise<string[]> {
		console.log(this.provider, address, target);
		return await Factory.connect(
			address,
			this.provider,
		).getRoles(target);
	}

	async hasRole(
		address: string,
		target: string,
		role: StableCoinRole,
	): Promise<boolean> {
		console.log(this.provider, address, target, role);
		return await Factory.connect(
			address,
			this.provider,
		).hasRole(role, target);
	}

	async supplierAllowance(
		address: string,
		target: string,
	): Promise<BigNumber> {
		console.log(this.provider, address, target);
		return await Factory.connect(
			address,
			this.provider,
		).getSupplierAllowance(target);
	}
}
