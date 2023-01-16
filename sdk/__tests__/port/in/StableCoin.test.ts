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

import EventService from '../../../src/app/service/event/EventService.js';
import { WalletEvents } from '../../../src/app/service/event/WalletEvent.js';
import Injectable from '../../../src/core/Injectable.js';
import {
	Account,
	Balance,
	FactoryAddressTestnet,
	HederaERC20AddressTestnet,
	Network,
	StableCoin,
	StableCoinViewModel,
	TokenSupplyType,
} from '../../../src/index.js';
import {
	CashInRequest,
	BurnRequest,
	WipeRequest,
	AssociateTokenRequest,
	GetAccountBalanceRequest,
	CapabilitiesRequest,
	PauseRequest,
	DeleteRequest,
	FreezeAccountRequest,
	CreateRequest,
	RescueRequest,
	IsAccountAssociatedTokenRequest,
} from '../../../src/port/in/request/index.js';
import ConnectRequest, {
	SupportedWallets,
} from '../../../src/port/in/request/ConnectRequest.js';
import GetStableCoinDetailsRequest from '../../../src/port/in/request/GetStableCoinDetailsRequest.js';
import { CLIENT_ACCOUNT_ECDSA, CLIENT_ACCOUNT_ED25519 } from '../../config.js';

describe('🧪 Stablecoin test', () => {
	let stableCoinSC: StableCoinViewModel;
	let stableCoinHTS: StableCoinViewModel;
	const delay = async (seconds = 2): Promise<void> => {
		seconds = seconds * 1000;
		await new Promise((r) => setTimeout(r, seconds));
	};
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
		Injectable.resolveTransactionHandler();
		const requestSC = new CreateRequest({
			name: 'TEST_ACCELERATOR_SC',
			symbol: 'TEST',
			decimals: '6',
			initialSupply: '1000',
			// maxSupply: '',
			autoRenewAccount: CLIENT_ACCOUNT_ED25519.id.toString(),
			adminKey: Account.NullPublicKey,
			freezeKey: Account.NullPublicKey,
			KYCKey: Account.NullPublicKey,
			wipeKey: Account.NullPublicKey,
			pauseKey: Account.NullPublicKey,
			supplyKey: Account.NullPublicKey,
			// treasury: CLIENT_ACCOUNT_ED25519.id.toString(),
			supplyType: TokenSupplyType.INFINITE,
			stableCoinFactory: FactoryAddressTestnet,
			hederaERC20: HederaERC20AddressTestnet,
			createReserve: false
		});
		const requestHTS = new CreateRequest({
			name: 'TEST_ACCELERATOR_HTS',
			symbol: 'TEST',
			decimals: '6',
			initialSupply: '1000',
			// maxSupply: '',
			autoRenewAccount: CLIENT_ACCOUNT_ED25519.id.toString(),
			adminKey: CLIENT_ACCOUNT_ED25519.publicKey,
			freezeKey: CLIENT_ACCOUNT_ED25519.publicKey,
			KYCKey: CLIENT_ACCOUNT_ED25519.publicKey,
			wipeKey: CLIENT_ACCOUNT_ED25519.publicKey,
			pauseKey: CLIENT_ACCOUNT_ED25519.publicKey,
			supplyKey: CLIENT_ACCOUNT_ED25519.publicKey,
			// treasury: CLIENT_ACCOUNT_ED25519.id.toString(),
			supplyType: TokenSupplyType.INFINITE,
			stableCoinFactory: FactoryAddressTestnet,
			hederaERC20: HederaERC20AddressTestnet,
			createReserve: false,
			// reserveAddress: '0.0.11111111'
		});

		stableCoinSC = (await StableCoin.create(requestSC)).coin;
		stableCoinHTS = (await StableCoin.create(requestHTS)).coin;
	}, 60_000);

	it('Gets a coin', async () => {
		const res = await StableCoin.getInfo(
			new GetStableCoinDetailsRequest({
				id: stableCoinSC?.tokenId?.toString() ?? '0.0.49106247',
			}),
		);
		expect(res).not.toBeNull();
		expect(res.decimals).not.toBeNull();
		expect(res.name).not.toBeNull();
		expect(res.symbol).not.toBeNull();
		expect(res.treasury).not.toBeNull();
		expect(res.tokenId).not.toBeNull();
	}, 60_000);

	it('Performs getBalanceOf', async () => {
		const handler = Injectable.resolveTransactionHandler();
		expect(handler).not.toBeNull();
		const eventService = Injectable.resolve(EventService);
		expect(eventService).not.toBeNull();
		eventService.on(WalletEvents.walletInit, (data) => {
			console.log(`Wallet: ${data.wallet} initialized`);
		});
		const result = await StableCoin.getBalanceOf(
			new GetAccountBalanceRequest({
				tokenId: stableCoinSC?.tokenId?.toString() ?? '0.0.49106247',
				targetId: CLIENT_ACCOUNT_ED25519.id.toString(),
			}),
		);
		expect(result instanceof Balance).toBe(true);
		expect(result.value).not.toBeNull();
	}, 60_000);

	it('Performs capabilities', async () => {
		const handler = Injectable.resolveTransactionHandler();
		expect(handler).not.toBeNull();
		const eventService = Injectable.resolve(EventService);
		expect(eventService).not.toBeNull();
		eventService.on(WalletEvents.walletInit, (data) => {
			console.log(`Wallet: ${data.wallet} initialized`);
		});
		const result = await StableCoin.capabilities(
			new CapabilitiesRequest({
				account: {
					accountId: CLIENT_ACCOUNT_ED25519.id.toString(),
					privateKey: CLIENT_ACCOUNT_ED25519.privateKey,
				},
				tokenId: stableCoinSC?.tokenId?.toString() ?? '0.0.49106247',
			}),
		);
		expect(result).not.toBeNull();
		expect(result.capabilities).not.toBeNull();
	}, 60_000);

	it('Performs a cash in SC', async () => {
		const handler = Injectable.resolveTransactionHandler();
		expect(handler).not.toBeNull();
		const eventService = Injectable.resolve(EventService);
		expect(eventService).not.toBeNull();
		eventService.on(WalletEvents.walletInit, (data) => {
			console.log(`Wallet: ${data.wallet} initialized`);
		});
		const result = await StableCoin.cashIn(
			new CashInRequest({
				amount: '1',
				tokenId: stableCoinSC?.tokenId?.toString() ?? '0.0.49106247',
				targetId: CLIENT_ACCOUNT_ED25519.id.toString(),
			}),
		);

		expect(result).not.toBeNull();
		await expect(result).toBe(true);
	}, 60_000);

	it('Performs burn SC', async () => {
		const handler = Injectable.resolveTransactionHandler();
		expect(handler).not.toBeNull();
		const eventService = Injectable.resolve(EventService);
		expect(eventService).not.toBeNull();
		eventService.on(WalletEvents.walletInit, (data) => {
			console.log(`Wallet: ${data.wallet} initialized`);
		});
		const result = await StableCoin.burn(
			new BurnRequest({
				amount: '1',
				tokenId: stableCoinSC?.tokenId?.toString() ?? '0.0.49106247',
			}),
		);
		expect(result).not.toBeNull();
		expect(result).toBe(true);
	}, 60_000);

	it('Performs rescue SC', async () => {
		const handler = Injectable.resolveTransactionHandler();
		expect(handler).not.toBeNull();
		const eventService = Injectable.resolve(EventService);
		expect(eventService).not.toBeNull();
		eventService.on(WalletEvents.walletInit, (data) => {
			console.log(`Wallet: ${data.wallet} initialized`);
		});
		const result = await StableCoin.rescue(
			new RescueRequest({
				amount: '1',
				tokenId: stableCoinSC?.tokenId?.toString() ?? '0.0.49106247',
			}),
		);
		expect(result).not.toBeNull();
		expect(result).toBe(true);
	}, 60_000);

	it('Performs wipe SC', async () => {
		const handler = Injectable.resolveTransactionHandler();
		expect(handler).not.toBeNull();
		const eventService = Injectable.resolve(EventService);
		expect(eventService).not.toBeNull();
		eventService.on(WalletEvents.walletInit, (data) => {
			console.log(`Wallet: ${data.wallet} initialized`);
		});
		const result = await StableCoin.wipe(
			new WipeRequest({
				amount: '1',
				tokenId: stableCoinSC?.tokenId?.toString() ?? '0.0.49106247',
				targetId: CLIENT_ACCOUNT_ED25519.id.toString(),
			}),
		);
		expect(result).not.toBeNull();
		expect(result).toBe(true);
	}, 60_000);

	// eslint-disable-next-line jest/no-disabled-tests
	it.skip('Performs associate SC', async () => {
		const handler = Injectable.resolveTransactionHandler();
		expect(handler).not.toBeNull();
		const eventService = Injectable.resolve(EventService);
		expect(eventService).not.toBeNull();
		eventService.on(WalletEvents.walletInit, (data) => {
			console.log(`Wallet: ${data.wallet} initialized`);
		});
		const result = await StableCoin.associate(
			new AssociateTokenRequest({
				account: {
					accountId: CLIENT_ACCOUNT_ECDSA.id.toString(),
					privateKey: CLIENT_ACCOUNT_ECDSA.privateKey,
				},
				proxyContractId: '0.0.0', // <-- Change
			}),
		);
		expect(result).not.toBeNull();
		expect(result).toBe(true);
	}, 60_000);

	it('Performs freeze SC', async () => {
		const handler = Injectable.resolveTransactionHandler();
		expect(handler).not.toBeNull();
		const eventService = Injectable.resolve(EventService);
		expect(eventService).not.toBeNull();
		eventService.on(WalletEvents.walletInit, (data) => {
			console.log(`Wallet: ${data.wallet} initialized`);
		});
		await delay();
		const result = await StableCoin.freeze(
			new FreezeAccountRequest({
				targetId: CLIENT_ACCOUNT_ED25519.id.toString(),
				tokenId: stableCoinSC?.tokenId?.toString() ?? '0.0.49131205',
			}),
		);

		expect(result).not.toBeNull();
		expect(result).toBe(true);
	}, 60_000);

	it('Performs unfreeze SC', async () => {
		const handler = Injectable.resolveTransactionHandler();
		expect(handler).not.toBeNull();
		const eventService = Injectable.resolve(EventService);
		expect(eventService).not.toBeNull();
		eventService.on(WalletEvents.walletInit, (data) => {
			console.log(`Wallet: ${data.wallet} initialized`);
		});
		await delay();
		const result = await StableCoin.unFreeze(
			new FreezeAccountRequest({
				targetId: CLIENT_ACCOUNT_ED25519.id.toString(),
				tokenId: stableCoinSC?.tokenId?.toString() ?? '0.0.49131205',
			}),
		);
		expect(result).not.toBeNull();
		expect(result).toBe(true);
	}, 60_000);

	it('Performs pause SC', async () => {
		const handler = Injectable.resolveTransactionHandler();
		expect(handler).not.toBeNull();
		const eventService = Injectable.resolve(EventService);
		expect(eventService).not.toBeNull();
		eventService.on(WalletEvents.walletInit, (data) => {
			console.log(`Wallet: ${data.wallet} initialized`);
		});
		const result = await StableCoin.pause(
			new PauseRequest({
				tokenId: stableCoinSC?.tokenId?.toString() ?? '0.0.49106247',
			}),
		);
		expect(result).not.toBeNull();
		expect(result).toBe(true);
	}, 60_000);

	it('Performs unpause SC', async () => {
		const handler = Injectable.resolveTransactionHandler();
		expect(handler).not.toBeNull();
		const eventService = Injectable.resolve(EventService);
		expect(eventService).not.toBeNull();
		eventService.on(WalletEvents.walletInit, (data) => {
			console.log(`Wallet: ${data.wallet} initialized`);
		});
		const result = await StableCoin.unPause(
			new PauseRequest({
				tokenId: stableCoinSC?.tokenId?.toString() ?? '0.0.49106247',
			}),
		);
		expect(result).not.toBeNull();
		expect(result).toBe(true);
	}, 60_000);

	// eslint-disable-next-line jest/no-disabled-tests
	it.skip('Performs delete SC', async () => {
		const handler = Injectable.resolveTransactionHandler();
		expect(handler).not.toBeNull();
		const eventService = Injectable.resolve(EventService);
		expect(eventService).not.toBeNull();
		eventService.on(WalletEvents.walletInit, (data) => {
			console.log(`Wallet: ${data.wallet} initialized`);
		});
		const result = await StableCoin.delete(
			new DeleteRequest({
				tokenId: stableCoinSC?.tokenId?.toString() ?? '0.0.49106247',
			}),
		);
		expect(result).not.toBeNull();
		expect(result).toBe(true);
	}, 60_000);

	// ----------------------HTS--------------------------

	it('Performs a cash in HTS', async () => {
		const handler = Injectable.resolveTransactionHandler();
		expect(handler).not.toBeNull();
		const eventService = Injectable.resolve(EventService);
		expect(eventService).not.toBeNull();
		eventService.on(WalletEvents.walletInit, (data) => {
			console.log(`Wallet: ${data.wallet} initialized`);
		});
		const result = await StableCoin.cashIn(
			new CashInRequest({
				amount: '1',
				tokenId: stableCoinHTS?.tokenId?.toString() ?? '0.0.49131205',
				targetId: CLIENT_ACCOUNT_ED25519.id.toString(),
			}),
		);

		expect(result).not.toBeNull();
		await expect(result).toBe(true);
	}, 60_000);

	it('Performs burn HTS', async () => {
		const handler = Injectable.resolveTransactionHandler();
		expect(handler).not.toBeNull();
		const eventService = Injectable.resolve(EventService);
		expect(eventService).not.toBeNull();
		eventService.on(WalletEvents.walletInit, (data) => {
			console.log(`Wallet: ${data.wallet} initialized`);
		});
		const result = await StableCoin.burn(
			new BurnRequest({
				amount: '1',
				tokenId: stableCoinHTS?.tokenId?.toString() ?? '0.0.49106247',
			}),
		);
		expect(result).not.toBeNull();
		expect(result).toBe(true);
	}, 60_000);

	it('Performs rescue HTS', async () => {
		const handler = Injectable.resolveTransactionHandler();
		expect(handler).not.toBeNull();
		const eventService = Injectable.resolve(EventService);
		expect(eventService).not.toBeNull();
		eventService.on(WalletEvents.walletInit, (data) => {
			console.log(`Wallet: ${data.wallet} initialized`);
		});
		const result = await StableCoin.rescue(
			new RescueRequest({
				amount: '1',
				tokenId: stableCoinHTS?.tokenId?.toString() ?? '0.0.49106247',
			}),
		);
		expect(result).not.toBeNull();
		expect(result).toBe(true);
	}, 60_000);

	it('Performs wipe HTS', async () => {
		const handler = Injectable.resolveTransactionHandler();
		expect(handler).not.toBeNull();
		const eventService = Injectable.resolve(EventService);
		expect(eventService).not.toBeNull();
		eventService.on(WalletEvents.walletInit, (data) => {
			console.log(`Wallet: ${data.wallet} initialized`);
		});
		const result = await StableCoin.wipe(
			new WipeRequest({
				amount: '1',
				tokenId: stableCoinHTS?.tokenId?.toString() ?? '0.0.49106247',
				targetId: CLIENT_ACCOUNT_ED25519.id.toString(),
			}),
		);
		expect(result).not.toBeNull();
		expect(result).toBe(true);
	}, 60_000);

	// eslint-disable-next-line jest/no-disabled-tests
	it.skip('Performs associate HTS', async () => {
		const handler = Injectable.resolveTransactionHandler();
		expect(handler).not.toBeNull();
		const eventService = Injectable.resolve(EventService);
		expect(eventService).not.toBeNull();
		eventService.on(WalletEvents.walletInit, (data) => {
			console.log(`Wallet: ${data.wallet} initialized`);
		});
		const result = await StableCoin.associate(
			new AssociateTokenRequest({
				account: {
					accountId: CLIENT_ACCOUNT_ECDSA.id.toString(),
					privateKey: CLIENT_ACCOUNT_ECDSA.privateKey,
				},
				proxyContractId: '0.0.0', // <-- Change
			}),
		);
		expect(result).not.toBeNull();
		expect(result).toBe(true);
	}, 60_000);

	it('Performs capabilities HTS', async () => {
		const handler = Injectable.resolveTransactionHandler();
		expect(handler).not.toBeNull();
		const eventService = Injectable.resolve(EventService);
		expect(eventService).not.toBeNull();
		eventService.on(WalletEvents.walletInit, (data) => {
			console.log(`Wallet: ${data.wallet} initialized`);
		});
		const result = await StableCoin.capabilities(
			new CapabilitiesRequest({
				account: {
					accountId: CLIENT_ACCOUNT_ED25519.id.toString(),
					privateKey: CLIENT_ACCOUNT_ED25519.privateKey,
				},
				tokenId: stableCoinHTS?.tokenId?.toString() ?? '0.0.49106247',
			}),
		);
		expect(result).not.toBeNull();
		expect(result.capabilities).not.toBeNull();
	}, 60_000);

	it('Performs freeze HTS', async () => {
		const handler = Injectable.resolveTransactionHandler();
		expect(handler).not.toBeNull();
		const eventService = Injectable.resolve(EventService);
		expect(eventService).not.toBeNull();
		eventService.on(WalletEvents.walletInit, (data) => {
			console.log(`Wallet: ${data.wallet} initialized`);
		});
		await delay();
		const result = await StableCoin.freeze(
			new FreezeAccountRequest({
				targetId: CLIENT_ACCOUNT_ED25519.id.toString(),
				tokenId: stableCoinHTS?.tokenId?.toString() ?? '0.0.49131205',
			}),
		);
		expect(result).not.toBeNull();
		expect(result).toBe(true);
	}, 60_000);

	it('Performs unfreeze HTS', async () => {
		const handler = Injectable.resolveTransactionHandler();
		expect(handler).not.toBeNull();
		const eventService = Injectable.resolve(EventService);
		expect(eventService).not.toBeNull();
		eventService.on(WalletEvents.walletInit, (data) => {
			console.log(`Wallet: ${data.wallet} initialized`);
		});
		await delay();
		const result = await StableCoin.unFreeze(
			new FreezeAccountRequest({
				targetId: CLIENT_ACCOUNT_ED25519.id.toString(),
				tokenId: stableCoinHTS?.tokenId?.toString() ?? '0.0.49131205',
			}),
		);
		expect(result).not.toBeNull();
		expect(result).toBe(true);
	}, 60_000);

	it('Performs pause HTS', async () => {
		const handler = Injectable.resolveTransactionHandler();
		expect(handler).not.toBeNull();
		const eventService = Injectable.resolve(EventService);
		expect(eventService).not.toBeNull();
		eventService.on(WalletEvents.walletInit, (data) => {
			console.log(`Wallet: ${data.wallet} initialized`);
		});
		const result = await StableCoin.pause(
			new PauseRequest({
				tokenId: stableCoinHTS?.tokenId?.toString() ?? '0.0.49106247',
			}),
		);
		expect(result).not.toBeNull();
		expect(result).toBe(true);
	}, 60_000);

	it('Performs unpause HTS', async () => {
		const handler = Injectable.resolveTransactionHandler();
		expect(handler).not.toBeNull();
		const eventService = Injectable.resolve(EventService);
		expect(eventService).not.toBeNull();
		eventService.on(WalletEvents.walletInit, (data) => {
			console.log(`Wallet: ${data.wallet} initialized`);
		});
		const result = await StableCoin.unPause(
			new PauseRequest({
				tokenId: stableCoinHTS?.tokenId?.toString() ?? '0.0.49106247',
			}),
		);
		expect(result).not.toBeNull();
		expect(result).toBe(true);
	}, 60_000);

	// eslint-disable-next-line jest/no-disabled-tests
	it.skip('Performs delete HTS', async () => {
		const handler = Injectable.resolveTransactionHandler();
		expect(handler).not.toBeNull();
		const eventService = Injectable.resolve(EventService);
		expect(eventService).not.toBeNull();
		eventService.on(WalletEvents.walletInit, (data) => {
			console.log(`Wallet: ${data.wallet} initialized`);
		});
		const result = await StableCoin.delete(
			new DeleteRequest({
				tokenId: stableCoinHTS?.tokenId?.toString() ?? '0.0.49106247',
			}),
		);
		expect(result).not.toBeNull();
		expect(result).toBe(true);
	}, 60_000);

	it('Get isAccountTokenAssociated', async () => {
		const handler = Injectable.resolveTransactionHandler();
		expect(handler).not.toBeNull();
		const eventService = Injectable.resolve(EventService);
		expect(eventService).not.toBeNull();
		eventService.on(WalletEvents.walletInit, (data) => {
			console.log(`Wallet: ${data.wallet} initialized`);
		});
		const result = await StableCoin.isAccountAssociated(
			new IsAccountAssociatedTokenRequest({
				targetId: CLIENT_ACCOUNT_ED25519.id.toString(),
				tokenId: stableCoinHTS?.tokenId?.toString() ?? '0.0.49206466',
			}),
		);
		expect(result).not.toBeNull();
		expect(result).toBe(true);
	}, 60_000);

	afterAll(async () => {
		const handler = Injectable.resolveTransactionHandler();
		expect(handler).not.toBeNull();
		const eventService = Injectable.resolve(EventService);
		expect(eventService).not.toBeNull();
		eventService.on(WalletEvents.walletInit, (data) => {
			console.log(`Wallet: ${data.wallet} initialized`);
		});
		console.log(`Token HTS: ${stableCoinHTS?.tokenId?.toString()}`);
		console.log(`Token SC: ${stableCoinSC?.tokenId?.toString()}`);

		await delay();
		const resultHTS = await StableCoin.delete(
			new DeleteRequest({
				tokenId: stableCoinHTS?.tokenId?.toString() ?? '0.0.49106247',
			}),
		);
		const resultSC = await StableCoin.delete(
			new DeleteRequest({
				tokenId: stableCoinSC?.tokenId?.toString() ?? '0.0.49106247',
			}),
		);
		expect(resultHTS).toBe(true);
		expect(resultSC).toBe(true);
	}, 60_000);
});
