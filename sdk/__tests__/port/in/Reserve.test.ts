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

import NetworkService from '../../../src/app/service/NetworkService.js';
import Injectable from '../../../src/core/Injectable.js';
import {
	Account,
	CreateRequest,
	InitializationRequest,
	Network,
	SetNetworkRequest,
	StableCoin,
	StableCoinViewModel,
	TokenSupplyType,
	ReserveDataFeed,
	GetReserveAmountRequest,
	UpdateReserveAmountRequest,
	GetReserveAddressRequest,
} from '../../../src/index.js';
import ConnectRequest, {
	SupportedWallets,
} from '../../../src/port/in/request/ConnectRequest.js';

import {
	CLIENT_ACCOUNT_ED25519,
	FACTORY_ADDRESS,
	HEDERA_ERC20_ADDRESS,
} from '../../config.js';

describe('🧪 Reserve test', () => {
	let stableCoinSC: StableCoinViewModel;
	const initialSupply = 10;
	const reserveInitialAmount = initialSupply * 2;
	beforeAll(async () => {
		await Network.connect(
			new ConnectRequest({
				account: {
					accountId: CLIENT_ACCOUNT_ED25519.id.toString(),
					privateKey: CLIENT_ACCOUNT_ED25519.privateKey,
				},
				network: 'testnet',
				wallet: SupportedWallets.CLIENT,
			}),
		);
		await Network.init(
			new InitializationRequest({
				network: 'testnet',
				configuration: {
					factoryAddress: FACTORY_ADDRESS,
				},
			}),
		);
		Injectable.resolveTransactionHandler();
		const requestSC = new CreateRequest({
			name: 'TEST_ACCELERATOR_SC',
			symbol: 'TEST',
			decimals: '6',
			initialSupply: initialSupply.toString(),
			freezeKey: Account.NullPublicKey,
			kycKey: Account.NullPublicKey,
			wipeKey: Account.NullPublicKey,
			pauseKey: Account.NullPublicKey,
			supplyType: TokenSupplyType.INFINITE,
			stableCoinFactory: FACTORY_ADDRESS,
			hederaERC20: HEDERA_ERC20_ADDRESS,
			reserveInitialAmount: reserveInitialAmount.toString(),
			createReserve: true,
			grantKYCToOriginalSender: true,
			burnRoleAccount: CLIENT_ACCOUNT_ED25519.id.toString(),
			freezeRoleAccount: CLIENT_ACCOUNT_ED25519.id.toString(),
			kycRoleAccount: CLIENT_ACCOUNT_ED25519.id.toString(),
			wipeRoleAccount: CLIENT_ACCOUNT_ED25519.id.toString(),
			pauseRoleAccount: CLIENT_ACCOUNT_ED25519.id.toString(),
			rescueRoleAccount: CLIENT_ACCOUNT_ED25519.id.toString(),
			deleteRoleAccount: CLIENT_ACCOUNT_ED25519.id.toString(),
			cashInRoleAccount: CLIENT_ACCOUNT_ED25519.id.toString(),
			cashInRoleAllowance: '0',
		});

		stableCoinSC = (await StableCoin.create(requestSC)).coin;
	}, 60_000);

	it('check reserve amount', async () => {
		const res = await ReserveDataFeed.getReserveAmount(
			new GetReserveAmountRequest({
				tokenId: stableCoinSC?.tokenId!.toString(),
			}),
		);
		expect(res.value.toString()).toEqual(reserveInitialAmount.toString());
	}, 60_000);

	it('update reserve amount', async () => {
		const reserveAddress = await StableCoin.getReserveAddress(
			new GetReserveAddressRequest({
				tokenId: stableCoinSC?.tokenId!.toString(),
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
				tokenId: stableCoinSC?.tokenId!.toString(),
			}),
		);

		expect(res.value.toString()).toEqual('0');
	}, 60_000);
});
