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
import Account from '../../../src/domain/context/account/Account';
import TransactionResponse from '../../../src/domain/context/transaction/TransactionResponse';
import {
	Network,
	RequestCustomFee,
	StableCoinCapabilities,
	RequestFixedFee,
	RequestFractionalFee,
} from '../../../src/index';
import ConnectRequest, {
	SupportedWallets,
} from '../../../src/port/in/request/ConnectRequest';
import {
	CustomFee as HCustomFee,
	CustomFixedFee as HCustomFixedFee,
	CustomFractionalFee as HCustomFractionalFee,
	ContractId as HContractId,
} from '@hashgraph/sdk';
import ContractId from '../../../src/domain/context/contract/ContractId';
import { TokenSupplyType } from '../../../src/port/in/StableCoin';
import { StableCoin } from '../../../src/domain/context/stablecoin/StableCoin';
import {
	CLIENT_ACCOUNT_ED25519,
	ENVIRONMENT,
	FACTORY_ADDRESS,
	HEDERA_ERC20_ADDRESS,
} from '../../config';
import { HTSTransactionAdapter } from '../../../src/port/out/hs/hts/HTSTransactionAdapter';
import { MirrorNodeAdapter } from '../../../src/port/out/mirror/MirrorNodeAdapter';
import Injectable from '../../../src/core/Injectable';
import { HederaId } from '../../../src/domain/context/shared/HederaId';
import StableCoinService from '../../../src/app/service/StableCoinService';
import StableCoinDetail from '../../../src/port/out/mirror/response/StableCoinViewModel';
// import FeeAssessmentMethod from '@hashgraph/sdk/lib/token/FeeAssessmentMethod.js';
import BigDecimal from '../../../src/domain/context/shared/BigDecimal.js';

describe('🧪 [ADAPTER] HTSTransactionAdapter with ECDSA accounts', () => {
	// token to operate through HTS
	let stableCoinCapabilitiesHTS: StableCoinCapabilities;
	let stableCoinService: StableCoinService;

	const feeCollectorAccountId = CLIENT_ACCOUNT_ED25519.id;

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

		const coinHTS = new StableCoin({
			name: 'TestCoinAccount',
			symbol: 'TCA',
			decimals: 6,
			initialSupply: BigDecimal.fromString('5.60', 6),
			maxSupply: BigDecimal.fromString('1000', 6),
			freezeDefault: false,
			freezeKey: CLIENT_ACCOUNT_ED25519.publicKey,
			wipeKey: CLIENT_ACCOUNT_ED25519.publicKey,
			pauseKey: CLIENT_ACCOUNT_ED25519.publicKey,
			feeScheduleKey: CLIENT_ACCOUNT_ED25519.publicKey,
			supplyType: TokenSupplyType.FINITE,
			burnRoleAccount: CLIENT_ACCOUNT_ED25519.id,
			rescueRoleAccount: CLIENT_ACCOUNT_ED25519.id,
			deleteRoleAccount: CLIENT_ACCOUNT_ED25519.id,
			cashInRoleAccount: CLIENT_ACCOUNT_ED25519.id,
			cashInRoleAllowance: BigDecimal.fromString('0'),
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
		await th.associateToken(tokenIdHTS, feeCollectorAccountId);
	}, 1500000);

	it('Create a fixed custom fee for an existing stable coin', async () => {
		const amount = 1;
		const customFixedFee: HCustomFixedFee = new HCustomFixedFee()
			.setAmount(amount)
			.setDenominatingTokenId(
				stableCoinCapabilitiesHTS.coin.tokenId!.toString(),
			)
			.setFeeCollectorAccountId(feeCollectorAccountId.toString());
		const customFee: HCustomFee[] = [customFixedFee];
		await th.updateCustomFees(stableCoinCapabilitiesHTS, customFee);

		await delay(5);

		const tokenCustomFees: RequestCustomFee[] = await getTokenCustomFees(
			mn,
			stableCoinCapabilitiesHTS.coin.tokenId!,
		);
		expect(tokenCustomFees.length).toEqual(1);
		checkFixedFee(
			tokenCustomFees[0],
			amount,
			stableCoinCapabilitiesHTS,
			feeCollectorAccountId,
		);

		await removeTokenCustomFees(th, stableCoinCapabilitiesHTS);
	}, 150000);

	it('Create a fractional custom fee for an existing stable coin', async () => {
		const numerator = 1;
		const denominator = 10;
		const customFractionalFee: HCustomFractionalFee =
			new HCustomFractionalFee()
				.setNumerator(numerator)
				.setDenominator(denominator)
				.setFeeCollectorAccountId(feeCollectorAccountId.toString());

		const customFee: HCustomFee[] = [customFractionalFee];
		await th.updateCustomFees(stableCoinCapabilitiesHTS, customFee);

		await delay(5);

		const tokenCustomFees: RequestCustomFee[] = await getTokenCustomFees(
			mn,
			stableCoinCapabilitiesHTS.coin.tokenId!,
		);
		expect(tokenCustomFees.length).toEqual(1);
		checkFractionalFee(
			tokenCustomFees[0],
			numerator,
			denominator,
			feeCollectorAccountId,
			false,
		);

		await removeTokenCustomFees(th, stableCoinCapabilitiesHTS);
	}, 150000);

	it('Create a fixed and a fractional custom fee, charged to the receiver, for an existing stable coin', async () => {
		const numerator = 1;
		const denominator = 10;
		const amount = 1;
		const customFixedFee: HCustomFixedFee = new HCustomFixedFee()
			.setAmount(amount)
			.setDenominatingTokenId(
				stableCoinCapabilitiesHTS.coin.tokenId!.toString(),
			)
			.setFeeCollectorAccountId(feeCollectorAccountId.toString());

		const customFractionalFee: HCustomFractionalFee =
			new HCustomFractionalFee()
				.setNumerator(numerator)
				.setDenominator(denominator)
				.setFeeCollectorAccountId(feeCollectorAccountId.toString());

		const customFee: HCustomFee[] = [customFractionalFee, customFixedFee];
		await th.updateCustomFees(stableCoinCapabilitiesHTS, customFee);

		await delay(5);

		const tokenCustomFees: RequestCustomFee[] = await getTokenCustomFees(
			mn,
			stableCoinCapabilitiesHTS.coin.tokenId!,
		);
		expect(tokenCustomFees.length).toEqual(2);
		let FractionalFeeId = 0;
		let FixedFeeId = 1;

		if (!(tokenCustomFees[0] as RequestFractionalFee).amountNumerator) {
			FractionalFeeId = 1;
			FixedFeeId = 0;
		}

		checkFractionalFee(
			tokenCustomFees[FractionalFeeId],
			numerator,
			denominator,
			feeCollectorAccountId,
			false,
		);
		checkFixedFee(
			tokenCustomFees[FixedFeeId],
			amount,
			stableCoinCapabilitiesHTS,
			feeCollectorAccountId,
		);

		await removeTokenCustomFees(th, stableCoinCapabilitiesHTS);
	}, 150000);

	it.skip('Create a fixed and a fractional custom fee, charged to the sender, for an existing stable coin', async () => {
		const numerator = 1;
		const denominator = 10;
		const amount = 1;
		const customFixedFee: HCustomFixedFee = new HCustomFixedFee()
			.setAmount(amount)
			.setDenominatingTokenId(
				stableCoinCapabilitiesHTS.coin.tokenId!.toString(),
			)
			.setFeeCollectorAccountId(feeCollectorAccountId.toString());

		const customFractionalFee: HCustomFractionalFee =
			new HCustomFractionalFee()
				.setNumerator(numerator)
				.setDenominator(denominator)
				// .setAssessmentMethod(new FeeAssessmentMethod(true))
				.setFeeCollectorAccountId(feeCollectorAccountId.toString());

		const customFee: HCustomFee[] = [customFixedFee, customFractionalFee];
		await th.updateCustomFees(stableCoinCapabilitiesHTS, customFee);

		await delay(5);

		const tokenCustomFees: RequestCustomFee[] = await getTokenCustomFees(
			mn,
			stableCoinCapabilitiesHTS.coin.tokenId!,
		);
		expect(tokenCustomFees.length).toEqual(2);
		let FractionalFeeId = 0;
		let FixedFeeId = 1;

		if (!(tokenCustomFees[0] as RequestFractionalFee).amountNumerator) {
			FractionalFeeId = 1;
			FixedFeeId = 0;
		}

		checkFractionalFee(
			tokenCustomFees[FractionalFeeId],
			numerator,
			denominator,
			feeCollectorAccountId,
			true,
		);
		checkFixedFee(
			tokenCustomFees[FixedFeeId],
			amount,
			stableCoinCapabilitiesHTS,
			feeCollectorAccountId,
		);

		await removeTokenCustomFees(th, stableCoinCapabilitiesHTS);
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

function checkFixedFee(
	tokenCustomFees: RequestCustomFee,
	amount: number,
	stableCoinCapabilitiesHTS: StableCoinCapabilities,
	feeCollectorAccountId: HederaId,
) {
	const feeAmount =
		parseFloat((tokenCustomFees as RequestFixedFee).amount) *
		10 ** stableCoinCapabilitiesHTS.coin.decimals;
	expect(feeAmount.toString()).toEqual(amount.toString());
	expect((tokenCustomFees as RequestFixedFee).tokenIdCollected).toEqual(
		stableCoinCapabilitiesHTS.coin.tokenId!.toString(),
	);
	expect(tokenCustomFees.collectorId).toEqual(feeCollectorAccountId.value);
}

function checkFractionalFee(
	tokenCustomFees: RequestCustomFee,
	numerator: number,
	denominator: number,
	feeCollectorAccountId: HederaId,
	net: boolean,
) {
	expect(tokenCustomFees.collectorId).toEqual(feeCollectorAccountId.value);
	expect((tokenCustomFees as RequestFractionalFee).amountNumerator).toEqual(
		numerator,
	);
	expect((tokenCustomFees as RequestFractionalFee).amountDenominator).toEqual(
		denominator,
	);
	expect((tokenCustomFees as RequestFractionalFee).min!).toEqual('0');
	expect((tokenCustomFees as RequestFractionalFee).max!).toEqual('0');
	expect((tokenCustomFees as RequestFractionalFee).net).toEqual(net);
}
