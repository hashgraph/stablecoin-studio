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
	AssociateTokenRequest,
	UpdateReserveAddressRequest,
	UpdateRequest,
	RequestPublicKey,
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

		await StableCoin.associate(
			new AssociateTokenRequest({
				targetId: CLIENT_ACCOUNT_ED25519.id.toString(),
				tokenId: stableCoinSC.tokenId!.toString(),
			}),
		);

		await StableCoin.associate(
			new AssociateTokenRequest({
				targetId: CLIENT_ACCOUNT_ED25519.id.toString(),
				tokenId: stableCoinHTS.tokenId!.toString(),
			}),
		);

		await StableCoin.grantKyc(
			new KYCRequest({
				targetId: CLIENT_ACCOUNT_ED25519.id.toString(),
				tokenId: stableCoinSC.tokenId!.toString(),
			}),
		);
		await StableCoin.grantKyc(
			new KYCRequest({
				targetId: CLIENT_ACCOUNT_ED25519.id.toString(),
				tokenId: stableCoinHTS.tokenId!.toString(),
			}),
		);
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

	it('Performs capabilities SC', async () => {
		await capabilitiesOperation(stableCoinSC);
	}, 60_000);

	it('Performs a cash in SC', async () => {
		await cashInOperation(stableCoinSC);
	}, 60_000);

	it('Performs burn SC', async () => {
		await burnOperation(stableCoinSC);
	}, 60_000);

	it('Performs rescue SC', async () => {
		await rescueOperation(stableCoinSC);
	}, 60_000);

	it('Performs wipe SC', async () => {
		await wipeOperation(stableCoinSC);
	}, 60_000);

	it('Performs freeze and unfreeze SC', async () => {
		await freezeUnfreezeOperation(stableCoinSC);
	}, 60_000);

	it('Performs grant and revoke kyc SC', async () => {
		await grantRevokeKYCOperation(stableCoinSC);
	}, 60_000);

	it('Performs pause and unpause SC', async () => {
		await pauseUnpauseOperation(stableCoinSC);
	}, 90_000);

	it('Performs update token SC', async () => {
		await updateToken(stableCoinSC);
	}, 60_000);

	// ----------------------HTS--------------------------

	it('Performs rescue HTS', async () => {
		await rescueOperation(stableCoinHTS);
	}, 60_000);

	it('Performs wipe HTS', async () => {
		await wipeOperation(stableCoinHTS);
	}, 60_000);

	it('Performs capabilities HTS', async () => {
		await capabilitiesOperation(stableCoinHTS);
	}, 60_000);

	it('Performs freeze and unfreeze HTS', async () => {
		await freezeUnfreezeOperation(stableCoinHTS);
	}, 60_000);

	it('Performs grant and revoke kyc HTS', async () => {
		await grantRevokeKYCOperation(stableCoinHTS);
	}, 60_000);

	it('Performs pause and unpause HTS', async () => {
		await pauseUnpauseOperation(stableCoinHTS);
	}, 90_000);

	it('Performs reserve', async () => {
		const result_1 = await getReserve(stableCoinHTS);
		expect(result_1).not.toEqual('0.0.0');
		const result_2 = await updateReserve(stableCoinHTS, '0.0.0');
		expect(result_2).toEqual('0.0.0');
		const result_3 = await updateReserve(stableCoinHTS, result_1);
		expect(result_3).toEqual(result_1);
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

	it('Performs update token HTS', async () => {
		await updateToken(stableCoinHTS);
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
		const burnAmount = 1;

		const initialAmount = await StableCoin.getBalanceOf(
			new GetAccountBalanceRequest({
				tokenId: stableCoin?.tokenId!.toString(),
				targetId: stableCoin?.treasury!.toString(),
			}),
		);

		await StableCoin.burn(
			new BurnRequest({
				amount: burnAmount.toString(),
				tokenId: stableCoin?.tokenId!.toString(),
			}),
		);

		await delay(1);

		const finalAmount = await StableCoin.getBalanceOf(
			new GetAccountBalanceRequest({
				tokenId: stableCoin?.tokenId!.toString(),
				targetId: stableCoin?.treasury!.toString(),
			}),
		);

		const final = initialAmount.value.toLong().sub(burnAmount);

		expect(finalAmount).toEqual(final);
	}

	async function cashInOperation(stableCoin: StableCoinViewModel) {
		const cashInAmount = 1;

		const initialAmount = await StableCoin.getBalanceOf(
			new GetAccountBalanceRequest({
				tokenId: stableCoin?.tokenId!.toString(),
				targetId: CLIENT_ACCOUNT_ED25519.id.toString(),
			}),
		);

		await StableCoin.cashIn(
			new CashInRequest({
				amount: cashInAmount.toString(),
				tokenId: stableCoin?.tokenId!.toString(),
				targetId: CLIENT_ACCOUNT_ED25519.id.toString(),
			}),
		);

		await delay(1);

		const finalAmount = await StableCoin.getBalanceOf(
			new GetAccountBalanceRequest({
				tokenId: stableCoin?.tokenId!.toString(),
				targetId: CLIENT_ACCOUNT_ED25519.id.toString(),
			}),
		);

		const final = initialAmount.value.toLong().add(cashInAmount);

		expect(finalAmount).toEqual(final);
	}

	async function rescueOperation(stableCoin: StableCoinViewModel) {
		const rescueAmount = 1;

		const initialAmount = await StableCoin.getBalanceOf(
			new GetAccountBalanceRequest({
				tokenId: stableCoin?.tokenId!.toString(),
				targetId: stableCoin?.treasury!.toString(),
			}),
		);

		await StableCoin.rescue(
			new RescueRequest({
				amount: rescueAmount.toString(),
				tokenId: stableCoin?.tokenId!.toString(),
			}),
		);

		await delay(1);

		const finalAmount = await StableCoin.getBalanceOf(
			new GetAccountBalanceRequest({
				tokenId: stableCoin?.tokenId!.toString(),
				targetId: stableCoin?.treasury!.toString(),
			}),
		);

		const final = initialAmount.value.toLong().sub(rescueAmount);

		expect(finalAmount).toEqual(final);
	}

	async function wipeOperation(stableCoin: StableCoinViewModel) {
		const wipeAmount = 1;

		const initialAmount = await StableCoin.getBalanceOf(
			new GetAccountBalanceRequest({
				tokenId: stableCoin?.tokenId!.toString(),
				targetId: CLIENT_ACCOUNT_ED25519.id.toString(),
			}),
		);

		await StableCoin.wipe(
			new WipeRequest({
				amount: wipeAmount.toString(),
				tokenId: stableCoin?.tokenId!.toString(),
				targetId: CLIENT_ACCOUNT_ED25519.id.toString(),
			}),
		);

		await delay(1);

		const finalAmount = await StableCoin.getBalanceOf(
			new GetAccountBalanceRequest({
				tokenId: stableCoin?.tokenId!.toString(),
				targetId: CLIENT_ACCOUNT_ED25519.id.toString(),
			}),
		);

		const final = initialAmount.value.toLong().sub(wipeAmount);

		expect(finalAmount).toEqual(final);
	}

	async function capabilitiesOperation(stableCoin: StableCoinViewModel) {
		const result = await StableCoin.capabilities(
			new CapabilitiesRequest({
				account: {
					accountId: CLIENT_ACCOUNT_ED25519.id.toString(),
					privateKey: CLIENT_ACCOUNT_ED25519.privateKey,
				},
				tokenId: stableCoin?.tokenId!.toString(),
			}),
		);

		expect(result.capabilities).not.toBeNull();
	}

	async function freezeUnfreezeOperation(stableCoin: StableCoinViewModel) {
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

		expect(result_1).toBe(true);
		expect(result_2).toBe(true);
		expect(notFrozen_1).toBe(true);
		expect(Frozen).toBe(false);
		expect(notFrozen_2).toBe(true);
	}

	async function grantRevokeKYCOperation(stableCoin: StableCoinViewModel) {
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

		expect(result_1).toBe(true);
		expect(result_2).toBe(true);
		expect(kycOK_1).toBe(true);
		expect(kycNOK).toBe(false);
		expect(kycOK_2).toBe(true);
	}

	async function pauseUnpauseOperation(stableCoin: StableCoinViewModel) {
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

		expect(result_1).toBe(true);
		expect(result_2).toBe(true);
	}

	async function getReserve(stableCoin: StableCoinViewModel) {
		return await StableCoin.getReserveAddress(
			new GetReserveAddressRequest({
				tokenId: stableCoin?.tokenId!.toString(),
			}),
		);
	}

	async function updateReserve(
		stableCoin: StableCoinViewModel,
		newReserveAddress: string,
	) {
		return await StableCoin.updateReserveAddress(
			new UpdateReserveAddressRequest({
				tokenId: stableCoin?.tokenId!.toString(),
				reserveAddress: newReserveAddress,
			}),
		);
	}

	async function updateToken(stableCoin: StableCoinViewModel) {
		const name = 'New Token Name';
		const symbol = 'New Token Symbol';
		const autoRenewPeriod = 30;
		const expirationTimestamp = stableCoin.expirationTimestamp! + 1;
		const freezeKey =
			stableCoin.freezeKey === Account.NullPublicKey
				? CLIENT_ACCOUNT_ED25519.publicKey
				: Account.NullPublicKey;
		const kycKey =
			stableCoin.kycKey === Account.NullPublicKey
				? CLIENT_ACCOUNT_ED25519.publicKey
				: Account.NullPublicKey;
		const wipeKey =
			stableCoin.wipeKey === Account.NullPublicKey
				? CLIENT_ACCOUNT_ED25519.publicKey
				: Account.NullPublicKey;
		const pauseKey =
			stableCoin.pauseKey === Account.NullPublicKey
				? CLIENT_ACCOUNT_ED25519.publicKey
				: Account.NullPublicKey;

		await StableCoin.update(
			new UpdateRequest({
				tokenId: stableCoin?.tokenId!.toString(),
				name: name,
				symbol: symbol,
				autoRenewPeriod: autoRenewPeriod.toString(),
				expirationTimestamp: expirationTimestamp.toString(),
				freezeKey: freezeKey,
				kycKey: kycKey,
				wipeKey: wipeKey,
				pauseKey: pauseKey,
			}),
		);

		await delay(1);

		const res = await StableCoin.getInfo(
			new GetStableCoinDetailsRequest({
				id: stableCoinSC?.tokenId!.toString(),
			}),
		);

		expect(res.name).toEqual(name);
		expect(res.symbol).toEqual(symbol);
		expect(res.autoRenewPeriod).toEqual(autoRenewPeriod);
		expect(res.expirationTimestamp).toEqual(expirationTimestamp);
		expect(res.freezeKey).toEqual(freezeKey);
		expect(res.kycKey).toEqual(kycKey);
		expect(res.wipeKey).toEqual(wipeKey);
		expect(res.pauseKey).toEqual(pauseKey);
	}
});
