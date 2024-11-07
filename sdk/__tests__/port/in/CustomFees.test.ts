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

/* eslint-disable jest/no-disabled-tests */
/* eslint-disable jest/expect-expect */
/* eslint-disable @typescript-eslint/no-non-null-assertion */
import Account from '../../../src/domain/context/account/Account.js';
import {
	AddFixedFeeRequest,
	Fees,
	GetStableCoinDetailsRequest,
	InitializationRequest,
	KYCRequest,
	Network,
	RequestCustomFee,
	StableCoin,
	UpdateCustomFeesRequest,
} from '../../../src/index';
import ConnectRequest, {
	SupportedWallets,
} from '../../../src/port/in/request/ConnectRequest.js';
import { HederaId } from '../../../src/index.js';
import {
	CLIENT_ACCOUNT_ED25519,
	CLIENT_PUBLIC_KEY_ED25519,
	DECIMALS,
	FACTORY_ADDRESS,
	MIRROR_NODE,
	RPC_NODE,
} from '../../config.js';
import Injectable from '../../../src/core/Injectable.js';
import StableCoinService from '../../../src/app/service/StableCoinService.js';
import { MirrorNode } from '../../../src/domain/context/network/MirrorNode.js';
import { JsonRpcRelay } from '../../../src/domain/context/network/JsonRpcRelay.js';

const mirrorNode: MirrorNode = {
	name: MIRROR_NODE.name,
	baseUrl: MIRROR_NODE.baseUrl,
};

const rpcNode: JsonRpcRelay = {
	name: RPC_NODE.name,
	baseUrl: RPC_NODE.baseUrl,
};

describe('🧪 [ADAPTER] HTSTransactionAdapter with ECDSA accounts', () => {
	// token to operate through HTS
	const stableCoinCapabilitiesHTS = {
		coin: {
			tokenId: new HederaId('0.0.6666666'),
			decimals: DECIMALS,
		},
	};

	const feeCollectorAccountId = CLIENT_ACCOUNT_ED25519.id;

	beforeAll(async () => {
		await connectAccount(CLIENT_ACCOUNT_ED25519);

		await StableCoin.grantKyc(
			new KYCRequest({
				targetId: CLIENT_ACCOUNT_ED25519.id.toString(),
				tokenId:
					stableCoinCapabilitiesHTS.coin.tokenId?.toString() ??
					'0.0.0',
			}),
		);

		Injectable.resolve(StableCoinService);
	}, 1500000);

	it('Create a fixed custom fee for an existing stablecoin', async () => {
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

		const tokenCustomFees: RequestCustomFee[] = await getTokenCustomFees(
			stableCoinCapabilitiesHTS.coin.tokenId!,
		);
		expect(tokenCustomFees.length).toEqual(CustomFeesNumber);

		await removeTokenCustomFees(
			stableCoinCapabilitiesHTS.coin.tokenId!.toString(),
		);
	}, 150000);

	// it('Create a fractional custom fees for an existing stablecoin (num+den)', async () => {
	// 	const CustomFeesNumber = 1;
	// 	const numerator = 1;
	// 	const denominator = 10;
	// 	const net = true;

	// 	const FractionalFee = new AddFractionalFeeRequest({
	// 		tokenId: stableCoinCapabilitiesHTS.coin.tokenId!.toString(),
	// 		collectorId: feeCollectorAccountId.toString(),
	// 		collectorsExempt: true,
	// 		decimals: stableCoinCapabilitiesHTS.coin.decimals,
	// 		percentage: undefined,
	// 		amountNumerator: numerator.toString(),
	// 		amountDenominator: denominator.toString(),
	// 		min: '0',
	// 		max: '0',
	// 		net: net,
	// 	});

	// 	await Fees.addFractionalFee(FractionalFee);

	// 	const tokenCustomFees: RequestCustomFee[] = await getTokenCustomFees(
	// 		stableCoinCapabilitiesHTS.coin.tokenId!,
	// 	);
	// 	expect(tokenCustomFees.length).toEqual(CustomFeesNumber);

	// 	await removeTokenCustomFees(
	// 		stableCoinCapabilitiesHTS.coin.tokenId!.toString(),
	// 	);
	// }, 150000);

	// it('Create a fractional custom fees for an existing stablecoin (perc.)', async () => {
	// 	const CustomFeesNumber = 1;
	// 	const percentage = 22;
	// 	const net = true;
	// 	const min = 1;
	// 	const max = 2;

	// 	const FractionalFee = new AddFractionalFeeRequest({
	// 		tokenId: stableCoinCapabilitiesHTS.coin.tokenId!.toString(),
	// 		collectorId: feeCollectorAccountId.toString(),
	// 		collectorsExempt: true,
	// 		decimals: stableCoinCapabilitiesHTS.coin.decimals,
	// 		percentage: percentage.toString(),
	// 		amountNumerator: undefined,
	// 		amountDenominator: undefined,
	// 		min: min.toString(),
	// 		max: max.toString(),
	// 		net: net,
	// 	});

	// 	await Fees.addFractionalFee(FractionalFee);

	// 	const tokenCustomFees: RequestCustomFee[] = await getTokenCustomFees(
	// 		stableCoinCapabilitiesHTS.coin.tokenId!,
	// 	);
	// 	expect(tokenCustomFees.length).toEqual(CustomFeesNumber);

	// 	await removeTokenCustomFees(
	// 		stableCoinCapabilitiesHTS.coin.tokenId!.toString(),
	// 	);
	// }, 150000);

	// it('Create a fixed and two fractional custom fees, charged to the receiver, for an existing stablecoin', async () => {
	// 	const CustomFeesNumber = 3;
	// 	const percentage = 7;
	// 	const numerator = 1;
	// 	const denominator = 10;
	// 	const amount = 1;
	// 	const min = 1;
	// 	const max = 3;
	// 	const net = false;

	// 	const newFixedFee: RequestFixedFee = {
	// 		collectorId: feeCollectorAccountId.toString(),
	// 		collectorsExempt: true,
	// 		decimals: stableCoinCapabilitiesHTS.coin.decimals,
	// 		tokenIdCollected:
	// 			stableCoinCapabilitiesHTS.coin.tokenId!.toString(),
	// 		amount: amount.toString(),
	// 	};

	// 	const newFractionalFee_1: RequestFractionalFee = {
	// 		collectorId: feeCollectorAccountId.toString(),
	// 		collectorsExempt: true,
	// 		decimals: stableCoinCapabilitiesHTS.coin.decimals,
	// 		percentage: percentage.toString(),
	// 		amountNumerator: '',
	// 		amountDenominator: '',
	// 		min: '0',
	// 		max: '0',
	// 		net: net,
	// 	};

	// 	const newFractionalFee_2: RequestFractionalFee = {
	// 		collectorId: feeCollectorAccountId.toString(),
	// 		collectorsExempt: true,
	// 		decimals: stableCoinCapabilitiesHTS.coin.decimals,
	// 		percentage: '',
	// 		amountNumerator: numerator.toString(),
	// 		amountDenominator: denominator.toString(),
	// 		min: min.toString(),
	// 		max: max.toString(),
	// 		net: net,
	// 	};

	// 	const customFees: RequestCustomFee[] = [
	// 		newFixedFee,
	// 		newFractionalFee_1,
	// 		newFractionalFee_2,
	// 	];

	// 	const newFees = new UpdateCustomFeesRequest({
	// 		customFees: customFees,
	// 		tokenId: stableCoinCapabilitiesHTS.coin.tokenId!.toString(),
	// 	});

	// 	await Fees.updateCustomFees(newFees);

	// 	const tokenCustomFees: RequestCustomFee[] = await getTokenCustomFees(
	// 		stableCoinCapabilitiesHTS.coin.tokenId!,
	// 	);
	// 	expect(tokenCustomFees.length).toEqual(CustomFeesNumber);

	// 	await removeTokenCustomFees(
	// 		stableCoinCapabilitiesHTS.coin.tokenId!.toString(),
	// 	);
	// }, 150000);
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

async function connectAccount(account: Account): Promise<void> {
	const overrideAccount = {
		...account,
		privateKey: {
			...account.privateKey,
			publicKey: CLIENT_PUBLIC_KEY_ED25519,
		},
		publicKey: CLIENT_PUBLIC_KEY_ED25519
	} as unknown as Account;

	console.error(`PublicKey is ${overrideAccount.privateKey?.publicKey}`)

	await Network.connect(
		new ConnectRequest({
			account: {
				accountId: overrideAccount.id.toString(),
				evmAddress: overrideAccount.evmAddress,
				privateKey: overrideAccount.privateKey,
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

async function removeTokenCustomFees(tokenId: string): Promise<void> {
	const empty = new UpdateCustomFeesRequest({
		customFees: [],
		tokenId: tokenId,
	});
	await Fees.updateCustomFees(empty);
}

/*function checkFixedFee(
	tokenCustomFees: RequestCustomFee,
	amount: number,
	stableCoinCapabilitiesHTS: any,
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
}*/
