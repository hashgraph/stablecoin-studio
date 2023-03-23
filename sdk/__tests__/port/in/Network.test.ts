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

import NetworkService from '../../../src/app/service/NetworkService.js';
import Injectable from '../../../src/core/Injectable.js';
import {
	InitializationRequest,
	Network,
	SetNetworkRequest,
} from '../../../src/index.js';
import ConnectRequest, {
	SupportedWallets,
} from '../../../src/port/in/request/ConnectRequest.js';

import {
	CLIENT_ACCOUNT_ED25519,
	FACTORY_ADDRESS,
	HEDERA_ERC20_ADDRESS,
} from '../../config.js';

describe('🧪 Network test', () => {
	afterEach(() => {
		// restore the spy created with spyOn
		jest.restoreAllMocks();
	});

	const networkService = Injectable.resolve(NetworkService);
	it('Starts as testnet network', async () => {
		expect(networkService.environment).toEqual('testnet');
		expect(networkService.consensusNodes).toBeUndefined();
		expect(networkService.mirrorNode).toBeUndefined();
		expect(networkService.rpcNode).toBeUndefined();
	}, 60_000);

	it('Connects to a client', async () => {
		const spy = jest.spyOn(Network, 'connect');
		const params = {
			network: 'testnet',
			wallet: SupportedWallets.CLIENT,
			account: {
				accountId: CLIENT_ACCOUNT_ED25519.id.toString(),
				privateKey: CLIENT_ACCOUNT_ED25519.privateKey,
			},
		};
		const init = await Network.connect(new ConnectRequest(params));
		expect(spy).toHaveBeenCalled();
		expect(networkService.environment).toEqual(params.network);
		expect(init).toBeTruthy();
		expect(init.account?.id.toString()).toEqual(params.account.accountId);
		expect(init.account?.privateKey).toEqual(params.account.privateKey);
	}, 60_000);

	it('Initializes the network', async () => {
		const spy = jest.spyOn(Network, 'init');
		const init = await Network.init(
			new InitializationRequest({
				network: 'previewnet',
				configuration: {
					factoryAddress: FACTORY_ADDRESS,
				},
			}),
		);
		expect(spy).toHaveBeenCalled();
		expect(networkService.consensusNodes).toBeUndefined();
		expect(networkService.mirrorNode).toBeUndefined();
		expect(networkService.rpcNode).toBeUndefined();
		expect(networkService.environment).toEqual('previewnet');
		expect(networkService.configuration).toStrictEqual({
			factoryAddress: FACTORY_ADDRESS,
			hederaERC20Address: HEDERA_ERC20_ADDRESS,
		});
		expect(init).toBeTruthy();
		expect(init.length).toBeGreaterThan(0);
	}, 60_000);

	it('Sets the network', async () => {
		const spy = jest.spyOn(Network, 'setNetwork');
		const params = {
			environment: 'previewnet',
			consensusNodes: 'nodes',
			mirrorNode: 'example.com',
			rpcNode: 'example.com',
		};
		const init = await Network.setNetwork(new SetNetworkRequest(params));
		expect(spy).toHaveBeenCalled();
		expect(networkService.consensusNodes).toEqual(params.consensusNodes);
		expect(networkService.mirrorNode).toEqual(params.mirrorNode);
		expect(networkService.rpcNode).toEqual(params.rpcNode);
		expect(networkService.environment).toEqual(params.environment);
		expect(init).toBeTruthy();
		expect(init.environment).toEqual(params.environment);
		expect(init.mirrorNode).toEqual(params.mirrorNode);
		expect(init.consensusNodes).toEqual(params.consensusNodes);
		expect(init.rpcNode).toEqual(params.rpcNode);
	}, 60_000);
});
