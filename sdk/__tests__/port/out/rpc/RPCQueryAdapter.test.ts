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
import { BalanceOfQuery } from '../../../../src/app/usecase/query/stablecoin/balanceof/BalanceOfQuery.js';
import { GetReserveAddressQuery } from '../../../../src/app/usecase/query/stablecoin/getReserveAddress/GetReserveAddressQuey.js';
import { GetReserveAmountQuery } from '../../../../src/app/usecase/query/stablecoin/getReserveAmount/GetReserveAmountQuery.js';
import { GetRolesQuery } from '../../../../src/app/usecase/query/stablecoin/roles/getRoles/GetRolesQuery.js';
import { HasRoleQuery } from '../../../../src/app/usecase/query/stablecoin/roles/hasRole/HasRoleQuery.js';
import { GetAllowanceQuery } from '../../../../src/app/usecase/query/stablecoin/roles/getAllowance/GetAllowanceQuery.js';
import Injectable from '../../../../src/core/Injectable.js';
import { QueryBus } from '../../../../src/core/query/QueryBus.js';
import {
	BigDecimal,
	Network,
	SetNetworkRequest,
	StableCoinCapabilities,
	TokenSupplyType,
} from '../../../../src/index.js';
import RPCQueryAdapter from '../../../../src/port/out/rpc/RPCQueryAdapter.js';
import { StableCoinRole } from '../../../../src/domain/context/stablecoin/StableCoinRole.js';
import { StableCoin } from '../../../../src/domain/context/stablecoin/StableCoin.js';
import Account from '../../../../src/domain/context/account/Account.js';
import {
	CLIENT_ACCOUNT_ECDSA,
	FACTORY_ADDRESS,
	HEDERA_ERC20_ADDRESS,
} from '../../../config.js';
import ContractId from '../../../../src/domain/context/contract/ContractId.js';
import { RESERVE_DECIMALS } from '../../../../src/domain/context/reserve/Reserve.js';
import { ContractId as HContractId } from '@hashgraph/sdk';
import StableCoinService from '../../../../src/app/service/StableCoinService.js';
import RPCTransactionAdapter from '../../../../src/port/out/rpc/RPCTransactionAdapter.js';
import TransactionResponse from '../../../../src/domain/context/transaction/TransactionResponse.js';
import { Wallet } from 'ethers';
import { MirrorNodeAdapter } from '../../../../src/port/out/mirror/MirrorNodeAdapter.js';
import PublicKey from '../../../../src/domain/context/account/PublicKey.js';

describe('🧪 RPCQueryAdapter', () => {
	const bus = Injectable.resolve(QueryBus);
	const adapter = Injectable.resolve(RPCQueryAdapter);
	const stableCoinService = Injectable.resolve(StableCoinService);
	const th = Injectable.resolve(RPCTransactionAdapter);
	const mirrorNodeAdapter = Injectable.resolve(MirrorNodeAdapter);
	mirrorNodeAdapter.setEnvironment('testnet');
	let tr: TransactionResponse;

	let stableCoinCapabilitiesSC: StableCoinCapabilities;

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
		await Network.setNetwork(
			new SetNetworkRequest({
				environment: 'testnet',
			}),
		);
		await th.init(true);
		await th.register(CLIENT_ACCOUNT_ECDSA, true);
		th.signerOrProvider = new Wallet(
			CLIENT_ACCOUNT_ECDSA.privateKey?.key ?? '',
			th.provider,
		);
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
	}, 150000);

	beforeEach(async () => {
		await adapter.init();
	});

	it('Test it initializes', async () => {
		const env = await adapter.init('testUrl');

		expect(env).toEqual('testnet');
		expect(adapter.provider).toBeDefined();
		expect(adapter.provider.connection.url).toEqual('testUrl');
	});

	it('Test it fetches a balance', async () => {
		const res = await bus.execute(
			new BalanceOfQuery(
				stableCoinCapabilitiesSC.coin.tokenId!,
				CLIENT_ACCOUNT_ECDSA.id,
			),
		);
		expect(res).not.toBeUndefined();
	});

	it('Test it gets roles', async () => {
		const res = await bus.execute(
			new GetRolesQuery(
				CLIENT_ACCOUNT_ECDSA.id,
				stableCoinCapabilitiesSC.coin.tokenId!,
			),
		);
		expect(res).not.toBeUndefined();
	});

	it('Test it has role', async () => {
		const res = await bus.execute(
			new HasRoleQuery(
				StableCoinRole.DEFAULT_ADMIN_ROLE,
				CLIENT_ACCOUNT_ECDSA.id,
				stableCoinCapabilitiesSC.coin.tokenId!,
			),
		);
		expect(res).not.toBeUndefined();
	});

	it('Test it gets allowance', async () => {
		const res = await bus.execute(
			new GetAllowanceQuery(
				CLIENT_ACCOUNT_ECDSA.id,
				stableCoinCapabilitiesSC.coin.tokenId!,
			),
		);
		expect(res).not.toBeUndefined();
	});

	it('Test it fetches reserve address', async () => {
		const res = await bus.execute(
			new GetReserveAddressQuery(stableCoinCapabilitiesSC.coin.tokenId!),
		);
		expect(res).not.toBeUndefined();
	});

	it('Test it fetches reserve amount', async () => {
		const res = await bus.execute(
			new GetReserveAmountQuery(stableCoinCapabilitiesSC.coin.tokenId!),
		);
		expect(res).not.toBeUndefined();
	});
});
