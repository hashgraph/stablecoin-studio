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

/* eslint-disable jest/no-disabled-tests */
/* eslint-disable jest/expect-expect */
/* eslint-disable @typescript-eslint/no-non-null-assertion */
import Account from '../../src/domain/context/account/Account.js';
import TransactionResponse from '../../src/domain/context/transaction/TransactionResponse.js';
import {
	Network,
	RequestCustomFee,
	StableCoinCapabilities,
	RequestFractionalFee,
	RequestFixedFee,
} from '../../src/index.js';
import ConnectRequest, {
	SupportedWallets,
} from '../../src/port/in/request/ConnectRequest.js';
import {
	CustomFee as HCustomFee,
	CustomFixedFee as HCustomFixedFee,
	CustomFractionalFee as HCustomFractionalFee,
	ContractId as HContractId,
} from '@hashgraph/sdk';
import ContractId from '../../src/domain/context/contract/ContractId.js';
import { TokenSupplyType } from '../../src/port/in/StableCoin.js';
import { StableCoin } from '../../src/domain/context/stablecoin/StableCoin.js';
import {
	CLIENT_ACCOUNT_ED25519,
	ENVIRONMENT,
	FACTORY_ADDRESS,
	HEDERA_ERC20_ADDRESS,
} from '../config.js';
import { HTSTransactionAdapter } from '../../src/port/out/hs/hts/HTSTransactionAdapter.js';
import { MirrorNodeAdapter } from '../../src/port/out/mirror/MirrorNodeAdapter.js';
import Injectable from '../../src/core/Injectable.js';
import { HederaId } from '../../src/domain/context/shared/HederaId.js';
import StableCoinService from '../../src/app/service/StableCoinService.js';
import StableCoinDetail from '../../src/port/out/mirror/response/StableCoinViewModel.js';
// import FeeAssessmentMethod from '@hashgraph/sdk/lib/token/FeeAssessmentMethod.js';
import {
	CustomFee,
	FixedFee,
	FractionalFee,
} from '../../src/domain/context/fee/CustomFee.js';
import BigDecimal from '../../src/domain/context/shared/BigDecimal.js';

describe('🧪 [ADAPTER] HTSTransactionAdapter with ECDSA accounts', () => {
	// token to operate through HTS
	let stableCoinCapabilitiesHTS: StableCoinCapabilities;
	let stableCoinService: StableCoinService;

	//const denominatingTokenId = '0.0.3397146';
	const feeCollectorAccountId: string = CLIENT_ACCOUNT_ED25519.id.toString();

	//const tokenId: HederaId = new HederaId('0.0.3397146');

	let th: HTSTransactionAdapter;
	let tr: TransactionResponse;
	let mn: MirrorNodeAdapter;

	const delay = async (seconds = 2): Promise<void> => {
		seconds = seconds * 1000;
		await new Promise((r) => setTimeout(r, seconds));
	};

	beforeAll(async () => {
		await connectAccount(CLIENT_ACCOUNT_ED25519);
		th = Injectable.resolve(HTSTransactionAdapter);
		mn = new MirrorNodeAdapter();
		mn.setEnvironment(ENVIRONMENT);

		stableCoinService = Injectable.resolve(StableCoinService);

		/*stableCoinCapabilitiesHTS = await stableCoinService.getCapabilities(
			CLIENT_ACCOUNT_ED25519,
			tokenId,
		);*/

		const coinHTS = new StableCoin({
			name: 'TestCoinAccount',
			symbol: 'TCA',
			decimals: 6,
			initialSupply: BigDecimal.fromString('5.60', 6),
			maxSupply: BigDecimal.fromString('1000', 6),
			freezeDefault: false,
			adminKey: CLIENT_ACCOUNT_ED25519.publicKey,
			freezeKey: CLIENT_ACCOUNT_ED25519.publicKey,
			wipeKey: CLIENT_ACCOUNT_ED25519.publicKey,
			pauseKey: CLIENT_ACCOUNT_ED25519.publicKey,
			supplyKey: CLIENT_ACCOUNT_ED25519.publicKey,
			feeScheduleKey: CLIENT_ACCOUNT_ED25519.publicKey,
			autoRenewAccount: CLIENT_ACCOUNT_ED25519.id,
			supplyType: TokenSupplyType.FINITE,
			treasury: CLIENT_ACCOUNT_ED25519.id,
		});
		tr = await th.create(
			coinHTS,
			new ContractId(FACTORY_ADDRESS),
			new ContractId(HEDERA_ERC20_ADDRESS),
			false,
		);

		const tokenIdHTS = ContractId.fromHederaContractId(
			HContractId.fromSolidityAddress(tr.response[0][3]),
		);
		stableCoinCapabilitiesHTS = await stableCoinService.getCapabilities(
			CLIENT_ACCOUNT_ED25519,
			tokenIdHTS,
		);
	}, 1500000);

	it('Create a fixed custom fee for an existing stable coin', async () => {
		const customFixedFee: HCustomFixedFee = new HCustomFixedFee()
			.setAmount(1)
			.setDenominatingTokenId(
				stableCoinCapabilitiesHTS.coin.tokenId!.toString(),
			)
			.setFeeCollectorAccountId(feeCollectorAccountId);
		const customFee: HCustomFee[] = [customFixedFee];
		await th.updateCustomFees(stableCoinCapabilitiesHTS, customFee);

		await delay(5);

		const tokenCustomFees: RequestCustomFee[] = await getTokenCustomFees(
			mn,
			stableCoinCapabilitiesHTS.coin.tokenId!,
		);
		expect(tokenCustomFees.length).toEqual(1);
		expect(tokenCustomFees[0]).toBeInstanceOf(FixedFee);
		expect(tokenCustomFees[0].collectorId).toEqual(
			new HederaId(feeCollectorAccountId),
		);

		await removeTokenCustomFees(th, stableCoinCapabilitiesHTS);
	}, 150000);

	it('Create a fractional custom fee for an existing stable coin', async () => {
		const customFractionalFee: HCustomFractionalFee =
			new HCustomFractionalFee()
				.setNumerator(1)
				.setDenominator(10)
				.setFeeCollectorAccountId(feeCollectorAccountId);

		const customFee: HCustomFee[] = [customFractionalFee];
		await th.updateCustomFees(stableCoinCapabilitiesHTS, customFee);

		await delay(5);

		const tokenCustomFees: RequestCustomFee[] = await getTokenCustomFees(
			mn,
			stableCoinCapabilitiesHTS.coin.tokenId!,
		);
		expect(tokenCustomFees.length).toEqual(1);
		expect(tokenCustomFees[0]).toBeInstanceOf(FractionalFee);
		expect(tokenCustomFees[0].collectorId).toEqual(
			new HederaId(feeCollectorAccountId),
		);
		expect(
			(tokenCustomFees[0] as RequestFractionalFee).amountNumerator,
		).toEqual(1);
		expect(
			(tokenCustomFees[0] as RequestFractionalFee).amountDenominator,
		).toEqual(10);
		expect((tokenCustomFees[0] as RequestFractionalFee).min!).toEqual(
			new BigDecimal('0'),
		);
		expect(
			(tokenCustomFees[0] as RequestFractionalFee).max,
		).toBeUndefined();

		await removeTokenCustomFees(th, stableCoinCapabilitiesHTS);
	}, 150000);

	it('Create a fixed and a fractional custom fee, charged to the receiver, for an existing stable coin', async () => {
		const customFixedFee: HCustomFixedFee = new HCustomFixedFee()
			.setAmount(1)
			.setDenominatingTokenId(
				stableCoinCapabilitiesHTS.coin.tokenId!.toString(),
			)
			.setFeeCollectorAccountId(feeCollectorAccountId);

		const customFractionalFee: HCustomFractionalFee =
			new HCustomFractionalFee()
				.setNumerator(1)
				.setDenominator(10)
				.setFeeCollectorAccountId(feeCollectorAccountId);

		const customFee: HCustomFee[] = [customFixedFee, customFractionalFee];
		await th.updateCustomFees(stableCoinCapabilitiesHTS, customFee);

		await delay(5);

		const tokenCustomFees: RequestCustomFee[] = await getTokenCustomFees(
			mn,
			stableCoinCapabilitiesHTS.coin.tokenId!,
		);
		expect(tokenCustomFees.length).toEqual(2);
		//expect(tokenCustomFees[0]).toBeInstanceOf(FractionalFee);
		expect(tokenCustomFees[0].collectorId).toEqual(
			new HederaId(feeCollectorAccountId),
		);
		expect(
			(tokenCustomFees[0] as RequestFractionalFee).amountNumerator,
		).toEqual(1);
		expect(
			(tokenCustomFees[0] as RequestFractionalFee).amountDenominator,
		).toEqual(10);
		expect((tokenCustomFees[0] as RequestFractionalFee).min!).toEqual(
			new BigDecimal('0'),
		);
		expect(
			(tokenCustomFees[0] as RequestFractionalFee).max,
		).toBeUndefined();

		//expect(tokenCustomFees[1]).toBeInstanceOf(FixedFee);
		expect(tokenCustomFees[1].collectorId).toEqual(
			new HederaId(feeCollectorAccountId),
		);

		await removeTokenCustomFees(th, stableCoinCapabilitiesHTS);
	}, 150000);

	it.skip('Create a fixed and a fractional custom fee, charged to the sender, for an existing stable coin', async () => {
		const customFixedFee: HCustomFixedFee = new HCustomFixedFee()
			.setAmount(1)
			.setDenominatingTokenId(
				stableCoinCapabilitiesHTS.coin.tokenId!.toString(),
			)
			.setFeeCollectorAccountId(feeCollectorAccountId);

		const customFractionalFee: HCustomFractionalFee =
			new HCustomFractionalFee()
				.setNumerator(1)
				.setDenominator(10)
				// .setAssessmentMethod(new FeeAssessmentMethod(true))
				.setFeeCollectorAccountId(feeCollectorAccountId);

		const customFee: HCustomFee[] = [customFixedFee, customFractionalFee];
		await th.updateCustomFees(stableCoinCapabilitiesHTS, customFee);
	}, 150000);
});

async function getTokenCustomFees(
	mn: MirrorNodeAdapter,
	tokenId: HederaId,
): Promise<RequestCustomFee[]> {
	const stableCoinDetail: StableCoinDetail = await mn.getStableCoin(tokenId);
	return stableCoinDetail.customFees ?? [];
}

async function removeTokenCustomFees(
	th: HTSTransactionAdapter,
	stableCoinCapabilitiesHTS: StableCoinCapabilities,
): Promise<void> {
	await th.updateCustomFees(stableCoinCapabilitiesHTS, []);
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
