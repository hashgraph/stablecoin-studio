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
 * Associates token 0.0.7981724 with the multisig account 0.0.8201011.
 * The multisig account has a 2-of-2 KeyList (ED25519 + ECDSA), so both
 * keys must sign the TokenAssociateTransaction.
 * The fee payer is the ECDSA account 0.0.1653 (which has funds).
 *
 * HOW TO RUN IT
 * 1- npm run build (inside packages/sdk)
 * 2- node build/cjs/src/scripts/AssociateToken.js
 *    or: npx ts-node scripts/AssociateToken.ts
 */

import {
	TokenAssociateTransaction,
	TokenId,
	AccountId,
	Client,
	PrivateKey,
} from '@hiero-ledger/sdk';

// Multisig account keys
const ED25519_PRIVATE_KEY = '';
const ECDSA_PRIVATE_KEY   = '';

// The multisig account to associate the token to
const MULTISIG_ACCOUNT_ID = '';

// Token to associate
const TOKEN_ID = '';

// Fee payer — single ECDSA account with funds
const FEE_PAYER = {
	id: '',
	privateKey: ECDSA_PRIVATE_KEY,
};

async function associateToken(): Promise<void> {
	const ed25519Key = PrivateKey.fromStringED25519(ED25519_PRIVATE_KEY);
	const ecdsaKey   = PrivateKey.fromStringECDSA(ECDSA_PRIVATE_KEY);

	const client = Client.forTestnet().setOperator(
		AccountId.fromString(FEE_PAYER.id),
		PrivateKey.fromStringECDSA(FEE_PAYER.privateKey),
	);

	const tx = await new TokenAssociateTransaction()
		.setAccountId(AccountId.fromString(MULTISIG_ACCOUNT_ID))
		.setTokenIds([TokenId.fromString(TOKEN_ID)])
		.freezeWith(client);

	// Both keys of the KeyList must sign
	const signedTx = await (await tx.sign(ed25519Key)).sign(ecdsaKey);

	const response = await signedTx.execute(client);
	const receipt  = await response.getReceipt(client);

	console.log(`Token ${TOKEN_ID} associated with ${MULTISIG_ACCOUNT_ID}`);
	console.log(`Status: ${receipt.status.toString()}`);
}

associateToken()
	.then(() => process.exit(0))
	.catch((err) => {
		console.error(err);
		process.exit(1);
	});
