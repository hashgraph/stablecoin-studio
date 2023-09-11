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

import { LoggerTransports, Network, SDK } from '../../../src/index.js';
import ConnectRequest, {
	SupportedWallets,
} from '../../../src/port/in/request/ConnectRequest.js';
import { CLIENT_ACCOUNT_ED25519, FACTORY_ADDRESS } from '../../config.js';
import Factory from '../../../src/port/in/Factory.js';
import GetTokenManagerListRequest from '../../../src/port/in/request/GetTokenManagerListRequest.js';
import { MirrorNode } from '../../../src/domain/context/network/MirrorNode.js';
import { JsonRpcRelay } from '../../../src/domain/context/network/JsonRpcRelay.js';

SDK.log = { level: 'ERROR', transports: new LoggerTransports.Console() };
describe('🧪 Factory test', () => {
	beforeAll(async () => {
		const mirrorNode: MirrorNode = {
			name: 'testmirrorNode',
			baseUrl: 'https://testnet.mirrornode.hedera.com/api/v1/',
		};

		const rpcNode: JsonRpcRelay = {
			name: 'testrpcNode',
			baseUrl: 'http://127.0.0.1:7546/api',
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

	it('Get TokenManager list', async () => {
		const res = await Factory.getHederaTokenManagerList(
			new GetTokenManagerListRequest({ factoryId: FACTORY_ADDRESS }),
		);
		expect(res.length).toBeGreaterThan(0);
	}, 60_000);
});
