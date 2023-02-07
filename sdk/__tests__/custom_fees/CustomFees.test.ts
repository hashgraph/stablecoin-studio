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

import Account from '../../src/domain/context/account/Account.js';
import { Network, StableCoinCapabilities } from '../../src/index.js';
import ConnectRequest, {
	SupportedWallets,
} from '../../src/port/in/request/ConnectRequest.js';
import { CustomFee, CustomFixedFee, CustomFractionalFee } from '@hashgraph/sdk';
import { CLIENT_ACCOUNT_ED25519 } from '../config.js';
import { HTSTransactionAdapter } from '../../src/port/out/hs/hts/HTSTransactionAdapter.js';
import Injectable from '../../src/core/Injectable.js';
import { HederaId } from '../../src/domain/context/shared/HederaId.js';
import StableCoinService from '../../src/app/service/StableCoinService.js';
import FeeAssessmentMethod from '@hashgraph/sdk/lib/token/FeeAssessmentMethod.js';

describe('🧪 [ADAPTER] HTSTransactionAdapter with ECDSA accounts', () => {
	// token to operate through HTS
	let stableCoinCapabilitiesHTS: StableCoinCapabilities;
	let stableCoinService: StableCoinService;

	const denominatingTokenId = '0.0.3397146';
	const feeCollectorAccountId: string = CLIENT_ACCOUNT_ED25519.id.toString();

	const tokenId: HederaId = new HederaId('0.0.3397146');

	let th: HTSTransactionAdapter;

	beforeAll(async () => {
		await connectAccount(CLIENT_ACCOUNT_ED25519);
		th = Injectable.resolve(HTSTransactionAdapter);
		stableCoinService = Injectable.resolve(StableCoinService);

		stableCoinCapabilitiesHTS = await stableCoinService.getCapabilities(
			CLIENT_ACCOUNT_ED25519,
			tokenId,
		);
	}, 1500000);

	it('Create a fixed custom fee for an existing stable coin', async () => {
		const customFixedFee: CustomFixedFee = new CustomFixedFee()
			.setAmount(1) // 1 token is transferred to the fee collecting account each time this token is transferred
			.setDenominatingTokenId(denominatingTokenId) // The token to charge the fee in
			.setFeeCollectorAccountId(feeCollectorAccountId);

		const customFee: CustomFee[] = [customFixedFee];
		await th.updateCustomFees(stableCoinCapabilitiesHTS, customFee);
	}, 150000);

	it('Create a fractional custom fee for an existing stable coin', async () => {
		const customFractionalFee: CustomFractionalFee =
			new CustomFractionalFee()
				.setNumerator(1) // The numerator of the fraction
				.setDenominator(10) // The denominator of the fraction
				.setFeeCollectorAccountId(feeCollectorAccountId); // The account collecting the 10% custom fee each time the token is transferred

		const customFee: CustomFee[] = [customFractionalFee];
		await th.updateCustomFees(stableCoinCapabilitiesHTS, customFee);
	}, 150000);

	it('Create a fixed and a fractional custom fee, charged to the receiver, for an existing stable coin', async () => {
		const customFixedFee: CustomFixedFee = new CustomFixedFee()
			.setAmount(1) // 1 token is transferred to the fee collecting account each time this token is transferred
			.setDenominatingTokenId(denominatingTokenId) // The token to charge the fee in
			.setFeeCollectorAccountId(feeCollectorAccountId);

		const customFractionalFee: CustomFractionalFee =
			new CustomFractionalFee()
				.setNumerator(1) // The numerator of the fraction
				.setDenominator(10) // The denominator of the fraction
				.setFeeCollectorAccountId(feeCollectorAccountId); // The account collecting the 10% custom fee each time the token is transferred

		const customFee: CustomFee[] = [customFixedFee, customFractionalFee];
		await th.updateCustomFees(stableCoinCapabilitiesHTS, customFee);
	}, 150000);

	it('Create a fixed and a fractional custom fee, charged to the sender, for an existing stable coin', async () => {
		const customFixedFee: CustomFixedFee = new CustomFixedFee()
			.setAmount(1) // 1 token is transferred to the fee collecting account each time this token is transferred
			.setDenominatingTokenId(denominatingTokenId) // The token to charge the fee in
			.setFeeCollectorAccountId(feeCollectorAccountId);

		const customFractionalFee: CustomFractionalFee =
			new CustomFractionalFee()
				.setNumerator(1) // The numerator of the fraction
				.setDenominator(10) // The denominator of the fraction
				.setAssessmentMethod(new FeeAssessmentMethod(true))
				.setFeeCollectorAccountId(feeCollectorAccountId); // The account collecting the 10% custom fee each time the token is transferred

		const customFee: CustomFee[] = [customFixedFee, customFractionalFee];
		await th.updateCustomFees(stableCoinCapabilitiesHTS, customFee);
	}, 150000);

	it('Clear custom fees for an existing stable coin', async () => {
		const customFee: CustomFee[] = [];
		await th.updateCustomFees(stableCoinCapabilitiesHTS, customFee);
	}, 150000);
});

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
