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

/* eslint-disable jest/no-disabled-tests */
import {
	Account,
	Network,
	StableCoin,
	StableCoinViewModel,
	TokenSupplyType,
	Proxy,
	Factory,
	ProxyConfigurationViewModel,
	HederaId,
} from '../../../src/index.js';
import {
	ChangeProxyOwnerRequest,
	CreateRequest,
	GetProxyConfigRequest,
	InitializationRequest,
	GetTokenManagerListRequest,
	UpgradeImplementationRequest,
	GetFactoryProxyConfigRequest,
	UpgradeFactoryImplementationRequest,
	ChangeFactoryProxyOwnerRequest,
	AcceptProxyOwnerRequest,
	AcceptFactoryProxyOwnerRequest,
} from '../../../src/port/in/request/index.js';
import ConnectRequest, {
	SupportedWallets,
} from '../../../src/port/in/request/ConnectRequest.js';
import {
	CLIENT_ACCOUNT_ED25519_2,
	CLIENT_ACCOUNT_ED25519,
	CLIENT_ACCOUNT_ECDSA,
	FACTORY_ADDRESS,
	HEDERA_TOKEN_MANAGER_ADDRESS,
	MIRROR_NODE,
	RPC_NODE,
} from '../../config.js';
import ContractId from 'domain/context/contract/ContractId.js';
import { MirrorNode } from '../../../src/domain/context/network/MirrorNode.js';
import { JsonRpcRelay } from '../../../src/domain/context/network/JsonRpcRelay.js';
import Injectable from '../../../src/core/Injectable.js';

const mirrorNode: MirrorNode = {
	name: MIRROR_NODE.name,
	baseUrl: MIRROR_NODE.baseUrl,
};

const rpcNode: JsonRpcRelay = {
	name: RPC_NODE.name,
	baseUrl: RPC_NODE.baseUrl,
};

describe('🧪 Proxy test', () => {
	const stableCoinSC = {
		tokenId: new HederaId('0.0.7777777'),
	};

	beforeAll(async () => {
		await Network.connect(
			new ConnectRequest({
				account: {
					accountId: CLIENT_ACCOUNT_ED25519.id.toString(),
					privateKey: CLIENT_ACCOUNT_ED25519.privateKey,
				},
				network: 'testnet',
				wallet: SupportedWallets.CLIENT,
				mirrorNode: mirrorNode,
				rpcNode: rpcNode,
			}),
		);
		await Network.init(
			new InitializationRequest({
				network: 'testnet',
				configuration: {
					factoryAddress: FACTORY_ADDRESS,
				},
				mirrorNode: mirrorNode,
				rpcNode: rpcNode,
			}),
		);
		Injectable.resolveTransactionHandler();
	}, 60_000);

	it('Upgrade SC proxy implementation', async () => {
		let proxyConfig: ProxyConfigurationViewModel =
			await Proxy.getProxyConfig(
				new GetProxyConfigRequest({
					tokenId: stableCoinSC?.tokenId?.toString() ?? '0.0.0',
				}),
			);
		expect(proxyConfig.implementationAddress.toString()).toBe(
			HEDERA_TOKEN_MANAGER_ADDRESS,
		);

		const contracts: ContractId[] = await Factory.getHederaTokenManagerList(
			new GetTokenManagerListRequest({ factoryId: FACTORY_ADDRESS }),
		);
		await Proxy.upgradeImplementation(
			new UpgradeImplementationRequest({
				tokenId: stableCoinSC?.tokenId?.toString() ?? '0.0.0',
				implementationAddress: contracts[0].toString(),
			}),
		);

		proxyConfig = await Proxy.getProxyConfig(
			new GetProxyConfigRequest({
				tokenId: stableCoinSC?.tokenId?.toString() ?? '0.0.0',
			}),
		);

		expect(proxyConfig.implementationAddress.toString()).toBe(
			contracts[0].toString(),
		);

		await Proxy.upgradeImplementation(
			new UpgradeImplementationRequest({
				tokenId: stableCoinSC?.tokenId?.toString() ?? '0.0.0',
				implementationAddress: HEDERA_TOKEN_MANAGER_ADDRESS,
			}),
		);
	}, 60_000);

	it('Changes SC proxy owner', async () => {
		await Proxy.changeProxyOwner(
			new ChangeProxyOwnerRequest({
				tokenId: stableCoinSC?.tokenId?.toString() ?? '0.0.0',
				targetId: CLIENT_ACCOUNT_ECDSA.id.toString(),
			}),
		);

		let proxyConfig = await Proxy.getProxyConfig(
			new GetProxyConfigRequest({
				tokenId: stableCoinSC?.tokenId?.toString() ?? '0.0.0',
			}),
		);

		expect(proxyConfig.pendingOwner.toString()).toBe(
			CLIENT_ACCOUNT_ECDSA.id.toString(),
		);

		await Proxy.acceptProxyOwner(
			new AcceptProxyOwnerRequest({
				tokenId: stableCoinSC?.tokenId?.toString() ?? '0.0.0',
			}),
		);

		proxyConfig = await Proxy.getProxyConfig(
			new GetProxyConfigRequest({
				tokenId: stableCoinSC?.tokenId?.toString() ?? '0.0.0',
			}),
		);

		expect(proxyConfig.owner.toString()).toBe(
			CLIENT_ACCOUNT_ECDSA.id.toString(),
		);
	}, 80_000);

	it('Upgrade Factory proxy implementation', async () => {
		const contract = '0.0.1234567';

		await Proxy.upgradeFactoryImplementation(
			new UpgradeFactoryImplementationRequest({
				factoryId: FACTORY_ADDRESS,
				implementationAddress: contract,
			}),
		);

		const factoryProxyConfig = await Proxy.getFactoryProxyConfig(
			new GetFactoryProxyConfigRequest({
				factoryId: FACTORY_ADDRESS,
			}),
		);

		expect(factoryProxyConfig.implementationAddress.toString()).toBe(
			contract,
		);
	}, 60_000);

	it('Changes Factory proxy owner', async () => {
		await Proxy.changeFactoryProxyOwner(
			new ChangeFactoryProxyOwnerRequest({
				factoryId: FACTORY_ADDRESS,
				targetId: CLIENT_ACCOUNT_ED25519.id.toString(),
			}),
		);

		let factoryProxyConfig = await Proxy.getFactoryProxyConfig(
			new GetFactoryProxyConfigRequest({
				factoryId: FACTORY_ADDRESS,
			}),
		);

		expect(factoryProxyConfig.pendingOwner.toString()).toBe(
			CLIENT_ACCOUNT_ED25519.id.toString(),
		);

		await Proxy.acceptFactoryProxyOwner(
			new AcceptFactoryProxyOwnerRequest({
				factoryId: FACTORY_ADDRESS,
			}),
		);

		factoryProxyConfig = await Proxy.getFactoryProxyConfig(
			new GetFactoryProxyConfigRequest({
				factoryId: FACTORY_ADDRESS,
			}),
		);

		expect(factoryProxyConfig.owner.toString()).toBe(
			CLIENT_ACCOUNT_ED25519.id.toString(),
		);
	}, 80_000);
});
