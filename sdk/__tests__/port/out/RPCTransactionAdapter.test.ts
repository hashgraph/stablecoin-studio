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

/* eslint-disable jest/no-commented-out-tests */
/* eslint-disable jest/valid-expect */
/* eslint-disable jest/expect-expect */
/* eslint-disable jest/no-standalone-expect */
/* eslint-disable jest/no-disabled-tests */
/* eslint-disable @typescript-eslint/no-non-null-assertion */

jest.resetModules();
jest.unmock('../../../src/port/out/mirror/MirrorNodeAdapter.ts');
jest.unmock('../../../src/port/out/rpc/RPCQueryAdapter.ts');
jest.unmock('axios');

jest.resetModules();
jest.unmock('../../../src/port/out/mirror/MirrorNodeAdapter.ts');
jest.unmock('../../../src/port/out/rpc/RPCQueryAdapter.ts');
jest.unmock('axios');

import { StableCoin } from '../../../src/domain/context/stablecoin/StableCoin.js';
import {
	AssociateTokenRequest,
	GetStableCoinDetailsRequest,
	KYCRequest,
	LoggerTransports,
	SDK,
	StableCoin as StableCoinInPort,
} from '../../../src/index.js';
import StableCoinCapabilities from '../../../src/domain/context/stablecoin/StableCoinCapabilities.js';
import BigDecimal from '../../../src/domain/context/shared/BigDecimal.js';
import { ethers, Wallet } from 'ethers';
import Injectable from '../../../src/core/Injectable.js';
import { MirrorNodeAdapter } from '../../../src/port/out/mirror/MirrorNodeAdapter.js';
import PublicKey from '../../../src/domain/context/account/PublicKey.js';
import ContractId from '../../../src/domain/context/contract/ContractId.js';
import { TokenSupplyType } from '../../../src/port/in/StableCoin.js';
import {
	CLIENT_ACCOUNT_ECDSA,
	FACTORY_ADDRESS,
	MIRROR_NODE,
	RESOLVER_ADDRESS,
	RPC_NODE,
} from '../../config.js';
import Account from '../../../src/domain/context/account/Account.js';
import NetworkService from '../../../src/app/service/NetworkService.js';
import { ContractId as HContractId } from '@hashgraph/sdk';
import StableCoinService from '../../../src/app/service/StableCoinService.js';
import { RESERVE_DECIMALS } from '../../../src/domain/context/reserve/Reserve.js';
import RPCTransactionAdapter from '../../../src/port/out/rpc/RPCTransactionAdapter.js';
import { RPCQueryAdapter } from '../../../src/port/out/rpc/RPCQueryAdapter.js';
import { MirrorNode } from '../../../src/domain/context/network/MirrorNode.js';
import { JsonRpcRelay } from '../../../src/domain/context/network/JsonRpcRelay.js';
import { Time } from '../../../src/core/Time';
import { CONFIG_SC, DEFAULT_VERSION } from '../../../src/core/Constants.js';

SDK.log = { level: 'ERROR', transports: new LoggerTransports.Console() };
const mirrorNode: MirrorNode = {
	name: MIRROR_NODE.name,
	baseUrl: MIRROR_NODE.baseUrl,
};

const rpcNode: JsonRpcRelay = {
	name: RPC_NODE.name,
	baseUrl: RPC_NODE.baseUrl,
};
const decimals = 6;
const initSupply = 1000;
const reserve = 100000000;
const configId = CONFIG_SC;
const configVersion = DEFAULT_VERSION;

describe('🧪 [ADAPTER] RPCTransactionAdapter', () => {
	let stableCoinCapabilitiesSC: StableCoinCapabilities;

	let th: RPCTransactionAdapter;
	let ns: NetworkService;
	let rpcQueryAdapter: RPCQueryAdapter;
	let stableCoinService: StableCoinService;
	// let proxyAdmin: string;
	// let proxy: string;

	const createToken = async (
		stablecoin: StableCoin,
		account: Account,
	): Promise<StableCoinCapabilities> => {
		const tr = await th.create(
			stablecoin,
			new ContractId(FACTORY_ADDRESS),
			false,
			new ContractId(RESOLVER_ADDRESS),
			configId,
			configVersion,
			account.id,
			'0',
			undefined,
			BigDecimal.fromString(reserve.toString(), RESERVE_DECIMALS),
		);

		const tokenIdSC = ContractId.fromHederaContractId(
			HContractId.fromEvmAddress(0, 0, tr.response[0][1]),
		);
		return await stableCoinService.getCapabilities(account, tokenIdSC);
	};

	let mirrorNodeAdapter: MirrorNodeAdapter;

	beforeAll(async () => {
		mirrorNodeAdapter = Injectable.resolve(MirrorNodeAdapter);
		mirrorNodeAdapter.set(mirrorNode);

		th = Injectable.resolve(RPCTransactionAdapter);
		ns = Injectable.resolve(NetworkService);
		rpcQueryAdapter = Injectable.resolve(RPCQueryAdapter);

		rpcQueryAdapter.init(rpcNode.baseUrl);
		ns.environment = 'testnet';

		await th.init(true);
		await th.register(CLIENT_ACCOUNT_ECDSA, true);

		const customHttpProvider = new ethers.JsonRpcProvider(rpcNode.baseUrl, {
			chainId: 296,
			name: rpcNode.name,
		});

		const hexKey =
			CLIENT_ACCOUNT_ECDSA.privateKey!.toHashgraphKey().toStringRaw();

		th.signerOrProvider = new Wallet(hexKey, customHttpProvider);

		stableCoinService = Injectable.resolve(StableCoinService);

		const coinSC = new StableCoin({
			name: 'TEST_ACCELERATOR_SC',
			symbol: 'TEST',
			decimals: decimals,
			initialSupply: BigDecimal.fromString(
				initSupply.toString(),
				decimals,
			),
			autoRenewAccount: CLIENT_ACCOUNT_ECDSA.id,
			adminKey: PublicKey.NULL,
			freezeKey: PublicKey.NULL,
			kycKey: PublicKey.NULL,
			wipeKey: PublicKey.NULL,
			pauseKey: PublicKey.NULL,
			supplyKey: PublicKey.NULL,
			feeScheduleKey: PublicKey.NULL,
			supplyType: TokenSupplyType.INFINITE,
			burnRoleAccount: CLIENT_ACCOUNT_ECDSA.id,
			wipeRoleAccount: CLIENT_ACCOUNT_ECDSA.id,
			rescueRoleAccount: CLIENT_ACCOUNT_ECDSA.id,
			freezeRoleAccount: CLIENT_ACCOUNT_ECDSA.id,
			pauseRoleAccount: CLIENT_ACCOUNT_ECDSA.id,
			deleteRoleAccount: CLIENT_ACCOUNT_ECDSA.id,
			kycRoleAccount: CLIENT_ACCOUNT_ECDSA.id,
			feeRoleAccount: CLIENT_ACCOUNT_ECDSA.id,
			cashInRoleAccount: CLIENT_ACCOUNT_ECDSA.id,
			cashInRoleAllowance: BigDecimal.ZERO,
			metadata: '',
		});

		stableCoinCapabilitiesSC = await createToken(
			coinSC,
			CLIENT_ACCOUNT_ECDSA,
		);

		await Time.delay(5, 'seconds');

		await StableCoinInPort.associate(
			new AssociateTokenRequest({
				targetId: CLIENT_ACCOUNT_ECDSA.id.toString(),
				tokenId:
					stableCoinCapabilitiesSC?.coin.tokenId?.toString() ??
					'0.0.0',
			}),
		);

		await Time.delay(5, 'seconds');

		await StableCoinInPort.grantKyc(
			new KYCRequest({
				targetId: CLIENT_ACCOUNT_ECDSA.id.toString(),
				tokenId:
					stableCoinCapabilitiesSC?.coin.tokenId?.toString() ??
					'0.0.0',
			}),
		);
	}, 1500000);

	it('Update Token', async () => {
		const init = await StableCoinInPort.getInfo(
			new GetStableCoinDetailsRequest({
				id:
					stableCoinCapabilitiesSC?.coin.tokenId?.toString() ??
					'0.0.0',
			}),
		);

		const name = 'New Token Name';
		const symbol = 'New Token Symbol';
		const autoRenewPeriod = 30 * 24 * 3600;
		const freezeKey = CLIENT_ACCOUNT_ECDSA.publicKey;
		const kycKey = CLIENT_ACCOUNT_ECDSA.publicKey;
		const wipeKey = CLIENT_ACCOUNT_ECDSA.publicKey;
		const pauseKey = CLIENT_ACCOUNT_ECDSA.publicKey;
		const feeScheduleKey = CLIENT_ACCOUNT_ECDSA.publicKey;

		await th.update(
			stableCoinCapabilitiesSC,
			name,
			symbol,
			autoRenewPeriod,
			undefined,
			kycKey,
			freezeKey,
			feeScheduleKey,
			pauseKey,
			wipeKey,
			'',
		);

		await Time.delay(5, 'seconds');

		const res = await StableCoinInPort.getInfo(
			new GetStableCoinDetailsRequest({
				id:
					stableCoinCapabilitiesSC?.coin.tokenId?.toString() ??
					'0.0.0',
			}),
		);

		expect(res.name).toEqual(name);
		expect(res.symbol).toEqual(symbol);
		expect(res.autoRenewPeriod).toEqual(autoRenewPeriod);
		expect(res.freezeKey?.toString()).toEqual(freezeKey?.toString());
		expect(res.kycKey?.toString()).toEqual(kycKey?.toString());
		expect(res.wipeKey?.toString()).toEqual(wipeKey?.toString());
		expect(res.pauseKey?.toString()).toEqual(pauseKey?.toString());

		await th.update(
			stableCoinCapabilitiesSC,
			init.name,
			init.symbol,
			init.autoRenewPeriod,
			undefined,
			PublicKey.NULL,
			PublicKey.NULL,
			PublicKey.NULL,
			PublicKey.NULL,
			PublicKey.NULL,
			'',
		);
	}, 1500000);
});
