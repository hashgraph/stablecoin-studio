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
 * ExternalEVMTransactionAdapter integration test.
 *
 * Implements EVMSigner (gets unsigned EVM bytes → sign with ethers.Wallet →
 * broadcast → verify receipt) and delegates the full test suite to runTestSuite().
 *
 * Required env vars (sdk/.env):
 *   MY_ACCOUNT_ID        – Hedera account ID  (e.g. 0.0.7625517)
 *   MY_PRIVATE_KEY       – ECDSA (0x-prefixed) or ED25519 hex private key
 *   MY_PRIVATE_KEY_ECDSA – ECDSA hex private key used for EVM signing
 *   FACTORY_ADDRESS      – Hedera factory contract ID
 *   RESOLVER_ADDRESS     – Hedera resolver contract ID
 * Optional:
 *   TOKEN_ID             – Reuse an existing token (skips creation)
 */

import { ethers } from 'ethers';
import {
	requireEnv,
	waitMs,
	testResults,
	ExternalSigner,
	printSummary,
	initSdk,
	connectClient,
	connectExternal,
	createStablecoin,
	setupToken,
	runTestSuite,
	TESTNET_RPC_URL,
	SupportedWallets,
} from './testExternalCommon';

// ─── Suppress transient RPC 502 errors from ethers.js polling ────────────────
process.on('unhandledRejection', (reason: unknown) => {
	const msg = String(reason);
	if (
		msg.includes('502') ||
		msg.includes('Bad Gateway') ||
		msg.includes('SERVER_ERROR')
	)
		return;
	console.error('Unhandled rejection:', msg.substring(0, 200));
});

// ─── EVM-specific helpers ─────────────────────────────────────────────────────

function toHexKey(key: string): string {
	return key.startsWith('0x') ? key : '0x' + key;
}

async function withRetry<T>(
	fn: () => Promise<T>,
	retries = 3,
	delayMs = 5000,
): Promise<T> {
	for (let i = 0; i < retries; i++) {
		try {
			return await fn();
		} catch (e: any) {
			const is502 =
				e?.info?.responseStatus?.includes('502') ||
				e?.shortMessage?.includes('502') ||
				String(e).includes('502');
			if (is502 && i < retries - 1) {
				await waitMs(delayMs);
				continue;
			}
			throw e;
		}
	}
	throw new Error('unreachable');
}

// ─── EVMSigner ────────────────────────────────────────────────────────────────

class EVMSigner implements ExternalSigner {
	readonly wallet = SupportedWallets.EXTERNAL_EVM;

	constructor(
		private readonly provider: ethers.JsonRpcProvider,
		private readonly ecdsaPrivateKey: string,
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
			const ethWallet = new ethers.Wallet(
				toHexKey(this.ecdsaPrivateKey),
				this.provider,
			);
			const unsignedTx = ethers.Transaction.from(data.serializedTransaction);

			unsignedTx.nonce = await withRetry(() =>
				this.provider.getTransactionCount(ethWallet.address),
			);
			const feeData = await withRetry(() => this.provider.getFeeData());
			if (unsignedTx.type === 2) {
				unsignedTx.maxFeePerGas = feeData.maxFeePerGas;
				unsignedTx.maxPriorityFeePerGas = feeData.maxPriorityFeePerGas;
			} else {
				unsignedTx.gasPrice = feeData.gasPrice;
			}

			const signedTx = await ethWallet.signTransaction(unsignedTx);
			const txResponse = await withRetry(() =>
				this.provider.broadcastTransaction(signedTx),
			);
			const receipt = await txResponse.wait(1, 60_000);

			if (!receipt) {
				testResults.push({
					name,
					status: 'FAIL',
					detail: `Receipt is null  txHash=${txResponse.hash}`,
				});
				console.log(
					`    ✗ FAIL  Receipt is null  txHash=${txResponse.hash}`,
				);
				return;
			}

			if (receipt.status !== 1) {
				let revertReason = 'Transaction reverted';
				try {
					const tx = await this.provider.getTransaction(txResponse.hash);
					if (tx) await this.provider.call(tx);
				} catch (e: any) {
					if (e.reason) revertReason = e.reason;
					else if (e.message) revertReason = e.message.substring(0, 100);
				}
				testResults.push({
					name,
					status: 'FAIL',
					detail: `status=${receipt.status} – ${revertReason}`,
				});
				console.log(
					`    ✗ FAIL  status=${receipt.status}  gas=${receipt.gasUsed}  txHash=${txResponse.hash}`,
				);
				console.log(`    └─ Reason: ${revertReason}`);
				return;
			}

			testResults.push({ name, status: 'PASS', detail: txResponse.hash });
			console.log(
				`    ✓ PASS  gas=${receipt.gasUsed}  txHash=${txResponse.hash}`,
			);
		} catch (error: any) {
			const errMsg = (error?.message ?? String(error)).substring(0, 300);
			testResults.push({ name, status: 'FAIL', detail: errMsg });
			console.log(`    ✗ FAIL: ${errMsg.substring(0, 150)}`);
		}
	}
}

// ─── Fund proxy contract with HBAR (EVM path) ────────────────────────────────

async function fundProxyWithHBAR(
	proxyAddress: string,
	provider: ethers.JsonRpcProvider,
	ecdsaPrivateKey: string,
	amountInHbar = '0.5',
): Promise<void> {
	console.log(
		'\n[Setup] Funding proxy contract with HBAR for rescueHBAR test...',
	);
	// Convert Hedera contract ID (0.0.X) to padded EVM address
	const parts = proxyAddress.split('.');
	const evmAddress = '0x' + parseInt(parts[2]).toString(16).padStart(40, '0');
	console.log(`  → Proxy ${proxyAddress} → EVM address ${evmAddress}`);

	const ethWallet = new ethers.Wallet(toHexKey(ecdsaPrivateKey), provider);
	const tx = await ethWallet.sendTransaction({
		to: evmAddress,
		value: ethers.parseEther(amountInHbar),
	});
	const receipt = await tx.wait();
	console.log(
		`  ✓ Sent ${amountInHbar} HBAR to proxy  txHash=${receipt?.hash}`,
	);
}

// ─── Main ─────────────────────────────────────────────────────────────────────

const main = async () => {
	const accountId = requireEnv('MY_ACCOUNT_ID');
	const privateKey = requireEnv('MY_PRIVATE_KEY');
	const ecdsaPrivateKey = requireEnv('MY_PRIVATE_KEY_ECDSA');
	const factoryAddress = requireEnv('FACTORY_ADDRESS');
	const resolverAddress = requireEnv('RESOLVER_ADDRESS');

	await initSdk(factoryAddress, resolverAddress);

	// ── Step 1: Connect CLIENT + create/setup token ────────────────────────
	let tokenId = process.env.TOKEN_ID ?? '';
	let reserveAddress = '';
	let proxyAddress = '';

	if (!tokenId) {
		await connectClient(accountId, privateKey);
		console.log('[1] Connected with CLIENT wallet');
		const setup = await createStablecoin(
			accountId,
			'ExternalEVM Test Token',
			'EVMTEST',
		);
		tokenId = setup.tokenId;
		reserveAddress = setup.reserveAddress;
		proxyAddress = setup.proxyAddress;
		await setupToken(tokenId, accountId);

		if (proxyAddress) {
			const tempProvider = new ethers.JsonRpcProvider(TESTNET_RPC_URL);
			await fundProxyWithHBAR(proxyAddress, tempProvider, ecdsaPrivateKey);
		}
	} else {
		console.log(`\n[1] Using existing token: ${tokenId}`);
	}

	// ── Step 2: Switch to EXTERNAL_EVM ────────────────────────────────────
	console.log('\n[2] Connecting with EXTERNAL_EVM wallet...');
	await connectExternal(accountId, SupportedWallets.EXTERNAL_EVM);
	console.log('  ✓ Connected (no private key held by SDK)');

	// ── Step 3: Run the full test suite ───────────────────────────────────
	const provider = new ethers.JsonRpcProvider(TESTNET_RPC_URL);
	const signer = new EVMSigner(provider, ecdsaPrivateKey);
	const ethWallet = new ethers.Wallet(toHexKey(ecdsaPrivateKey), provider);

	console.log(`\n[3] Running tests as EVM address: ${ethWallet.address}`);
	console.log(`    Token:   ${tokenId}`);
	console.log(`    Account: ${accountId}\n`);

	await runTestSuite(signer, {
		accountId,
		privateKeyStr: privateKey,
		tokenId,
		reserveAddress,
		proxyAddress,
		resolverAddress,
	});

	printSummary('EXTERNAL EVM TEST SUMMARY');
	process.exit(0);
};

main().catch((error) => {
	console.error('\n✗ Fatal error:', error);
	printSummary('EXTERNAL EVM TEST SUMMARY');
	process.exit(1);
});
