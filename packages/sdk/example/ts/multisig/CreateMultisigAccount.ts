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

/**
 * DESCRIPTION
 * Creates a multisig account with a 2-of-2 KeyList (ED25519 + ECDSA).
 * The resulting account requires both keys to sign every transaction.
 * The fee payer is the ECDSA account 0.0.1653 (which has funds).
 *
 * HOW TO RUN IT
 * 1- npm run build (inside packages/sdk)
 * 2- npm run execute:createMultisig
 */

import {
	AccountCreateTransaction,
	AccountId,
	Client,
	Hbar,
	KeyList,
	PrivateKey,
} from '@hiero-ledger/sdk';

// ECDSA private key of account 1
const ECDSA_1_PRIVATE_KEY = '';

// ECDSA private key of account 2
const ECDSA_2_PRIVATE_KEY = '';

// Fee payer — single ECDSA account with funds
const FEE_PAYER = {
	id: '',
	privateKey: '',
};

async function createMultisigAccount(): Promise<void> {
	const ecdsaKey1 = PrivateKey.fromStringECDSA(ECDSA_1_PRIVATE_KEY);
	const ecdsaKey2 = PrivateKey.fromStringECDSA(ECDSA_2_PRIVATE_KEY);

	// 2-of-2 KeyList: both ECDSA keys must sign
	const keyList = new KeyList([ecdsaKey1.publicKey, ecdsaKey2.publicKey], 2);

	const client = Client.forTestnet().setOperator(
		AccountId.fromString(FEE_PAYER.id),
		PrivateKey.fromStringECDSA(FEE_PAYER.privateKey),
	);

	const tx = await new AccountCreateTransaction()
		.setKeyWithoutAlias(keyList)
		.setInitialBalance(new Hbar(0))
		.execute(client);

	const receipt = await tx.getReceipt(client);
	const newAccountId = receipt.accountId;

	if (!newAccountId) {
		throw new Error('Error creating multisig account');
	}

	console.log(`Multisig account created: ${newAccountId.toString()}`);
}

createMultisigAccount()
	.then(() => process.exit(0))
	.catch((err) => {
		console.error(err);
		process.exit(1);
	});
