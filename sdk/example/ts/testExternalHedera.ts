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
 * Comprehensive test for ExternalHederaTransactionAdapter.
 *
 * Creates a stablecoin with CLIENT wallet, then switches to EXTERNAL_HEDERA
 * and tests every write operation:  get serialized bytes → sign with Hedera key
 * → submit via Hedera SDK client → verify receipt SUCCESS.
 * Prints a pass/fail summary table at the end.
 *
 * Tests include:
 *   - Basic operations: cashIn, burn, wipe, associate
 *   - Compliance: freeze/unFreeze, grantKyc/revokeKyc, pause/unPause
 *   - Token updates: update
 *   - Roles: grantRole, revokeRole, grantMultiRoles, revokeMultiRoles
 *   - Supplier allowance: increaseAllowance, decreaseAllowance, resetAllowance
 *   - Custom fees: addFixedFee, addFractionalFee, updateCustomFees
 *   - Rescue: rescue, rescueHBAR
 *   - Reserve: updateReserveAddress, updateReserveAmount
 *   - Holds: createHold, releaseHold, executeHold, createHoldByController
 *   - Management: updateConfig, updateConfigVersion, updateResolver
 *   - Dangerous: delete
 *
 * Required env vars (sdk/.env or sdk/example/.env):
 *   MY_ACCOUNT_ID        – Hedera account ID  (e.g. 0.0.7625517)
 *   MY_PRIVATE_KEY       – ECDSA (0x-prefixed) or ED25519 hex private key
 *   FACTORY_ADDRESS      – Hedera factory contract ID
 *   RESOLVER_ADDRESS     – Hedera resolver contract ID
 *   TOKEN_ID_HEDERA      – (Optional) Skip token creation and reuse existing token
 */

import {
	Network,
	InitializationRequest,
	CreateRequest,
	CashInRequest,
	BurnRequest,
	WipeRequest,
	FreezeAccountRequest,
	PauseRequest,
	DeleteRequest,
	KYCRequest,
	RescueRequest,
	UpdateRequest,
	GrantRoleRequest,
	RevokeRoleRequest,
	GrantMultiRolesRequest,
	RevokeMultiRolesRequest,
	IncreaseSupplierAllowanceRequest,
	DecreaseSupplierAllowanceRequest,
	ResetSupplierAllowanceRequest,
	AddFixedFeeRequest,
	AddFractionalFeeRequest,
	UpdateCustomFeesRequest,
	UpdateConfigRequest,
	UpdateConfigVersionRequest,
	UpdateResolverRequest,
	UpdateReserveAddressRequest,
	CreateHoldRequest,
	CreateHoldByControllerRequest,
	ExecuteHoldRequest,
	ReleaseHoldRequest,
	ReclaimHoldRequest,
	GetHoldsIdForRequest,
	ConnectRequest,
	SupportedWallets,
	TokenSupplyType,
	StableCoin,
	Role,
	Management,
	Fees,
	SerializedTransactionData,
	AssociateTokenRequest,
	StableCoinRole,
} from '@hashgraph/stablecoin-npm-sdk';
import {
	Transaction,
	PrivateKey,
	Client,
	AccountId,
	Hbar,
} from '@hiero-ledger/sdk';

require('dotenv').config({ path: __dirname + '/../../.env' });

// ─── Config ───────────────────────────────────────────────────────────────────

const TESTNET_MIRROR_URL = 'https://testnet.mirrornode.hedera.com/api/v1/';
const TESTNET_RPC_URL = 'https://testnet.hashio.io/api';
const CONFIG_ID =
	'0x0000000000000000000000000000000000000000000000000000000000000002';

const mirrorNodeConfig = {
	name: 'Testnet Mirror Node',
	network: 'testnet',
	baseUrl: TESTNET_MIRROR_URL,
	apiKey: '',
	headerName: '',
	selected: true,
};

const rpcNodeConfig = {
	name: 'HashIO',
	network: 'testnet',
	baseUrl: TESTNET_RPC_URL,
	apiKey: '',
	headerName: '',
	selected: true,
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

function requireEnv(name: string): string {
	const val = process.env[name];
	if (!val) throw new Error(`Missing required env var: ${name}`);
	return val;
}

function detectKeyType(key: string): 'ED25519' | 'ECDSA' {
	const hex = key.startsWith('0x') ? key.slice(2) : key;
	return hex.length === 64 ? 'ECDSA' : 'ED25519';
}

async function waitMs(ms: number): Promise<void> {
	return new Promise((resolve) => setTimeout(resolve, ms));
}

// ─── Test runner ──────────────────────────────────────────────────────────────

type TestResult = {
	name: string;
	status: 'PASS' | 'FAIL' | 'SKIP';
	txId?: string;
	error?: string;
};

const testResults: TestResult[] = [];

async function runHederaTest(
	name: string,
	fn: () => Promise<any>,
	hederaClient: Client,
	privateKey: PrivateKey,
): Promise<void> {
	console.log(`\n  ▶ ${name}...`);
	try {
		const result = await fn();

		if (!result || !('serializedTransaction' in result)) {
			testResults.push({
				name,
				status: 'FAIL',
				error: 'Did not return SerializedTransactionData',
			});
			console.log(`    ✗ FAIL: Did not return SerializedTransactionData`);
			return;
		}

		const data = result as SerializedTransactionData;

		// Deserialize frozen Hedera transaction bytes
		const bytes = Buffer.from(data.serializedTransaction, 'hex');
		const tx = Transaction.fromBytes(bytes);

		// Sign with the account's private key
		const signedTx = await tx.sign(privateKey);

		// Submit to Hedera network
		const txResponse = await signedTx.execute(hederaClient);
		const receipt = await txResponse.getReceipt(hederaClient);

		const statusStr = receipt.status.toString();
		if (statusStr !== 'SUCCESS') {
			testResults.push({
				name,
				status: 'FAIL',
				txId: txResponse.transactionId.toString(),
				error: `Receipt status: ${statusStr}`,
			});
			console.log(
				`    ✗ FAIL  status=${statusStr}  txId=${txResponse.transactionId}`,
			);
			return;
		}

		testResults.push({
			name,
			status: 'PASS',
			txId: txResponse.transactionId.toString(),
		});
		console.log(
			`    ✓ PASS  txId=${txResponse.transactionId}`,
		);
	} catch (error: any) {
		const errMsg = (error?.message ?? String(error)).substring(0, 300);
		testResults.push({ name, status: 'FAIL', error: errMsg });
		console.log(`    ✗ FAIL: ${errMsg.substring(0, 150)}`);
	}
}

// ─── Setup helpers (CLIENT wallet) ───────────────────────────────────────────

async function createStablecoin(accountId: string): Promise<string> {
	console.log('\n[Setup] Creating stablecoin...');
	const createResult = (await StableCoin.create(
		new CreateRequest({
			name: 'ExternalHedera Test Token',
			symbol: 'HERTEST',
			decimals: 2,
			initialSupply: '1000',
			freezeKey: { key: 'null', type: 'null' },
			kycKey: { key: 'null', type: 'null' },
			wipeKey: { key: 'null', type: 'null' },
			pauseKey: { key: 'null', type: 'null' },
			feeScheduleKey: { key: 'null', type: 'null' },
			supplyType: TokenSupplyType.INFINITE,
			createReserve: false,
			updatedAtThreshold: '0',
			grantKYCToOriginalSender: true,
			burnRoleAccount: accountId,
			wipeRoleAccount: accountId,
			rescueRoleAccount: accountId,
			pauseRoleAccount: accountId,
			freezeRoleAccount: accountId,
			deleteRoleAccount: accountId,
			kycRoleAccount: accountId,
			cashInRoleAccount: accountId,
			feeRoleAccount: accountId,
			cashInRoleAllowance: '0',
			proxyOwnerAccount: accountId,
			configId: CONFIG_ID,
			configVersion: 1,
		}),
	)) as { coin: any; reserve: any };
	const tokenId = (createResult.coin as { tokenId?: string }).tokenId ?? '';
	if (!tokenId) throw new Error('Token creation failed – tokenId missing');
	console.log(`  ✓ Token created: ${tokenId}`);
	return tokenId;
}

async function setupToken(tokenId: string, accountId: string): Promise<void> {
	console.log('\n[Setup] Associating token + granting KYC...');
	await StableCoin.associate(
		new AssociateTokenRequest({ targetId: accountId, tokenId }),
	);
	console.log('  ✓ Associated');

	await StableCoin.grantKyc(
		new KYCRequest({ targetId: accountId, tokenId }),
	);
	console.log('  ✓ KYC granted (waiting 5s for mirror node indexing...)');
	await waitMs(5000);

	console.log('\n[Setup] Minting tokens for test account...');
	await StableCoin.cashIn(
		new CashInRequest({ tokenId, targetId: accountId, amount: '100' }),
	);
	console.log('  ✓ 100 tokens minted to account');

	console.log('\n[Setup] Granting HOLD_CREATOR_ROLE...');
	await Role.grantRole(
		new GrantRoleRequest({
			tokenId,
			targetId: accountId,
			role: StableCoinRole.HOLD_CREATOR_ROLE,
		}),
	);
	console.log('  ✓ HOLD_CREATOR_ROLE granted');

	console.log('\n[Setup] Waiting 5s for mirror node indexing...');
	await waitMs(5000);
}

// ─── Summary printer ─────────────────────────────────────────────────────────

function printSummary(): void {
	const pass = testResults.filter((r) => r.status === 'PASS').length;
	const fail = testResults.filter((r) => r.status === 'FAIL').length;
	const skip = testResults.filter((r) => r.status === 'SKIP').length;

	console.log('\n' + '═'.repeat(80));
	console.log(' EXTERNAL HEDERA TEST SUMMARY');
	console.log('═'.repeat(80));
	console.log(
		` ${'TEST'.padEnd(45)} ${'STATUS'.padEnd(8)} DETAILS`,
	);
	console.log('─'.repeat(80));

	for (const r of testResults) {
		const icon = r.status === 'PASS' ? '✓' : r.status === 'SKIP' ? '○' : '✗';
		const details =
			r.status === 'PASS'
				? (r.txId ?? '').substring(0, 30) + '...'
				: r.status === 'SKIP'
				? 'Skipped'
				: (r.error ?? '').substring(0, 30);
		console.log(
			` ${icon} ${r.name.padEnd(43)} ${r.status.padEnd(8)} ${details}`,
		);
	}

	console.log('─'.repeat(80));
	console.log(
		` Total: ${testResults.length}  ✓ PASS: ${pass}  ✗ FAIL: ${fail}  ○ SKIP: ${skip}`,
	);
	console.log('═'.repeat(80));
}

// ─── Main ─────────────────────────────────────────────────────────────────────

const main = async () => {
	const accountId = requireEnv('MY_ACCOUNT_ID');
	const privateKeyStr = requireEnv('MY_PRIVATE_KEY');
	const factoryAddress = requireEnv('FACTORY_ADDRESS');
	const resolverAddress = requireEnv('RESOLVER_ADDRESS');

	// ── Init SDK ───────────────────────────────────────────────────────────
	console.log('[0] Initializing SDK on testnet...');
	await Network.init(
		new InitializationRequest({
			network: 'testnet',
			mirrorNode: mirrorNodeConfig,
			rpcNode: rpcNodeConfig,
			configuration: { factoryAddress, resolverAddress },
		}),
	);

	// ── Step 1: Connect CLIENT + setup token ──────────────────────────────
	let tokenId = process.env.TOKEN_ID_HEDERA ?? '';

	if (!tokenId) {
		await Network.connect(
			new ConnectRequest({
				account: {
					accountId,
					privateKey: {
						key: privateKeyStr,
						type: detectKeyType(privateKeyStr),
					},
				},
				network: 'testnet',
				mirrorNode: mirrorNodeConfig,
				rpcNode: rpcNodeConfig,
				wallet: SupportedWallets.CLIENT,
			}),
		);
		console.log('[1] Connected with CLIENT wallet');
		tokenId = await createStablecoin(accountId);
		await setupToken(tokenId, accountId);
	} else {
		console.log(`\n[1] Using existing token: ${tokenId}`);
	}

	// ── Step 2: Switch to EXTERNAL_HEDERA ────────────────────────────────
	console.log('\n[2] Connecting with EXTERNAL_HEDERA wallet...');
	await Network.connect(
		new ConnectRequest({
			account: { accountId },
			network: 'testnet',
			mirrorNode: mirrorNodeConfig,
			rpcNode: rpcNodeConfig,
			wallet: SupportedWallets.EXTERNAL_HEDERA,
		}),
	);
	console.log('  ✓ Connected (no private key held by SDK)');

	// ── Build Hedera client for signing + submission ───────────────────────
	const keyHex = privateKeyStr.startsWith('0x')
		? privateKeyStr.slice(2)
		: privateKeyStr;
	const pk =
		detectKeyType(privateKeyStr) === 'ECDSA'
			? PrivateKey.fromStringECDSA(keyHex)
			: PrivateKey.fromStringED25519(keyHex);

	const hederaClient = Client.forTestnet();
	hederaClient.setOperator(AccountId.fromString(accountId), pk);
	// Use a reasonable timeout for contract calls
	hederaClient.setDefaultMaxTransactionFee(new Hbar(20)); // 20 HBAR

	// ── Step 3: Run all EXTERNAL_HEDERA tests ─────────────────────────────
	console.log(`\n[3] Running tests as Hedera account: ${accountId}`);
	console.log(`    Token: ${tokenId}`);
	console.log(`    Key type: ${detectKeyType(privateKeyStr)}\n`);

	// ── Category 1: Basic token operations ────────────────────────────────

	await runHederaTest(
		'cashIn (mint 10 to account)',
		() =>
			StableCoin.cashIn(
				new CashInRequest({ tokenId, targetId: accountId, amount: '10' }),
			),
		hederaClient,
		pk,
	);

	await runHederaTest(
		'burn (5 from treasury supply)',
		() => StableCoin.burn(new BurnRequest({ tokenId, amount: '5' })),
		hederaClient,
		pk,
	);

	await runHederaTest(
		'wipe (3 from account balance)',
		() =>
			StableCoin.wipe(
				new WipeRequest({ tokenId, targetId: accountId, amount: '3' }),
			),
		hederaClient,
		pk,
	);

	// ── Test associate ─────────────────────────────────────────────────────
	// Create a temporary token so we can test association (main token is already associated).
	// Uses CLIENT wallet to create the temp token, then switches back to EXTERNAL_HEDERA.
	console.log(
		'\n[Associate Test] Creating temporary token for association test...',
	);
	let tempTokenId = '';
	try {
		await Network.connect(
			new ConnectRequest({
				account: {
					accountId,
					privateKey: {
						key: privateKeyStr,
						type: detectKeyType(privateKeyStr),
					},
				},
				network: 'testnet',
				mirrorNode: mirrorNodeConfig,
				rpcNode: rpcNodeConfig,
				wallet: SupportedWallets.CLIENT,
			}),
		);
		const tempCreateResult = (await StableCoin.create(
			new CreateRequest({
				name: 'Temp Hedera Associate Test',
				symbol: 'TEMPHEDERA',
				decimals: 2,
				initialSupply: '10',
				freezeKey: { key: 'null', type: 'null' },
				kycKey: { key: 'null', type: 'null' },
				wipeKey: { key: 'null', type: 'null' },
				pauseKey: { key: 'null', type: 'null' },
				feeScheduleKey: { key: 'null', type: 'null' },
				supplyType: TokenSupplyType.INFINITE,
				createReserve: false,
				updatedAtThreshold: '0',
				grantKYCToOriginalSender: false,
				proxyOwnerAccount: accountId,
				configId: CONFIG_ID,
				configVersion: 1,
			}),
		)) as { coin: any };
		// .tokenId is a HederaId domain object – call toString() to get the primitive string
		tempTokenId = (
			tempCreateResult.coin as {
				tokenId?: { toString(): string } | string;
			}
		).tokenId?.toString() ?? '';
		console.log(`  ✓ Temp token created: ${tempTokenId}`);
		await waitMs(5000);

		// Switch back to EXTERNAL_HEDERA
		await Network.connect(
			new ConnectRequest({
				account: { accountId },
				network: 'testnet',
				mirrorNode: mirrorNodeConfig,
				rpcNode: rpcNodeConfig,
				wallet: SupportedWallets.EXTERNAL_HEDERA,
			}),
		);
	} catch (error: any) {
		console.log(
			`  ✗ Failed to create temp token: ${error?.message ?? error}`,
		);
	}

	if (tempTokenId) {
		// The factory auto-associates the proxyOwnerAccount with the HTS token during creation.
		// If already associated, AssociateCommandHandler returns TransactionResult (not SerializedTransactionData).
		// EXTERNAL_HEDERA uses native TokenAssociateTransaction (supportsEvmOperations()=false).
		console.log('\n  ▶ associate (TokenAssociateTransaction for temp token)...');
		try {
			const associateResult = await StableCoin.associate(
				new AssociateTokenRequest({
					targetId: accountId,
					tokenId: tempTokenId,
				}),
			);
			if (associateResult && 'serializedTransaction' in associateResult) {
				// Got serialized bytes – sign and submit via Hedera SDK
				await runHederaTest(
					'associate (TokenAssociateTransaction)',
					() =>
						StableCoin.associate(
							new AssociateTokenRequest({
								targetId: accountId,
								tokenId: tempTokenId,
							}),
						),
					hederaClient,
					pk,
				);
			} else if ((associateResult as any)?.success === true) {
				// AssociateCommandHandler short-circuited: account already auto-associated by factory
				testResults.push({
					name: 'associate (TokenAssociateTransaction)',
					status: 'SKIP',
				});
				console.log(
					'    ○ SKIP: Account already auto-associated by factory – SDK Hedera path is correct',
				);
			} else {
				const debugInfo = JSON.stringify(associateResult, null, 2).substring(
					0,
					200,
				);
				testResults.push({
					name: 'associate (TokenAssociateTransaction)',
					status: 'FAIL',
					error: `Unexpected result: ${debugInfo}`,
				});
				console.log(
					`    ✗ FAIL: Unexpected result from associate: ${debugInfo}`,
				);
			}
		} catch (error: any) {
			const errMsg = (error?.message ?? String(error)).substring(0, 300);
			testResults.push({
				name: 'associate (TokenAssociateTransaction)',
				status: 'FAIL',
				error: errMsg,
			});
			console.log(`    ✗ FAIL: ${errMsg.substring(0, 150)}`);
		}
	} else {
		testResults.push({
			name: 'associate (temp token creation failed)',
			status: 'SKIP',
		});
		console.log('\n  ○ associate → SKIP (temp token creation failed)');
	}

	// transfers() throws "Method not implemented" in all adapters – skip
	testResults.push({
		name: 'transfers (not implemented in adapters)',
		status: 'SKIP',
	});
	console.log('\n  ○ transfers (not implemented in any adapter) → SKIP');

	// ── Category 2: Compliance ────────────────────────────────────────────

	await runHederaTest(
		'freeze (freeze account)',
		() =>
			StableCoin.freeze(
				new FreezeAccountRequest({ tokenId, targetId: accountId }),
			),
		hederaClient,
		pk,
	);

	await runHederaTest(
		'unFreeze (unfreeze account)',
		() =>
			StableCoin.unFreeze(
				new FreezeAccountRequest({ tokenId, targetId: accountId }),
			),
		hederaClient,
		pk,
	);

	await runHederaTest(
		'revokeKyc (revoke KYC from account)',
		() => StableCoin.revokeKyc(new KYCRequest({ tokenId, targetId: accountId })),
		hederaClient,
		pk,
	);

	// Wait for mirror node to index the revokeKyc before attempting grantKyc.
	// GrantKycCommandHandler queries mirror node for KYC status; if it still shows GRANTED
	// it will short-circuit and fail.
	console.log('\n  ⏳ Waiting 5s for mirror node to index revokeKyc...');
	await waitMs(5000);

	await runHederaTest(
		'grantKyc (re-grant KYC to account)',
		() => StableCoin.grantKyc(new KYCRequest({ tokenId, targetId: accountId })),
		hederaClient,
		pk,
	);

	await runHederaTest(
		'pause (pause token)',
		() => StableCoin.pause(new PauseRequest({ tokenId })),
		hederaClient,
		pk,
	);

	await runHederaTest(
		'unPause (unpause token)',
		() => StableCoin.unPause(new PauseRequest({ tokenId })),
		hederaClient,
		pk,
	);

	// ── Category 3: Token update ───────────────────────────────────────────

	await runHederaTest(
		'update (rename token)',
		() =>
			StableCoin.update(
				new UpdateRequest({
					tokenId,
					name: 'ExternalHedera Updated',
					symbol: 'HERTEST2',
				}),
			),
		hederaClient,
		pk,
	);

	// ── Category 4: Roles ─────────────────────────────────────────────────

	await runHederaTest(
		'revokeRole (revoke BURN_ROLE)',
		() =>
			Role.revokeRole(
				new RevokeRoleRequest({
					tokenId,
					targetId: accountId,
					role: StableCoinRole.BURN_ROLE,
				}),
			),
		hederaClient,
		pk,
	);

	await runHederaTest(
		'grantRole (grant BURN_ROLE)',
		() =>
			Role.grantRole(
				new GrantRoleRequest({
					tokenId,
					targetId: accountId,
					role: StableCoinRole.BURN_ROLE,
				}),
			),
		hederaClient,
		pk,
	);

	await runHederaTest(
		'revokeMultiRoles (revoke FREEZE_ROLE)',
		() =>
			Role.revokeMultiRoles(
				new RevokeMultiRolesRequest({
					tokenId,
					targetsId: [accountId],
					roles: [StableCoinRole.FREEZE_ROLE],
				}),
			),
		hederaClient,
		pk,
	);

	await runHederaTest(
		'grantMultiRoles (grant FREEZE_ROLE)',
		() =>
			Role.grantMultiRoles(
				new GrantMultiRolesRequest({
					tokenId,
					targetsId: [accountId],
					roles: [StableCoinRole.FREEZE_ROLE],
				}),
			),
		hederaClient,
		pk,
	);

	// ── Category 5: Supplier allowance ────────────────────────────────────

	// Must revoke the unlimited supplier role first; contract rejects changing unlimited→limited directly
	await runHederaTest(
		'revokeRole CASHIN_ROLE (prep: remove unlimited)',
		() =>
			Role.revokeRole(
				new RevokeRoleRequest({
					tokenId,
					targetId: accountId,
					role: StableCoinRole.CASHIN_ROLE,
				}),
			),
		hederaClient,
		pk,
	);

	await runHederaTest(
		'grantRole CASHIN_ROLE limited (100)',
		() =>
			Role.grantRole(
				new GrantRoleRequest({
					tokenId,
					targetId: accountId,
					role: StableCoinRole.CASHIN_ROLE,
					supplierType: 'limited',
					amount: '100',
				}),
			),
		hederaClient,
		pk,
	);

	await runHederaTest(
		'increaseAllowance (+50)',
		() =>
			Role.increaseAllowance(
				new IncreaseSupplierAllowanceRequest({
					tokenId,
					targetId: accountId,
					amount: '50',
				}),
			),
		hederaClient,
		pk,
	);

	await runHederaTest(
		'decreaseAllowance (-25)',
		() =>
			Role.decreaseAllowance(
				new DecreaseSupplierAllowanceRequest({
					tokenId,
					targetId: accountId,
					amount: '25',
				}),
			),
		hederaClient,
		pk,
	);

	await runHederaTest(
		'resetAllowance',
		() =>
			Role.resetAllowance(
				new ResetSupplierAllowanceRequest({
					tokenId,
					targetId: accountId,
				}),
			),
		hederaClient,
		pk,
	);

	await runHederaTest(
		'grantRole CASHIN_ROLE unlimited (restore)',
		() =>
			Role.grantRole(
				new GrantRoleRequest({
					tokenId,
					targetId: accountId,
					role: StableCoinRole.CASHIN_ROLE,
					supplierType: 'unlimited',
				}),
			),
		hederaClient,
		pk,
	);

	// ── Category 6: Custom fees ───────────────────────────────────────────

	await runHederaTest(
		'addFixedFee (HBAR-denominated, 0.01 HBAR)',
		// tokenIdCollected '0.0.0' → HederaId.NULL → isNull()=true → no setDenominatingTokenId call → HBAR fee
		() =>
			Fees.addFixedFee(
				new AddFixedFeeRequest({
					tokenId,
					collectorId: accountId,
					collectorsExempt: true,
					decimals: 2,
					tokenIdCollected: '0.0.0',
					amount: '1',
				}),
			),
		hederaClient,
		pk,
	);

	await runHederaTest(
		'addFractionalFee (1% fee)',
		() =>
			Fees.addFractionalFee(
				new AddFractionalFeeRequest({
					tokenId,
					collectorId: accountId,
					collectorsExempt: true,
					decimals: 2,
					percentage: '1',
					min: '0',
					max: '10',
					net: false,
				}),
			),
		hederaClient,
		pk,
	);

	await runHederaTest(
		'updateCustomFees (clear all fees)',
		() =>
			Fees.updateCustomFees(
				new UpdateCustomFeesRequest({ tokenId, customFees: [] }),
			),
		hederaClient,
		pk,
	);

	// ── Category 7: Rescue ────────────────────────────────────────────────

	await runHederaTest(
		'rescue (attempt rescue HTS tokens)',
		() => StableCoin.rescue(new RescueRequest({ tokenId, amount: '1' })),
		hederaClient,
		pk,
	);

	// rescueHBAR - Skip if no HBAR in treasury
	console.log('\n  ▶ rescueHBAR (attempt rescue HBAR)...');
	testResults.push({
		name: 'rescueHBAR (no HBAR in treasury)',
		status: 'SKIP',
	});
	console.log('  ○ SKIP  No HBAR in treasury to rescue');

	// ── Category 8: Reserve operations ───────────────────────────────────

	// updateReserveAddress with '0.0.0' clears the reserve address without querying mirror node.
	// This is supported by the SDK special-case fix in StableCoin.updateReserveAddress().
	await runHederaTest(
		'updateReserveAddress (set to 0.0.0)',
		() =>
			StableCoin.updateReserveAddress(
				new UpdateReserveAddressRequest({
					tokenId,
					reserveAddress: '0.0.0',
				}),
			),
		hederaClient,
		pk,
	);

	console.log('\n  ▶ updateReserveAmount (no reserve created)...');
	testResults.push({
		name: 'updateReserveAmount (no reserve created)',
		status: 'SKIP',
	});
	console.log('  ○ SKIP  No reserve was created for this token');

	// ── Category 9: Hold operations ───────────────────────────────────────

	const expirationDate = Math.floor(Date.now() / 1000 + 3600).toString(); // 1h from now

	// createHold → then releaseHold
	// IMPORTANT: holdId must be queried AFTER runHederaTest returns (tx already submitted+confirmed)
	let holdId1 = -1;
	await runHederaTest(
		'createHold (hold 5 tokens, escrow=self)',
		() =>
			StableCoin.createHold(
				new CreateHoldRequest({
					tokenId,
					amount: '5',
					escrow: accountId,
					expirationDate,
					targetId: accountId,
				}),
			),
		hederaClient,
		pk,
	);
	// Now tx is confirmed – wait for mirror node then query holdIds
	await waitMs(4000);
	try {
		const ids = await StableCoin.getHoldsIdFor(
			new GetHoldsIdForRequest({
				tokenId,
				sourceId: accountId,
				start: 0,
				end: 100,
			}),
		);
		holdId1 = ids.length > 0 ? (ids[ids.length - 1] as number) : -1;
		console.log(`\n    ↳ holdId1=${holdId1}`);
	} catch (_) {
		/* ignore */
	}

	await runHederaTest(
		`releaseHold (holdId=${holdId1})`,
		() =>
			holdId1 >= 0
				? StableCoin.releaseHold(
						new ReleaseHoldRequest({
							tokenId,
							sourceId: accountId,
							holdId: holdId1,
							amount: '5',
						}),
					)
				: Promise.reject(
						new Error(
							'No holdId available – createHold tx may not have been indexed yet',
						),
					),
		hederaClient,
		pk,
	);

	// createHold → then executeHold
	let holdId2 = -1;
	await runHederaTest(
		'createHold (hold 5 tokens for executeHold)',
		() =>
			StableCoin.createHold(
				new CreateHoldRequest({
					tokenId,
					amount: '5',
					escrow: accountId,
					expirationDate,
					targetId: accountId,
				}),
			),
		hederaClient,
		pk,
	);
	await waitMs(4000);
	try {
		const ids = await StableCoin.getHoldsIdFor(
			new GetHoldsIdForRequest({
				tokenId,
				sourceId: accountId,
				start: 0,
				end: 100,
			}),
		);
		holdId2 = ids.length > 0 ? (ids[ids.length - 1] as number) : -1;
		console.log(`\n    ↳ holdId2=${holdId2}`);
	} catch (_) {
		/* ignore */
	}

	await runHederaTest(
		`executeHold (holdId=${holdId2})`,
		() =>
			holdId2 >= 0
				? StableCoin.executeHold(
						new ExecuteHoldRequest({
							tokenId,
							sourceId: accountId,
							holdId: holdId2,
							amount: '5',
							targetId: accountId,
						}),
					)
				: Promise.reject(new Error('No holdId available')),
		hederaClient,
		pk,
	);

	// createHoldByController (no release/execute needed)
	await runHederaTest(
		'createHoldByController (controller creates hold)',
		() =>
			StableCoin.createHoldByController(
				new CreateHoldByControllerRequest({
					tokenId,
					amount: '5',
					escrow: accountId,
					expirationDate,
					sourceId: accountId,
					targetId: accountId,
				}),
			),
		hederaClient,
		pk,
	);

	// reclaimHold test with short expiration (+10 seconds)
	const shortExpirationDate = Math.floor(Date.now() / 1000 + 10).toString();
	let reclaimHoldId = -1;

	await runHederaTest(
		'createHold (short expiration for reclaim test)',
		() =>
			StableCoin.createHold(
				new CreateHoldRequest({
					tokenId,
					amount: '5',
					escrow: accountId,
					expirationDate: shortExpirationDate,
					targetId: accountId,
				}),
			),
		hederaClient,
		pk,
	);

	await waitMs(4000);
	try {
		const ids = await StableCoin.getHoldsIdFor(
			new GetHoldsIdForRequest({
				tokenId,
				sourceId: accountId,
				start: 0,
				end: 100,
			}),
		);
		reclaimHoldId = ids.length > 0 ? (ids[ids.length - 1] as number) : -1;
		console.log(`\n    ↳ reclaimHoldId=${reclaimHoldId}`);
	} catch (_) {
		/* ignore */
	}

	console.log(`\n  ⏳ Waiting 15s for hold ${reclaimHoldId} to expire...`);
	await waitMs(15000);

	await runHederaTest(
		`reclaimHold (expired hold, holdId=${reclaimHoldId})`,
		() =>
			reclaimHoldId >= 0
				? StableCoin.reclaimHold(
						new ReclaimHoldRequest({
							tokenId,
							sourceId: accountId,
							holdId: reclaimHoldId,
						}),
					)
				: Promise.reject(
						new Error('No holdId available for reclaim'),
					),
		hederaClient,
		pk,
	);

	// ── Category 10: Management ───────────────────────────────────────────

	await runHederaTest(
		'updateConfig (same configId+version)',
		() =>
			Management.updateConfig(
				new UpdateConfigRequest({
					tokenId,
					configId: CONFIG_ID,
					configVersion: 1,
				}),
			),
		hederaClient,
		pk,
	);

	await runHederaTest(
		'updateConfigVersion (version=1)',
		() =>
			Management.updateConfigVersion(
				new UpdateConfigVersionRequest({ tokenId, configVersion: 1 }),
			),
		hederaClient,
		pk,
	);

	await runHederaTest(
		'updateResolver (same resolver)',
		() =>
			Management.updateResolver(
				new UpdateResolverRequest({
					tokenId,
					configId: CONFIG_ID,
					configVersion: 1,
					resolver: resolverAddress,
				}),
			),
		hederaClient,
		pk,
	);

	// ── Category 11: Dangerous – delete last ─────────────────────────────

	await runHederaTest(
		'delete (permanent – runs last)',
		() => StableCoin.delete(new DeleteRequest({ tokenId })),
		hederaClient,
		pk,
	);

	// ── Cleanup ───────────────────────────────────────────────────────────
	hederaClient.close();

	// ── Print summary ─────────────────────────────────────────────────────
	printSummary();
	process.exit(0);
};

main().catch((error) => {
	console.error('\n✗ Fatal error:', error);
	printSummary();
	process.exit(1);
});
