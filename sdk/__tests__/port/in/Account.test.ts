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

import { Account, Network } from '../../../src/index.js';
import {
	GetAccountInfoRequest,
	GetListStableCoinRequest,
	GetPublicKeyRequest,
} from '../../../src/port/in/request/index.js';
import ConnectRequest, {
	SupportedWallets,
} from '../../../src/port/in/request/ConnectRequest.js';

import {
	CLIENT_ACCOUNT_ED25519,
	CLIENT_PUBLIC_KEY_ED25519,
	MIRROR_NODE,
	RPC_NODE,
} from '../../config.js';
import { MirrorNode } from '../../../src/domain/context/network/MirrorNode.js';
import { JsonRpcRelay } from '../../../src/domain/context/network/JsonRpcRelay.js';

describe('🧪 Account test', () => {
	beforeAll(async () => {
		const mirrorNode: MirrorNode = {
			name: MIRROR_NODE.name,
			baseUrl: MIRROR_NODE.baseUrl,
		};
		
		const rpcNode: JsonRpcRelay = {
			name: RPC_NODE.name,
			baseUrl: RPC_NODE.baseUrl,
		};

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

	it('Gets a public key', async () => {
		const res = await Account.getPublicKey(
			new GetPublicKeyRequest({
				account: {
					accountId: CLIENT_ACCOUNT_ED25519.id.toString(),
					privateKey: CLIENT_ACCOUNT_ED25519.privateKey,
				},
			}),
		);
		expect(res.toString()).toEqual(CLIENT_PUBLIC_KEY_ED25519.toString());
	}, 60_000);

	it('Lists stablecoins', async () => {
		const res = await Account.listStableCoins(
			new GetListStableCoinRequest({
				account: {
					accountId: CLIENT_ACCOUNT_ED25519.id.toString(),
				},
			}),
		);
		expect(res.coins).not.toBeFalsy();
		expect(res.coins.length).toBeDefined();
		expect(res.coins[0]).toHaveProperty('symbol');
	}, 60_000);

	it('Gets account info', async () => {
		const res = await Account.getInfo(
			new GetAccountInfoRequest({
				account: {
					accountId: CLIENT_ACCOUNT_ED25519.id.toString(),
				},
			}),
		);
		expect(res).not.toBeFalsy();
		expect(res.id).toBeDefined();
		expect(res.id).toEqual(CLIENT_ACCOUNT_ED25519.id.toString());
		expect(res.publicKey).toBeDefined();
		expect(res.publicKey).toEqual(CLIENT_PUBLIC_KEY_ED25519);
	}, 60_000);
});
