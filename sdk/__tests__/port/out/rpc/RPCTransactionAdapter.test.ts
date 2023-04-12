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

/* eslint-disable jest/no-commented-out-tests */
/* eslint-disable jest/valid-expect */
/* eslint-disable jest/expect-expect */
/* eslint-disable jest/no-standalone-expect */
/* eslint-disable jest/no-disabled-tests */
import { StableCoin } from '../../../../src/domain/context/stablecoin/StableCoin.js';
import TransactionResponse from '../../../../src/domain/context/transaction/TransactionResponse.js';
import StableCoinCapabilities from '../../../../src/domain/context/stablecoin/StableCoinCapabilities.js';
import BigDecimal from '../../../../src/domain/context/shared/BigDecimal.js';
import { Wallet } from 'ethers';
import { StableCoinRole } from '../../../../src/domain/context/stablecoin/StableCoinRole.js';
import Injectable from '../../../../src/core/Injectable.js';
import { MirrorNodeAdapter } from '../../../../src/port/out/mirror/MirrorNodeAdapter.js';
import PublicKey from '../../../../src/domain/context/account/PublicKey.js';
import ContractId from '../../../../src/domain/context/contract/ContractId.js';
import { TokenSupplyType } from '../../../../src/port/in/StableCoin.js';
import {
	CLIENT_ACCOUNT_ECDSA,
	FACTORY_ADDRESS,
	HEDERA_ERC20_ADDRESS,
} from '../../../config.js';
import Account from '../../../../src/domain/context/account/Account.js';
import NetworkService from '../../../../src/app/service/NetworkService.js';
import { ContractId as HContractId } from '@hashgraph/sdk';
import StableCoinService from '../../../../src/app/service/StableCoinService.js';
import { RESERVE_DECIMALS } from '../../../../src/domain/context/reserve/Reserve.js';
import RPCTransactionAdapter from '../../../../src/port/out/rpc/RPCTransactionAdapter.js';
import RPCQueryAdapter from '../../../../src/port/out/rpc/RPCQueryAdapter.js';
import { LoggerTransports, SDK } from '../../../../src/index.js';

SDK.log = { level: 'ERROR', transports: new LoggerTransports.Console() };
describe('🧪 [ADAPTER] RPCTransactionAdapter', () => {
	let stableCoinCapabilitiesHTS: StableCoinCapabilities;
	let stableCoinCapabilitiesSC: StableCoinCapabilities;

	let th: RPCTransactionAdapter;
	let tr: TransactionResponse;
	let ns: NetworkService;
	let rpcQueryAdapter: RPCQueryAdapter;
	let stableCoinService: StableCoinService;
	const delay = async (seconds = 2): Promise<void> => {
		seconds = seconds * 1000;
		await new Promise((r) => setTimeout(r, seconds));
	};

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
			burnRoleAccount: CLIENT_ACCOUNT_ECDSA.id,
			wipeRoleAccount: CLIENT_ACCOUNT_ECDSA.id,
			rescueRoleAccount: CLIENT_ACCOUNT_ECDSA.id,
			freezeRoleAccount: CLIENT_ACCOUNT_ECDSA.id,
			pauseRoleAccount: CLIENT_ACCOUNT_ECDSA.id,
			deleteRoleAccount: CLIENT_ACCOUNT_ECDSA.id,
			kycRoleAccount: CLIENT_ACCOUNT_ECDSA.id,
			cashInRoleAccount: CLIENT_ACCOUNT_ECDSA.id,
			cashInRoleAllowance: BigDecimal.ZERO,
		});

		const coinHTS = new StableCoin({
			name: 'TEST_ACCELERATOR_HTS',
			symbol: 'TEST',
			decimals: 6,
			initialSupply: BigDecimal.fromString('1000', 6),
			autoRenewAccount: CLIENT_ACCOUNT_ECDSA.id,
			adminKey: CLIENT_ACCOUNT_ECDSA.publicKey,
			freezeKey: CLIENT_ACCOUNT_ECDSA.publicKey,
			wipeKey: CLIENT_ACCOUNT_ECDSA.publicKey,
			pauseKey: CLIENT_ACCOUNT_ECDSA.publicKey,
			supplyKey: CLIENT_ACCOUNT_ECDSA.publicKey,
			supplyType: TokenSupplyType.INFINITE,
			// grantKYCToOriginalSender:true,
			burnRoleAccount: undefined,
			wipeRoleAccount: undefined,
			rescueRoleAccount: undefined,
			freezeRoleAccount: undefined,
			pauseRoleAccount: undefined,
			deleteRoleAccount: undefined,
			kycRoleAccount: undefined,
			cashInRoleAccount: undefined,
			cashInRoleAllowance: undefined,
		});

		stableCoinCapabilitiesSC = await createToken(
			coinSC,
			CLIENT_ACCOUNT_ECDSA,
		);
		stableCoinCapabilitiesHTS = await createToken(
			coinHTS,
			CLIENT_ACCOUNT_ECDSA,
		);
		expect(stableCoinCapabilitiesSC).not.toBeNull();
		expect(stableCoinCapabilitiesHTS).not.toBeNull();
	}, 1500000);

	// eslint-disable-next-line jest/no-disabled-tests
	it.skip('create coin and assign to account', async () => {
		const coin = new StableCoin({
			name: 'TestCoinAccount',
			symbol: 'TCA',
			decimals: 6,
			initialSupply: BigDecimal.fromString('1.60', 6),
			maxSupply: BigDecimal.fromString('1000', 6),
			freezeDefault: false,
			adminKey: Account.NULL.publicKey,
			freezeKey: CLIENT_ACCOUNT_ECDSA.publicKey,
			kycKey: CLIENT_ACCOUNT_ECDSA.publicKey,
			wipeKey: CLIENT_ACCOUNT_ECDSA.publicKey,
			pauseKey: CLIENT_ACCOUNT_ECDSA.publicKey,
			supplyKey: CLIENT_ACCOUNT_ECDSA.publicKey,
			autoRenewAccount: CLIENT_ACCOUNT_ECDSA.id,
			supplyType: TokenSupplyType.FINITE,
			burnRoleAccount: undefined,
			wipeRoleAccount: undefined,
			rescueRoleAccount: undefined,
			freezeRoleAccount: undefined,
			pauseRoleAccount: undefined,
			deleteRoleAccount: undefined,
			kycRoleAccount: undefined,
			cashInRoleAccount: undefined,
			cashInRoleAllowance: undefined,
		});
		tr = await th.create(
			coin,
			new ContractId(FACTORY_ADDRESS),
			new ContractId(HEDERA_ERC20_ADDRESS),
			true,
		);
	}, 1500000);

	it('Test hasRole', async () => {
		await delay();
		tr = await th.hasRole(
			stableCoinCapabilitiesSC,
			CLIENT_ACCOUNT_ECDSA.id,
			StableCoinRole.CASHIN_ROLE,
		);
		expect(typeof tr.response === 'boolean').toBeTruthy();
	}, 1500000);

	it('Test mint SC', async () => {
		await delay(3);
		tr = await th.cashin(
			stableCoinCapabilitiesSC,
			CLIENT_ACCOUNT_ECDSA.id,
			BigDecimal.fromString(
				'0.5',
				stableCoinCapabilitiesSC.coin.decimals,
			),
		);
	}, 1500000);

	it('Test cashIn contract function does not succeeded if exceeds reserve', async () => {
		await delay(3);
		tr = await th.getReserveAddress(stableCoinCapabilitiesSC);
		const reserveContractId: HContractId = HContractId.fromSolidityAddress(
			tr.response,
		);
		await delay(3);
		tr = await th.updateReserveAmount(
			new ContractId(reserveContractId.toString()),
			BigDecimal.fromStringFixed('900', RESERVE_DECIMALS),
		);
		await delay(3);
		await expect(
			th.cashin(
				stableCoinCapabilitiesSC,
				CLIENT_ACCOUNT_ECDSA.id,
				BigDecimal.fromString(
					'900',
					stableCoinCapabilitiesSC.coin.decimals,
				),
			),
		).rejects.toThrow();

		tr = await th.updateReserveAmount(
			new ContractId(reserveContractId.toString()),
			BigDecimal.fromString('100000000', RESERVE_DECIMALS),
		);
	}, 150000);

	it('Test wipe SC', async () => {
		await delay(3);
		tr = await th.cashin(
			stableCoinCapabilitiesSC,
			CLIENT_ACCOUNT_ECDSA.id,
			BigDecimal.fromString('1', stableCoinCapabilitiesSC.coin.decimals),
		);
		await delay();
		tr = await th.wipe(
			stableCoinCapabilitiesSC,
			CLIENT_ACCOUNT_ECDSA.id,
			BigDecimal.fromString('1', stableCoinCapabilitiesSC.coin.decimals),
		);
	}, 1500000);

	it('Test burn SC', async () => {
		await delay();
		tr = await th.burn(
			stableCoinCapabilitiesSC,
			BigDecimal.fromString('1', stableCoinCapabilitiesSC.coin.decimals),
		);
	}, 1500000);

	it('Test rescue SC', async () => {
		await delay();
		tr = await th.rescue(
			stableCoinCapabilitiesSC,
			BigDecimal.fromString('1', stableCoinCapabilitiesSC.coin.decimals),
		);
	}, 1500000);

	it('Test freeze SC', async () => {
		await delay();
		tr = await th.freeze(stableCoinCapabilitiesSC, CLIENT_ACCOUNT_ECDSA.id);
	}, 1500000);

	it('Test unfreeze SC', async () => {
		await delay();
		tr = await th.unfreeze(
			stableCoinCapabilitiesSC,
			CLIENT_ACCOUNT_ECDSA.id,
		);
	}, 1500000);

	it('Test pause SC', async () => {
		await delay();
		tr = await th.pause(stableCoinCapabilitiesSC);
	}, 1500000);

	it('Test unpause SC', async () => {
		await delay();
		tr = await th.unpause(stableCoinCapabilitiesSC);
	}, 1500000);

	it.skip('Test mint HTS', async () => {
		await delay();
		tr = await th.cashin(
			stableCoinCapabilitiesHTS,
			CLIENT_ACCOUNT_ECDSA.id,
			BigDecimal.fromString('1', stableCoinCapabilitiesHTS.coin.decimals),
		);
	}, 1500000);

	it.skip('Test wipe HTS', async () => {
		await delay();
		tr = await th.cashin(
			stableCoinCapabilitiesHTS,
			CLIENT_ACCOUNT_ECDSA.id,
			BigDecimal.fromString('1', stableCoinCapabilitiesHTS.coin.decimals),
		);
		await delay();
		tr = await th.wipe(
			stableCoinCapabilitiesHTS,
			CLIENT_ACCOUNT_ECDSA.id,
			BigDecimal.fromString('1', stableCoinCapabilitiesHTS.coin.decimals),
		);
	}, 1500000);

	it.skip('Test burn HTS', async () => {
		await delay();
		tr = await th.burn(
			stableCoinCapabilitiesHTS,
			BigDecimal.fromString('1', stableCoinCapabilitiesHTS.coin.decimals),
		);
	}, 1500000);

	it.skip('Test freeze HTS', async () => {
		await delay();
		tr = await th.freeze(
			stableCoinCapabilitiesHTS,
			CLIENT_ACCOUNT_ECDSA.id,
		);
	}, 1500000);

	it.skip('Test unfreeze HTS', async () => {
		await delay();
		tr = await th.unfreeze(
			stableCoinCapabilitiesHTS,
			CLIENT_ACCOUNT_ECDSA.id,
		);
	}, 1500000);

	it.skip('Test pause HTS', async () => {
		await delay();
		tr = await th.pause(stableCoinCapabilitiesHTS);
	}, 1500000);

	it.skip('Test unpause HTS', async () => {
		await delay();
		tr = await th.unpause(stableCoinCapabilitiesHTS);
	}, 1500000);

	// it('Test transfer', async () => {
	//     tr = await th.mint(tokenId, Long.ONE);
	//     tr = await th.transfer(tokenId, Long.ONE, clientAccountId, accountId);
	// });

	// it('Test delete', async () => {
	// 	tr = await th.delete(stableCoinCapabilitiesSC);
	// }, 1500000);

	it('Test revokeRole', async () => {
		await delay();
		tr = await th.revokeRole(
			stableCoinCapabilitiesSC,
			CLIENT_ACCOUNT_ECDSA.id,
			StableCoinRole.WIPE_ROLE,
		);
	}, 1500000);

	it('Test grantRole', async () => {
		await delay();
		tr = await th.grantRole(
			stableCoinCapabilitiesSC,
			CLIENT_ACCOUNT_ECDSA.id,
			StableCoinRole.WIPE_ROLE,
		);
	}, 1500000);

	it('Test revokeSupplierRole', async () => {
		await delay();
		tr = await th.revokeSupplierRole(
			stableCoinCapabilitiesSC,
			CLIENT_ACCOUNT_ECDSA.id,
		);
	}, 1500000);

	it('Test grantSupplierRole', async () => {
		await delay();
		tr = await th.revokeSupplierRole(
			stableCoinCapabilitiesSC,
			CLIENT_ACCOUNT_ECDSA.id,
		);
		await delay();
		tr = await th.grantSupplierRole(
			stableCoinCapabilitiesSC,
			CLIENT_ACCOUNT_ECDSA.id,
			BigDecimal.fromString('1', stableCoinCapabilitiesSC.coin.decimals),
		);
	}, 1500000);

	it('Test grantUnlimitedSupplierRole', async () => {
		await delay();
		tr = await th.grantUnlimitedSupplierRole(
			stableCoinCapabilitiesSC,
			CLIENT_ACCOUNT_ECDSA.id,
		);
	}, 1500000);

	it('Test getBalanceOf', async () => {
		await delay();
		tr = await th.balanceOf(
			stableCoinCapabilitiesSC,
			CLIENT_ACCOUNT_ECDSA.id,
		);
	}, 1500000);

	it('Test isUnlimitedSupplierAllowance', async () => {
		await delay();
		tr = await th.isUnlimitedSupplierAllowance(
			stableCoinCapabilitiesSC,
			CLIENT_ACCOUNT_ECDSA.id,
		);
	}, 1500000);

	it('Test supplierAllowance', async () => {
		await delay();
		tr = await th.supplierAllowance(
			stableCoinCapabilitiesSC,
			CLIENT_ACCOUNT_ECDSA.id,
		);
	}, 1500000);

	it('Test resetSupplierAllowance', async () => {
		await delay();
		tr = await th.resetSupplierAllowance(
			stableCoinCapabilitiesSC,
			CLIENT_ACCOUNT_ECDSA.id,
		);
	}, 1500000);

	it('Test increaseSupplierAllowance', async () => {
		await delay();
		tr = await th.increaseSupplierAllowance(
			stableCoinCapabilitiesSC,
			CLIENT_ACCOUNT_ECDSA.id,
			BigDecimal.fromString('1', stableCoinCapabilitiesSC.coin.decimals),
		);
	}, 1500000);

	it('Test decreaseSupplierAllowance', async () => {
		await delay();
		tr = await th.decreaseSupplierAllowance(
			stableCoinCapabilitiesSC,
			CLIENT_ACCOUNT_ECDSA.id,
			BigDecimal.fromString('1', stableCoinCapabilitiesSC.coin.decimals),
		);
	}, 1500000);

	it('Test getRoles', async () => {
		await delay();
		tr = await th.getRoles(
			stableCoinCapabilitiesSC,
			CLIENT_ACCOUNT_ECDSA.id,
		);
	}, 1500000);

	// eslint-disable-next-line jest/no-disabled-tests
	/* it.skip('Test dissociateToken', async () => {
		await delay();
		tr = await th.dissociateToken(
			stableCoinCapabilitiesSC,
			CLIENT_ACCOUNT_ECDSA.id,
		);
	}, 1500000);

	// eslint-disable-next-line jest/no-disabled-tests
	it.skip('Test associateToken', async () => {
		delay();
		tr = await th.associateToken(
			stableCoinCapabilitiesSC,
			CLIENT_ACCOUNT_ECDSA.id,
		);
	}, 1500000); */

	it('Test cannot create coin with an initial supply greater than reserve', async () => {
		const coinSC = new StableCoin({
			name: 'TEST_ACCELERATOR_SC',
			symbol: 'TEST',
			decimals: 6,
			initialSupply: BigDecimal.fromString('100000001', 6),
			autoRenewAccount: CLIENT_ACCOUNT_ECDSA.id,
			adminKey: PublicKey.NULL,
			freezeKey: PublicKey.NULL,
			wipeKey: PublicKey.NULL,
			pauseKey: PublicKey.NULL,
			supplyKey: PublicKey.NULL,
			supplyType: TokenSupplyType.INFINITE,
			burnRoleAccount: CLIENT_ACCOUNT_ECDSA.id,
			wipeRoleAccount: CLIENT_ACCOUNT_ECDSA.id,
			rescueRoleAccount: CLIENT_ACCOUNT_ECDSA.id,
			freezeRoleAccount: CLIENT_ACCOUNT_ECDSA.id,
			pauseRoleAccount: CLIENT_ACCOUNT_ECDSA.id,
			deleteRoleAccount: CLIENT_ACCOUNT_ECDSA.id,
			kycRoleAccount: CLIENT_ACCOUNT_ECDSA.id,
			cashInRoleAccount: CLIENT_ACCOUNT_ECDSA.id,
			cashInRoleAllowance: BigDecimal.ZERO,
		});
		await expect(
			createToken(coinSC, CLIENT_ACCOUNT_ECDSA),
		).rejects.toThrow();
	}, 1500000);

	it('Test get reserve address returns a value when stable coin has reserve', async () => {
		tr = await th.getReserveAddress(stableCoinCapabilitiesHTS);
		expect(tr.response).not.toBeNull;
	}, 1500000);

	it('Test get reserve amount returns a value when stable coin has reserve', async () => {
		tr = await th.getReserveAmount(stableCoinCapabilitiesHTS);
		expect(tr.response).toEqual(
			BigDecimal.fromStringFixed('10000000000', RESERVE_DECIMALS),
		);
	}, 1500000);

	it('Test update reserve amount when stable coin has reserve', async () => {
		tr = await th.getReserveAddress(stableCoinCapabilitiesHTS);
		const reserveContractId: HContractId = HContractId.fromSolidityAddress(
			tr.response,
		);
		tr = await th.updateReserveAmount(
			new ContractId(reserveContractId.toString()),
			BigDecimal.fromStringFixed('1000', RESERVE_DECIMALS),
		);
		tr = await th.getReserveAmount(stableCoinCapabilitiesHTS);
		expect(tr.response).toEqual(
			BigDecimal.fromStringFixed('1000', RESERVE_DECIMALS),
		);
	}, 1500000);

	it('Test update reserve address when stable coin has reserve', async () => {
		tr = await th.updateReserveAddress(
			stableCoinCapabilitiesHTS,
			new ContractId('0.0.11111111'),
		);
		tr = await th.getReserveAddress(stableCoinCapabilitiesHTS);
		expect(tr.response.toString().toUpperCase()).toEqual(
			`0X${HContractId.fromString('0.0.11111111')
				.toSolidityAddress()
				.toUpperCase()}`,
		);
	}, 1500000);

	afterEach(async () => {
		expect(tr).not.toBeNull();
		expect(tr.error).toEqual(undefined);
	});
});
