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
 * ExternalHederaTransactionAdapter integration test.
 *
 * Implements HederaSigner (gets serialized Hedera tx bytes → sign with
 * Hedera SDK PrivateKey → submit via Client → verify receipt SUCCESS)
 * and delegates the full test suite to runTestSuite().
 *
 * Required env vars (sdk/.env):
 *   MY_ACCOUNT_ID    – Hedera account ID  (e.g. 0.0.7625517)
 *   MY_PRIVATE_KEY   – ECDSA (0x-prefixed) or ED25519 hex private key
 *   FACTORY_ADDRESS  – Hedera factory contract ID
 *   RESOLVER_ADDRESS – Hedera resolver contract ID
 * Optional:
 *   TOKEN_ID_HEDERA  – Reuse an existing token (skips creation)
 */

import {
	Transaction,
	TransferTransaction,
	PrivateKey,
	Client,
	AccountId,
	Hbar,
} from '@hiero-ledger/sdk';
import {
	requireEnv,
	detectKeyType,
	testResults,
	ExternalSigner,
	printSummary,
	initSdk,
	connectClient,
	connectExternal,
	createStablecoin,
	setupToken,
	runTestSuite,
	SupportedWallets,
} from './testExternalCommon';

// ─── HederaSigner ─────────────────────────────────────────────────────────────

class HederaSigner implements ExternalSigner {
	readonly wallet = SupportedWallets.EXTERNAL_HEDERA;

	constructor(
		private readonly hederaClient: Client,
		private readonly privateKey: PrivateKey,
	) {}

	async run(name: string, fn: () => Promise<any>): Promise<void> {
		console.log(`\n  ▶ ${name}...`);
		try {
			const result = await fn();

			if (!result || !('serializedTransaction' in result)) {
				testResults.push({
					name,
					status: 'FAIL',
					detail: 'Did not return SerializedTransactionData',
				});
				console.log(`    ✗ FAIL: Did not return SerializedTransactionData`);
				return;
			}

			const data = result as { serializedTransaction: string };
			const bytes = Buffer.from(data.serializedTransaction, 'hex');
			const tx = Transaction.fromBytes(bytes);
			const signedTx = await tx.sign(this.privateKey);
			const txResponse = await signedTx.execute(this.hederaClient);
			const receipt = await txResponse.getReceipt(this.hederaClient);

			const statusStr = receipt.status.toString();
			if (statusStr !== 'SUCCESS') {
				testResults.push({
					name,
					status: 'FAIL',
					detail: `Receipt status: ${statusStr}  txId=${txResponse.transactionId}`,
				});
				console.log(
					`    ✗ FAIL  status=${statusStr}  txId=${txResponse.transactionId}`,
				);
				return;
			}

			testResults.push({
				name,
				status: 'PASS',
				detail: txResponse.transactionId.toString(),
			});
			console.log(`    ✓ PASS  txId=${txResponse.transactionId}`);
		} catch (error: any) {
			const errMsg = (error?.message ?? String(error)).substring(0, 300);
			testResults.push({ name, status: 'FAIL', detail: errMsg });
			console.log(`    ✗ FAIL: ${errMsg.substring(0, 150)}`);
		}
	}
}

// ─── Fund proxy contract with HBAR (Hedera native path) ──────────────────────

async function fundProxyWithHBAR(
	senderAccountId: string,
	proxyAddress: string,
	hederaClient: Client,
	privateKey: PrivateKey,
	amountHbar = 0.5,
): Promise<void> {
	console.log(
		'\n[Setup] Funding proxy contract with HBAR for rescueHBAR test...',
	);
	const transfer = new TransferTransaction()
		.addHbarTransfer(AccountId.fromString(senderAccountId), new Hbar(-amountHbar))
		.addHbarTransfer(AccountId.fromString(proxyAddress), new Hbar(amountHbar));
	const frozenTx = await transfer.freezeWith(hederaClient);
	const signedTx = await frozenTx.sign(privateKey);
	const response = await signedTx.execute(hederaClient);
	const receipt = await response.getReceipt(hederaClient);
	console.log(
		`  ✓ Sent ${amountHbar} HBAR to proxy ${proxyAddress} – status: ${receipt.status}`,
	);
}

// ─── Main ─────────────────────────────────────────────────────────────────────

const main = async () => {
	const accountId = requireEnv('MY_ACCOUNT_ID');
	const privateKeyStr = requireEnv('MY_PRIVATE_KEY');
	const factoryAddress = requireEnv('FACTORY_ADDRESS');
	const resolverAddress = requireEnv('RESOLVER_ADDRESS');

	await initSdk(factoryAddress, resolverAddress);

	// ── Build Hedera client for signing + submission ────────────────────────
	const keyHex = privateKeyStr.startsWith('0x')
		? privateKeyStr.slice(2)
		: privateKeyStr;
	const pk =
		detectKeyType(privateKeyStr) === 'ECDSA'
			? PrivateKey.fromStringECDSA(keyHex)
			: PrivateKey.fromStringED25519(keyHex);
	const hederaClient = Client.forTestnet();
	hederaClient.setOperator(AccountId.fromString(accountId), pk);
	hederaClient.setDefaultMaxTransactionFee(new Hbar(20));

	// ── Step 1: Connect CLIENT + create/setup token ────────────────────────
	let tokenId = process.env.TOKEN_ID_HEDERA ?? '';
	let reserveAddress = '';
	let proxyAddress = '';

	if (!tokenId) {
		await connectClient(accountId, privateKeyStr);
		console.log('[1] Connected with CLIENT wallet');
		const setup = await createStablecoin(
			accountId,
			'ExternalHedera Test Token',
			'HERTEST',
		);
		tokenId = setup.tokenId;
		reserveAddress = setup.reserveAddress;
		proxyAddress = setup.proxyAddress;
		await setupToken(tokenId, accountId);

		if (proxyAddress) {
			await fundProxyWithHBAR(accountId, proxyAddress, hederaClient, pk);
		}
	} else {
		console.log(`\n[1] Using existing token: ${tokenId}`);
	}

	// ── Step 2: Switch to EXTERNAL_HEDERA ─────────────────────────────────
	console.log('\n[2] Connecting with EXTERNAL_HEDERA wallet...');
	await connectExternal(accountId, SupportedWallets.EXTERNAL_HEDERA);
	console.log('  ✓ Connected (no private key held by SDK)');

	// ── Step 3: Run the full test suite ───────────────────────────────────
	const signer = new HederaSigner(hederaClient, pk);

	console.log(`\n[3] Running tests as Hedera account: ${accountId}`);
	console.log(`    Token:    ${tokenId}`);
	console.log(`    Key type: ${detectKeyType(privateKeyStr)}\n`);

	await runTestSuite(signer, {
		accountId,
		privateKeyStr,
		tokenId,
		reserveAddress,
		proxyAddress,
		resolverAddress,
	});

	hederaClient.close();
	printSummary('EXTERNAL HEDERA TEST SUMMARY');
	process.exit(0);
};

main().catch((error) => {
	console.error('\n✗ Fatal error:', error);
	printSummary('EXTERNAL HEDERA TEST SUMMARY');
	process.exit(1);
});
