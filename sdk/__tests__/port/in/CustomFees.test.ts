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
import {
	Network,
	RequestCustomFee,
	StableCoinCapabilities,
	RequestFixedFee,
	RequestFractionalFee,
	Fees,
	StableCoin,
	AddFixedFeeRequest,
	AddFractionalFeeRequest,
	UpdateCustomFeesRequest,
	AssociateTokenRequest,
	CreateRequest,
	InitializationRequest,
	GetStableCoinDetailsRequest,
} from '../../../src/index';
import ConnectRequest, {
	SupportedWallets,
} from '../../../src/port/in/request/ConnectRequest';
import { TokenSupplyType } from '../../../src/port/in/StableCoin';
import {
	CLIENT_ACCOUNT_ED25519,
	FACTORY_ADDRESS,
	HEDERA_TOKEN_MANAGER_ADDRESS,
} from '../../config';
import Injectable from '../../../src/core/Injectable';
import { HederaId } from '../../../src/domain/context/shared/HederaId';
import StableCoinService from '../../../src/app/service/StableCoinService';
import { MirrorNode } from '../../../src/domain/context/network/MirrorNode.js';
import { JsonRpcRelay } from '../../../src/domain/context/network/JsonRpcRelay.js';

const decimals = 6;
const mirrorNode: MirrorNode = {
	name: 'testmirrorNode',
	baseUrl: 'https://testnet.mirrornode.hedera.com/api/v1/',
};
const rpcNode: JsonRpcRelay = {
	name: 'testrpcNode',
	baseUrl: 'http://127.0.0.1:7546/api',
};

describe('🧪 [ADAPTER] HTSTransactionAdapter with ECDSA accounts', () => {
	// token to operate through HTS
	let stableCoinCapabilitiesHTS: StableCoinCapabilities;
	let stableCoinService: StableCoinService;

	const feeCollectorAccountId = CLIENT_ACCOUNT_ED25519.id;

	const delay = async (seconds = 5): Promise<void> => {
		seconds = seconds * 1000;
		await new Promise((r) => setTimeout(r, seconds));
	};

	beforeAll(async () => {
		await connectAccount(CLIENT_ACCOUNT_ED25519);

		stableCoinService = Injectable.resolve(StableCoinService);

		const req = new CreateRequest({
			name: 'TestCoinAccount',
			symbol: 'TCA',
			decimals: decimals,
			initialSupply: '5.6',
			maxSupply: '1000',
			freezeDefault: false,
			createReserve: false,
			freezeKey: CLIENT_ACCOUNT_ED25519.publicKey,
			wipeKey: CLIENT_ACCOUNT_ED25519.publicKey,
			pauseKey: CLIENT_ACCOUNT_ED25519.publicKey,
			feeScheduleKey: CLIENT_ACCOUNT_ED25519.publicKey,
			supplyType: TokenSupplyType.FINITE,
			stableCoinFactory: FACTORY_ADDRESS,
			hederaTokenManager: HEDERA_TOKEN_MANAGER_ADDRESS,
			burnRoleAccount: CLIENT_ACCOUNT_ED25519.id.toString(),
			rescueRoleAccount: CLIENT_ACCOUNT_ED25519.id.toString(),
			deleteRoleAccount: CLIENT_ACCOUNT_ED25519.id.toString(),
			cashInRoleAccount: CLIENT_ACCOUNT_ED25519.id.toString(),
			cashInRoleAllowance: '0',
		});
		const tr = await StableCoin.create(req);

		const tokenIdHTS = tr.coin.tokenId!;

		await delay();

		stableCoinCapabilitiesHTS = await stableCoinService.getCapabilities(
			CLIENT_ACCOUNT_ED25519,
			tokenIdHTS,
		);
		await StableCoin.associate(
			new AssociateTokenRequest({
				targetId: CLIENT_ACCOUNT_ED25519.id.toString(),
				tokenId: tokenIdHTS.toString(),
			}),
		);

		await delay();
	}, 1500000);

	it('Create a fixed custom fee for an existing stable coin', async () => {
		const CustomFeesNumber = 1;
		const amount = 1;

		const fixedFee = new AddFixedFeeRequest({
			tokenId: stableCoinCapabilitiesHTS.coin.tokenId!.toString(),
			tokenIdCollected:
				stableCoinCapabilitiesHTS.coin.tokenId!.toString(),
			collectorId: feeCollectorAccountId.toString(),
			collectorsExempt: true,
			decimals: stableCoinCapabilitiesHTS.coin.decimals,
			amount: amount.toString(),
		});
		await Fees.addFixedFee(fixedFee);

		await delay();

		const tokenCustomFees: RequestCustomFee[] = await getTokenCustomFees(
			stableCoinCapabilitiesHTS.coin.tokenId!,
		);
		expect(tokenCustomFees.length).toEqual(CustomFeesNumber);
		checkFixedFee(
			tokenCustomFees[0],
			amount * 10 ** decimals,
			stableCoinCapabilitiesHTS,
			feeCollectorAccountId,
		);

		await removeTokenCustomFees(stableCoinCapabilitiesHTS);

		await delay();
	}, 150000);

	it('Create a fractional custom fees for an existing stable coin (num+den)', async () => {
		const CustomFeesNumber = 1;
		const numerator = 1;
		const denominator = 10;
		const net = true;

		const FractionalFee = new AddFractionalFeeRequest({
			tokenId: stableCoinCapabilitiesHTS.coin.tokenId!.toString(),
			collectorId: feeCollectorAccountId.toString(),
			collectorsExempt: true,
			decimals: stableCoinCapabilitiesHTS.coin.decimals,
			percentage: undefined,
			amountNumerator: numerator.toString(),
			amountDenominator: denominator.toString(),
			min: '0',
			max: '0',
			net: net,
		});

		await Fees.addFractionalFee(FractionalFee);

		await delay();

		const tokenCustomFees: RequestCustomFee[] = await getTokenCustomFees(
			stableCoinCapabilitiesHTS.coin.tokenId!,
		);
		expect(tokenCustomFees.length).toEqual(CustomFeesNumber);
		checkFractionalFee(
			tokenCustomFees[0],
			numerator,
			denominator,
			0,
			feeCollectorAccountId,
			net,
			0,
			0,
		);

		await removeTokenCustomFees(stableCoinCapabilitiesHTS);

		await delay();
	}, 150000);

	it('Create a fractional custom fees for an existing stable coin (perc.)', async () => {
		const CustomFeesNumber = 1;
		const percentage = 22;
		const net = true;
		const min = 1;
		const max = 2;

		const FractionalFee = new AddFractionalFeeRequest({
			tokenId: stableCoinCapabilitiesHTS.coin.tokenId!.toString(),
			collectorId: feeCollectorAccountId.toString(),
			collectorsExempt: true,
			decimals: stableCoinCapabilitiesHTS.coin.decimals,
			percentage: percentage.toString(),
			amountNumerator: undefined,
			amountDenominator: undefined,
			min: min.toString(),
			max: max.toString(),
			net: net,
		});

		await Fees.addFractionalFee(FractionalFee);

		await delay();

		const tokenCustomFees: RequestCustomFee[] = await getTokenCustomFees(
			stableCoinCapabilitiesHTS.coin.tokenId!,
		);
		expect(tokenCustomFees.length).toEqual(CustomFeesNumber);
		checkFractionalFee(
			tokenCustomFees[0],
			0,
			0,
			percentage,
			feeCollectorAccountId,
			net,
			min,
			max,
		);

		await removeTokenCustomFees(stableCoinCapabilitiesHTS);

		await delay();
	}, 150000);

	it('Create a fixed and two fractional custom fees, charged to the receiver, for an existing stable coin', async () => {
		const CustomFeesNumber = 3;
		const percentage = 7;
		const numerator = 1;
		const denominator = 10;
		const amount = 1;
		const min = 1;
		const max = 3;
		const net = false;

		const newFixedFee: RequestFixedFee = {
			collectorId: feeCollectorAccountId.toString(),
			collectorsExempt: true,
			decimals: stableCoinCapabilitiesHTS.coin.decimals,
			tokenIdCollected:
				stableCoinCapabilitiesHTS.coin.tokenId!.toString(),
			amount: amount.toString(),
		};

		const newFractionalFee_1: RequestFractionalFee = {
			collectorId: feeCollectorAccountId.toString(),
			collectorsExempt: true,
			decimals: stableCoinCapabilitiesHTS.coin.decimals,
			percentage: percentage.toString(),
			amountNumerator: '',
			amountDenominator: '',
			min: '0',
			max: '0',
			net: net,
		};

		const newFractionalFee_2: RequestFractionalFee = {
			collectorId: feeCollectorAccountId.toString(),
			collectorsExempt: true,
			decimals: stableCoinCapabilitiesHTS.coin.decimals,
			percentage: '',
			amountNumerator: numerator.toString(),
			amountDenominator: denominator.toString(),
			min: min.toString(),
			max: max.toString(),
			net: net,
		};

		const customFees: RequestCustomFee[] = [
			newFixedFee,
			newFractionalFee_1,
			newFractionalFee_2,
		];

		const newFees = new UpdateCustomFeesRequest({
			customFees: customFees,
			tokenId: stableCoinCapabilitiesHTS.coin.tokenId!.toString(),
		});

		await Fees.updateCustomFees(newFees);

		await delay();

		const tokenCustomFees: RequestCustomFee[] = await getTokenCustomFees(
			stableCoinCapabilitiesHTS.coin.tokenId!,
		);
		expect(tokenCustomFees.length).toEqual(CustomFeesNumber);
		let FixedFeeId = 0;
		let FractionalFeeId_1 = 1;
		let FractionalFeeId_2 = 2;

		if ((tokenCustomFees[0] as RequestFractionalFee).amountNumerator) {
			FixedFeeId = 1;
			if ((tokenCustomFees[1] as RequestFractionalFee).amountNumerator) {
				FixedFeeId = 2;
				FractionalFeeId_1 = 1;
				FractionalFeeId_2 = 0;
				if (
					(tokenCustomFees[1] as RequestFractionalFee)
						.amountNumerator == numerator.toString()
				) {
					FractionalFeeId_1 = 0;
					FractionalFeeId_2 = 1;
				}
			}
			FractionalFeeId_1 = 0;
			FractionalFeeId_2 = 2;
			if (
				(tokenCustomFees[0] as RequestFractionalFee).amountNumerator ==
				numerator.toString()
			) {
				FractionalFeeId_1 = 2;
				FractionalFeeId_2 = 0;
			}
		}
		if (
			(tokenCustomFees[1] as RequestFractionalFee).amountNumerator ==
			numerator.toString()
		) {
			FractionalFeeId_1 = 2;
			FractionalFeeId_2 = 1;
		}

		checkFractionalFee(
			tokenCustomFees[FractionalFeeId_1],
			0,
			0,
			percentage,
			feeCollectorAccountId,
			net,
			0,
			0,
		);
		checkFractionalFee(
			tokenCustomFees[FractionalFeeId_2],
			numerator,
			denominator,
			0,
			feeCollectorAccountId,
			net,
			min,
			max,
		);
		checkFixedFee(
			tokenCustomFees[FixedFeeId],
			amount * 10 ** decimals,
			stableCoinCapabilitiesHTS,
			feeCollectorAccountId,
		);

		await removeTokenCustomFees(stableCoinCapabilitiesHTS);

		await delay();
	}, 150000);
});

async function getTokenCustomFees(
	tokenId: HederaId,
): Promise<RequestCustomFee[]> {
	const res = await StableCoin.getInfo(
		new GetStableCoinDetailsRequest({
			id: tokenId.toString(),
		}),
	);

	return res.customFees ?? [];
}

async function removeTokenCustomFees(
	stableCoinCapabilities: StableCoinCapabilities,
): Promise<void> {
	const empty = new UpdateCustomFeesRequest({
		customFees: [],
		tokenId: stableCoinCapabilities.coin.tokenId!.toString(),
	});
	await Fees.updateCustomFees(empty);
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
		}),
	);
}

function checkFixedFee(
	tokenCustomFees: RequestCustomFee,
	amount: number,
	stableCoinCapabilitiesHTS: StableCoinCapabilities,
	feeCollectorAccountId: HederaId,
): void {
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
	percentage: number,
	feeCollectorAccountId: HederaId,
	net: boolean,
	min: number,
	max: number,
): void {
	if (percentage > 0) {
		expect(
			parseInt(
				(tokenCustomFees as RequestFractionalFee).amountNumerator,
			) /
				parseInt(
					(tokenCustomFees as RequestFractionalFee).amountDenominator,
				),
		).toEqual(percentage / 100);
	} else {
		expect(
			(tokenCustomFees as RequestFractionalFee).amountNumerator,
		).toEqual(numerator);
		expect(
			(tokenCustomFees as RequestFractionalFee).amountDenominator,
		).toEqual(denominator);
	}

	expect(tokenCustomFees.collectorId).toEqual(feeCollectorAccountId.value);
	expect((tokenCustomFees as RequestFractionalFee).min!).toEqual(
		min.toString(),
	);
	expect((tokenCustomFees as RequestFractionalFee).max!).toEqual(
		max.toString(),
	);
	expect((tokenCustomFees as RequestFractionalFee).net).toEqual(net);
}
