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
	FireblocksConfigRequest,
} from '../../../src/port/in/request/ConnectRequest';
import {
	FACTORY_ADDRESS,
	FIREBLOCKS_SETTINGS,
	HEDERA_TOKEN_MANAGER_ADDRESS,
} from '../../config';
import Injectable from '../../../src/core/Injectable';
import * as fs from 'fs';
import * as path from 'path';

const decimals = 6;
const initialSupply = 1000;
const apiSecretKey = fs.readFileSync(
	path.resolve(FIREBLOCKS_SETTINGS.apiSecretKeyPath),
	'utf8',
);

describe('🧪 FireblocksTransactionAdapter test', () => {
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
				},
				mirrorNode: mirrorNode,
				rpcNode: rpcNode,
			}),
		);
		Injectable.resolveTransactionHandler();
	}, 80_000);

	it('Fireblocks should create a Stable Coin', async () => {
		const requesCreateStableCoin = new CreateRequest({
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
			burnRoleAccount: FIREBLOCKS_SETTINGS.hederaAccountId,
			rescueRoleAccount: FIREBLOCKS_SETTINGS.hederaAccountId,
			deleteRoleAccount: FIREBLOCKS_SETTINGS.hederaAccountId,
			cashInRoleAccount: FIREBLOCKS_SETTINGS.hederaAccountId,
			cashInRoleAllowance: '0',
			metadata: '',
		});

		stableCoinHTS = (await StableCoin.create(requesCreateStableCoin)).coin;
		expect(stableCoinHTS?.tokenId).not.toBeNull();
	}, 80_000);

	it('Fireblocks should associate a token', async () => {
		await StableCoin.associate(
			new AssociateTokenRequest({
				targetId: FIREBLOCKS_SETTINGS.hederaAccountId,
				tokenId: stableCoinHTS?.tokenId?.toString() ?? '0.0.0',
			}),
		);
	}, 80_000);
});
