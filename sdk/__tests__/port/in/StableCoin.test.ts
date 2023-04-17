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

/* eslint-disable jest/no-standalone-expect */

import EventService from '../../../src/app/service/event/EventService.js';
import { WalletEvents } from '../../../src/app/service/event/WalletEvent.js';
import Injectable from '../../../src/core/Injectable.js';
import {
	Account,
	Balance,
	Network,
	StableCoin,
	StableCoinViewModel,
	TokenSupplyType,
} from '../../../src/index.js';
import {
	CashInRequest,
	BurnRequest,
	WipeRequest,
	GetAccountBalanceRequest,
	CapabilitiesRequest,
	PauseRequest,
	DeleteRequest,
	FreezeAccountRequest,
	CreateRequest,
	RescueRequest,
	IsAccountAssociatedTokenRequest,
	InitializationRequest,
	KYCRequest,
	GetReserveAddressRequest,
} from '../../../src/port/in/request/index.js';
import ConnectRequest, {
	SupportedWallets,
} from '../../../src/port/in/request/ConnectRequest.js';
import GetStableCoinDetailsRequest from '../../../src/port/in/request/GetStableCoinDetailsRequest.js';
import {
	CLIENT_ACCOUNT_ECDSA,
	CLIENT_ACCOUNT_ED25519,
	FACTORY_ADDRESS,
	HEDERA_ERC20_ADDRESS,
} from '../../config.js';

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
			initialSupply: '1000',
			freezeKey: Account.NullPublicKey,
			kycKey: Account.NullPublicKey,
			wipeKey: Account.NullPublicKey,
			pauseKey: Account.NullPublicKey,
			supplyType: TokenSupplyType.INFINITE,
			stableCoinFactory: FACTORY_ADDRESS,
			hederaERC20: HEDERA_ERC20_ADDRESS,
			reserveInitialAmount: '1000000',
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
		const requestHTS = new CreateRequest({
			name: 'TEST_ACCELERATOR_HTS',
			symbol: 'TEST',
			decimals: '6',
			initialSupply: '1000',
			freezeKey: CLIENT_ACCOUNT_ED25519.publicKey,
			kycKey: CLIENT_ACCOUNT_ED25519.publicKey,
			wipeKey: CLIENT_ACCOUNT_ED25519.publicKey,
			pauseKey: CLIENT_ACCOUNT_ED25519.publicKey,
			supplyType: TokenSupplyType.INFINITE,
			stableCoinFactory: FACTORY_ADDRESS,
			hederaERC20: HEDERA_ERC20_ADDRESS,
			reserveInitialAmount: '1000000',
			createReserve: true,
			grantKYCToOriginalSender: true,
			burnRoleAccount: CLIENT_ACCOUNT_ED25519.id.toString(),
			rescueRoleAccount: CLIENT_ACCOUNT_ED25519.id.toString(),
			deleteRoleAccount: CLIENT_ACCOUNT_ED25519.id.toString(),
			cashInRoleAccount: CLIENT_ACCOUNT_ED25519.id.toString(),
			cashInRoleAllowance: '0',
		});

		stableCoinSC = (await StableCoin.create(requestSC)).coin;
		stableCoinHTS = (await StableCoin.create(requestHTS)).coin;
	}, 60_000);

	it('Gets a coin', async () => {
		const res = await StableCoin.getInfo(
			new GetStableCoinDetailsRequest({
				id: stableCoinSC?.tokenId!.toString(),
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
				tokenId: stableCoinSC?.tokenId!.toString(),
				targetId: CLIENT_ACCOUNT_ED25519.id.toString(),
			}),
		);
		expect(result instanceof Balance).toBe(true);
		expect(result.value.toString()).toEqual('0');
	}, 60_000);

	it('Performs capabilities', async () => {
		const result = await capabilitiesOperation(stableCoinSC);
		expect(result.capabilities).not.toBeNull();
	}, 60_000);

	it('Performs a cash in SC', async () => {
		const result = await cashInOperation(stableCoinSC);
		expect(result).toBe(true);
	}, 60_000);

	it('Performs burn SC', async () => {
		const result = await burnOperation(stableCoinSC);
		expect(result).toBe(true);
	}, 60_000);

	it('Performs rescue SC', async () => {
		const result = await rescueOperation(stableCoinSC);
		expect(result).toBe(true);
	}, 60_000);

	it('Performs wipe SC', async () => {
		const result = await wipeOperation(stableCoinSC);
		expect(result).toBe(true);
	}, 60_000);

	it('Performs freeze and unfreeze SC', async () => {
		const [result_1, result_2, notFrozen_1, Frozen, notFrozen_2] =
			await freezeUnfreezeOperation(stableCoinSC);
		expect(result_1).toBe(true);
		expect(result_2).toBe(true);
		expect(notFrozen_1).toBe(true);
		expect(Frozen).toBe(false);
		expect(notFrozen_2).toBe(true);
	}, 60_000);

	it('Performs grant and revoke kyc SC', async () => {
		const [result_1, result_2, kycOK_1, kycNOK, kycOK_2] =
			await grantRevokeKYCOperation(stableCoinSC);
		expect(result_1).toBe(true);
		expect(result_2).toBe(true);
		expect(kycOK_1).toBe(true);
		expect(kycNOK).toBe(false);
		expect(kycOK_2).toBe(true);
	}, 60_000);

	it('Performs pause and unpause SC', async () => {
		const [result_1, result_2] = await pauseUnpauseOperation(stableCoinSC);
		expect(result_1).toBe(true);
		expect(result_2).toBe(true);
	}, 90_000);

	// eslint-disable-next-line jest/no-disabled-tests

	it('Performs reserve SC', async () => {
		const result = await getReserve(stableCoinSC);
		expect(result).not.toBeNull();
	}, 60_000);

	// ----------------------HTS--------------------------

	it('Performs rescue HTS', async () => {
		const result = await rescueOperation(stableCoinHTS);
		expect(result).toBe(true);
	}, 60_000);

	it('Performs wipe HTS', async () => {
		const result = await wipeOperation(stableCoinHTS);
		expect(result).toBe(true);
	}, 60_000);

	it('Performs capabilities HTS', async () => {
		const result = await capabilitiesOperation(stableCoinHTS);
		expect(result.capabilities).not.toBeNull();
	}, 60_000);

	it('Performs freeze and unfreeze HTS', async () => {
		const [result_1, result_2, notFrozen_1, Frozen, notFrozen_2] =
			await freezeUnfreezeOperation(stableCoinHTS);
		expect(result_1).toBe(true);
		expect(result_2).toBe(true);
		expect(notFrozen_1).toBe(true);
		expect(Frozen).toBe(false);
		expect(notFrozen_2).toBe(true);
	}, 60_000);

	it('Performs grant and revoke kyc HTS', async () => {
		const [result_1, result_2, kycOK_1, kycNOK, kycOK_2] =
			await grantRevokeKYCOperation(stableCoinHTS);
		expect(result_1).toBe(true);
		expect(result_2).toBe(true);
		expect(kycOK_1).toBe(true);
		expect(kycNOK).toBe(false);
		expect(kycOK_2).toBe(true);
	}, 60_000);

	it('Performs pause and unpause HTS', async () => {
		const [result_1, result_2] = await pauseUnpauseOperation(stableCoinHTS);
		expect(result_1).toBe(true);
		expect(result_2).toBe(true);
	}, 90_000);

	it('Performs reserve HTS', async () => {
		const result = await getReserve(stableCoinHTS);
		expect(result).not.toBeNull();
	}, 60_000);

	// eslint-disable-next-line jest/no-disabled-tests

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
				tokenId: stableCoinHTS?.tokenId!.toString(),
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
		console.log(`Token HTS: ${stableCoinHTS?.tokenId!.toString()}`);
		console.log(`Token SC: ${stableCoinSC?.tokenId!.toString()}`);

		await delay(10);
		const resultHTS = await StableCoin.delete(
			new DeleteRequest({
				tokenId: stableCoinHTS?.tokenId!.toString(),
			}),
		);
		const resultSC = await StableCoin.delete(
			new DeleteRequest({
				tokenId: stableCoinSC?.tokenId!.toString(),
			}),
		);
		expect(resultHTS).toBe(true);
		expect(resultSC).toBe(true);
	}, 60_000);

	async function burnOperation(stableCoin: StableCoinViewModel) {
		const handler = Injectable.resolveTransactionHandler();
		const eventService = Injectable.resolve(EventService);
		eventService.on(WalletEvents.walletInit, (data) => {
			console.log(`Wallet: ${data.wallet} initialized`);
		});
		return await StableCoin.burn(
			new BurnRequest({
				amount: '1',
				tokenId: stableCoin?.tokenId!.toString(),
			}),
		);
	}

	async function cashInOperation(stableCoin: StableCoinViewModel) {
		const handler = Injectable.resolveTransactionHandler();
		const eventService = Injectable.resolve(EventService);
		eventService.on(WalletEvents.walletInit, (data) => {
			console.log(`Wallet: ${data.wallet} initialized`);
		});
		return await StableCoin.cashIn(
			new CashInRequest({
				amount: '1',
				tokenId: stableCoin?.tokenId!.toString(),
				targetId: CLIENT_ACCOUNT_ED25519.id.toString(),
			}),
		);
	}

	async function rescueOperation(stableCoin: StableCoinViewModel) {
		const handler = Injectable.resolveTransactionHandler();
		const eventService = Injectable.resolve(EventService);
		eventService.on(WalletEvents.walletInit, (data) => {
			console.log(`Wallet: ${data.wallet} initialized`);
		});
		return await StableCoin.rescue(
			new RescueRequest({
				amount: '1',
				tokenId: stableCoin?.tokenId!.toString(),
			}),
		);
	}

	async function wipeOperation(stableCoin: StableCoinViewModel) {
		const handler = Injectable.resolveTransactionHandler();
		const eventService = Injectable.resolve(EventService);
		eventService.on(WalletEvents.walletInit, (data) => {
			console.log(`Wallet: ${data.wallet} initialized`);
		});
		return await StableCoin.wipe(
			new WipeRequest({
				amount: '1',
				tokenId: stableCoin?.tokenId!.toString(),
				targetId: CLIENT_ACCOUNT_ED25519.id.toString(),
			}),
		);
	}

	async function capabilitiesOperation(stableCoin: StableCoinViewModel) {
		const handler = Injectable.resolveTransactionHandler();
		const eventService = Injectable.resolve(EventService);
		eventService.on(WalletEvents.walletInit, (data) => {
			console.log(`Wallet: ${data.wallet} initialized`);
		});
		return await StableCoin.capabilities(
			new CapabilitiesRequest({
				account: {
					accountId: CLIENT_ACCOUNT_ED25519.id.toString(),
					privateKey: CLIENT_ACCOUNT_ED25519.privateKey,
				},
				tokenId: stableCoin?.tokenId!.toString(),
			}),
		);
	}

	async function freezeUnfreezeOperation(stableCoin: StableCoinViewModel) {
		const handler = Injectable.resolveTransactionHandler();
		const eventService = Injectable.resolve(EventService);
		eventService.on(WalletEvents.walletInit, (data) => {
			console.log(`Wallet: ${data.wallet} initialized`);
		});

		const notFrozen_1 = await StableCoin.isAccountFrozen(
			new FreezeAccountRequest({
				targetId: CLIENT_ACCOUNT_ED25519.id.toString(),
				tokenId: stableCoin?.tokenId!.toString(),
			}),
		);

		const result_1 = await StableCoin.freeze(
			new FreezeAccountRequest({
				targetId: CLIENT_ACCOUNT_ED25519.id.toString(),
				tokenId: stableCoin?.tokenId!.toString(),
			}),
		);

		await delay(1);

		const Frozen = await StableCoin.isAccountFrozen(
			new FreezeAccountRequest({
				targetId: CLIENT_ACCOUNT_ED25519.id.toString(),
				tokenId: stableCoin?.tokenId!.toString(),
			}),
		);

		const result_2 = await StableCoin.unFreeze(
			new FreezeAccountRequest({
				targetId: CLIENT_ACCOUNT_ED25519.id.toString(),
				tokenId: stableCoin?.tokenId!.toString(),
			}),
		);

		await delay(1);

		const notFrozen_2 = await StableCoin.isAccountFrozen(
			new FreezeAccountRequest({
				targetId: CLIENT_ACCOUNT_ED25519.id.toString(),
				tokenId: stableCoin?.tokenId!.toString(),
			}),
		);

		return [result_1, result_2, notFrozen_1, Frozen, notFrozen_2];
	}

	async function grantRevokeKYCOperation(stableCoin: StableCoinViewModel) {
		const handler = Injectable.resolveTransactionHandler();
		const eventService = Injectable.resolve(EventService);
		eventService.on(WalletEvents.walletInit, (data) => {
			console.log(`Wallet: ${data.wallet} initialized`);
		});

		const kycOK_1 = await StableCoin.isAccountKYCGranted(
			new KYCRequest({
				targetId: CLIENT_ACCOUNT_ED25519.id.toString(),
				tokenId: stableCoin?.tokenId!.toString(),
			}),
		);

		const result_1 = await StableCoin.revokeKyc(
			new KYCRequest({
				targetId: CLIENT_ACCOUNT_ED25519.id.toString(),
				tokenId: stableCoin?.tokenId!.toString(),
			}),
		);

		await delay(1);

		const kycNOK = await StableCoin.isAccountKYCGranted(
			new KYCRequest({
				targetId: CLIENT_ACCOUNT_ED25519.id.toString(),
				tokenId: stableCoin?.tokenId!.toString(),
			}),
		);

		const result_2 = await StableCoin.grantKyc(
			new KYCRequest({
				targetId: CLIENT_ACCOUNT_ED25519.id.toString(),
				tokenId: stableCoin?.tokenId!.toString(),
			}),
		);

		await delay(1);

		const kycOK_2 = await StableCoin.isAccountKYCGranted(
			new KYCRequest({
				targetId: CLIENT_ACCOUNT_ED25519.id.toString(),
				tokenId: stableCoin?.tokenId!.toString(),
			}),
		);

		return [result_1, result_2, kycOK_1, kycNOK, kycOK_2];
	}

	async function pauseUnpauseOperation(stableCoin: StableCoinViewModel) {
		const handler = Injectable.resolveTransactionHandler();
		const eventService = Injectable.resolve(EventService);
		eventService.on(WalletEvents.walletInit, (data) => {
			console.log(`Wallet: ${data.wallet} initialized`);
		});
		const result_1 = await StableCoin.pause(
			new PauseRequest({
				tokenId: stableCoin?.tokenId!.toString(),
			}),
		);
		const result_2 = await StableCoin.unPause(
			new PauseRequest({
				tokenId: stableCoin?.tokenId!.toString(),
			}),
		);

		return [result_1, result_2];
	}

	async function getReserve(stableCoin: StableCoinViewModel) {
		const handler = Injectable.resolveTransactionHandler();
		const eventService = Injectable.resolve(EventService);
		eventService.on(WalletEvents.walletInit, (data) => {
			console.log(`Wallet: ${data.wallet} initialized`);
		});
		return await StableCoin.getReserveAddress(
			new GetReserveAddressRequest({
				tokenId: stableCoin?.tokenId!.toString(),
			}),
		);
	}
});
