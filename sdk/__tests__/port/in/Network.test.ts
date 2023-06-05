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
	SetConfigurationRequest,
	SetNetworkRequest,
} from '../../../src/index.js';
import {
	testnet,
	previewnet,
	unrecognized,
} from '../../../src/domain/context/network/Environment.js';
import ConnectRequest, {
	SupportedWallets,
} from '../../../src/port/in/request/ConnectRequest.js';

import { CLIENT_ACCOUNT_ED25519, FACTORY_ADDRESS } from '../../config.js';
import { MirrorNode } from 'domain/context/network/MirrorNode.js';
import { JsonRpcRelay } from 'domain/context/network/JsonRpcRelay.js';

const mirrorNode: MirrorNode = {
	name: 'testmirrorNode',
	baseUrl: 'https://testnet.mirrornode.hedera.com/api/v1/',
};

const rpcNode: JsonRpcRelay = {
	name: 'testrpcNode',
	baseUrl: 'http://127.0.0.1:7546/api',
};

describe('🧪 Network test', () => {
	afterEach(() => {
		// restore the spy created with spyOn
		jest.restoreAllMocks();
	});

	const networkService = Injectable.resolve(NetworkService);
	it('Starts as testnet network', async () => {
		expect(networkService.environment).toEqual(testnet);
		expect(networkService.consensusNodes).toBeUndefined();
		expect(networkService.mirrorNode.baseUrl).toEqual(
			'https://testnet.mirrornode.hedera.com',
		);
		expect(networkService.mirrorNode.name).toEqual('default');
		expect(networkService.mirrorNode.apiKey).toBeUndefined();
		expect(networkService.mirrorNode.headerName).toBeUndefined();
		expect(networkService.rpcNode.baseUrl).toEqual(
			'https://testnet.hashio.io/api',
		);
		expect(networkService.rpcNode.name).toEqual('default');
		expect(networkService.rpcNode.apiKey).toBeUndefined();
		expect(networkService.rpcNode.headerName).toBeUndefined();
	}, 60_000);

	it('Connects to a client', async () => {
		const spy = jest.spyOn(Network, 'connect');
		const params = {
			network: testnet,
			wallet: SupportedWallets.CLIENT,
			account: {
				accountId: CLIENT_ACCOUNT_ED25519.id.toString(),
				privateKey: CLIENT_ACCOUNT_ED25519.privateKey,
			},
			mirrorNode: mirrorNode,
			rpcNode: rpcNode,
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
				network: testnet,
				configuration: {
					factoryAddress: FACTORY_ADDRESS,
				},
				mirrorNode: mirrorNode,
				rpcNode: rpcNode,
			}),
		);
		expect(spy).toHaveBeenCalled();
		expect(networkService.consensusNodes).toBeUndefined();
		expect(networkService.rpcNode.name).toEqual(rpcNode.name);
		expect(networkService.rpcNode.baseUrl).toEqual(rpcNode.baseUrl);
		expect(networkService.rpcNode.apiKey).toEqual(rpcNode.apiKey);
		expect(networkService.rpcNode.headerName).toEqual(rpcNode.headerName);
		expect(networkService.environment).toEqual(testnet);
		expect(networkService.mirrorNode.name).toEqual(mirrorNode.name);
		expect(networkService.mirrorNode.baseUrl).toEqual(mirrorNode.baseUrl);
		expect(networkService.mirrorNode.apiKey).toEqual(mirrorNode.apiKey);
		expect(networkService.mirrorNode.headerName).toEqual(
			mirrorNode.headerName,
		);
		expect(networkService.configuration.factoryAddress).toEqual(
			FACTORY_ADDRESS,
		);
		expect(init).toBeTruthy();
		expect(init.length).toBeGreaterThan(0);
	}, 60_000);

	it('Gets factory and network', async () => {
		const factoryAddress = await Network.getFactoryAddress();
		expect(factoryAddress).toEqual(FACTORY_ADDRESS);
		const network = await Network.getNetwork();
		expect(network).toEqual(testnet);
	}, 60_000);

	it('Sets the configuration', async () => {
		await Network.setConfig(
			new SetConfigurationRequest({ factoryAddress: '0.0.1' }),
		);
		expect(networkService.configuration.factoryAddress).toEqual('0.0.1');
		await Network.setConfig(
			new SetConfigurationRequest({ factoryAddress: FACTORY_ADDRESS }),
		);
		expect(networkService.configuration.factoryAddress).toEqual(
			FACTORY_ADDRESS,
		);
	}, 60_000);

	it('Sets the network', async () => {
		const newMirrorNode: MirrorNode = {
			name: 'newMirrorNode',
			baseUrl: 'https://testnet.mirrornode.hedera.com/api/v1/',
			apiKey: 'apiKeyValue',
			headerName: 'httpHeaderName',
		};
		const newRpcNode: JsonRpcRelay = {
			name: 'newRpcNode',
			baseUrl: 'https://testnet.hashio.io/api',
			apiKey: 'apiKeyValue',
			headerName: 'httpHeaderName',
		};
		const spy = jest.spyOn(Network, 'setNetwork');
		const params = {
			environment: previewnet,
			consensusNodes: 'nodes',
			mirrorNode: newMirrorNode,
			rpcNode: newRpcNode,
		};
		const init = await Network.setNetwork(new SetNetworkRequest(params));
		expect(spy).toHaveBeenCalled();
		expect(networkService.consensusNodes).toEqual(params.consensusNodes);
		expect(networkService.mirrorNode.name).toEqual(params.mirrorNode.name);
		expect(networkService.mirrorNode.baseUrl).toEqual(
			params.mirrorNode.baseUrl,
		);
		expect(networkService.mirrorNode.apiKey).toEqual(
			params.mirrorNode.apiKey,
		);
		expect(networkService.mirrorNode.headerName).toEqual(
			params.mirrorNode.headerName,
		);
		expect(networkService.rpcNode.name).toEqual(params.rpcNode.name);
		expect(networkService.rpcNode.baseUrl).toEqual(params.rpcNode.baseUrl);
		expect(networkService.rpcNode.apiKey).toEqual(params.rpcNode.apiKey);
		expect(networkService.rpcNode.headerName).toEqual(
			params.rpcNode.headerName,
		);
		expect(networkService.environment).toEqual(params.environment);
		expect(init).toBeTruthy();
		expect(init.environment).toEqual(params.environment);
		expect(init.mirrorNode.name).toEqual(params.mirrorNode.name);
		expect(init.mirrorNode.baseUrl).toEqual(params.mirrorNode.baseUrl);
		expect(init.mirrorNode.apiKey).toEqual(params.mirrorNode.apiKey);
		expect(init.mirrorNode.headerName).toEqual(
			params.mirrorNode.headerName,
		);
		expect(init.rpcNode.name).toEqual(params.rpcNode.name);
		expect(init.rpcNode.baseUrl).toEqual(params.rpcNode.baseUrl);
		expect(init.rpcNode.apiKey).toEqual(params.rpcNode.apiKey);
		expect(init.rpcNode.headerName).toEqual(params.rpcNode.headerName);
		expect(init.consensusNodes).toEqual(params.consensusNodes);

		const params_2 = {
			environment: testnet,
			consensusNodes: '',
			mirrorNode: mirrorNode,
			rpcNode: rpcNode,
		};

		await Network.setNetwork(new SetNetworkRequest(params_2));
	}, 60_000);

	it('Is the network recognized', async () => {
		const networkOK = await Network.isNetworkRecognized();
		expect(networkOK).toEqual(true);

		const params = {
			environment: unrecognized,
			consensusNodes: '',
			mirrorNode: networkService.mirrorNode,
			rpcNode: networkService.rpcNode,
		};

		await Network.setNetwork(new SetNetworkRequest(params));
		const networkNOK = await Network.isNetworkRecognized();
		expect(networkNOK).toEqual(false);
	}, 60_000);

	it('disconnect Network', async () => {
		jest.spyOn(Network, 'connect');
		const params = {
			network: testnet,
			wallet: SupportedWallets.CLIENT,
			account: {
				accountId: CLIENT_ACCOUNT_ED25519.id.toString(),
				privateKey: CLIENT_ACCOUNT_ED25519.privateKey,
			},
			mirrorNode: mirrorNode,
			rpcNode: rpcNode,
		};
		await Network.connect(new ConnectRequest(params));

		const networkDisconnect = await Network.disconnect();

		expect(networkDisconnect).toEqual(true);
	}, 60_000);
});
