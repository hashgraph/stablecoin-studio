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
 * This script will deploy a multi-key account with a key list made of 2 keys:
 * - one ED25519 key
 * - one EDCSA key
 *
 * HOW TO RUN IT
 * 1- Fill in the following constants : Multisig_ED25519_privateKey, Multisig_ECDSA_privateKey, deployingAccount
 * 2- Compile the script : npm run build (this command will actually build all the typescript files in the module)
 * 3- Run the compiled script : npm run execute:createMultisig
 * 4- the multisig account id will be displayed in the console.
 */

import {
	AccountCreateTransaction,
	KeyList,
	Client,
	PrivateKey,
	AccountId,
} from '@hashgraph/sdk';

// Hex encoded private key of the ED25519 key that will be added to the multisig account's key
const Multisig_ED25519_privateKey = '';

// Hex encoded private key of the ECDSA key that will be added to the multisig account's key
const Multisig_ECDSA_privateKey = '';

// Account Id and Hex encoded ECDSA private key of the single key account that will be used to deploy the multisig account.
// MAKE SURE this account has funds as it will pay for the account creation fees !!!!!!!!!!!
const deployingAccount = {
	id: '',
	ECDSA_privateKey: '',
};

const delay = async (seconds = 5): Promise<void> => {
	seconds = seconds * 1000;
	await new Promise((r) => setTimeout(r, seconds));
};

async function createMultisigAccount(): Promise<string> {
	const signerKeys = [
		PrivateKey.fromStringED25519(Multisig_ED25519_privateKey),
		PrivateKey.fromStringECDSA(Multisig_ECDSA_privateKey),
	];

	const keyList = KeyList.of(
		signerKeys[0].publicKey,
		signerKeys[1].publicKey,
	);

	const newAccountTx = new AccountCreateTransaction().setKey(keyList);

	const client = Client.forTestnet().setOperator(
		AccountId.fromString(deployingAccount.id),
		PrivateKey.fromStringECDSA(deployingAccount.ECDSA_privateKey),
	);

	const newAccountResponse = await newAccountTx.execute(client);

	await delay();

	const newAccountReceipt = await newAccountResponse.getReceipt(client);
	const newAccountId = newAccountReceipt.accountId;
	if (newAccountId === null) {
		throw new Error('❌ Failed to create account');
	}

	const multisigAccountId = newAccountId.toString();

	return multisigAccountId;
}

// Main
createMultisigAccount()
	.then((events) => {
		console.log(events);
	})
	.catch((error) => {
		console.error(error);
	});
