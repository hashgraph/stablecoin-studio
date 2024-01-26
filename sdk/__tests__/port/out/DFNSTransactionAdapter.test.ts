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
	DFNS_SETTINGS,
	FACTORY_ADDRESS,
	HEDERA_TOKEN_MANAGER_ADDRESS,
} from '../../config';
import Injectable from '../../../src/core/Injectable';
import * as fs from 'fs';
import * as path from 'path';

const decimals = 6;
const initialSupply = 1000;
const apiSecretKey = fs.readFileSync(
	path.resolve(DFNS_SETTINGS.serviceAccountPrivateKeyPath),
	'utf8',
);

describe('🧪 DFNSTransactionAdapter test', () => {
	let stableCoinHTS: StableCoinViewModel;

	const delay = async (seconds = 5): Promise<void> => {
		seconds = seconds * 1000;
		await new Promise((r) => setTimeout(r, seconds));
	};

	const mirrorNode: MirrorNode = {
		name: 'testmirrorNode',
		baseUrl: 'https://testnet.mirrornode.hedera.com/api/v1/',
	};

	const rpcNode: JsonRpcRelay = {
		name: 'testrpcNode',
		baseUrl: 'http://127.0.0.1:7546/api',
	};

	const dfnsSettings: DFNSConfigRequest = {
		authorizationToken: DFNS_SETTINGS.authorizationToken,
		credentialId: DFNS_SETTINGS.credentialId,
		serviceAccountPrivateKey: apiSecretKey,
		urlApplicationOrigin: DFNS_SETTINGS.urlApplicationOrigin,
		applicationId: DFNS_SETTINGS.applicationId,
		baseUrl: DFNS_SETTINGS.baseUrl,
		walletId: DFNS_SETTINGS.walletId,
		hederaAccountId: DFNS_SETTINGS.hederaAccountId,
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
				},
				mirrorNode: mirrorNode,
				rpcNode: rpcNode,
			}),
		);
		Injectable.resolveTransactionHandler();
		await delay();
	}, 60_000);

	it('DFNS should create a Stable Coin', async () => {
		const requestCreateStableCoin = new CreateRequest({
			name: 'TEST_ACCELERATOR_HTS',
			symbol: 'TEST',
			decimals: decimals,
			initialSupply: initialSupply.toString(),
			freezeKey: requestPublicKey,
			kycKey: requestPublicKey,
			wipeKey: requestPublicKey,
			pauseKey: requestPublicKey,
			supplyType: TokenSupplyType.INFINITE,
			stableCoinFactory: FACTORY_ADDRESS,
			hederaTokenManager: HEDERA_TOKEN_MANAGER_ADDRESS,
			reserveInitialAmount: '1000000',
			createReserve: true,
			grantKYCToOriginalSender: true,
			burnRoleAccount: DFNS_SETTINGS.hederaAccountId,
			rescueRoleAccount: DFNS_SETTINGS.hederaAccountId,
			deleteRoleAccount: DFNS_SETTINGS.hederaAccountId,
			cashInRoleAccount: DFNS_SETTINGS.hederaAccountId,
			cashInRoleAllowance: '0',
			metadata: '',
		});

		stableCoinHTS = (await StableCoin.create(requestCreateStableCoin)).coin;
		expect(stableCoinHTS?.tokenId).not.toBeNull();
	}, 60_000);

	it('DFNS should associate a token', async () => {
		await StableCoin.associate(
			new AssociateTokenRequest({
				targetId: DFNS_SETTINGS.hederaAccountId,
				tokenId: stableCoinHTS?.tokenId?.toString() ?? '0.0.0',
			}),
		);
	}, 60_000);
});
