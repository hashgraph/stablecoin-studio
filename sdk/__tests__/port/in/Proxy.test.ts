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

import Injectable from '../../../src/core/Injectable.js';
import {
	Account,
	Network,
	StableCoin,
	StableCoinViewModel,
	TokenSupplyType,
	Proxy,
	Factory,
	ProxyConfigurationViewModel,
} from '../../../src/index.js';
import {
	ChangeProxyOwnerRequest,
	CreateRequest,
	GetProxyConfigRequest,
	InitializationRequest,
	GetTokenManagerListRequest,
	UpgradeImplementationRequest,
} from '../../../src/port/in/request/index.js';
import ConnectRequest, {
	SupportedWallets,
} from '../../../src/port/in/request/ConnectRequest.js';

import {
	CLIENT_ACCOUNT_ED25519,
	CLIENT_ACCOUNT_ECDSA,
	FACTORY_ADDRESS,
	HEDERA_TOKEN_MANAGER_ADDRESS,
} from '../../config.js';
import ContractId from 'domain/context/contract/ContractId.js';
import { MirrorNode } from '../../../src/domain/context/network/MirrorNode.js';
import { JsonRpcRelay } from '../../../src/domain/context/network/JsonRpcRelay.js';

const mirrorNode: MirrorNode = {
	name: 'testmirrorNode',
	baseUrl: 'https://testnet.mirrornode.hedera.com/api/v1/',
};

const rpcNode: JsonRpcRelay = {
	name: 'testrpcNode',
	baseUrl: 'https://testnet.hashio.io/api',
};

describe('🧪 Proxy test', () => {
	let stableCoinSC: StableCoinViewModel;

	const delay = async (seconds = 3): Promise<void> => {
		seconds = seconds * 1000;
		await new Promise((r) => setTimeout(r, seconds));
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
		const requestSC = new CreateRequest({
			name: 'TEST_ACCELERATOR_SC',
			symbol: 'TEST',
			decimals: '6',
			initialSupply: '1000',
			freezeKey: Account.NullPublicKey,
			kycKey: Account.NullPublicKey,
			wipeKey: Account.NullPublicKey,
			pauseKey: Account.NullPublicKey,
			supplyType: TokenSupplyType.INFINITE,
			stableCoinFactory: FACTORY_ADDRESS,
			hederaTokenManager: HEDERA_TOKEN_MANAGER_ADDRESS,
			createReserve: true,
			grantKYCToOriginalSender: true,
			burnRoleAccount: CLIENT_ACCOUNT_ED25519.id.toString(),
			rescueRoleAccount: CLIENT_ACCOUNT_ED25519.id.toString(),
			deleteRoleAccount: CLIENT_ACCOUNT_ED25519.id.toString(),
			reserveInitialAmount: '1000',
		});
		stableCoinSC = (await StableCoin.create(requestSC)).coin;

		await delay();
	}, 60_000);

	it('Upgrade proxy implementation', async () => {
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

	it('Changes proxy owner', async () => {
		let proxyConfig: ProxyConfigurationViewModel =
			await Proxy.getProxyConfig(
				new GetProxyConfigRequest({
					tokenId: stableCoinSC?.tokenId?.toString() ?? '0.0.0',
				}),
			);

		expect(proxyConfig.owner.toString()).toBe(
			CLIENT_ACCOUNT_ED25519.id.toString(),
		);

		await Proxy.changeProxyOwner(
			new ChangeProxyOwnerRequest({
				tokenId: stableCoinSC?.tokenId?.toString() ?? '0.0.0',
				targetId: CLIENT_ACCOUNT_ECDSA.id.toString(),
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

		await Network.connect(
			new ConnectRequest({
				account: {
					accountId: CLIENT_ACCOUNT_ECDSA.id.toString(),
					privateKey: CLIENT_ACCOUNT_ECDSA.privateKey,
				},
				network: 'testnet',
				wallet: SupportedWallets.CLIENT,
				mirrorNode: mirrorNode,
				rpcNode: rpcNode,
			}),
		);

		await Proxy.changeProxyOwner(
			new ChangeProxyOwnerRequest({
				tokenId: stableCoinSC?.tokenId?.toString() ?? '0.0.0',
				targetId: CLIENT_ACCOUNT_ED25519.id.toString(),
			}),
		);

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
	}, 60_000);
});
