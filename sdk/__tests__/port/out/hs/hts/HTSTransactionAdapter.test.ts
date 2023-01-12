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

/* eslint-disable jest/valid-expect */
/* eslint-disable jest/expect-expect */
/* eslint-disable jest/no-standalone-expect */
import { HTSTransactionAdapter } from '../../../../../src/port/out/hs/hts/HTSTransactionAdapter.js';
import TransactionResponse from '../../../../../src/domain/context/transaction/TransactionResponse.js';
import StableCoinCapabilities from '../../../../../src/domain/context/stablecoin/StableCoinCapabilities.js';
import { StableCoin } from '../../../../../src/domain/context/stablecoin/StableCoin.js';
import Account from '../../../../../src/domain/context/account/Account.js';
import BigDecimal from '../../../../../src/domain/context/shared/BigDecimal.js';
import { HederaId } from '../../../../../src/domain/context/shared/HederaId.js';
import { StableCoinRole } from '../../../../../src/domain/context/stablecoin/StableCoinRole.js';
import Injectable from '../../../../../src/core/Injectable.js';
import { Network } from '../../../../../src/index.js';
import ConnectRequest, {
	SupportedWallets,
} from '../../../../../src/port/in/request/ConnectRequest.js';
import {
	HederaERC20AddressTestnet,
	FactoryAddressTestnet,
	TokenSupplyType,
} from '../../../../../src/port/in/StableCoin.js';
import PublicKey from '../../../../../src/domain/context/account/PublicKey.js';
import ContractId from '../../../../../src/domain/context/contract/ContractId.js';
import { ContractId as HContractId } from '@hashgraph/sdk';
import {
	CLIENT_ACCOUNT_ECDSA,
	CLIENT_ACCOUNT_ED25519,
} from '../../../../config.js';
import StableCoinService from '../../../../../src/app/service/StableCoinService.js';

describe('🧪 [ADAPTER] HTSTransactionAdapter with ECDSA accounts', () => {
	// token to operate through HTS
	let stableCoinCapabilitiesHTS: StableCoinCapabilities;
	let stableCoinCapabilitiesSC: StableCoinCapabilities;
	let stableCoinService: StableCoinService;

	let th: HTSTransactionAdapter;
	let tr: TransactionResponse;
	const getBalance = async function (
		hederaId: HederaId,
		stableCoinCapabilities: StableCoinCapabilities,
	): Promise<BigDecimal> {
		return (
			(await th.balanceOf(stableCoinCapabilities, hederaId)).response ??
			BigDecimal.ZERO
		);
	};
	beforeAll(async () => {
		await initTest(CLIENT_ACCOUNT_ECDSA);
		th = Injectable.resolve(HTSTransactionAdapter);
		stableCoinService = Injectable.resolve(StableCoinService);

		const coinSC = new StableCoin({
			name: 'TestCoinSC',
			symbol: 'TCSC',
			decimals: 6,
			initialSupply: BigDecimal.fromString('5.60', 6),
			freezeDefault: false,
			adminKey: PublicKey.NULL,
			freezeKey: PublicKey.NULL,
			// kycKey: PublicKey.NULL,
			wipeKey: PublicKey.NULL,
			pauseKey: PublicKey.NULL,
			supplyKey: PublicKey.NULL,
			autoRenewAccount: CLIENT_ACCOUNT_ECDSA.id,
			supplyType: TokenSupplyType.INFINITE,
			treasury: HederaId.NULL,
		});
		tr = await th.create(
			coinSC,
			new ContractId(FactoryAddressTestnet),
			new ContractId(HederaERC20AddressTestnet),
			false,
		);
		const tokenIdSC = ContractId.fromHederaContractId(
			HContractId.fromSolidityAddress(tr.response[3]),
		);
		stableCoinCapabilitiesSC = await stableCoinService.getCapabilities(
			CLIENT_ACCOUNT_ECDSA,
			tokenIdSC,
		);
		const coinHTS = new StableCoin({
			name: 'TestCoinAccount',
			symbol: 'TCA',
			decimals: 6,
			initialSupply: BigDecimal.fromString('5.60', 6),
			maxSupply: BigDecimal.fromString('1000', 6),
			freezeDefault: false,
			adminKey: CLIENT_ACCOUNT_ECDSA.publicKey,
			freezeKey: CLIENT_ACCOUNT_ECDSA.publicKey,
			// kycKey: CLIENT_ACCOUNT_ECDSA.publicKey,
			wipeKey: CLIENT_ACCOUNT_ECDSA.publicKey,
			pauseKey: CLIENT_ACCOUNT_ECDSA.publicKey,
			supplyKey: CLIENT_ACCOUNT_ECDSA.publicKey,
			autoRenewAccount: CLIENT_ACCOUNT_ECDSA.id,
			supplyType: TokenSupplyType.FINITE,
			treasury: CLIENT_ACCOUNT_ECDSA.id,
		});
		tr = await th.create(
			coinHTS,
			new ContractId(FactoryAddressTestnet),
			new ContractId(HederaERC20AddressTestnet),
			true
		);
		const tokenIdHTS = ContractId.fromHederaContractId(
			HContractId.fromSolidityAddress(tr.response[3]),
		);
		stableCoinCapabilitiesHTS = await stableCoinService.getCapabilities(
			CLIENT_ACCOUNT_ECDSA,
			tokenIdHTS,
		);
	}, 1500000);

	it('Test cashin HTS', async () => {
		const accountInitialBalance = await getBalance(
			CLIENT_ACCOUNT_ECDSA.id,
			stableCoinCapabilitiesHTS,
		);
		tr = await th.cashin(
			stableCoinCapabilitiesHTS,
			CLIENT_ACCOUNT_ECDSA.id,
			BigDecimal.fromString('1', stableCoinCapabilitiesHTS.coin.decimals),
		);
		tr = await th.transfer(
			stableCoinCapabilitiesHTS,
			BigDecimal.fromString('1', stableCoinCapabilitiesHTS.coin.decimals),
			CLIENT_ACCOUNT_ECDSA,
			CLIENT_ACCOUNT_ECDSA.id,
			true,
		);

		const accountFinalBalance = await getBalance(
			CLIENT_ACCOUNT_ECDSA.id,
			stableCoinCapabilitiesHTS,
		);
		expect(accountFinalBalance).toEqual(
			accountInitialBalance.addUnsafe(
				BigDecimal.fromString(
					'1',
					stableCoinCapabilitiesHTS.coin.decimals,
				),
			),
		);
	}, 150000);

	it('Test burn HTS', async () => {
		const accountInitialBalance: BigDecimal = await getBalance(
			stableCoinCapabilitiesHTS.coin.treasury ?? HederaId.NULL,
			stableCoinCapabilitiesHTS,
		);
		tr = await th.burn(
			stableCoinCapabilitiesHTS,
			BigDecimal.fromString('1', stableCoinCapabilitiesHTS.coin.decimals),
		);

		const accountFinalBalance: BigDecimal = await getBalance(
			stableCoinCapabilitiesHTS.coin.treasury ?? HederaId.NULL,
			stableCoinCapabilitiesHTS,
		);
		// const expectFinal =;
		expect(accountFinalBalance).toEqual(
			accountInitialBalance.subUnsafe(
				BigDecimal.fromString(
					'1',
					stableCoinCapabilitiesHTS.coin.decimals,
				),
			),
		);
	}, 50000);

	it('Test wipe HTS', async () => {
		await expect(
			th.wipe(
				stableCoinCapabilitiesHTS,
				CLIENT_ACCOUNT_ECDSA.id,
				BigDecimal.fromString(
					'1',
					stableCoinCapabilitiesHTS.coin.decimals,
				),
			),
		).rejects.toThrow();
	}, 50000);

	it('Test freeze', async () => {
		tr = await th.freeze(
			stableCoinCapabilitiesHTS,
			CLIENT_ACCOUNT_ECDSA.id,
		);
	}, 20000);

	it('Test unfreeze', async () => {
		tr = await th.unfreeze(
			stableCoinCapabilitiesHTS,
			CLIENT_ACCOUNT_ECDSA.id,
		);
	}, 20000);

	it('Test pause', async () => {
		tr = await th.pause(stableCoinCapabilitiesHTS);
	}, 20000);

	it('Test unpause', async () => {
		tr = await th.unpause(stableCoinCapabilitiesHTS);
	}, 20000);

	it('Test cashIn contract function', async () => {
		const accountInitialBalance: BigDecimal = await getBalance(
			CLIENT_ACCOUNT_ECDSA.id,
			stableCoinCapabilitiesSC,
		);

		tr = await th.cashin(
			stableCoinCapabilitiesSC,
			CLIENT_ACCOUNT_ECDSA.id,
			BigDecimal.fromString('1', stableCoinCapabilitiesSC.coin.decimals),
		);
		const accountFinalBalance: BigDecimal = await getBalance(
			CLIENT_ACCOUNT_ECDSA.id,
			stableCoinCapabilitiesSC,
		);
		expect(accountFinalBalance).toEqual(
			accountInitialBalance.addUnsafe(
				BigDecimal.fromString(
					'1',
					stableCoinCapabilitiesHTS.coin.decimals,
				),
			),
		);
	}, 20000);

	it('Test burn contract function', async () => {
		const accountInitialBalance: BigDecimal = await getBalance(
			stableCoinCapabilitiesSC.coin.treasury ?? HederaId.NULL,
			stableCoinCapabilitiesSC,
		);

		tr = await th.burn(
			stableCoinCapabilitiesSC,
			BigDecimal.fromString('1', stableCoinCapabilitiesSC.coin.decimals),
		);
		const accountFinalBalance: BigDecimal = await getBalance(
			stableCoinCapabilitiesSC.coin.treasury ?? HederaId.NULL,
			stableCoinCapabilitiesSC,
		);

		expect(accountFinalBalance).toEqual(
			accountInitialBalance.subUnsafe(
				BigDecimal.fromString(
					'1',
					stableCoinCapabilitiesSC.coin.decimals,
				),
			),
		);
	}, 20000);

	it('Test wipe contract function', async () => {
		const accountInitialBalance: BigDecimal = await getBalance(
			CLIENT_ACCOUNT_ECDSA.id,
			stableCoinCapabilitiesSC,
		);

		tr = await th.wipe(
			stableCoinCapabilitiesSC,
			CLIENT_ACCOUNT_ECDSA.id,
			BigDecimal.fromString('1', stableCoinCapabilitiesSC.coin.decimals),
		);
		const accountFinalBalance: BigDecimal = await getBalance(
			CLIENT_ACCOUNT_ECDSA.id,
			stableCoinCapabilitiesSC,
		);
		expect(accountFinalBalance).toEqual(
			accountInitialBalance.subUnsafe(
				BigDecimal.fromString(
					'1',
					stableCoinCapabilitiesSC.coin.decimals,
				),
			),
		);
	}, 20000);

	it('Test rescue contract function', async () => {
		tr = await th.rescue(
			stableCoinCapabilitiesSC,
			BigDecimal.fromString('1', stableCoinCapabilitiesSC.coin.decimals),
		);
	}, 20000);

	it('Test freeze contract function', async () => {
		tr = await th.freeze(stableCoinCapabilitiesSC, CLIENT_ACCOUNT_ECDSA.id);
	});

	it('Test unfreeze contract function', async () => {
		tr = await th.unfreeze(
			stableCoinCapabilitiesSC,
			CLIENT_ACCOUNT_ECDSA.id,
		);
	});

	it('Test pause contract function', async () => {
		tr = await th.pause(stableCoinCapabilitiesSC);
	});

	it('Test unpause contract function', async () => {
		tr = await th.unpause(stableCoinCapabilitiesSC);
	});

	it('Test get roles contract function', async () => {
		tr = await th.getRoles(
			stableCoinCapabilitiesSC,
			CLIENT_ACCOUNT_ECDSA.id,
		);
		expect(tr.response).toEqual([
			StableCoinRole.DEFAULT_ADMIN_ROLE,
			StableCoinRole.CASHIN_ROLE,
			StableCoinRole.BURN_ROLE,
			StableCoinRole.WIPE_ROLE,
			StableCoinRole.RESCUE_ROLE,
			StableCoinRole.PAUSE_ROLE,
			StableCoinRole.FREEZE_ROLE,
			StableCoinRole.DELETE_ROLE,
		]);
	}, 10000);

	it('Test revoke role contract function', async () => {
		tr = await th.revokeRole(
			stableCoinCapabilitiesSC,
			CLIENT_ACCOUNT_ECDSA.id,
			StableCoinRole.BURN_ROLE,
		);
		tr = await th.hasRole(
			stableCoinCapabilitiesSC,
			CLIENT_ACCOUNT_ECDSA.id,
			StableCoinRole.BURN_ROLE,
		);
		expect(tr.response).toEqual(false);
	}, 10000);

	it('Test grant role contract function', async () => {
		tr = await th.grantRole(
			stableCoinCapabilitiesSC,
			CLIENT_ACCOUNT_ECDSA.id,
			StableCoinRole.BURN_ROLE,
		);
		tr = await th.hasRole(
			stableCoinCapabilitiesSC,
			CLIENT_ACCOUNT_ECDSA.id,
			StableCoinRole.BURN_ROLE,
		);
		expect(tr.response).toEqual(true);
	}, 10000);

	it('Test supplier allowance contract function', async () => {
		tr = await th.supplierAllowance(
			stableCoinCapabilitiesSC,
			CLIENT_ACCOUNT_ECDSA.id,
		);
		expect(tr.response).toEqual(
			BigDecimal.fromString('0', stableCoinCapabilitiesSC.coin.decimals),
		);
	});

	it('Test increase supplier allowance contract function', async () => {
		tr = await th.revokeSupplierRole(
			stableCoinCapabilitiesSC,
			CLIENT_ACCOUNT_ECDSA.id,
		);
		tr = await th.grantSupplierRole(
			stableCoinCapabilitiesSC,
			CLIENT_ACCOUNT_ECDSA.id,
			BigDecimal.fromString('10', stableCoinCapabilitiesSC.coin.decimals),
		);
		tr = await th.increaseSupplierAllowance(
			stableCoinCapabilitiesSC,
			CLIENT_ACCOUNT_ECDSA.id,
			BigDecimal.fromString('1', stableCoinCapabilitiesSC.coin.decimals),
		);
		tr = await th.supplierAllowance(
			stableCoinCapabilitiesSC,
			CLIENT_ACCOUNT_ECDSA.id,
		);
		expect(tr.response).toEqual(
			BigDecimal.fromString('11', stableCoinCapabilitiesSC.coin.decimals),
		);
		tr = await th.isUnlimitedSupplierAllowance(
			stableCoinCapabilitiesSC,
			CLIENT_ACCOUNT_ECDSA.id,
		);
		expect(tr.response).toEqual(false);
	}, 20000);

	it('Test decrease supplier allowance contract function', async () => {
		tr = await th.decreaseSupplierAllowance(
			stableCoinCapabilitiesSC,
			CLIENT_ACCOUNT_ECDSA.id,
			BigDecimal.fromString('1', stableCoinCapabilitiesSC.coin.decimals),
		);
		tr = await th.supplierAllowance(
			stableCoinCapabilitiesSC,
			CLIENT_ACCOUNT_ECDSA.id,
		);
		expect(tr.response).toEqual(
			BigDecimal.fromString('10', stableCoinCapabilitiesSC.coin.decimals),
		);
		tr = await th.isUnlimitedSupplierAllowance(
			stableCoinCapabilitiesSC,
			CLIENT_ACCOUNT_ECDSA.id,
		);
		expect(tr.response).toEqual(false);
	}, 20000);

	it('Test reset supplier allowance contract function', async () => {
		tr = await th.resetSupplierAllowance(
			stableCoinCapabilitiesSC,
			CLIENT_ACCOUNT_ECDSA.id,
		);
		tr = await th.supplierAllowance(
			stableCoinCapabilitiesSC,
			CLIENT_ACCOUNT_ECDSA.id,
		);
		expect(tr.response).toEqual(
			BigDecimal.fromString('0', stableCoinCapabilitiesSC.coin.decimals),
		);
	}, 20000);

	it('Test grant unlimited supplier allowance contract function', async () => {
		tr = await th.revokeSupplierRole(
			stableCoinCapabilitiesSC,
			CLIENT_ACCOUNT_ECDSA.id,
		);
		tr = await th.grantUnlimitedSupplierRole(
			stableCoinCapabilitiesSC,
			CLIENT_ACCOUNT_ECDSA.id,
		);
		tr = await th.isUnlimitedSupplierAllowance(
			stableCoinCapabilitiesSC,
			CLIENT_ACCOUNT_ECDSA.id,
		);
		expect(tr.response).toEqual(true);
	}, 20000);

	it('Test get feed address returns null when stable coin has no PoR', async () => {
		tr = await th.getReserveAddress(
			stableCoinCapabilitiesSC
		);
		expect(tr.response).toBeNull
	}, 20000);

	it('Test get feed address returns a value when stable coin has PoR', async () => {
		tr = await th.getReserveAddress(
			stableCoinCapabilitiesHTS
		);
		expect(tr.response).not.toBeNull
	}, 20000);

	it('Test get PoR amount returns null when stable coin has no PoR', async () => {
		tr = await th.getReserveAmount(
			stableCoinCapabilitiesSC
		);
		expect(tr.response).toBeNull
	}, 20000);

	it('Test get PoR amount returns a value when stable coin has PoR', async () => {
		tr = await th.getReserveAmount(
			stableCoinCapabilitiesHTS
		);
		expect(tr.response).not.toBeNull
	}, 20000);
	
	it('Test update PoR amount when stable coin has PoR', async () => {
		tr = await th.getReserveAddress(
			stableCoinCapabilitiesHTS
		);

		tr = await th.updateReserveAmount(
			new ContractId(tr.response),
			BigDecimal.fromStringFixed('1000', 2)
		);
		tr = await th.getReserveAmount(
			stableCoinCapabilitiesHTS
		);
		expect(tr.response).toEqual(BigDecimal.fromStringFixed('1000', 2))
	}, 20000);

	it('Test update feed address when stable coin has PoR', async () => {
		tr = await th.updateReserveAddress(
			stableCoinCapabilitiesHTS,
			new ContractId('0.0.11111111')
		);
		tr = await th.getReserveAddress(
			stableCoinCapabilitiesHTS
		);
		expect(tr.response).toEqual('0.0.11111111')
	}, 20000);
});

describe('🧪 [ADAPTER] HTSTransactionAdapter with ED25519 accounts', () => {
	// token to operate through HTS
	let stableCoinCapabilitiesHTS: StableCoinCapabilities;
	let stableCoinCapabilitiesSC: StableCoinCapabilities;
	let stableCoinService: StableCoinService;

	let th: HTSTransactionAdapter;
	let tr: TransactionResponse;
	const getBalance = async function (
		hederaId: HederaId,
		stableCoinCapabilities: StableCoinCapabilities,
	): Promise<BigDecimal> {
		return (
			(await th.balanceOf(stableCoinCapabilities, hederaId)).response ??
			BigDecimal.ZERO
		);
	};
	beforeAll(async () => {
		await initTest(CLIENT_ACCOUNT_ED25519);
		th = Injectable.resolve(HTSTransactionAdapter);
		stableCoinService = Injectable.resolve(StableCoinService);

		const coinSC = new StableCoin({
			name: 'TestCoinSC',
			symbol: 'TCSC',
			decimals: 6,
			initialSupply: BigDecimal.fromString('5.60', 6),
			freezeDefault: false,
			adminKey: PublicKey.NULL,
			freezeKey: PublicKey.NULL,
			// kycKey: PublicKey.NULL,
			wipeKey: PublicKey.NULL,
			pauseKey: PublicKey.NULL,
			supplyKey: PublicKey.NULL,
			autoRenewAccount: CLIENT_ACCOUNT_ED25519.id,
			supplyType: TokenSupplyType.INFINITE,
			treasury: HederaId.NULL,
		});
		tr = await th.create(
			coinSC,
			new ContractId(FactoryAddressTestnet),
			new ContractId(HederaERC20AddressTestnet),
			false,
			new ContractId('0.0.11111111')
		);
		const tokenIdSC = ContractId.fromHederaContractId(
			HContractId.fromSolidityAddress(tr.response[3]),
		);
		stableCoinCapabilitiesSC = await stableCoinService.getCapabilities(
			CLIENT_ACCOUNT_ED25519,
			tokenIdSC,
		);
		const coinHTS = new StableCoin({
			name: 'TestCoinAccount',
			symbol: 'TCA',
			decimals: 6,
			initialSupply: BigDecimal.fromString('5.60', 6),
			maxSupply: BigDecimal.fromString('1000', 6),
			freezeDefault: false,
			adminKey: CLIENT_ACCOUNT_ED25519.publicKey,
			freezeKey: CLIENT_ACCOUNT_ED25519.publicKey,
			// kycKey: CLIENT_ACCOUNT_ED25519.publicKey,
			wipeKey: CLIENT_ACCOUNT_ED25519.publicKey,
			pauseKey: CLIENT_ACCOUNT_ED25519.publicKey,
			supplyKey: CLIENT_ACCOUNT_ED25519.publicKey,
			autoRenewAccount: CLIENT_ACCOUNT_ED25519.id,
			supplyType: TokenSupplyType.FINITE,
			treasury: CLIENT_ACCOUNT_ED25519.id,
		});
		tr = await th.create(
			coinHTS,
			new ContractId(FactoryAddressTestnet),
			new ContractId(HederaERC20AddressTestnet),
			false,
			new ContractId('0.0.11111111'),
			BigDecimal.fromString('2.35', 2)
		);
		const tokenIdHTS = ContractId.fromHederaContractId(
			HContractId.fromSolidityAddress(tr.response[3]),
		);
		stableCoinCapabilitiesHTS = await stableCoinService.getCapabilities(
			CLIENT_ACCOUNT_ED25519,
			tokenIdHTS,
		);
	}, 1500000);

	it('Test cashin HTS', async () => {
		const accountInitialBalance = await getBalance(
			CLIENT_ACCOUNT_ED25519.id,
			stableCoinCapabilitiesHTS,
		);
		tr = await th.cashin(
			stableCoinCapabilitiesHTS,
			CLIENT_ACCOUNT_ED25519.id,
			BigDecimal.fromString('1', stableCoinCapabilitiesHTS.coin.decimals),
		);
		tr = await th.transfer(
			stableCoinCapabilitiesHTS,
			BigDecimal.fromString('1', stableCoinCapabilitiesHTS.coin.decimals),
			CLIENT_ACCOUNT_ED25519,
			CLIENT_ACCOUNT_ED25519.id,
			true,
		);

		const accountFinalBalance = await getBalance(
			CLIENT_ACCOUNT_ED25519.id,
			stableCoinCapabilitiesHTS,
		);
		expect(accountFinalBalance).toEqual(
			accountInitialBalance.addUnsafe(
				BigDecimal.fromString(
					'1',
					stableCoinCapabilitiesHTS.coin.decimals,
				),
			),
		);
	}, 150000);

	it('Test burn HTS', async () => {
		const accountInitialBalance: BigDecimal = await getBalance(
			stableCoinCapabilitiesHTS.coin.treasury ?? HederaId.NULL,
			stableCoinCapabilitiesHTS,
		);
		tr = await th.burn(
			stableCoinCapabilitiesHTS,
			BigDecimal.fromString('1', stableCoinCapabilitiesHTS.coin.decimals),
		);

		const accountFinalBalance: BigDecimal = await getBalance(
			stableCoinCapabilitiesHTS.coin.treasury ?? HederaId.NULL,
			stableCoinCapabilitiesHTS,
		);
		// const expectFinal =;
		expect(accountFinalBalance).toEqual(
			accountInitialBalance.subUnsafe(
				BigDecimal.fromString(
					'1',
					stableCoinCapabilitiesHTS.coin.decimals,
				),
			),
		);
	}, 50000);

	it('Test wipe HTS', async () => {
		await expect(
			th.wipe(
				stableCoinCapabilitiesHTS,
				CLIENT_ACCOUNT_ECDSA.id,
				BigDecimal.fromString(
					'1',
					stableCoinCapabilitiesHTS.coin.decimals,
				),
			),
		).rejects.toThrow();
	}, 50000);

	it('Test freeze', async () => {
		tr = await th.freeze(
			stableCoinCapabilitiesHTS,
			CLIENT_ACCOUNT_ED25519.id,
		);
	}, 20000);

	it('Test unfreeze', async () => {
		tr = await th.unfreeze(
			stableCoinCapabilitiesHTS,
			CLIENT_ACCOUNT_ED25519.id,
		);
	}, 20000);

	it('Test pause', async () => {
		tr = await th.pause(stableCoinCapabilitiesHTS);
	}, 20000);

	it('Test unpause', async () => {
		tr = await th.unpause(stableCoinCapabilitiesHTS);
	}, 20000);

	it('Test cashIn contract function', async () => {
		const accountInitialBalance: BigDecimal = await getBalance(
			CLIENT_ACCOUNT_ED25519.id,
			stableCoinCapabilitiesSC,
		);

		tr = await th.cashin(
			stableCoinCapabilitiesSC,
			CLIENT_ACCOUNT_ED25519.id,
			BigDecimal.fromString('1', stableCoinCapabilitiesSC.coin.decimals),
		);
		const accountFinalBalance: BigDecimal = await getBalance(
			CLIENT_ACCOUNT_ED25519.id,
			stableCoinCapabilitiesSC,
		);
		expect(accountFinalBalance).toEqual(
			accountInitialBalance.addUnsafe(
				BigDecimal.fromString(
					'1',
					stableCoinCapabilitiesHTS.coin.decimals,
				),
			),
		);
	}, 20000);

	it('Test burn contract function', async () => {
		const accountInitialBalance: BigDecimal = await getBalance(
			stableCoinCapabilitiesSC.coin.treasury ?? HederaId.NULL,
			stableCoinCapabilitiesSC,
		);

		tr = await th.burn(
			stableCoinCapabilitiesSC,
			BigDecimal.fromString('1', stableCoinCapabilitiesSC.coin.decimals),
		);
		const accountFinalBalance: BigDecimal = await getBalance(
			stableCoinCapabilitiesSC.coin.treasury ?? HederaId.NULL,
			stableCoinCapabilitiesSC,
		);

		expect(accountFinalBalance).toEqual(
			accountInitialBalance.subUnsafe(
				BigDecimal.fromString(
					'1',
					stableCoinCapabilitiesSC.coin.decimals,
				),
			),
		);
	}, 20000);

	it('Test wipe contract function', async () => {
		const accountInitialBalance: BigDecimal = await getBalance(
			CLIENT_ACCOUNT_ED25519.id,
			stableCoinCapabilitiesSC,
		);

		tr = await th.wipe(
			stableCoinCapabilitiesSC,
			CLIENT_ACCOUNT_ED25519.id,
			BigDecimal.fromString('1', stableCoinCapabilitiesSC.coin.decimals),
		);
		const accountFinalBalance: BigDecimal = await getBalance(
			CLIENT_ACCOUNT_ED25519.id,
			stableCoinCapabilitiesSC,
		);
		expect(accountFinalBalance).toEqual(
			accountInitialBalance.subUnsafe(
				BigDecimal.fromString(
					'1',
					stableCoinCapabilitiesSC.coin.decimals,
				),
			),
		);
	}, 20000);

	it('Test rescue contract function', async () => {
		tr = await th.rescue(
			stableCoinCapabilitiesSC,
			BigDecimal.fromString('1', stableCoinCapabilitiesSC.coin.decimals),
		);
	}, 20000);

	it('Test freeze contract function', async () => {
		tr = await th.freeze(
			stableCoinCapabilitiesSC,
			CLIENT_ACCOUNT_ED25519.id,
		);
	});

	it('Test unfreeze contract function', async () => {
		tr = await th.unfreeze(
			stableCoinCapabilitiesSC,
			CLIENT_ACCOUNT_ED25519.id,
		);
	});

	it('Test pause contract function', async () => {
		tr = await th.pause(stableCoinCapabilitiesSC);
	});

	it('Test unpause contract function', async () => {
		tr = await th.unpause(stableCoinCapabilitiesSC);
	});

	it('Test get roles contract function', async () => {
		tr = await th.getRoles(
			stableCoinCapabilitiesSC,
			CLIENT_ACCOUNT_ED25519.id,
		);
		expect(tr.response).toEqual([
			StableCoinRole.DEFAULT_ADMIN_ROLE,
			StableCoinRole.CASHIN_ROLE,
			StableCoinRole.BURN_ROLE,
			StableCoinRole.WIPE_ROLE,
			StableCoinRole.RESCUE_ROLE,
			StableCoinRole.PAUSE_ROLE,
			StableCoinRole.FREEZE_ROLE,
			StableCoinRole.DELETE_ROLE,
		]);
	}, 10000);

	it('Test revoke role contract function', async () => {
		tr = await th.revokeRole(
			stableCoinCapabilitiesSC,
			CLIENT_ACCOUNT_ED25519.id,
			StableCoinRole.BURN_ROLE,
		);
		tr = await th.hasRole(
			stableCoinCapabilitiesSC,
			CLIENT_ACCOUNT_ED25519.id,
			StableCoinRole.BURN_ROLE,
		);
		expect(tr.response).toEqual(false);
	}, 10000);

	it('Test grant role contract function', async () => {
		tr = await th.grantRole(
			stableCoinCapabilitiesSC,
			CLIENT_ACCOUNT_ED25519.id,
			StableCoinRole.BURN_ROLE,
		);
		tr = await th.hasRole(
			stableCoinCapabilitiesSC,
			CLIENT_ACCOUNT_ED25519.id,
			StableCoinRole.BURN_ROLE,
		);
		expect(tr.response).toEqual(true);
	}, 10000);

	it('Test supplier allowance contract function', async () => {
		tr = await th.supplierAllowance(
			stableCoinCapabilitiesSC,
			CLIENT_ACCOUNT_ED25519.id,
		);
		expect(tr.response).toEqual(
			BigDecimal.fromString('0', stableCoinCapabilitiesSC.coin.decimals),
		);
	});

	it('Test increase supplier allowance contract function', async () => {
		tr = await th.revokeSupplierRole(
			stableCoinCapabilitiesSC,
			CLIENT_ACCOUNT_ED25519.id,
		);
		tr = await th.grantSupplierRole(
			stableCoinCapabilitiesSC,
			CLIENT_ACCOUNT_ED25519.id,
			BigDecimal.fromString('10', stableCoinCapabilitiesSC.coin.decimals),
		);
		tr = await th.increaseSupplierAllowance(
			stableCoinCapabilitiesSC,
			CLIENT_ACCOUNT_ED25519.id,
			BigDecimal.fromString('1', stableCoinCapabilitiesSC.coin.decimals),
		);
		tr = await th.supplierAllowance(
			stableCoinCapabilitiesSC,
			CLIENT_ACCOUNT_ED25519.id,
		);
		expect(tr.response).toEqual(
			BigDecimal.fromString('11', stableCoinCapabilitiesSC.coin.decimals),
		);
		tr = await th.isUnlimitedSupplierAllowance(
			stableCoinCapabilitiesSC,
			CLIENT_ACCOUNT_ED25519.id,
		);
		expect(tr.response).toEqual(false);
	}, 20000);

	it('Test decrease supplier allowance contract function', async () => {
		tr = await th.decreaseSupplierAllowance(
			stableCoinCapabilitiesSC,
			CLIENT_ACCOUNT_ED25519.id,
			BigDecimal.fromString('1', stableCoinCapabilitiesSC.coin.decimals),
		);
		tr = await th.supplierAllowance(
			stableCoinCapabilitiesSC,
			CLIENT_ACCOUNT_ED25519.id,
		);
		expect(tr.response).toEqual(
			BigDecimal.fromString('10', stableCoinCapabilitiesSC.coin.decimals),
		);
		tr = await th.isUnlimitedSupplierAllowance(
			stableCoinCapabilitiesSC,
			CLIENT_ACCOUNT_ED25519.id,
		);
		expect(tr.response).toEqual(false);
	}, 20000);

	it('Test reset supplier allowance contract function', async () => {
		tr = await th.resetSupplierAllowance(
			stableCoinCapabilitiesSC,
			CLIENT_ACCOUNT_ED25519.id,
		);
		tr = await th.supplierAllowance(
			stableCoinCapabilitiesSC,
			CLIENT_ACCOUNT_ED25519.id,
		);
		expect(tr.response).toEqual(
			BigDecimal.fromString('0', stableCoinCapabilitiesSC.coin.decimals),
		);
	}, 20000);

	it('Test grant unlimited supplier allowance contract function', async () => {
		tr = await th.revokeSupplierRole(
			stableCoinCapabilitiesSC,
			CLIENT_ACCOUNT_ED25519.id,
		);
		tr = await th.grantUnlimitedSupplierRole(
			stableCoinCapabilitiesSC,
			CLIENT_ACCOUNT_ED25519.id,
		);
		tr = await th.isUnlimitedSupplierAllowance(
			stableCoinCapabilitiesSC,
			CLIENT_ACCOUNT_ED25519.id,
		);
		expect(tr.response).toEqual(true);
	}, 20000);

	it('Test get feed address returns null when stable coin has no PoR', async () => {
		tr = await th.getReserveAddress(
			stableCoinCapabilitiesSC
		);
		expect(tr.response).toBeNull
	}, 20000);

	it('Test get feed address returns a value when stable coin has PoR', async () => {
		tr = await th.getReserveAddress(
			stableCoinCapabilitiesHTS
		);
		expect(tr.response).not.toBeNull
	}, 20000);

	it('Test get PoR amount returns null when stable coin has no PoR', async () => {
		tr = await th.getReserveAmount(
			stableCoinCapabilitiesSC
		);
		expect(tr.response).toBeNull
	}, 20000);

	it('Test get PoR amount returns a value when stable coin has PoR', async () => {
		tr = await th.getReserveAmount(
			stableCoinCapabilitiesHTS
		);
		expect(tr.response).not.toBeNull
	}, 20000);
	
	it('Test update PoR amount when stable coin has PoR', async () => {
		tr = await th.getReserveAddress(
			stableCoinCapabilitiesHTS
		);

		tr = await th.updateReserveAmount(
			new ContractId(tr.response),
			BigDecimal.fromStringFixed('1000', 2)
		);
		tr = await th.getReserveAmount(
			stableCoinCapabilitiesHTS
		);
		expect(tr.response).toEqual(BigDecimal.fromStringFixed('1000', 2))
	}, 20000);

	it('Test update feed address when stable coin has PoR', async () => {
		tr = await th.updateReserveAddress(
			stableCoinCapabilitiesHTS,
			new ContractId('0.0.11111111')
		);
		tr = await th.getReserveAddress(
			stableCoinCapabilitiesHTS
		);
		expect(tr.response).toEqual('0.0.11111111')
	}, 20000);	
});

async function initTest(account: Account): Promise<void> {
	await Network.connect(
		new ConnectRequest({
			account: {
				accountId: account.id.toString(),
				evmAddress: account.evmAddress,
				privateKey: account.privateKey,
			},
			network: 'testnet',
			wallet: SupportedWallets.CLIENT,
		}),
	);
}
