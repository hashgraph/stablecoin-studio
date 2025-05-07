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

import Account from '../../../src/domain/context/account/Account.js';
import {
	GetConfigInfoRequest,
	InitializationRequest,
	Management,
	Network,
	UpdateConfigRequest,
	UpdateConfigVersionRequest,
	UpdateResolverRequest,
} from '../../../src/index';
import { SupportedWallets } from '../../../src/port/in/request/ConnectRequest.js';
import { HederaId } from '../../../src/index.js';
import {
	CLIENT_ACCOUNT_ED25519,
	CLIENT_PUBLIC_KEY_ED25519,
	DECIMALS,
	FACTORY_ADDRESS,
	MIRROR_NODE,
	RESOLVER_ADDRESS,
	RPC_NODE,
} from '../../config.js';
import Injectable from '../../../src/core/Injectable.js';
import StableCoinService from '../../../src/app/service/StableCoinService.js';
import { MirrorNode } from '../../../src/domain/context/network/MirrorNode.js';
import { JsonRpcRelay } from '../../../src/domain/context/network/JsonRpcRelay.js';
import { CommandBus } from '../../../src/core/command/CommandBus.js';
import { ConnectCommand } from '../../../src/app/usecase/command/network/connect/ConnectCommand.js';
import ConfigInfoViewModel from '../../../src/port/in/response/ConfigInfoViewModel.js';

const mirrorNode: MirrorNode = {
	name: MIRROR_NODE.name,
	baseUrl: MIRROR_NODE.baseUrl,
};

const rpcNode: JsonRpcRelay = {
	name: RPC_NODE.name,
	baseUrl: RPC_NODE.baseUrl,
};
const resolver = RESOLVER_ADDRESS;
const configVersion = 1;
const configId =
	'0x0000000000000000000000000000000000000000000000000000000000000001';
let tokenId: string;

describe('🧪 Management test', () => {
	const stableCoinCapabilities = {
		coin: {
			tokenId: new HederaId('0.0.6666666'),
			decimals: DECIMALS,
		},
	};
	tokenId = stableCoinCapabilities.coin.tokenId?.toString();

	beforeAll(async () => {
		await connectAccount(CLIENT_ACCOUNT_ED25519);
		Injectable.resolve(StableCoinService);
	}, 1500000);

	function checkConfig(
		resolver: string,
		configId: string,
		configVersion: number,
		configInfo: ConfigInfoViewModel,
	): boolean {
		expect(configInfo.resolverAddress).toEqual(resolver);
		expect(configInfo.configId).toEqual(configId);
		expect(configInfo.configVersion).toEqual(configVersion);
		return true;
	}

	it('Updates resolver correctly', async () => {
		const request = new UpdateResolverRequest({
			configVersion,
			configId,
			tokenId,
			resolver,
		});
		const res = await Management.updateResolver(request);
		const configInfo = await Management.getConfigInfo(
			new GetConfigInfoRequest({
				tokenId,
			}),
		);
		checkConfig(resolver, configId, configVersion, configInfo);
		expect(res).toBe(true);
	}, 600_000);

	it('Updates configVersion correctly', async () => {
		const newConfigVersion = 2;
		const request = new UpdateConfigVersionRequest({
			configVersion: newConfigVersion,
			tokenId,
		});
		const res = await Management.updateConfigVersion(request);
		const configInfo = await Management.getConfigInfo(
			new GetConfigInfoRequest({
				tokenId,
			}),
		);
		checkConfig(resolver, configId, newConfigVersion, configInfo);
		expect(res).toBe(true);
	}, 600_000);

	it('Updates config correctly', async () => {
		const configVersion = 2;
		const newConfigId =
			'0x0000000000000000000000000000000000000000000000000000000000000003';
		const request = new UpdateConfigRequest({
			configId: newConfigId,
			configVersion: configVersion,
			tokenId,
		});
		const res = await Management.updateConfig(request);
		const configInfo = await Management.getConfigInfo(
			new GetConfigInfoRequest({
				tokenId,
			}),
		);
		checkConfig(resolver, newConfigId, configVersion, configInfo);
		expect(res).toBe(true);
	}, 600_000);
});

async function connectAccount(account: Account): Promise<void> {
	const overrideAccount = {
		...account,
		privateKey: {
			...account.privateKey,
			publicKey: CLIENT_PUBLIC_KEY_ED25519,
		},
	} as unknown as Account;

	const command = Injectable.resolve(CommandBus);

	await command.execute(
		new ConnectCommand(
			'testnet',
			SupportedWallets.CLIENT,
			overrideAccount,
			undefined,
			undefined,
		),
	);

	await Network.init(
		new InitializationRequest({
			network: 'testnet',
			configuration: {
				factoryAddress: FACTORY_ADDRESS,
				resolverAddress: RESOLVER_ADDRESS,
			},
			mirrorNode: mirrorNode,
			rpcNode: rpcNode,
		}),
	);
}
