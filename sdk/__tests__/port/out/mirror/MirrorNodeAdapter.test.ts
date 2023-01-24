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

import StableCoinList from '../../../../src/port/out/mirror/response/StableCoinListViewModel.js';
import StableCoinDetail from '../../../../src/port/out/mirror/response/StableCoinViewModel.js';
import AccountInfo from '../../../../src/port/out/mirror/response/AccountViewModel.js';
import { MirrorNodeAdapter } from '../../../../src/port/out/mirror/MirrorNodeAdapter.js';
import { HederaId } from '../../../../src/domain/context/shared/HederaId.js';
import {
	HEDERA_ID_ACCOUNT_ECDSA,
	HEDERA_ID_ACCOUNT_ED25519,
	CLIENT_ACCOUNT_ECDSA,
	CLIENT_ACCOUNT_ED25519,
	ENVIRONMENT,
} from '../../../config.js';
import AccountTokenListRelationViewModel from '../../../../src/port/out/mirror/response/AccountTokenListRelationViewModel.js';

describe('🧪 MirrorNodeAdapter', () => {
	const tokenId = HederaId.from('0.0.49117058');
	const proxyEvmAddress = '0000000000000000000000000000000002ed7781';

	let mn: MirrorNodeAdapter;
	beforeAll(async () => {
		mn = new MirrorNodeAdapter();
		mn.setEnvironment(ENVIRONMENT);
	});

	// eslint-disable-next-line jest/no-disabled-tests
	it('Test get stable coins list', async () => {
		const stableCoinList: StableCoinList = await mn.getStableCoinsList(
			HEDERA_ID_ACCOUNT_ED25519,
		);
		expect(stableCoinList.coins.length).toBeGreaterThan(0);
	});

	it('Test get stable coin', async () => {
		// StableCoin.create();
		const stableCoinDetail: StableCoinDetail = await mn.getStableCoin(
			tokenId,
		);
		expect(stableCoinDetail.tokenId).toEqual(tokenId);
		expect(stableCoinDetail.name).toEqual('TEST_ACCELERATOR_HTS');
		expect(stableCoinDetail.symbol).toEqual('TEST');
		expect(stableCoinDetail.decimals).toEqual(6);
		expect(stableCoinDetail.evmProxyAddress?.toString()).toEqual(
			'0x' + proxyEvmAddress,
		);
		expect(stableCoinDetail.autoRenewAccount).toEqual(
			CLIENT_ACCOUNT_ED25519.id,
		);
		expect(stableCoinDetail.autoRenewAccountPeriod).toEqual(90);
		// expect(stableCoinDetail.treasury).toEqual(CLIENT_ACCOUNT_ECDSA.id);
		expect(stableCoinDetail.paused).toEqual(false);
		expect(stableCoinDetail.deleted).toEqual(false);
		expect(stableCoinDetail.adminKey).toEqual(
			CLIENT_ACCOUNT_ED25519.publicKey,
		);
		expect(stableCoinDetail.supplyKey).toEqual(
			CLIENT_ACCOUNT_ED25519.publicKey,
		);
		expect(stableCoinDetail.wipeKey).toEqual(
			CLIENT_ACCOUNT_ED25519.publicKey,
		);
		expect(stableCoinDetail.freezeKey).toEqual(
			CLIENT_ACCOUNT_ED25519.publicKey,
		);
		expect(stableCoinDetail.kycKey).toEqual(undefined);
		expect(stableCoinDetail.pauseKey).toEqual(
			CLIENT_ACCOUNT_ED25519.publicKey,
		);
	}, 150000000);

	it('Test get ed25519 account info', async () => {
		const accountInfo: AccountInfo = await mn.getAccountInfo(
			HEDERA_ID_ACCOUNT_ED25519,
		);
		expect(accountInfo.id).toEqual(HEDERA_ID_ACCOUNT_ED25519.toString());
		// expect(accountInfo.accountEvmAddress).toBeNull();
		expect(accountInfo.publicKey).toEqual(CLIENT_ACCOUNT_ED25519.publicKey);
		// expect(accountInfo.alias).toBeNull();
	});

	it('Test get ecdsa account info', async () => {
		const accountInfo: AccountInfo = await mn.getAccountInfo(
			HEDERA_ID_ACCOUNT_ECDSA,
		);

		expect(accountInfo.id).toEqual(CLIENT_ACCOUNT_ECDSA.id.value);
		expect(accountInfo.accountEvmAddress).toEqual(
			CLIENT_ACCOUNT_ECDSA.evmAddress,
		);

		expect(accountInfo.publicKey?.key).toEqual(
			CLIENT_ACCOUNT_ECDSA.publicKey?.key,
		);
	});

	it('Test get account relationship token', async () => {
		// StableCoin.create();
		const tokenId = HederaId.from('0.0.49171802');
		const accountTokenRelation: AccountTokenListRelationViewModel =
			await mn.getAccountTokens(HEDERA_ID_ACCOUNT_ED25519, tokenId);
		expect(accountTokenRelation.tokens[0].token_id).toStrictEqual(tokenId);
		expect(accountTokenRelation.tokens[0].created_timestamp).not.toBeNull();
		expect(accountTokenRelation.tokens[0].balance).not.toBeNull();
		expect(
			accountTokenRelation.tokens[0].automatic_association,
		).not.toBeNull();
		expect(accountTokenRelation.tokens[0].freeze_status).not.toBeNull();
		expect(accountTokenRelation.tokens[0].kyc_status).not.toBeNull();
	}, 150000000);

	it('Test get account no relationship token', async () => {
		// StableCoin.create();
		const tokenId = HederaId.from('0.0.49207748');
		const accountTokenRelation: AccountTokenListRelationViewModel =
			await mn.getAccountTokens(HEDERA_ID_ACCOUNT_ED25519, tokenId);
		expect(accountTokenRelation.tokens).toStrictEqual([]);
	}, 150000000);
});
