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

// Clave privada ED25519 de la cuenta 0.0.1579
const Multisig_ED25519_privateKey = 'e8e993b064ba3d8209a40526513574f043d5af0f900764f35fc92c9a9198deb2';

// Clave privada ECDSA de la cuenta 0.0.1653
const Multisig_ECDSA_privateKey = '3bb707249245cfb5090cfa49d598ad43eee5a266a91585f5cddb063ed525e491';

// Cuenta pagadora (fee payer): debe tener fondos en testnet
const deployingAccount = {
	id: '0.0.1653',
	ECDSA_privateKey: '3bb707249245cfb5090cfa49d598ad43eee5a266a91585f5cddb063ed525e491',
};

async function createMultisigAccount(): Promise<void> {
	const ed25519Key = PrivateKey.fromStringED25519(Multisig_ED25519_privateKey);
	const ecdsaKey   = PrivateKey.fromStringECDSA(Multisig_ECDSA_privateKey);
	const feePayerKey = PrivateKey.fromStringECDSA(deployingAccount.ECDSA_privateKey);

	// 2-of-2 KeyList: both ED25519 and ECDSA must sign
	const keyList = new KeyList([ed25519Key.publicKey, ecdsaKey.publicKey], 2);

	const client = Client.forTestnet().setOperator(
		AccountId.fromString(deployingAccount.id),
		feePayerKey,
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
	console.log(`KeyList: ED25519 (0.0.1579) + ECDSA (0.0.1653), threshold 2-of-2`);
}

createMultisigAccount()
	.then(() => process.exit(0))
	.catch((err) => {
		console.error(err);
		process.exit(1);
	});
