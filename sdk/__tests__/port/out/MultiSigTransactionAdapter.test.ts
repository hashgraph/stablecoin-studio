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

import {
	Client,
	AccountId,
	PrivateKey,
	Mnemonic,
	AccountCreateTransaction,
	PublicKey,
	TransactionResponse,
	TransactionReceipt,
	TransferTransaction,
	Transaction,
	TransactionId,
	KeyList,
} from '@hashgraph/sdk';
import { config } from 'dotenv';

const PRIVATE_KEY =
	'3c8055953320b1001b93f6c99518ec0a1daf7210f1bb02dd11c64f3dec96fdb6';
const ACCOUNT_ID = '0.0.1328';
const MNEMONIC =
	'point cactus sand length embark castle bulk process decade acoustic green either ozone tunnel lunar job project corn match topic energy attack ignore please';
let signerKeys: PrivateKey[];
let client: Client;

// 0.0.3728066
/**
 * "key": {
    "_type": "ProtobufEncoded",
    "key": "326c0a221220cf8c984270cd7cd25e1bd6df1a3a22ee2d1cd53a0f7bbfdf917a8bd881b11b5e0a221220c539f0f94cd937b721f9bd4c0b965164622798cf8ddea6169d2cb734f70baf8e0a2212200e3c05cf1c2a04db21d0e73f0e608d80d7043851154a4d9516e6b0ee929f7f9f"
  },
 */

// 0.0.3728073
/**
 * "key": {
    "_type": "ProtobufEncoded",
    "key": "2a700802126c0a221220cf8c984270cd7cd25e1bd6df1a3a22ee2d1cd53a0f7bbfdf917a8bd881b11b5e0a221220c539f0f94cd937b721f9bd4c0b965164622798cf8ddea6169d2cb734f70baf8e0a2212200e3c05cf1c2a04db21d0e73f0e608d80d7043851154a4d9516e6b0ee929f7f9f"
  
 */

describe('🧪 MultiSigTransactionAdapter test', () => {
	beforeAll(async () => {
		const privateKey = PrivateKey.fromStringECDSA(PRIVATE_KEY);
		const accountId = AccountId.fromString(ACCOUNT_ID);
		const mnemonic = await Mnemonic.fromString(MNEMONIC);
		//const mnemonic = await Mnemonic.generate();

		client = Client.forTestnet().setOperator(accountId, privateKey);

		signerKeys = await Promise.all([
			mnemonic.toStandardEd25519PrivateKey(undefined, 0),
			mnemonic.toStandardEd25519PrivateKey(undefined, 1),
			mnemonic.toStandardEd25519PrivateKey(undefined, 2),
		]);
	});

	it('create key lists', async () => {
		const keyList = KeyList.of(
			signerKeys[0].publicKey,
			signerKeys[1].publicKey,
			signerKeys[2].publicKey,
		);

		const newAccountTx = new AccountCreateTransaction().setKey(keyList);
		// Execute the transaction
		const newAccountResponse = await newAccountTx.execute(client);
		// Get receipt
		const newAccountReceipt = await newAccountResponse.getReceipt(client);
		// Get the account ID
		const newAccountId = newAccountReceipt.accountId;

		console.log(newAccountId);

		console.log(signerKeys[0].publicKey._key.toBytes());
		console.log(signerKeys[1].publicKey._key.toBytes());
		console.log(signerKeys[2].publicKey._key.toBytes());
	});

	it('create key threshold', async () => {
		const keyList = new KeyList(
			[
				signerKeys[0].publicKey,
				signerKeys[1].publicKey,
				signerKeys[2].publicKey,
			],
			2,
		);

		const newAccountTx = new AccountCreateTransaction().setKey(keyList);
		// Execute the transaction
		const newAccountResponse = await newAccountTx.execute(client);
		// Get receipt
		const newAccountReceipt = await newAccountResponse.getReceipt(client);
		// Get the account ID
		const newAccountId = newAccountReceipt.accountId;

		console.log(newAccountId);

		console.log(signerKeys[0].publicKey._key.toBytes());
		console.log(signerKeys[1].publicKey._key.toBytes());
		console.log(signerKeys[2].publicKey._key.toBytes());
	});
});
