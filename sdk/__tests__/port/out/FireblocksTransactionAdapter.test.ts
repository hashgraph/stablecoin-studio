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

jest.resetModules();
jest.unmock('../../../src/port/out/mirror/MirrorNodeAdapter.ts');
jest.unmock('../../../src/port/out/rpc/RPCQueryAdapter.ts');
jest.unmock('axios');

import {
	AssociateTokenRequest,
	CreateRequest,
	InitializationRequest,
	Network,
	RequestPublicKey,
	StableCoin,
	StableCoinViewModel,
	SupportedWallets,
	TokenSupplyType,
} from '../../../src';
import { MirrorNode } from '../../../src/domain/context/network/MirrorNode';
import { JsonRpcRelay } from '../../../src/domain/context/network/JsonRpcRelay';
import ConnectRequest, {
	FireblocksConfigRequest,
} from '../../../src/port/in/request/ConnectRequest';
import {
	DECIMALS,
	FACTORY_ADDRESS,
	FIREBLOCKS_SETTINGS,
	MIRROR_NODE,
	RESOLVER_ADDRESS,
	RPC_NODE,
} from '../../config';
import Injectable from '../../../src/core/Injectable';
import { Time } from '../../../src/core/Time';

const initialSupply = 1000;
const apiSecretKey = FIREBLOCKS_SETTINGS.apiSecretKeyPath;
const configId =
	'0x0000000000000000000000000000000000000000000000000000000000000000';
const configVersion = 0;

describe('🧪 FireblocksTransactionAdapter test', () => {
	let stableCoinHTS: StableCoinViewModel;

	const mirrorNode: MirrorNode = {
		name: MIRROR_NODE.name,
		baseUrl: MIRROR_NODE.baseUrl,
	};

	const rpcNode: JsonRpcRelay = {
		name: RPC_NODE.name,
		baseUrl: RPC_NODE.baseUrl,
	};

	const fireblocksSettings: FireblocksConfigRequest = {
		apiSecretKey: apiSecretKey,
		apiKey: FIREBLOCKS_SETTINGS.apiKey,
		baseUrl: FIREBLOCKS_SETTINGS.baseUrl,
		vaultAccountId: FIREBLOCKS_SETTINGS.vaultAccountId,
		assetId: FIREBLOCKS_SETTINGS.assetId,
		hederaAccountId: FIREBLOCKS_SETTINGS.hederaAccountId,
	};

	const requestPublicKey: RequestPublicKey = {
		key: FIREBLOCKS_SETTINGS.hederaAccountPublicKey,
	};

	beforeAll(async () => {
		await Network.connect(
			new ConnectRequest({
				network: 'testnet',
				wallet: SupportedWallets.FIREBLOCKS,
				mirrorNode: mirrorNode,
				rpcNode: rpcNode,
				custodialWalletSettings: fireblocksSettings,
			}),
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
		Injectable.resolveTransactionHandler();
		const requesCreateStableCoin = new CreateRequest({
			name: 'TEST_ACCELERATOR_HTS',
			symbol: 'TEST',
			decimals: DECIMALS,
			initialSupply: initialSupply.toString(),
			freezeKey: requestPublicKey,
			kycKey: requestPublicKey,
			wipeKey: requestPublicKey,
			pauseKey: requestPublicKey,
			supplyType: TokenSupplyType.INFINITE,
			stableCoinFactory: FACTORY_ADDRESS,
			reserveInitialAmount: '1000000',
			createReserve: true,
			grantKYCToOriginalSender: true,
			burnRoleAccount: FIREBLOCKS_SETTINGS.hederaAccountId,
			rescueRoleAccount: FIREBLOCKS_SETTINGS.hederaAccountId,
			deleteRoleAccount: FIREBLOCKS_SETTINGS.hederaAccountId,
			cashInRoleAccount: FIREBLOCKS_SETTINGS.hederaAccountId,
			proxyOwnerAccount: FIREBLOCKS_SETTINGS.hederaAccountId,
			cashInRoleAllowance: '0',
			metadata: '',
			configId: configId,
			configVersion: configVersion,
		});

		stableCoinHTS = (await StableCoin.create(requesCreateStableCoin)).coin;
		await Time.delay(5, 'seconds');
	}, 80_000);

	it('Fireblocks should create a Stable Coin', async () => {
		expect(stableCoinHTS?.tokenId).not.toBeNull();
	}, 80_000);

	it('Fireblocks should associate a token', async () => {
		const result = await StableCoin.associate(
			new AssociateTokenRequest({
				targetId: FIREBLOCKS_SETTINGS.hederaAccountId,
				tokenId: stableCoinHTS?.tokenId?.toString() ?? '0.0.0',
			}),
		);
		expect(result).toBe(true);
	}, 80_000);
});
