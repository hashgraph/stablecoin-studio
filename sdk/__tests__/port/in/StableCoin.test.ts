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
	BigDecimal,
	Network,
	StableCoin,
	StableCoinViewModel,
	TokenSupplyType,
	HBAR_DECIMALS,
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
	RescueHBARRequest,
	IsAccountAssociatedTokenRequest,
	InitializationRequest,
	KYCRequest,
	GetReserveAddressRequest,
	AssociateTokenRequest,
	UpdateReserveAddressRequest,
	UpdateRequest,
} from '../../../src/port/in/request/index.js';
import ConnectRequest, {
	SupportedWallets,
} from '../../../src/port/in/request/ConnectRequest.js';
import GetStableCoinDetailsRequest from '../../../src/port/in/request/GetStableCoinDetailsRequest.js';
import {
	CLIENT_ACCOUNT_ED25519,
	FACTORY_ADDRESS,
	HEDERA_TOKEN_MANAGER_ADDRESS,
} from '../../config.js';
import { MirrorNodeAdapter } from '../../../src/port/out/mirror/MirrorNodeAdapter.js';
import { Client, Hbar, TransferTransaction } from '@hashgraph/sdk';
import { MirrorNode } from '../../../src/domain/context/network/MirrorNode.js';
import { JsonRpcRelay } from '../../../src/domain/context/network/JsonRpcRelay.js';
const decimals = 6;

describe('🧪 Stablecoin test', () => {
	let stableCoinSC: StableCoinViewModel;
	let stableCoinHTS: StableCoinViewModel;

	const delay = async (seconds = 5): Promise<void> => {
		seconds = seconds * 1000;
		await new Promise((r) => setTimeout(r, seconds));
	};

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
		const requestSC = new CreateRequest({
			name: 'TEST_ACCELERATOR_SC',
			symbol: 'TEST',
			decimals: decimals,
			initialSupply: '1000',
			freezeKey: Account.NullPublicKey,
			kycKey: Account.NullPublicKey,
			wipeKey: Account.NullPublicKey,
			pauseKey: Account.NullPublicKey,
			supplyType: TokenSupplyType.INFINITE,
			stableCoinFactory: FACTORY_ADDRESS,
			hederaTokenManager: HEDERA_TOKEN_MANAGER_ADDRESS,
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
			decimals: decimals,
			initialSupply: '1000',
			freezeKey: CLIENT_ACCOUNT_ED25519.publicKey,
			kycKey: CLIENT_ACCOUNT_ED25519.publicKey,
			wipeKey: CLIENT_ACCOUNT_ED25519.publicKey,
			pauseKey: CLIENT_ACCOUNT_ED25519.publicKey,
			supplyType: TokenSupplyType.INFINITE,
			stableCoinFactory: FACTORY_ADDRESS,
			hederaTokenManager: HEDERA_TOKEN_MANAGER_ADDRESS,
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

		await delay();

		await StableCoin.associate(
			new AssociateTokenRequest({
				targetId: CLIENT_ACCOUNT_ED25519.id.toString(),
				tokenId: stableCoinSC?.tokenId?.toString() ?? '0.0.0',
			}),
		);

		await StableCoin.associate(
			new AssociateTokenRequest({
				targetId: CLIENT_ACCOUNT_ED25519.id.toString(),
				tokenId: stableCoinHTS?.tokenId?.toString() ?? '0.0.0',
			}),
		);

		await delay();

		await StableCoin.grantKyc(
			new KYCRequest({
				targetId: CLIENT_ACCOUNT_ED25519.id.toString(),
				tokenId: stableCoinSC?.tokenId?.toString() ?? '0.0.0',
			}),
		);
		await StableCoin.grantKyc(
			new KYCRequest({
				targetId: CLIENT_ACCOUNT_ED25519.id.toString(),
				tokenId: stableCoinHTS?.tokenId?.toString() ?? '0.0.0',
			}),
		);

		await delay();
	}, 60_000);

	it('Gets a coin', async () => {
		const res = await StableCoin.getInfo(
			new GetStableCoinDetailsRequest({
				id: stableCoinSC?.tokenId?.toString() ?? '0.0.0',
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
				tokenId: stableCoinSC?.tokenId?.toString() ?? '0.0.0',
				targetId: CLIENT_ACCOUNT_ED25519.id.toString(),
			}),
		);
		expect(result instanceof Balance).toBe(true);
		expect(result.value.toString()).toEqual('0');
	}, 60_000);

	it('Performs capabilities SC', async () => {
		const result = await capabilitiesOperation(stableCoinSC);
		expect(result).toBeDefined();
	}, 60_000);

	it('Performs a cash in SC', async () => {
		const result = await cashInOperation(stableCoinSC);
		expect(result).toBeDefined();
	}, 60_000);

	it('Performs burn SC', async () => {
		const result = await burnOperation(stableCoinSC);
		expect(result).toBeDefined();
	}, 60_000);

	it('Performs rescue SC', async () => {
		const result = await rescueOperation(stableCoinSC);
		expect(result).toBeDefined();
	}, 60_000);

	it('Performs rescue HBAR SC', async () => {
		const result = await rescueHBAROperation(stableCoinSC);
		expect(result).toBeDefined();
	}, 60_000);

	it('Performs wipe SC', async () => {
		const result = await wipeOperation(stableCoinSC);
		expect(result).toBeDefined();
	}, 60_000);

	it('Performs freeze and unfreeze SC', async () => {
		const result = await freezeUnfreezeOperation(stableCoinSC);
		expect(result).toBeDefined();
	}, 60_000);

	it('Performs grant and revoke kyc SC', async () => {
		const result = await grantRevokeKYCOperation(stableCoinSC);
		expect(result).toBeDefined();
	}, 60_000);

	it('Performs pause and unpause SC', async () => {
		const result = await pauseUnpauseOperation(stableCoinSC);
		expect(result).toBeDefined();
	}, 90_000);

	it('Performs update token SC', async () => {
		const result = await updateToken(stableCoinSC);
		expect(result).toBeDefined();
	}, 60_000);

	// ----------------------HTS--------------------------

	it('Performs rescue HTS', async () => {
		const result = await rescueOperation(stableCoinHTS);
		expect(result).toBeDefined();
	}, 60_000);

	it('Performs rescue HBAR HTS', async () => {
		const result = await rescueHBAROperation(stableCoinHTS);
		expect(result).toBeDefined();
	}, 60_000);

	it('Performs wipe HTS', async () => {
		const result = await wipeOperation(stableCoinHTS);
		expect(result).toBeDefined();
	}, 60_000);

	it('Performs capabilities HTS', async () => {
		const result = await capabilitiesOperation(stableCoinHTS);
		expect(result).toBeDefined();
	}, 60_000);

	it('Performs freeze and unfreeze HTS', async () => {
		const result = await freezeUnfreezeOperation(stableCoinHTS);
		expect(result).toBeDefined();
	}, 60_000);

	it('Performs grant and revoke kyc HTS', async () => {
		const result = await grantRevokeKYCOperation(stableCoinHTS);
		expect(result).toBeDefined();
	}, 60_000);

	it('Performs pause and unpause HTS', async () => {
		const result = await pauseUnpauseOperation(stableCoinHTS);
		expect(result).toBeDefined();
	}, 90_000);

	it('Performs reserve', async () => {
		const result_1 = await getReserve(stableCoinHTS);
		expect(result_1).not.toEqual('0.0.0');

		await updateReserve(
			stableCoinHTS,
			stableCoinSC.reserveAddress?.toString() ?? '0.0.0',
		);
		await delay();
		const result_2 = await getReserve(stableCoinHTS);
		expect(result_2).toEqual(
			stableCoinSC.reserveAddress?.toString() ?? '0.0.0',
		);

		await updateReserve(stableCoinHTS, result_1);
		await delay();
		const result_3 = await getReserve(stableCoinHTS);
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
				tokenId: stableCoinHTS?.tokenId?.toString() ?? '0.0.0',
			}),
		);
		expect(result).not.toBeNull();
		expect(result).toBe(true);
	}, 60_000);

	it('Performs update token HTS', async () => {
		const result = await updateToken(stableCoinHTS);
		expect(result).toBeDefined();
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

		await delay(10);
		const resultHTS = await StableCoin.delete(
			new DeleteRequest({
				tokenId: stableCoinHTS?.tokenId?.toString() ?? '0.0.0',
			}),
		);
		const resultSC = await StableCoin.delete(
			new DeleteRequest({
				tokenId: stableCoinSC?.tokenId?.toString() ?? '0.0.0',
			}),
		);

		await delay();

		expect(resultHTS).toBe(true);
		expect(resultSC).toBe(true);
	}, 60_000) as void;

	async function burnOperation(
		stableCoin: StableCoinViewModel,
	): Promise<void> {
		const burnAmount = 1;

		const initialAmount = await StableCoin.getBalanceOf(
			new GetAccountBalanceRequest({
				tokenId: stableCoin?.tokenId?.toString() ?? '0.0.0',
				targetId: stableCoin?.treasury?.toString() ?? '0.0.0',
			}),
		);

		await StableCoin.burn(
			new BurnRequest({
				amount: burnAmount.toString(),
				tokenId: stableCoin?.tokenId?.toString() ?? '0.0.0',
			}),
		);

		await delay();

		const finalAmount = await StableCoin.getBalanceOf(
			new GetAccountBalanceRequest({
				tokenId: stableCoin?.tokenId?.toString() ?? '0.0.0',
				targetId: stableCoin?.treasury?.toString() ?? '0.0.0',
			}),
		);

		const final = initialAmount.value
			.toBigNumber()
			.sub(new BigDecimal(burnAmount.toString(), decimals).toBigNumber());

		expect(finalAmount.value.toBigNumber().toString()).toEqual(
			final.toString(),
		);
	}

	async function cashInOperation(
		stableCoin: StableCoinViewModel,
	): Promise<void> {
		const cashInAmount = 1;

		const initialAmount = await StableCoin.getBalanceOf(
			new GetAccountBalanceRequest({
				tokenId: stableCoin?.tokenId?.toString() ?? '0.0.0',
				targetId: CLIENT_ACCOUNT_ED25519.id.toString(),
			}),
		);

		await StableCoin.cashIn(
			new CashInRequest({
				amount: cashInAmount.toString(),
				tokenId: stableCoin?.tokenId?.toString() ?? '0.0.0',
				targetId: CLIENT_ACCOUNT_ED25519.id.toString(),
			}),
		);

		await delay();

		const finalAmount = await StableCoin.getBalanceOf(
			new GetAccountBalanceRequest({
				tokenId: stableCoin?.tokenId?.toString() ?? '0.0.0',
				targetId: CLIENT_ACCOUNT_ED25519.id.toString(),
			}),
		);

		const final = initialAmount.value
			.toBigNumber()
			.add(
				new BigDecimal(cashInAmount.toString(), decimals).toBigNumber(),
			);

		expect(finalAmount.value.toBigNumber().toString()).toEqual(
			final.toString(),
		);
	}

	async function rescueOperation(
		stableCoin: StableCoinViewModel,
	): Promise<void> {
		const rescueAmount = 1;

		const initialAmount = await StableCoin.getBalanceOf(
			new GetAccountBalanceRequest({
				tokenId: stableCoin?.tokenId?.toString() ?? '0.0.0',
				targetId: stableCoin?.treasury?.toString() ?? '0.0.0',
			}),
		);

		await StableCoin.rescue(
			new RescueRequest({
				amount: rescueAmount.toString(),
				tokenId: stableCoin?.tokenId?.toString() ?? '0.0.0',
			}),
		);

		await delay();

		const finalAmount = await StableCoin.getBalanceOf(
			new GetAccountBalanceRequest({
				tokenId: stableCoin?.tokenId?.toString() ?? '0.0.0',
				targetId: stableCoin?.treasury?.toString() ?? '0.0.0',
			}),
		);

		const final = initialAmount.value
			.toBigNumber()
			.sub(
				new BigDecimal(rescueAmount.toString(), decimals).toBigNumber(),
			);

		expect(finalAmount.value.toBigNumber().toString()).toEqual(
			final.toString(),
		);
	}

	async function rescueHBAROperation(
		stableCoin: StableCoinViewModel,
	): Promise<void> {
		const initalHBARAmount = BigDecimal.fromString('2.5', HBAR_DECIMALS);
		const rescueAmount = BigDecimal.fromString('1.5', HBAR_DECIMALS);

		const client = Client.forTestnet();

		client.setOperator(
			CLIENT_ACCOUNT_ED25519.id.toString(),
			CLIENT_ACCOUNT_ED25519.privateKey?.key ?? '0',
		);

		const transaction = new TransferTransaction()
			.addHbarTransfer(
				CLIENT_ACCOUNT_ED25519.id.toString(),
				Hbar.fromTinybars(
					'-' + initalHBARAmount.toBigNumber().toString(),
				),
			)
			.addHbarTransfer(
				stableCoin?.treasury?.toString() ?? '0.0.0',
				Hbar.fromTinybars(initalHBARAmount.toBigNumber().toString()),
			);

		await transaction.execute(client);

		await delay();

		const mirrorNodeAdapter: MirrorNodeAdapter =
			Injectable.resolve(MirrorNodeAdapter);

		const initialAmount = await mirrorNodeAdapter.getHBARBalance(
			stableCoin?.treasury?.toString() ?? '0.0.0',
		);

		await StableCoin.rescueHBAR(
			new RescueHBARRequest({
				amount: rescueAmount.toString(),
				tokenId: stableCoin?.tokenId?.toString() ?? '0.0.0',
			}),
		);

		await delay();

		const finalAmount = await mirrorNodeAdapter.getHBARBalance(
			stableCoin?.treasury?.toString() ?? '0.0.0',
		);

		const final = initialAmount
			.toBigNumber()
			.sub(rescueAmount.toBigNumber());

		expect(finalAmount.toBigNumber().toString()).toEqual(final.toString());
	}

	async function wipeOperation(
		stableCoin: StableCoinViewModel,
	): Promise<void> {
		const wipeAmount = 1;

		const initialAmount = await StableCoin.getBalanceOf(
			new GetAccountBalanceRequest({
				tokenId: stableCoin?.tokenId?.toString() ?? '0.0.0',
				targetId: CLIENT_ACCOUNT_ED25519.id.toString(),
			}),
		);

		await StableCoin.wipe(
			new WipeRequest({
				amount: wipeAmount.toString(),
				tokenId: stableCoin?.tokenId?.toString() ?? '0.0.0',
				targetId: CLIENT_ACCOUNT_ED25519.id.toString(),
			}),
		);

		await delay();

		const finalAmount = await StableCoin.getBalanceOf(
			new GetAccountBalanceRequest({
				tokenId: stableCoin?.tokenId?.toString() ?? '0.0.0',
				targetId: CLIENT_ACCOUNT_ED25519.id.toString(),
			}),
		);

		const final = initialAmount.value
			.toBigNumber()
			.sub(new BigDecimal(wipeAmount.toString(), decimals).toBigNumber());

		expect(finalAmount.value.toBigNumber().toString()).toEqual(
			final.toString(),
		);
	}

	async function capabilitiesOperation(
		stableCoin: StableCoinViewModel,
	): Promise<void> {
		const result = await StableCoin.capabilities(
			new CapabilitiesRequest({
				account: {
					accountId: CLIENT_ACCOUNT_ED25519.id.toString(),
					privateKey: CLIENT_ACCOUNT_ED25519.privateKey,
				},
				tokenId: stableCoin?.tokenId?.toString() ?? '0.0.0',
			}),
		);

		expect(result.capabilities).not.toBeNull();
	}

	async function freezeUnfreezeOperation(
		stableCoin: StableCoinViewModel,
	): Promise<void> {
		const notFrozen_1 = await StableCoin.isAccountFrozen(
			new FreezeAccountRequest({
				targetId: CLIENT_ACCOUNT_ED25519.id.toString(),
				tokenId: stableCoin?.tokenId?.toString() ?? '0.0.0',
			}),
		);

		const result_1 = await StableCoin.freeze(
			new FreezeAccountRequest({
				targetId: CLIENT_ACCOUNT_ED25519.id.toString(),
				tokenId: stableCoin?.tokenId?.toString() ?? '0.0.0',
			}),
		);

		await delay();

		const Frozen = await StableCoin.isAccountFrozen(
			new FreezeAccountRequest({
				targetId: CLIENT_ACCOUNT_ED25519.id.toString(),
				tokenId: stableCoin?.tokenId?.toString() ?? '0.0.0',
			}),
		);

		const result_2 = await StableCoin.unFreeze(
			new FreezeAccountRequest({
				targetId: CLIENT_ACCOUNT_ED25519.id.toString(),
				tokenId: stableCoin?.tokenId?.toString() ?? '0.0.0',
			}),
		);

		await delay();

		const notFrozen_2 = await StableCoin.isAccountFrozen(
			new FreezeAccountRequest({
				targetId: CLIENT_ACCOUNT_ED25519.id.toString(),
				tokenId: stableCoin?.tokenId?.toString() ?? '0.0.0',
			}),
		);

		expect(result_1).toBe(true);
		expect(result_2).toBe(true);
		expect(notFrozen_1).toBe(false);
		expect(Frozen).toBe(true);
		expect(notFrozen_2).toBe(false);
	}

	async function grantRevokeKYCOperation(
		stableCoin: StableCoinViewModel,
	): Promise<void> {
		const kycOK_1 = await StableCoin.isAccountKYCGranted(
			new KYCRequest({
				targetId: CLIENT_ACCOUNT_ED25519.id.toString(),
				tokenId: stableCoin?.tokenId?.toString() ?? '0.0.0',
			}),
		);

		const result_1 = await StableCoin.revokeKyc(
			new KYCRequest({
				targetId: CLIENT_ACCOUNT_ED25519.id.toString(),
				tokenId: stableCoin?.tokenId?.toString() ?? '0.0.0',
			}),
		);

		await delay();

		const kycNOK = await StableCoin.isAccountKYCGranted(
			new KYCRequest({
				targetId: CLIENT_ACCOUNT_ED25519.id.toString(),
				tokenId: stableCoin?.tokenId?.toString() ?? '0.0.0',
			}),
		);

		const result_2 = await StableCoin.grantKyc(
			new KYCRequest({
				targetId: CLIENT_ACCOUNT_ED25519.id.toString(),
				tokenId: stableCoin?.tokenId?.toString() ?? '0.0.0',
			}),
		);

		await delay();

		const kycOK_2 = await StableCoin.isAccountKYCGranted(
			new KYCRequest({
				targetId: CLIENT_ACCOUNT_ED25519.id.toString(),
				tokenId: stableCoin?.tokenId?.toString() ?? '0.0.0',
			}),
		);

		expect(result_1).toBe(true);
		expect(result_2).toBe(true);
		expect(kycOK_1).toBe(true);
		expect(kycNOK).toBe(false);
		expect(kycOK_2).toBe(true);
	}

	async function pauseUnpauseOperation(
		stableCoin: StableCoinViewModel,
	): Promise<void> {
		const result_1 = await StableCoin.pause(
			new PauseRequest({
				tokenId: stableCoin?.tokenId?.toString() ?? '0.0.0',
			}),
		);

		await delay();

		const result_2 = await StableCoin.unPause(
			new PauseRequest({
				tokenId: stableCoin?.tokenId?.toString() ?? '0.0.0',
			}),
		);

		await delay();

		expect(result_1).toBe(true);
		expect(result_2).toBe(true);
	}

	async function getReserve(
		stableCoin: StableCoinViewModel,
	): Promise<string> {
		return await StableCoin.getReserveAddress(
			new GetReserveAddressRequest({
				tokenId: stableCoin?.tokenId?.toString() ?? '0.0.0',
			}),
		);
	}

	async function updateReserve(
		stableCoin: StableCoinViewModel,
		newReserveAddress: string,
	): Promise<boolean> {
		return await StableCoin.updateReserveAddress(
			new UpdateReserveAddressRequest({
				tokenId: stableCoin?.tokenId?.toString() ?? '0.0.0',
				reserveAddress: newReserveAddress,
			}),
		);
	}

	async function updateToken(stableCoin: StableCoinViewModel): Promise<void> {
		const name = 'New Token Name';
		const symbol = 'New Token Symbol';
		const autoRenewPeriod = 30 * 24 * 3600;
		const expirationTimestampInDays =
			parseInt(
				timestampInNanoToDays(
					Number(stableCoin.expirationTimestamp?.toString() ?? '0'),
				),
			) + 1;
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
				tokenId: stableCoin?.tokenId?.toString() ?? '0.0.0',
				name: name,
				symbol: symbol,
				autoRenewPeriod: autoRenewPeriod.toString(),
				expirationTimestamp: daysToTimestampInNano(
					Number(expirationTimestampInDays),
				),
				freezeKey: freezeKey,
				kycKey: kycKey,
				wipeKey: wipeKey,
				pauseKey: pauseKey,
				feeScheduleKey: stableCoin.feeScheduleKey,
			}),
		);

		await delay();

		const res = await StableCoin.getInfo(
			new GetStableCoinDetailsRequest({
				id: stableCoin?.tokenId?.toString() ?? '0.0.0',
			}),
		);

		expect(res.name).toEqual(name);
		expect(res.symbol).toEqual(symbol);
		expect(res.autoRenewPeriod).toEqual(autoRenewPeriod);
		expect(timestampInNanoToDays(Number(res.expirationTimestamp))).toEqual(
			expirationTimestampInDays.toString(),
		);
		expect(res.freezeKey?.toString()).toEqual(
			freezeKey === Account.NullPublicKey
				? stableCoin.autoRenewAccount?.toString()
				: freezeKey?.toString(),
		);
		expect(res.kycKey?.toString()).toEqual(
			kycKey === Account.NullPublicKey
				? stableCoin.autoRenewAccount?.toString()
				: kycKey?.toString(),
		);
		expect(res.wipeKey?.toString()).toEqual(
			wipeKey === Account.NullPublicKey
				? stableCoin.autoRenewAccount?.toString()
				: wipeKey?.toString(),
		);
		expect(res.pauseKey?.toString()).toEqual(
			pauseKey === Account.NullPublicKey
				? stableCoin.autoRenewAccount?.toString()
				: pauseKey?.toString(),
		);
	}

	function timestampInNanoToDays(timestamp: number): string {
		const currentDate: Date = new Date();
		const currentExpirationTime: Date = new Date(
			Math.floor(timestamp / 1000000),
		);
		const diffInMs =
			currentExpirationTime.getTime() - currentDate.getTime();
		return Math.ceil(diffInMs / (1000 * 60 * 60 * 24)).toString();
	}

	function daysToTimestampInNano(days: number): string {
		const currentDate: Date = new Date();
		const currentDatePlusDays: Date = new Date();
		currentDatePlusDays.setDate(currentDate.getDate() + days);
		const currentDatePlusDaysInMillis = currentDatePlusDays.getTime();
		return (currentDatePlusDaysInMillis * 1000000).toString();
	}
});
