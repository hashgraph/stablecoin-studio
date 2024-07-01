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

/* eslint-disable jest/no-standalone-expect */

import EventService from '../../../src/app/service/event/EventService.js';
import { WalletEvents } from '../../../src/app/service/event/WalletEvent.js';
import {
	Account,
	Balance,
	BigDecimal,
	HBAR_DECIMALS,
	HederaId,
	LoggerTransports,
	Network,
	Role,
	SDK,
	StableCoin,
	StableCoinRole,
	StableCoinViewModel,
	TokenSupplyType,
} from '../../../src/index.js';
import {
	AssociateTokenRequest,
	BurnRequest,
	CapabilitiesRequest,
	CashInRequest,
	CreateRequest,
	DeleteRequest,
	FreezeAccountRequest,
	GetAccountBalanceHBARRequest,
	GetAccountBalanceRequest,
	GetReserveAddressRequest,
	GetTransactionsRequest,
	GrantRoleRequest,
	InitializationRequest,
	IsAccountAssociatedTokenRequest,
	KYCRequest,
	PauseRequest,
	RescueHBARRequest,
	RescueRequest,
	SignTransactionRequest,
	SubmitTransactionRequest,
	TransfersRequest,
	UpdateRequest,
	UpdateReserveAddressRequest,
	WipeRequest,
} from '../../../src/port/in/request/index.js';
import ConnectRequest, {
	SupportedWallets,
} from '../../../src/port/in/request/ConnectRequest.js';
import GetStableCoinDetailsRequest from '../../../src/port/in/request/GetStableCoinDetailsRequest.js';
import {
	BACKEND_NODE,
	CLIENT_ACCOUNT_ECDSA,
	CLIENT_ACCOUNT_ED25519,
	FACTORY_ADDRESS,
	HEDERA_TOKEN_MANAGER_ADDRESS,
	MULTISIG_ACCOUNT_ADDRESS,
	DECIMALS,
	PROXY_CONTRACT_ID,
	MAX_SUPPLY,
	INITIAL_SUPPLY,
	EXPIRATION_TIMESTAMP,
	AUTO_RENEW_ACCOUNT,
	RESERVE_AMOUNT,
	RESERVE_ADDRESS,
} from '../../config.js';
import { Client, Hbar, TransferTransaction } from '@hashgraph/sdk';
import { MirrorNode } from '../../../src/domain/context/network/MirrorNode.js';
import { JsonRpcRelay } from '../../../src/domain/context/network/JsonRpcRelay.js';
import BaseError, {
	ErrorCategory,
	ErrorCode,
} from '../../../src/core/error/BaseError.js';
import BackendEndpoint from '../../../src/domain/context/network/BackendEndpoint.js';
import { Environment } from '../../../src/domain/context/network/Environment.js';
import { MultiSigTransaction } from '../../../src/domain/context/transaction/MultiSigTransaction.js';
import { ConsensusNode } from '../../../src/domain/context/network/ConsensusNodes.js';
import Injectable from '../../../src/core/Injectable.js';

const initialSupply = parseInt(INITIAL_SUPPLY);
const maxSupply = parseInt(MAX_SUPPLY);
const multisigAccountId = MULTISIG_ACCOUNT_ADDRESS;

// let multiSigTransaction: MultiSigTransaction;

SDK.log = { level: 'ERROR', transports: new LoggerTransports.Console() };

describe('🧪 Stablecoin test', () => {
	const stableCoin = {
		tokenId: new HederaId('0.0.5555555'),
		treasury: new HederaId(PROXY_CONTRACT_ID),
		decimals: DECIMALS,
		expirationTimestamp: parseInt(EXPIRATION_TIMESTAMP),
		autoRenewAccount: HederaId.from(AUTO_RENEW_ACCOUNT),
	};

	/*const stableCoinHTS = {
		tokenId: new HederaId('0.0.4444444'),
		decimals: DECIMALS,
	};*/

	const mirrorNode: MirrorNode = {
		name: 'testmirrorNode',
		baseUrl: 'https://testnet.mirrornode.hedera.com/api/v1/',
	};

	const rpcNode: JsonRpcRelay = {
		name: 'testrpcNode',
		baseUrl: 'https://testnet.hashio.io/api',
	};

	const newConsensusNode_1: ConsensusNode = {
		url: '34.94.106.61:50211',
		nodeId: '0.0.3',
	};
	const newConsensusNode_2: ConsensusNode = {
		url: '35.237.119.55:50211',
		nodeId: '0.0.4',
	};
	const consensusNodes = [newConsensusNode_1, newConsensusNode_2];

	const backendEndpoint: BackendEndpoint = {
		url: BACKEND_NODE.baseUrl,
	};

	const requestSC = new CreateRequest({
		name: 'TEST_ACCELERATOR_SC',
		symbol: 'TEST',
		decimals: DECIMALS,
		initialSupply: initialSupply.toString(),
		maxSupply: maxSupply.toString(),
		freezeKey: Account.NullPublicKey,
		kycKey: Account.NullPublicKey,
		wipeKey: Account.NullPublicKey,
		pauseKey: Account.NullPublicKey,
		supplyType: TokenSupplyType.FINITE,
		stableCoinFactory: FACTORY_ADDRESS,
		hederaTokenManager: HEDERA_TOKEN_MANAGER_ADDRESS,
		reserveInitialAmount: RESERVE_AMOUNT,
		reserveAddress: RESERVE_ADDRESS,
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
		metadata: '',
	});
	const requestHTS = new CreateRequest({
		name: 'TEST_ACCELERATOR_HTS',
		symbol: 'TEST',
		decimals: DECIMALS,
		initialSupply: initialSupply.toString(),
		freezeKey: CLIENT_ACCOUNT_ED25519.publicKey,
		kycKey: CLIENT_ACCOUNT_ED25519.publicKey,
		wipeKey: CLIENT_ACCOUNT_ED25519.publicKey,
		pauseKey: CLIENT_ACCOUNT_ED25519.publicKey,
		supplyType: TokenSupplyType.INFINITE,
		stableCoinFactory: FACTORY_ADDRESS,
		hederaTokenManager: HEDERA_TOKEN_MANAGER_ADDRESS,
		reserveInitialAmount: RESERVE_AMOUNT,
		reserveAddress: RESERVE_ADDRESS,
		createReserve: true,
		grantKYCToOriginalSender: true,
		burnRoleAccount: CLIENT_ACCOUNT_ED25519.id.toString(),
		rescueRoleAccount: CLIENT_ACCOUNT_ED25519.id.toString(),
		deleteRoleAccount: CLIENT_ACCOUNT_ED25519.id.toString(),
		cashInRoleAccount: CLIENT_ACCOUNT_ED25519.id.toString(),
		cashInRoleAllowance: '0',
		metadata: '',
	});

	beforeAll(async () => {
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
				backend: backendEndpoint,
			}),
		);
		Injectable.resolveTransactionHandler();

		await Role.grantRole(
			new GrantRoleRequest({
				targetId: CLIENT_ACCOUNT_ED25519.id.toString(),
				tokenId: stableCoin?.tokenId?.toString() ?? '0.0.0',
				role: StableCoinRole.CASHIN_ROLE,
			}),
		);

		await StableCoin.grantKyc(
			new KYCRequest({
				targetId: CLIENT_ACCOUNT_ED25519.id.toString(),
				tokenId: stableCoin?.tokenId?.toString() ?? '0.0.0',
			}),
		);

		await StableCoin.grantKyc(
			new KYCRequest({
				targetId: PROXY_CONTRACT_ID,
				tokenId: stableCoin?.tokenId?.toString() ?? '0.0.0',
			}),
		);
	}, 180_000);

	it('Gets a coin', async () => {
		const res = await StableCoin.getInfo(
			new GetStableCoinDetailsRequest({
				id: stableCoin?.tokenId?.toString() ?? '0.0.0',
			}),
		);
		expect(res).not.toBeNull();
		expect(res.decimals).not.toBeNull();
		expect(res.name).not.toBeNull();
		expect(res.symbol).not.toBeNull();
		expect(res.treasury).not.toBeNull();
		expect(res.tokenId).not.toBeNull();
		expect(res.metadata).not.toBeNull();
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
				tokenId: stableCoin?.tokenId?.toString() ?? '0.0.0',
				targetId: CLIENT_ACCOUNT_ED25519.id.toString(),
			}),
		);
		expect(result instanceof Balance).toBe(true);
		expect(result.value.toString()).toEqual('0');
	}, 60_000);

	it('Performs capabilities SC', async () => {
		const result = await capabilitiesOperation(stableCoin);
		expect(result).not.toBeNull();
	}, 60_000);

	it('Performs a cash in SC', async () => {
		await StableCoin.create(requestSC);

		await Role.grantRole(
			new GrantRoleRequest({
				targetId: CLIENT_ACCOUNT_ED25519.id.toString(),
				tokenId: stableCoin?.tokenId?.toString() ?? '0.0.0',
				role: StableCoinRole.CASHIN_ROLE,
			}),
		);
		const result = await cashInOperation(stableCoin);
		expect(result).not.toBeNull();
	}, 60_000);

	it('Performs burn SC', async () => {
		await StableCoin.create(requestSC);

		const result = await burnOperation(stableCoin);
		expect(result).not.toBeNull();
	}, 60_000);

	it('Performs rescue SC', async () => {
		await StableCoin.create(requestSC);

		const result = await rescueOperation(stableCoin);
		expect(result).not.toBeNull();
	}, 60_000);

	it('Performs rescue HBAR SC', async () => {
		await StableCoin.create(requestSC);

		const result = await rescueHBAROperation(stableCoin);
		expect(result).not.toBeNull();
	}, 60_000);

	it('Performs wipe SC', async () => {
		await StableCoin.create(requestSC);

		await cashInOperation(stableCoin);
		const result = await wipeOperation(stableCoin);
		expect(result).not.toBeNull();
	}, 60_000);

	it('Performs freeze and unfreeze SC', async () => {
		await StableCoin.create(requestSC);

		const result = await freezeUnfreezeOperation(stableCoin);
		expect(result).not.toBeNull();
	}, 60_000);

	it('Performs grant and revoke kyc SC', async () => {
		await StableCoin.create(requestSC);

		const result = await grantRevokeKYCOperation(stableCoin);
		expect(result).not.toBeNull();
	}, 60_000);

	it('Performs pause and unpause SC', async () => {
		await StableCoin.create(requestSC);

		const result = await pauseUnpauseOperation(stableCoin);
		expect(result).not.toBeNull();
	}, 90_000);

	it('Performs update token SC', async () => {
		await StableCoin.create(requestSC);

		const result = await updateToken(stableCoin);
		expect(result).not.toBeNull();
	}, 60_000);

	it.skip('Performs add, multisign and submit transaction', async () => {
		await Network.connect(
			new ConnectRequest({
				account: {
					accountId: multisigAccountId,
				},
				network: 'testnet',
				wallet: SupportedWallets.MULTISIG,
				mirrorNode: mirrorNode,
				rpcNode: rpcNode,
				consensusNodes: consensusNodes,
			}),
		);

		Injectable.resolveTransactionHandler();

		await StableCoin.associate(
			new AssociateTokenRequest({
				targetId: multisigAccountId,
				tokenId: stableCoin?.tokenId?.toString() ?? '0.0.0',
			}),
		);

		const trans_account = await StableCoin.getTransactions(
			new GetTransactionsRequest({
				page: 1,
				limit: 1,
				status: 'pending',
				account: multisigAccountId,
			}),
		);

		const trans_pk = await StableCoin.getTransactions(
			new GetTransactionsRequest({
				publicKey: {
					key: CLIENT_ACCOUNT_ECDSA.privateKey
						? CLIENT_ACCOUNT_ECDSA.privateKey
								.toHashgraphKey()
								.publicKey.toStringRaw()
						: '',
					type: CLIENT_ACCOUNT_ECDSA.publicKey?.type,
				},
				page: 1,
				limit: 1,
				status: 'pending',
			}),
		);

		const trans = await StableCoin.getTransactions(
			new GetTransactionsRequest({
				page: 1,
				limit: 1,
			}),
		);

		const accounts = [CLIENT_ACCOUNT_ECDSA, CLIENT_ACCOUNT_ED25519];

		for (const account of accounts) {
			await Network.connect(
				new ConnectRequest({
					account: {
						accountId: account.id.toString(),
						privateKey: {
							key: account.privateKey?.key ?? '',
							type: account.privateKey?.type ?? '',
						},
					},
					network: 'testnet',
					wallet: SupportedWallets.CLIENT,
					mirrorNode: mirrorNode,
					rpcNode: rpcNode,
				}),
			);

			Injectable.resolveTransactionHandler();

			await StableCoin.signTransaction(
				new SignTransactionRequest({
					transactionId: '1',
				}),
			);
		}

		const result = await StableCoin.submitTransaction(
			new SubmitTransactionRequest({
				transactionId: '1',
			}),
		);

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

		expect(result).toBe(true);
		expect(trans.transactions[0].id).toEqual(trans_pk.transactions[0].id);
		expect(trans.transactions[0].id).toEqual(
			trans_account.transactions[0].id,
		);
	}, 180_000);

	// ----------------------HTS--------------------------

	it('Performs rescue HTS', async () => {
		await StableCoin.create(requestHTS);
		const result = await rescueOperation(stableCoin);
		expect(result).not.toBeNull();
	}, 60_000);

	it('Performs rescue HBAR HTS', async () => {
		await StableCoin.create(requestHTS);
		const result = await rescueHBAROperation(stableCoin);
		expect(result).not.toBeNull();
	}, 60_000);

	it('Performs wipe HTS', async () => {
		await StableCoin.create(requestHTS);
		await cashInOperation(stableCoin);
		const result = await wipeOperation(stableCoin);
		expect(result).not.toBeNull();
	}, 60_000);

	it('Performs capabilities HTS', async () => {
		await StableCoin.create(requestHTS);
		const result = await capabilitiesOperation(stableCoin);
		expect(result).not.toBeNull();
	}, 60_000);

	it('Performs freeze and unfreeze HTS', async () => {
		await StableCoin.create(requestHTS);
		const result = await freezeUnfreezeOperation(stableCoin);
		expect(result).not.toBeNull();
	}, 60_000);

	it('Performs grant and revoke kyc HTS', async () => {
		await StableCoin.create(requestHTS);
		const result = await grantRevokeKYCOperation(stableCoin);
		expect(result).not.toBeNull();
	}, 60_000);

	it('Performs pause and unpause HTS', async () => {
		await StableCoin.create(requestHTS);
		const result = await pauseUnpauseOperation(stableCoin);
		expect(result).not.toBeNull();
	}, 90_000);

	it('Performs reserve', async () => {
		const newReserve = '0.0.3333333';

		await StableCoin.create(requestHTS);

		const result_1 = await getReserve(stableCoin);
		expect(result_1).not.toEqual('0.0.0');

		await updateReserve(stableCoin, newReserve);

		const result_2 = await getReserve(stableCoin);
		expect(result_2).toEqual(newReserve);

		await updateReserve(stableCoin, result_1);

		const result_3 = await getReserve(stableCoin);
		expect(result_3).toEqual(result_1);
	}, 60_000);

	it('Performs update token HTS', async () => {
		const result = await updateToken(stableCoin);
		expect(result).not.toBeNull();
	}, 60_000);

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

		const finalAmount = await StableCoin.getBalanceOf(
			new GetAccountBalanceRequest({
				tokenId: stableCoin?.tokenId?.toString() ?? '0.0.0',
				targetId: stableCoin?.treasury?.toString() ?? '0.0.0',
			}),
		);

		const final = initialAmount.value
			.toBigNumber()
			.sub(new BigDecimal(burnAmount.toString(), DECIMALS).toBigNumber());

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

		const finalAmount = await StableCoin.getBalanceOf(
			new GetAccountBalanceRequest({
				tokenId: stableCoin?.tokenId?.toString() ?? '0.0.0',
				targetId: CLIENT_ACCOUNT_ED25519.id.toString(),
			}),
		);

		const final = initialAmount.value
			.toBigNumber()
			.add(
				new BigDecimal(cashInAmount.toString(), DECIMALS).toBigNumber(),
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

		const finalAmount = await StableCoin.getBalanceOf(
			new GetAccountBalanceRequest({
				tokenId: stableCoin?.tokenId?.toString() ?? '0.0.0',
				targetId: stableCoin?.treasury?.toString() ?? '0.0.0',
			}),
		);

		const final = initialAmount.value
			.toBigNumber()
			.sub(
				new BigDecimal(rescueAmount.toString(), DECIMALS).toBigNumber(),
			);

		expect(finalAmount.value.toBigNumber().toString()).toEqual(
			final.toString(),
		);
	}

	async function rescueHBAROperation(
		stableCoin: StableCoinViewModel,
	): Promise<void> {
		const rescueAmount = BigDecimal.fromString('1.5', HBAR_DECIMALS);

		const initialAmount = await StableCoin.getBalanceOfHBAR(
			new GetAccountBalanceHBARRequest({
				treasuryAccountId: stableCoin?.treasury?.toString() ?? '0.0.0',
			}),
		);
		await StableCoin.rescueHBAR(
			new RescueHBARRequest({
				amount: rescueAmount.toString(),
				tokenId: stableCoin?.tokenId?.toString() ?? '0.0.0',
			}),
		);

		const finalAmount = await StableCoin.getBalanceOfHBAR(
			new GetAccountBalanceHBARRequest({
				treasuryAccountId: stableCoin?.treasury?.toString() ?? '0.0.0',
			}),
		);

		const final = initialAmount.value
			.toBigNumber()
			.sub(rescueAmount.toBigNumber());

		expect(finalAmount.value.toBigNumber().toString()).toEqual(
			final.toString(),
		);
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

		const finalAmount = await StableCoin.getBalanceOf(
			new GetAccountBalanceRequest({
				tokenId: stableCoin?.tokenId?.toString() ?? '0.0.0',
				targetId: CLIENT_ACCOUNT_ED25519.id.toString(),
			}),
		);

		const final = initialAmount.value
			.toBigNumber()
			.sub(new BigDecimal(wipeAmount.toString(), DECIMALS).toBigNumber());

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

		const result_2 = await StableCoin.unPause(
			new PauseRequest({
				tokenId: stableCoin?.tokenId?.toString() ?? '0.0.0',
			}),
		);

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
		const metadata = 'New Metadata';

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
				metadata: metadata,
			}),
		);

		const res = await StableCoin.getInfo(
			new GetStableCoinDetailsRequest({
				id: stableCoin?.tokenId?.toString() ?? '0.0.0',
			}),
		);

		expect(res.name).toEqual(name);
		expect(res.symbol).toEqual(symbol);
		expect(res.autoRenewPeriod).toEqual(autoRenewPeriod);
		/*expect([
			timestampInNanoToDays(Number(res.expirationTimestamp)),
			(
				+timestampInNanoToDays(Number(res.expirationTimestamp)) - 1
			).toString(),
		]).toContain(expirationTimestampInDays.toString());*/
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
		expect(res.metadata).toEqual(metadata);
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
