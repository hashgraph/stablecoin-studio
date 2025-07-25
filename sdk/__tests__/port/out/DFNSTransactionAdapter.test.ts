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
	DFNSConfigRequest,
} from '../../../src/port/in/request/ConnectRequest';
import {
	DECIMALS,
	DFNS_SETTINGS,
	FACTORY_ADDRESS,
	MIRROR_NODE,
	RESOLVER_ADDRESS,
	RPC_NODE,
} from '../../config';
import Injectable from '../../../src/core/Injectable';
import { Time } from '../../../src/core/Time';
import { CONFIG_SC, DEFAULT_VERSION } from '../../../src/core/Constants';

const initialSupply = 1000;
const configId = CONFIG_SC;
const configVersion = DEFAULT_VERSION;

describe('🧪 DFNSTransactionAdapter test', () => {
	let stableCoinHTS: StableCoinViewModel;

	const mirrorNode: MirrorNode = {
		name: MIRROR_NODE.name,
		baseUrl: MIRROR_NODE.baseUrl,
	};

	const rpcNode: JsonRpcRelay = {
		name: RPC_NODE.name,
		baseUrl: RPC_NODE.baseUrl,
	};

	const dfnsSettings: DFNSConfigRequest = {
		authorizationToken: DFNS_SETTINGS.authorizationToken,
		credentialId: DFNS_SETTINGS.credentialId,
		serviceAccountPrivateKey: DFNS_SETTINGS.serviceAccountPrivateKeyPath,
		urlApplicationOrigin: DFNS_SETTINGS.urlApplicationOrigin,
		applicationId: DFNS_SETTINGS.applicationId,
		baseUrl: DFNS_SETTINGS.baseUrl,
		walletId: DFNS_SETTINGS.walletId,
		hederaAccountId: DFNS_SETTINGS.hederaAccountId,
		publicKey: DFNS_SETTINGS.hederaAccountPublicKey,
	};

	const requestPublicKey: RequestPublicKey = {
		key: DFNS_SETTINGS.hederaAccountPublicKey,
	};

	beforeAll(async () => {
		await Network.connect(
			new ConnectRequest({
				network: 'testnet',
				wallet: SupportedWallets.DFNS,
				mirrorNode: mirrorNode,
				rpcNode: rpcNode,
				custodialWalletSettings: dfnsSettings,
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
		const requestCreateStableCoin = new CreateRequest({
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
			createReserve: false,
			grantKYCToOriginalSender: true,
			burnRoleAccount: DFNS_SETTINGS.hederaAccountId,
			rescueRoleAccount: DFNS_SETTINGS.hederaAccountId,
			deleteRoleAccount: DFNS_SETTINGS.hederaAccountId,
			cashInRoleAccount: DFNS_SETTINGS.hederaAccountId,
			proxyOwnerAccount: DFNS_SETTINGS.hederaAccountId,
			cashInRoleAllowance: '0',
			metadata: '',
			configId: configId,
			configVersion: configVersion,
		});

		stableCoinHTS = (await StableCoin.create(requestCreateStableCoin)).coin;

		await Time.delay(5, 'seconds');
	}, 60_000);

	it('DFNS should create a Stable Coin', async () => {
		expect(stableCoinHTS?.tokenId).not.toBeNull();
	}, 60_000);

	it('DFNS should associate a token', async () => {
		const result = await StableCoin.associate(
			new AssociateTokenRequest({
				targetId: DFNS_SETTINGS.hederaAccountId,
				tokenId: stableCoinHTS?.tokenId?.toString() ?? '0.0.0',
			}),
		);
		expect(result).toBe(true);
	}, 60_000);
});
