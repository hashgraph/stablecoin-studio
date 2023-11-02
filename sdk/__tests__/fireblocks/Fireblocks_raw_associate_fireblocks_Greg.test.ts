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

/* eslint-disable jest/no-standalone-expect */

import fs from 'fs';
import path from 'path';
import { createHash } from 'crypto';
import {
	FireblocksSDK,
	PeerType,
	TransactionOperation,
	TransactionStatus,
} from 'fireblocks-sdk';
import {
	Client,
	TokenId,
	AccountId,
	TokenAssociateTransaction,
} from '@hashgraph/sdk';

const apiSecretKey = fs.readFileSync(
	path.resolve('/home/mamorales/fireblocks_dario/fireblocks_secret.key'),
	'utf8',
);
const apiKey = '652415d5-e004-4dfd-9b3b-d93e8fc939d7';
const baseUrl = 'https://api.fireblocks.io';
const vaultAccountId = '2';

const tokenHederaId = '0.0.5759338';
const tokenId = TokenId.fromString(tokenHederaId);

const nodeId = [];
nodeId.push(new AccountId(3));

const fireblocksAaccountId = '0.0.5712904';
const fireblocksPublicKey =
	'04eb152576e3af4dccbabda7026b85d8fdc0ad3f18f26540e42ac71a08e21623';

const client = Client.forTestnet();
client.setOperatorWith(
	fireblocksAaccountId,
	fireblocksPublicKey,
	signingService,
);
client.setMaxNodesPerTransaction(1);

const transaction = new TokenAssociateTransaction()
	.setNodeAccountIds(nodeId)
	.setAccountId(fireblocksAaccountId)
	.setTokenIds([tokenId])
	.freezeWith(client);

const fireblocks: FireblocksSDK = new FireblocksSDK(
	apiSecretKey,
	apiKey,
	baseUrl,
);

describe('🧪 Firebocks signing a Hedera transaction', () => {
	it('Signing a raw transaction', async () => {
		await transaction.execute(client);
	}, 90_000);
});

async function signingService(
	transactionBytes: Uint8Array,
): Promise<Uint8Array> {
	const serializedTransaction = new TextDecoder().decode(transactionBytes);
	const signatureHex = await signArbitraryMessage(
		fireblocks,
		vaultAccountId,
		serializedTransaction,
	);
	console.log(signatureHex);
	return hexStringToUint8Array(signatureHex);
}

function hexStringToUint8Array(hexString: string): Uint8Array {
	const uint8Array = new Uint8Array(hexString.length / 2);

	for (let i = 0; i < hexString.length; i += 2) {
		const byte = parseInt(hexString.substr(i, 2), 16);
		uint8Array[i / 2] = byte;
	}

	return uint8Array;
}

async function signArbitraryMessage(
	fireblocks: FireblocksSDK,
	vaultAccountId: string,
	message: string,
): Promise<string> {
	const hash = createHash('sha256').update(message, 'utf8').digest();
	const content = createHash('sha256').update(hash).digest('hex');

	const { status, id } = await fireblocks.createTransaction({
		operation: TransactionOperation.RAW,
		assetId: 'HBAR_TEST',
		source: {
			type: PeerType.VAULT_ACCOUNT,
			id: vaultAccountId,
		},
		extraParameters: {
			rawMessageData: {
				messages: [
					{
						content,
					},
				],
			},
		},
	});

	let currentStatus = status;
	let txInfo: any;

	while (
		currentStatus != TransactionStatus.COMPLETED &&
		currentStatus != TransactionStatus.FAILED
	) {
		try {
			console.log(
				'keep polling for tx ' + id + '; status: ' + currentStatus,
			);
			txInfo = await fireblocks.getTransactionById(id);
			currentStatus = txInfo.status;
		} catch (err) {
			console.log('err', err);
		}
		await new Promise((r) => setTimeout(r, 1000));
	}

	const signature = txInfo.signedMessages[0].signature;
	console.log('signed message: ' + JSON.stringify(txInfo.signedMessages[0]));
	return signature.fullSig;
}
