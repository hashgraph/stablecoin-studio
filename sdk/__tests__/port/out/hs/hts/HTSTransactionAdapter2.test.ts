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

/* eslint-disable @typescript-eslint/no-non-null-assertion */
import TransactionResponse from '../../../../../src/domain/context/transaction/TransactionResponse.js';
import StableCoinCapabilities from '../../../../../src/domain/context/stablecoin/StableCoinCapabilities.js';
import { StableCoin } from '../../../../../src/domain/context/stablecoin/StableCoin.js';
import Account from '../../../../../src/domain/context/account/Account.js';
import BigDecimal from '../../../../../src/domain/context/shared/BigDecimal.js';
import { HederaId } from '../../../../../src/domain/context/shared/HederaId.js';
import { StableCoinRole } from '../../../../../src/domain/context/stablecoin/StableCoinRole.js';
import Injectable from '../../../../../src/core/Injectable.js';
import { LoggerTransports, Network, SDK } from '../../../../../src/index.js';
import ConnectRequest, {
	SupportedWallets,
} from '../../../../../src/port/in/request/ConnectRequest.js';
import {
	StableCoinViewModel,
	TokenSupplyType,
} from '../../../../../src/port/in/StableCoin.js';
import PublicKey from '../../../../../src/domain/context/account/PublicKey.js';
import ContractId from '../../../../../src/domain/context/contract/ContractId.js';
import { ContractId as HContractId } from '@hashgraph/sdk';
import {
	CLIENT_ACCOUNT_ECDSA,
	CLIENT_ACCOUNT_ED25519,
	FACTORY_ADDRESS,
	HEDERA_ERC20_ADDRESS,
} from '../../../../config.js';
import StableCoinService from '../../../../../src/app/service/StableCoinService.js';
import { RESERVE_DECIMALS } from '../../../../../src/domain/context/reserve/Reserve.js';
import RPCQueryAdapter from '../../../../../src/port/out/rpc/RPCQueryAdapter.js';
import { HTSTransactionAdapter } from '../../../../../src/port/out/hs/hts/HTSTransactionAdapter.js';
import { MirrorNodeAdapter } from '../../../../../src/port/out/mirror/MirrorNodeAdapter.js';

SDK.log = { level: 'ERROR', transports: new LoggerTransports.Console() };

const delay = async (seconds = 2): Promise<void> => {
	seconds = seconds * 1000;
	await new Promise((r) => setTimeout(r, seconds));
};

describe('🧪 [ADAPTER] HTSTransactionAdapter with ECDSA accounts', () => {
	// token to operate through HTS
	let stableCoinCapabilitiesHTS: StableCoinCapabilities;
	let stableCoinCapabilitiesSC: StableCoinCapabilities;
	let stableCoinService: StableCoinService;
	let rpcQueryAdapter: RPCQueryAdapter;
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
		await connectAccount(CLIENT_ACCOUNT_ECDSA);
		th = Injectable.resolve(HTSTransactionAdapter);
		stableCoinService = Injectable.resolve(StableCoinService);
		rpcQueryAdapter = Injectable.resolve(RPCQueryAdapter);
		rpcQueryAdapter.init();

		const coinSC = new StableCoin({
			name: 'TestCoinSC',
			symbol: 'TCSC',
			decimals: 6,
			initialSupply: BigDecimal.fromString('5.60', 6),
			freezeDefault: false,
			// adminKey: PublicKey.NULL,
			freezeKey: PublicKey.NULL,
			// kycKey: PublicKey.NULL,
			wipeKey: PublicKey.NULL,
			pauseKey: PublicKey.NULL,
			// supplyKey: PublicKey.NULL,
			// autoRenewAccount: CLIENT_ACCOUNT_ECDSA.id,
			supplyType: TokenSupplyType.INFINITE,
			// treasury: HederaId.NULL,
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
		tr = await th.create(
			coinSC,
			new ContractId(FACTORY_ADDRESS),
			new ContractId(HEDERA_ERC20_ADDRESS),
			true,
			undefined,
			BigDecimal.fromString('100000000', RESERVE_DECIMALS),
		);
		const tokenIdSC = ContractId.fromHederaContractId(
			HContractId.fromSolidityAddress(tr.response[0][3]),
		);
		stableCoinCapabilitiesSC = await stableCoinService.getCapabilities(
			CLIENT_ACCOUNT_ECDSA,
			tokenIdSC,
		);
		console.log('cccccccccc');
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
		/*tr = await th.create(
			coinHTS,
			new ContractId(FACTORY_ADDRESS),
			new ContractId(HEDERA_ERC20_ADDRESS),
			false,
		);
console.log("aaaaaaaaaaaa");
		const tokenIdHTS = ContractId.fromHederaContractId(
			HContractId.fromSolidityAddress(tr.response[0][3]),
		);
console.log("tokenIdHTS: " + tokenIdHTS);		
		stableCoinCapabilitiesHTS = await stableCoinService.getCapabilities(
			CLIENT_ACCOUNT_ECDSA,
			tokenIdHTS,
		);*/
	}, 1500000);

	it('Test cashin HTS', async () => {
		console.log('xxxxxx');
		const accountInitialBalance = await getBalance(
			CLIENT_ACCOUNT_ECDSA.id,
			stableCoinCapabilitiesHTS,
		);
		console.log('yyyyyy');
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
});

function oneYearLaterInNano(): number {
	const currentDate: Date = new Date();
	return currentDate.setFullYear(currentDate.getFullYear() + 1) * 1000000;
}

function oneYearLaterInSeconds(): number {
	const currentDate: Date = new Date();
	return Math.floor(
		currentDate.setFullYear(currentDate.getFullYear() + 1) / 1000,
	);
}

function secondsToDays(seconds: number): number {
	return seconds * 60 * 60 * 24;
}

function secondsToNano(seconds: number): number {
	return seconds * 1000000000;
}

async function connectAccount(account: Account): Promise<void> {
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
