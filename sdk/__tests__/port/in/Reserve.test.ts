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

import { MirrorNode } from '../../../src/domain/context/network/MirrorNode.js';
import { JsonRpcRelay } from '../../../src/domain/context/network/JsonRpcRelay.js';
import {
	InitializationRequest,
	Network,
	StableCoin,
	ReserveDataFeed,
	GetReserveAmountRequest,
	UpdateReserveAmountRequest,
	GetReserveAddressRequest,
	HederaId,
} from '../../../src/index.js';
import ConnectRequest, {
	SupportedWallets,
} from '../../../src/port/in/request/ConnectRequest.js';

import { CLIENT_ACCOUNT_ED25519, FACTORY_ADDRESS } from '../../config.js';
import Injectable from '../../../src/core/Injectable.js';

describe('🧪 ReserveFacet.sol test', () => {
	const stableCoinSC = {
		tokenId: new HederaId('0.0.8888888'),
	};

	beforeAll(async () => {
		const mirrorNode: MirrorNode = {
			name: 'testmirrorNode',
			baseUrl: 'https://testnet.mirrornode.hedera.com/api/v1/',
		};

		const rpcNode: JsonRpcRelay = {
			name: 'testrpcNode',
			baseUrl: 'https://testnet.hashio.io/api',
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

	it('update reserve amount', async () => {
		const reserveAddress = await StableCoin.getReserveAddress(
			new GetReserveAddressRequest({
				tokenId: stableCoinSC?.tokenId?.toString() ?? '0.0.0',
			}),
		);

		await ReserveDataFeed.updateReserveAmount(
			new UpdateReserveAmountRequest({
				reserveAddress: reserveAddress,
				reserveAmount: '0',
			}),
		);

		const res = await ReserveDataFeed.getReserveAmount(
			new GetReserveAmountRequest({
				tokenId: stableCoinSC?.tokenId?.toString() ?? '0.0.0',
			}),
		);

		expect(res.value.toString()).toEqual('0');
	}, 60_000);
});
