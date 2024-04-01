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

import {
	AccountCreateTransaction,
	TransferTransaction,
	KeyList,
	Hbar,
	Client,
	PrivateKey,
	AccountId,
} from '@hashgraph/sdk';
import {
	Account,
	AssociateTokenRequest,
	ConnectRequest,
	CreateRequest,
	InitializationRequest,
	LoggerTransports,
	Network,
	SDK,
	StableCoin,
	StableCoinViewModel,
	SupportedWallets,
	TokenSupplyType,
	Proxy,
	AcceptProxyOwnerRequest,
	Role,
	GrantRoleRequest,
	StableCoinRole,
	RevokeRoleRequest,
	ChangeProxyOwnerRequest,
	SignTransactionRequest,
	GetTransactionsRequest,
	SubmitTransactionRequest,
	GetAccountBalanceRequest,
	CashInRequest,
	WipeRequest,
	KYCRequest,
} from '../../../src';
import { MirrorNode } from '../../../src/domain/context/network/MirrorNode';
import { JsonRpcRelay } from '../../../src/domain/context/network/JsonRpcRelay';
import {
	CLIENT_ACCOUNT_ED25519,
	FACTORY_ADDRESS,
	HEDERA_TOKEN_MANAGER_ADDRESS,
	MIRROR_NODE,
	RPC_NODE,
	BACKEND_NODE,
	CLIENT_ACCOUNT_ECDSA,
} from '../../config';
import Injectable from '../../../src/core/Injectable';
import SetBackendRequest from '../../../src/port/in/request/SetBackendRequest.js';
import BackendEndpoint from '../../../src/domain/context/network/BackendEndpoint.js';

const decimals = 6;
const initialSupply = 1000;
const maxSupply = 1000000;
let multisigAccountId = '0.0.3792838';
const hederaNetwork = 'testnet';
const StableCoinSC_Name = 'TEST_MULTISIG_SC';
const StableCoinSC_Symbol = 'TEST_M_SC';
const ReserveInitialAmount = '1000000';

SDK.log = { level: 'ERROR', transports: new LoggerTransports.Console() };

let signerKeys: PrivateKey[];

describe('🧪 MultiSigTransactionAdapter test', () => {
	let stableCoinSC: StableCoinViewModel;

	const multisig_signing_submit = async (
		accounts: any[],
		transactionId: string,
	): Promise<boolean> => {
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
					network: hederaNetwork,
					wallet: SupportedWallets.CLIENT,
					mirrorNode: mirrorNode,
					rpcNode: rpcNode,
				}),
			);

			Injectable.resolveTransactionHandler();

			await StableCoin.signTransaction(
				new SignTransactionRequest({
					transactionId: transactionId,
				}),
			);
		}

		const result = await StableCoin.submitTransaction(
			new SubmitTransactionRequest({
				transactionId: transactionId,
			}),
		);

		await Network.connect(
			new ConnectRequest({
				account: {
					accountId: multisigAccountId,
				},
				network: hederaNetwork,
				wallet: SupportedWallets.MULTISIG,
				mirrorNode: mirrorNode,
				rpcNode: rpcNode,
			}),
		);

		Injectable.resolveTransactionHandler();

		return result;
	};

	const deploy_multisig_account = async (): Promise<void> => {
		signerKeys = [
			CLIENT_ACCOUNT_ECDSA.privateKey!.toHashgraphKey(),
			CLIENT_ACCOUNT_ED25519.privateKey!.toHashgraphKey(),
		];

		const keyList = KeyList.of(
			signerKeys[0].publicKey,
			signerKeys[1].publicKey,
		);

		const newAccountTx = new AccountCreateTransaction().setKey(keyList);

		const client = Client.forTestnet().setOperator(
			AccountId.fromString(CLIENT_ACCOUNT_ECDSA.id.toString()),
			PrivateKey.fromStringECDSA(
				CLIENT_ACCOUNT_ECDSA.privateKey!.key.toString(),
			),
		);

		const newAccountResponse = await newAccountTx.execute(client);

		await delay();

		// Get receipt
		const newAccountReceipt = await newAccountResponse.getReceipt(client);
		// Get the account ID
		const newAccountId = newAccountReceipt.accountId;

		multisigAccountId = newAccountId!.toString();

		const newTransferTx = new TransferTransaction()
			.addHbarTransfer(CLIENT_ACCOUNT_ECDSA.id.toString(), new Hbar(-100))
			.addHbarTransfer(newAccountId!, new Hbar(100));

		await newTransferTx.execute(client);
	};

	const delay = async (seconds = 5): Promise<void> => {
		seconds = seconds * 1000;
		await new Promise((r) => setTimeout(r, seconds));
	};

	const mirrorNode: MirrorNode = {
		name: MIRROR_NODE.name,
		baseUrl: MIRROR_NODE.baseUrl,
	};

	const rpcNode: JsonRpcRelay = {
		name: RPC_NODE.name,
		baseUrl: RPC_NODE.baseUrl,
	};

	const backendEndpoint: BackendEndpoint = {
		url: BACKEND_NODE.baseUrl,
	};

	beforeAll(async () => {
		await Network.connect(
			new ConnectRequest({
				account: {
					accountId: CLIENT_ACCOUNT_ED25519.id.toString(),
					privateKey: CLIENT_ACCOUNT_ED25519.privateKey,
				},
				network: hederaNetwork,
				wallet: SupportedWallets.CLIENT,
				mirrorNode: mirrorNode,
				rpcNode: rpcNode,
			}),
		);
		await Network.init(
			new InitializationRequest({
				network: hederaNetwork,
				configuration: {
					factoryAddress: FACTORY_ADDRESS,
				},
				mirrorNode: mirrorNode,
				rpcNode: rpcNode,
				backend: backendEndpoint,
			}),
		);
		Injectable.resolveTransactionHandler();

		// Deploy MultiSig account

		// await deploy_multisig_account();

		// Deploy StableCoin

		const requestSC = new CreateRequest({
			name: StableCoinSC_Name,
			symbol: StableCoinSC_Symbol,
			decimals: decimals,
			initialSupply: initialSupply.toString(),
			maxSupply: maxSupply.toString(),
			freezeKey: Account.NullPublicKey,
			kycKey: Account.NullPublicKey,
			wipeKey: Account.NullPublicKey,
			pauseKey: Account.NullPublicKey,
			supplyType: TokenSupplyType.FINITE,
			stableCoinFactory: FACTORY_ADDRESS,
			hederaTokenManager: HEDERA_TOKEN_MANAGER_ADDRESS,
			reserveInitialAmount: ReserveInitialAmount,
			createReserve: true,
			grantKYCToOriginalSender: true,
			burnRoleAccount: multisigAccountId,
			freezeRoleAccount: multisigAccountId,
			kycRoleAccount: multisigAccountId,
			wipeRoleAccount: multisigAccountId,
			pauseRoleAccount: multisigAccountId,
			rescueRoleAccount: multisigAccountId,
			deleteRoleAccount: multisigAccountId,
			cashInRoleAccount: multisigAccountId,
			cashInRoleAllowance: '0',
			metadata: '',
		});

		stableCoinSC = (await StableCoin.create(requestSC)).coin;

		await delay();

		await StableCoin.associate(
			new AssociateTokenRequest({
				targetId: CLIENT_ACCOUNT_ED25519.id.toString(),
				tokenId: stableCoinSC?.tokenId?.toString() ?? '0.0.0',
			}),
		);

		await Role.grantRole(
			new GrantRoleRequest({
				targetId: multisigAccountId,
				tokenId: stableCoinSC?.tokenId?.toString() ?? '0.0.0',
				role: StableCoinRole.DEFAULT_ADMIN_ROLE,
			}),
		);

		await Role.revokeRole(
			new RevokeRoleRequest({
				targetId: CLIENT_ACCOUNT_ED25519.id.toString(),
				tokenId: stableCoinSC?.tokenId?.toString() ?? '0.0.0',
				role: StableCoinRole.DEFAULT_ADMIN_ROLE,
			}),
		);

		await Proxy.changeProxyOwner(
			new ChangeProxyOwnerRequest({
				tokenId: stableCoinSC?.tokenId?.toString() ?? '0.0.0',
				targetId: multisigAccountId,
			}),
		);

		await delay();

		await Network.connect(
			new ConnectRequest({
				account: {
					accountId: multisigAccountId,
				},
				network: hederaNetwork,
				wallet: SupportedWallets.MULTISIG,
				mirrorNode: mirrorNode,
				rpcNode: rpcNode,
			}),
		);

		Injectable.resolveTransactionHandler();
	}, 60_000);

	it.skip('MultiSig should accept proxy ownership', async () => {
		await Proxy.acceptProxyOwner(
			new AcceptProxyOwnerRequest({
				tokenId: stableCoinSC?.tokenId?.toString() ?? '0.0.0',
			}),
		);

		const transactionIds = await StableCoin.getTransactions(
			new GetTransactionsRequest({
				publicKey: {
					key: CLIENT_ACCOUNT_ECDSA.privateKey!.toHashgraphKey().publicKey.toStringRaw(),
					type: CLIENT_ACCOUNT_ECDSA.publicKey!.type,
				},
				page: 1,
				limit: 1,
				status: 'pending',
			}),
		);

		const transactionId = transactionIds[0].id;

		const result = await multisig_signing_submit(
			[CLIENT_ACCOUNT_ECDSA, CLIENT_ACCOUNT_ED25519],
			transactionId,
		);

		expect(result).toBe(true);
	}, 60_000);

	it.skip('MultiSig should grant KYC, cash in and wipe', async () => {
		await StableCoin.grantKyc(
			new KYCRequest({
				tokenId: stableCoinSC?.tokenId?.toString() ?? '0.0.0',
				targetId: CLIENT_ACCOUNT_ED25519.id.toString(),
			}),
		);

		await multisig_signing_submit(
			[CLIENT_ACCOUNT_ECDSA, CLIENT_ACCOUNT_ED25519],
			(
				await StableCoin.getTransactions(
					new GetTransactionsRequest({
						publicKey: {
							key: CLIENT_ACCOUNT_ECDSA.privateKey!.toHashgraphKey().publicKey.toStringRaw(),
							type: CLIENT_ACCOUNT_ECDSA.publicKey!.type,
						},
						page: 1,
						limit: 1,
						status: 'pending',
					}),
				)
			)[0].id,
		);

		await delay();

		const Amount = 1;

		const balance_before = await StableCoin.getBalanceOf(
			new GetAccountBalanceRequest({
				tokenId: stableCoinSC?.tokenId?.toString() ?? '0.0.0',
				targetId: CLIENT_ACCOUNT_ED25519.id.toString(),
			}),
		);

		await StableCoin.cashIn(
			new CashInRequest({
				amount: Amount.toString(),
				tokenId: stableCoinSC?.tokenId?.toString() ?? '0.0.0',
				targetId: CLIENT_ACCOUNT_ED25519.id.toString(),
			}),
		);

		await multisig_signing_submit(
			[CLIENT_ACCOUNT_ECDSA, CLIENT_ACCOUNT_ED25519],
			(
				await StableCoin.getTransactions(
					new GetTransactionsRequest({
						publicKey: {
							key: CLIENT_ACCOUNT_ECDSA.privateKey!.toHashgraphKey().publicKey.toStringRaw(),
							type: CLIENT_ACCOUNT_ECDSA.publicKey!.type,
						},
						page: 1,
						limit: 1,
						status: 'pending',
					}),
				)
			)[0].id,
		);

		await delay();

		const balance_after_cashIn = await StableCoin.getBalanceOf(
			new GetAccountBalanceRequest({
				tokenId: stableCoinSC?.tokenId?.toString() ?? '0.0.0',
				targetId: CLIENT_ACCOUNT_ED25519.id.toString(),
			}),
		);

		await StableCoin.wipe(
			new WipeRequest({
				amount: Amount.toString(),
				tokenId: stableCoinSC?.tokenId?.toString() ?? '0.0.0',
				targetId: CLIENT_ACCOUNT_ED25519.id.toString(),
			}),
		);

		await multisig_signing_submit(
			[CLIENT_ACCOUNT_ECDSA, CLIENT_ACCOUNT_ED25519],
			(
				await StableCoin.getTransactions(
					new GetTransactionsRequest({
						publicKey: {
							key: CLIENT_ACCOUNT_ECDSA.privateKey!.toHashgraphKey().publicKey.toStringRaw(),
							type: CLIENT_ACCOUNT_ECDSA.publicKey!.type,
						},
						page: 1,
						limit: 1,
						status: 'pending',
					}),
				)
			)[0].id,
		);

		await delay();

		const balance_after_wipe = await StableCoin.getBalanceOf(
			new GetAccountBalanceRequest({
				tokenId: stableCoinSC?.tokenId?.toString() ?? '0.0.0',
				targetId: CLIENT_ACCOUNT_ED25519.id.toString(),
			}),
		);

		expect(balance_before.value.toString()).toEqual('0');
		expect(balance_after_cashIn.value.toString()).toEqual(
			Amount.toString(),
		);
		expect(balance_after_wipe.value.toString()).toEqual('0');
	}, 600_000);
});
