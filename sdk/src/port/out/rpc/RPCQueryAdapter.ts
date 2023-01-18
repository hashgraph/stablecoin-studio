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

import { ContractFactory, ethers } from 'ethers';
import { singleton } from 'tsyringe';
import { lazyInject } from '../../../core/decorator/LazyInjectDecorator.js';
import NetworkService from '../../../app/service/NetworkService.js';
import LogService from '../../../app/service/LogService.js';

type CallableContractFn<T extends ContractFactory> = Extract<
	T,
	CallableFunction
>;

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

	async execute(
		target: any,
		address: string,
		query: any,
		args: any[],
	): Promise<any> {
		try {
			console.log(target)
			const contract = target.connect(address, this.provider);
			console.log(contract)
			return await contract[query](...args);
		} catch (error) {
			console.error(error);
		}
	}
}
