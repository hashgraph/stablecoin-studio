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
import { proto } from '@hashgraph/proto';
import { hashgraph } from '@hashgraph/stablecoin-npm-contracts';

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
key list 3
 */

// 0.0.3728073
/**
 * "key": {
    "_type": "ProtobufEncoded",
    "key": "2a700802126c0a221220cf8c984270cd7cd25e1bd6df1a3a22ee2d1cd53a0f7bbfdf917a8bd881b11b5e0a221220c539f0f94cd937b721f9bd4c0b965164622798cf8ddea6169d2cb734f70baf8e0a2212200e3c05cf1c2a04db21d0e73f0e608d80d7043851154a4d9516e6b0ee929f7f9f"
  },
threshold 2/3
 */

// 0.0.3733080
/**
 * "key": {
    "_type": "ProtobufEncoded",
    "key": "32ce030a722a700802126c0a221220cf8c984270cd7cd25e1bd6df1a3a22ee2d1cd53a0f7bbfdf917a8bd881b11b5e0a221220c539f0f94cd937b721f9bd4c0b965164622798cf8ddea6169d2cb734f70baf8e0a2212200e3c05cf1c2a04db21d0e73f0e608d80d7043851154a4d9516e6b0ee929f7f9f0a6e326c0a221220cf8c984270cd7cd25e1bd6df1a3a22ee2d1cd53a0f7bbfdf917a8bd881b11b5e0a221220c539f0f94cd937b721f9bd4c0b965164622798cf8ddea6169d2cb734f70baf8e0a2212200e3c05cf1c2a04db21d0e73f0e608d80d7043851154a4d9516e6b0ee929f7f9f0ae70132e4010a722a700801126c0a2212205ac253d0505239c0320276d441e8e574bf503093c95341c9e8ee5d0f49b8288e0a22122033f6fefe851ed8d085a9e766186a42b6c76571683ee66079e026a4e74f9460c30a2212200d1e405bf0c14370efc959c3d9fc2420ed543c4b20e54fc9a83ca9bd7a46c4230a6e326c0a2212205ac253d0505239c0320276d441e8e574bf503093c95341c9e8ee5d0f49b8288e0a22122033f6fefe851ed8d085a9e766186a42b6c76571683ee66079e026a4e74f9460c30a2212200d1e405bf0c14370efc959c3d9fc2420ed543c4b20e54fc9a83ca9bd7a46c423"
  }
threshold 2/3
key list 3
combined : threshold 1/3, key list 3
 */

import Injectable from '../../../src/core/Injectable';
import {
	AssociateTokenRequest,
	CashInRequest,
	CreateRequest,
	InitializationRequest,
	Network,
	RequestPublicKey,
	StableCoin,
	StableCoinViewModel,
	SupportedWallets,
	TokenSupplyType,
} from '../../../src';
import { MirrorNode } from '../../../src/domain/context/network/MirrorNode';
import { JsonRpcRelay } from '../../../src/domain/context/network/JsonRpcRelay';
import {
	FACTORY_ADDRESS,
	HEDERA_TOKEN_MANAGER_ADDRESS,
	MIRROR_NODE,
	RPC_NODE,
} from '../../config';
import ConnectRequest from '../../../src/port/in/request/ConnectRequest';
import Hex from '../../../src/core/Hex.js';

const decimals = 6;
const initialSupply = 1000;

describe('🧪 MultiSigTransactionAdapter test', () => {
	let stableCoinHTS: StableCoinViewModel;
	const delay = async (seconds = 5): Promise<void> => {
		seconds = seconds * 1000;
		await new Promise((r) => setTimeout(r, seconds));
	};

	const mirrorNode: MirrorNode = {
		name: MIRROR_NODE.name,
		baseUrl: MIRROR_NODE.baseUrl,
	};

	const rpcNode: JsonRpcRelay = {
		name: RPC_NODE.name,
		baseUrl: RPC_NODE.baseUrl,
	};

	beforeAll(async () => {
		await Network.connect(
			new ConnectRequest({
				account: {
					accountId: '0.0.3728066',
				},
				network: 'testnet',
				wallet: SupportedWallets.MULTISIG,
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
		Injectable.resolveTransactionHandler();

		/*const privateKey = PrivateKey.fromStringECDSA(PRIVATE_KEY);
		const accountId = AccountId.fromString(ACCOUNT_ID);
		const mnemonic = await Mnemonic.fromString(MNEMONIC);
		//const mnemonic = await Mnemonic.generate();

		client = Client.forTestnet().setOperator(accountId, privateKey);

		signerKeys = await Promise.all([
			mnemonic.toStandardEd25519PrivateKey(undefined, 0),
			mnemonic.toStandardEd25519PrivateKey(undefined, 1),
			mnemonic.toStandardEd25519PrivateKey(undefined, 2),
			mnemonic.toStandardEd25519PrivateKey(undefined, 3),
			mnemonic.toStandardEd25519PrivateKey(undefined, 4),
			mnemonic.toStandardEd25519PrivateKey(undefined, 5),
		]);*/
	});

	it('Multisig should associate a token', async () => {
		const result = await StableCoin.associate(
			new AssociateTokenRequest({
				targetId: '0.0.3728066',
				tokenId: '0.0.3735939',
			}),
		);
		expect(result).toBe(true);
	}, 80_000);

	/*it('create key lists', async () => {
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
		const thresholdKey = new KeyList(
			[
				signerKeys[0].publicKey,
				signerKeys[1].publicKey,
				signerKeys[2].publicKey,
			],
			2,
		);

		const newAccountTx = new AccountCreateTransaction().setKey(
			thresholdKey,
		);
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

	it('create multi level key list/threshold', async () => {
		const thresholdKey_1 = new KeyList(
			[
				signerKeys[0].publicKey,
				signerKeys[1].publicKey,
				signerKeys[2].publicKey,
			],
			2,
		);

		const thresholdKey_2 = new KeyList(
			[
				signerKeys[3].publicKey,
				signerKeys[4].publicKey,
				signerKeys[5].publicKey,
			],
			1,
		);

		const keyList_1 = KeyList.of(
			signerKeys[0].publicKey,
			signerKeys[1].publicKey,
			signerKeys[2].publicKey,
		);

		const keyList_2 = KeyList.of(
			signerKeys[3].publicKey,
			signerKeys[4].publicKey,
			signerKeys[5].publicKey,
		);

		const keyCombined = KeyList.of(thresholdKey_2, keyList_2);

		const finalKey = KeyList.of(thresholdKey_1, keyList_1, keyCombined);

		const newAccountTx = new AccountCreateTransaction().setKey(finalKey);
		// Execute the transaction
		const newAccountResponse = await newAccountTx.execute(client);
		// Get receipt
		const newAccountReceipt = await newAccountResponse.getReceipt(client);
		// Get the account ID
		const newAccountId = newAccountReceipt.accountId;

		console.log(newAccountId);
	});

	it('decode protobuf', async () => {
		const protoBufString_keyList =
			'326c0a221220cf8c984270cd7cd25e1bd6df1a3a22ee2d1cd53a0f7bbfdf917a8bd881b11b5e0a221220c539f0f94cd937b721f9bd4c0b965164622798cf8ddea6169d2cb734f70baf8e0a2212200e3c05cf1c2a04db21d0e73f0e608d80d7043851154a4d9516e6b0ee929f7f9f';
		const protoBufString_thresholdKey =
			'2a700802126c0a221220cf8c984270cd7cd25e1bd6df1a3a22ee2d1cd53a0f7bbfdf917a8bd881b11b5e0a221220c539f0f94cd937b721f9bd4c0b965164622798cf8ddea6169d2cb734f70baf8e0a2212200e3c05cf1c2a04db21d0e73f0e608d80d7043851154a4d9516e6b0ee929f7f9f';
		const protoBufString_combinedKey =
			'32ce030a722a700802126c0a221220cf8c984270cd7cd25e1bd6df1a3a22ee2d1cd53a0f7bbfdf917a8bd881b11b5e0a221220c539f0f94cd937b721f9bd4c0b965164622798cf8ddea6169d2cb734f70baf8e0a2212200e3c05cf1c2a04db21d0e73f0e608d80d7043851154a4d9516e6b0ee929f7f9f0a6e326c0a221220cf8c984270cd7cd25e1bd6df1a3a22ee2d1cd53a0f7bbfdf917a8bd881b11b5e0a221220c539f0f94cd937b721f9bd4c0b965164622798cf8ddea6169d2cb734f70baf8e0a2212200e3c05cf1c2a04db21d0e73f0e608d80d7043851154a4d9516e6b0ee929f7f9f0ae70132e4010a722a700801126c0a2212205ac253d0505239c0320276d441e8e574bf503093c95341c9e8ee5d0f49b8288e0a22122033f6fefe851ed8d085a9e766186a42b6c76571683ee66079e026a4e74f9460c30a2212200d1e405bf0c14370efc959c3d9fc2420ed543c4b20e54fc9a83ca9bd7a46c4230a6e326c0a2212205ac253d0505239c0320276d441e8e574bf503093c95341c9e8ee5d0f49b8288e0a22122033f6fefe851ed8d085a9e766186a42b6c76571683ee66079e026a4e74f9460c30a2212200d1e405bf0c14370efc959c3d9fc2420ed543c4b20e54fc9a83ca9bd7a46c423';

		const uint8Array_keyList = Hex.toUint8Array(protoBufString_keyList);
		const uint8Array_thresholdKey = Hex.toUint8Array(
			protoBufString_thresholdKey,
		);
		const uint8Array_combinedKey = Hex.toUint8Array(
			protoBufString_combinedKey,
		);

		const out_keyList = proto.Key.decode(uint8Array_keyList);
		const out_thresholdKey = proto.Key.decode(uint8Array_thresholdKey);
		const out_combinedKey = proto.Key.decode(uint8Array_combinedKey);

		console.log(out_keyList.keyList?.keys);
		console.log('-----------');
		console.log(out_thresholdKey.thresholdKey?.threshold);
		console.log(out_thresholdKey.thresholdKey?.keys);
		console.log(out_thresholdKey.thresholdKey?.keys?.keys);
		
	});*/
});
