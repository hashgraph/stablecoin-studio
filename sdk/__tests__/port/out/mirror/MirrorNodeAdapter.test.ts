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
/* eslint-disable @typescript-eslint/no-non-null-assertion */
import { StableCoin } from '../../../../src/domain/context/stablecoin/StableCoin.js';
import StableCoinList from '../../../../src/port/out/mirror/response/StableCoinListViewModel.js';
import StableCoinDetail from '../../../../src/port/out/mirror/response/StableCoinViewModel.js';
import AccountInfo from '../../../../src/port/out/mirror/response/AccountViewModel.js';
import {
	HEDERA_ID_ACCOUNT_ECDSA,
	HEDERA_ID_ACCOUNT_ED25519,
	CLIENT_ACCOUNT_ECDSA,
	CLIENT_ACCOUNT_ED25519,
	ENVIRONMENT,
	FACTORY_ADDRESS,
	HEDERA_ERC20_ADDRESS,
} from '../../../config.js';
import {
	BigDecimal,
	LoggerTransports,
	SDK,
	StableCoinCapabilities,
	TokenSupplyType,
} from '../../../../src/index.js';
import Account from '../../../../src/domain/context/account/Account.js';
import { MirrorNodeAdapter } from '../../../../src/port/out/mirror/MirrorNodeAdapter.js';
import RPCTransactionAdapter from '../../../../src/port/out/rpc/RPCTransactionAdapter.js';
import TransactionResponse from '../../../../src/domain/context/transaction/TransactionResponse.js';
import NetworkService from '../../../../src/app/service/NetworkService.js';
import RPCQueryAdapter from '../../../../src/port/out/rpc/RPCQueryAdapter.js';
import StableCoinService from '../../../../src/app/service/StableCoinService.js';
import Injectable from '../../../../src/core/Injectable.js';
import { Wallet } from 'ethers';
import { ContractId as HContractId } from '@hashgraph/sdk';
import PublicKey from '../../../../src/domain/context/account/PublicKey.js';
import ContractId from '../../../../src/domain/context/contract/ContractId.js';
import { RESERVE_DECIMALS } from '../../../../src/domain/context/reserve/Reserve.js';

SDK.log = { level: 'ERROR', transports: new LoggerTransports.Console() };

describe('🧪 MirrorNodeAdapter', () => {
	let stableCoinCapabilitiesSC: StableCoinCapabilities;

	let mn: MirrorNodeAdapter;
	let th: RPCTransactionAdapter;
	let tr: TransactionResponse;
	let ns: NetworkService;
	let rpcQueryAdapter: RPCQueryAdapter;
	let stableCoinService: StableCoinService;
	const createToken = async (
		stablecoin: StableCoin,
		account: Account,
	): Promise<StableCoinCapabilities> => {
		tr = await th.create(
			stablecoin,
			new ContractId(FACTORY_ADDRESS),
			new ContractId(HEDERA_ERC20_ADDRESS),
			true,
			undefined,
			BigDecimal.fromString('100000000', RESERVE_DECIMALS),
		);
		const tokenIdSC = ContractId.fromHederaContractId(
			HContractId.fromSolidityAddress(tr.response[0][3]),
		);
		return await stableCoinService.getCapabilities(account, tokenIdSC);
	};
	beforeAll(async () => {
		mn = new MirrorNodeAdapter();
		mn.setEnvironment(ENVIRONMENT);
		th = Injectable.resolve(RPCTransactionAdapter);
		ns = Injectable.resolve(NetworkService);
		rpcQueryAdapter = Injectable.resolve(RPCQueryAdapter);
		rpcQueryAdapter.init();
		ns.environment = 'testnet';
		await th.init(true);
		await th.register(CLIENT_ACCOUNT_ECDSA, true);
		th.signerOrProvider = new Wallet(
			CLIENT_ACCOUNT_ECDSA.privateKey?.key ?? '',
			th.provider,
		);
		const mirrorNodeAdapter = Injectable.resolve(MirrorNodeAdapter);
		mirrorNodeAdapter.setEnvironment('testnet');
		stableCoinService = Injectable.resolve(StableCoinService);

		const coinSC = new StableCoin({
			name: 'TEST_ACCELERATOR_SC',
			symbol: 'TEST',
			decimals: 6,
			initialSupply: BigDecimal.fromString('1000', 6),
			autoRenewAccount: CLIENT_ACCOUNT_ECDSA.id,
			adminKey: PublicKey.NULL,
			freezeKey: PublicKey.NULL,
			wipeKey: PublicKey.NULL,
			pauseKey: PublicKey.NULL,
			supplyKey: PublicKey.NULL,
			supplyType: TokenSupplyType.INFINITE,
			// grantKYCToOriginalSender:true
		});

		stableCoinCapabilitiesSC = await createToken(
			coinSC,
			CLIENT_ACCOUNT_ECDSA,
		);

		expect(stableCoinCapabilitiesSC).not.toBeNull();
	}, 1500000);

	// eslint-disable-next-line jest/no-disabled-tests
	it('Test get stable coins list', async () => {
		const stableCoinList: StableCoinList = await mn.getStableCoinsList(
			HEDERA_ID_ACCOUNT_ED25519,
		);
		expect(stableCoinList.coins.length).toBeGreaterThan(0);
	});

	it('Test get stable coin', async () => {
		const stableCoinDetail: StableCoinDetail = await mn.getStableCoin(
			stableCoinCapabilitiesSC!.coin!.tokenId!,
		);
		expect(stableCoinDetail.tokenId).toEqual(
			stableCoinCapabilitiesSC!.coin!.tokenId,
		);
		expect(stableCoinDetail.name).toEqual(
			stableCoinCapabilitiesSC!.coin!.name,
		);
		expect(stableCoinDetail.symbol).toEqual(
			stableCoinCapabilitiesSC!.coin!.symbol,
		);
		expect(stableCoinDetail.decimals).toEqual(
			stableCoinCapabilitiesSC!.coin!.decimals,
		);
		expect(stableCoinDetail.evmProxyAddress?.toString()).toEqual(
			stableCoinCapabilitiesSC!.coin!.evmProxyAddress?.value,
		);
		expect(stableCoinDetail.autoRenewAccount).toEqual(
			CLIENT_ACCOUNT_ECDSA.id,
		);
		expect(stableCoinDetail.autoRenewPeriod).toEqual(
			stableCoinCapabilitiesSC!.coin!.autoRenewPeriod,
		);
		// expect(stableCoinDetail.treasury).toEqual(CLIENT_ACCOUNT_ECDSA.id);
		expect(stableCoinDetail.paused).toEqual(false);
		expect(stableCoinDetail.deleted).toEqual(false);
		expect(stableCoinDetail.adminKey).toEqual(
			stableCoinCapabilitiesSC!.coin!.adminKey,
		);
		expect(stableCoinDetail.supplyKey).toEqual(
			stableCoinCapabilitiesSC!.coin!.supplyKey,
		);
		expect(stableCoinDetail.wipeKey).toEqual(
			stableCoinCapabilitiesSC!.coin!.wipeKey,
		);
		expect(stableCoinDetail.freezeKey).toEqual(
			stableCoinCapabilitiesSC!.coin!.freezeKey,
		);
		expect(stableCoinDetail.kycKey).toEqual(undefined);
		expect(stableCoinDetail.pauseKey).toEqual(
			stableCoinCapabilitiesSC!.coin!.pauseKey,
		);
	}, 150000000);

	it('Test get ed25519 account info', async () => {
		const accountInfo: AccountInfo = await mn.getAccountInfo(
			HEDERA_ID_ACCOUNT_ED25519,
		);
		expect(accountInfo.id).toEqual(HEDERA_ID_ACCOUNT_ED25519.toString());
		// expect(accountInfo.accountEvmAddress).toBeNull();
		expect(accountInfo.publicKey).toEqual(CLIENT_ACCOUNT_ED25519.publicKey);
		// expect(accountInfo.alias).toBeNull();
	});

	it('Test get ecdsa account info', async () => {
		const accountInfo: AccountInfo = await mn.getAccountInfo(
			HEDERA_ID_ACCOUNT_ECDSA,
		);

		expect(accountInfo.id).toEqual(CLIENT_ACCOUNT_ECDSA.id.value);
		expect(accountInfo.accountEvmAddress).toEqual(
			CLIENT_ACCOUNT_ECDSA.evmAddress,
		);

		expect(accountInfo.publicKey?.key).toEqual(
			CLIENT_ACCOUNT_ECDSA.publicKey?.key,
		);
	});

	it('Test get account relationship token', async () => {
		// StableCoin.create();
		const accountTokenRelation = await mn.getAccountToken(
			CLIENT_ACCOUNT_ECDSA.id,
			stableCoinCapabilitiesSC.coin.tokenId!,
		);
		expect(accountTokenRelation).toBeTruthy();
		expect(accountTokenRelation?.tokenId).toStrictEqual(
			stableCoinCapabilitiesSC.coin.tokenId!,
		);
		expect(accountTokenRelation?.createdTimestamp).not.toBeNull();
		expect(accountTokenRelation?.balance).not.toBeNull();
		expect(accountTokenRelation?.automaticAssociation).not.toBeNull();
		expect(accountTokenRelation?.freezeStatus).not.toBeNull();
		expect(accountTokenRelation?.kycStatus).not.toBeNull();
	}, 150000000);

	it('Test get account no relationship token', async () => {
		// StableCoin.create();
		const accountTokenRelation = await mn.getAccountToken(
			HEDERA_ID_ACCOUNT_ED25519,
			stableCoinCapabilitiesSC.coin.tokenId!,
		);
		expect(accountTokenRelation).toBeFalsy();
	}, 150000000);
});
