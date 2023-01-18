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

import { HederaERC20__factory } from 'hedera-stable-coin-contracts';
import Injectable from '../../../../src/core/Injectable.js';
import { Network, SetNetworkRequest } from '../../../../src/index.js';
import RPCQueryAdapter from '../../../../src/port/out/rpc/RPCQueryAdapter.js';

describe('🧪 RPCQueryAdapter', () => {
	beforeAll(async () => {
		await Network.setNetwork(
			new SetNetworkRequest({
				environment: 'testnet',
			}),
		);
	});

	it('Test it initializes', async () => {
        const adapter = Injectable.resolve(RPCQueryAdapter);
        const env = await adapter.init('testUrl');

        expect(env).toEqual('testnet');
        expect(adapter.provider).toBeDefined();
        expect(adapter.provider.connection.url).toEqual('testUrl')
    });
	
    it('Test it fetches a balance', async () => {
        const adapter = Injectable.resolve(RPCQueryAdapter);
        const env = await adapter.init();

        expect(env).toEqual('testnet');
        expect(adapter.provider).toBeDefined();
        expect(adapter.provider.connection.url).not.toEqual('testUrl');

        const res = await adapter.execute(
			HederaERC20__factory,
			'0x0000000000000000000000000000000002f0b0a8',
			'balanceOf',
			['0x26f3cc9b61fcd838b838720e384d03802d68adff'],
		);
        console.log('RES', res);
        expect(res).not.toBeUndefined();
    });
});
