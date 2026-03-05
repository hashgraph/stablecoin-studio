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
 * Shared utilities, SDK setup helpers, and the full test suite for the
 * External Wallet adapter integration tests (EVM and Hedera).
 *
 * Each adapter-specific entry point (testExternalEVM.ts / testExternalHedera.ts)
 * implements the `ExternalSigner` interface and calls `runTestSuite()`.
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
	RescueHBARRequest,
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
	UpdateReserveAmountRequest,
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
	ReserveDataFeed,
	AssociateTokenRequest,
	StableCoinRole,
} from '@hashgraph/stablecoin-npm-sdk';

// Re-export so adapter-specific files can import from one place instead of
// directly depending on @hashgraph/stablecoin-npm-sdk (whose build may lag).
export { SupportedWallets };

require('dotenv').config({ path: __dirname + '/../../.env' });

// ─── Config ───────────────────────────────────────────────────────────────────

export const TESTNET_MIRROR_URL =
	'https://testnet.mirrornode.hedera.com/api/v1/';
export const TESTNET_RPC_URL = 'https://testnet.hashio.io/api';

export const CONFIG_ID =
	'0x0000000000000000000000000000000000000000000000000000000000000002';
export const RESERVE_CONFIG_ID =
	'0x0000000000000000000000000000000000000000000000000000000000000003';

export const mirrorNodeConfig = {
	name: 'Testnet Mirror Node',
	network: 'testnet',
	baseUrl: TESTNET_MIRROR_URL,
	apiKey: '',
	headerName: '',
	selected: true,
};

export const rpcNodeConfig = {
	name: 'HashIO',
	network: 'testnet',
	baseUrl: TESTNET_RPC_URL,
	apiKey: '',
	headerName: '',
	selected: true,
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

export function requireEnv(name: string): string {
	const val = process.env[name];
	if (!val) throw new Error(`Missing required env var: ${name}`);
	return val;
}

export function detectKeyType(key: string): 'ED25519' | 'ECDSA' {
	const hex = key.startsWith('0x') ? key.slice(2) : key;
	return hex.length === 64 ? 'ECDSA' : 'ED25519';
}

export function waitMs(ms: number): Promise<void> {
	return new Promise((resolve) => setTimeout(resolve, ms));
}

// ─── Test result tracking ─────────────────────────────────────────────────────

export interface TestResult {
	name: string;
	status: 'PASS' | 'FAIL' | 'SKIP';
	/** txHash (EVM) or txId (Hedera) on PASS; error message on FAIL */
	detail?: string;
}

export const testResults: TestResult[] = [];

/**
 * Interface each adapter-specific file must implement.
 * `run()` invokes `fn()`, verifies it returns SerializedTransactionData,
 * signs + submits the transaction, and records PASS or FAIL.
 */
export interface ExternalSigner {
	/** The external wallet type – used to reconnect after CLIENT operations. */
	readonly wallet: SupportedWallets;
	run(name: string, fn: () => Promise<any>): Promise<void>;
}

// ─── Summary ─────────────────────────────────────────────────────────────────

export function printSummary(title: string): void {
	const pass = testResults.filter((r) => r.status === 'PASS').length;
	const fail = testResults.filter((r) => r.status === 'FAIL').length;
	const skip = testResults.filter((r) => r.status === 'SKIP').length;

	console.log('\n' + '═'.repeat(80));
	console.log(` ${title}`);
	console.log('═'.repeat(80));
	console.log(` ${'TEST'.padEnd(45)} ${'STATUS'.padEnd(8)} DETAILS`);
	console.log('─'.repeat(80));

	for (const r of testResults) {
		const icon =
			r.status === 'PASS' ? '✓' : r.status === 'SKIP' ? '○' : '✗';
		const details =
			r.status === 'PASS'
				? (r.detail ?? '').substring(0, 30) + '...'
				: r.status === 'SKIP'
				? 'Skipped'
				: (r.detail ?? '').substring(0, 30);
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

// ─── SDK setup helpers ────────────────────────────────────────────────────────

export async function initSdk(
	factoryAddress: string,
	resolverAddress: string,
): Promise<void> {
	console.log('[0] Initializing SDK on testnet...');
	await Network.init(
		new InitializationRequest({
			network: 'testnet',
			mirrorNode: mirrorNodeConfig,
			rpcNode: rpcNodeConfig,
			configuration: { factoryAddress, resolverAddress },
		}),
	);
}

export async function connectClient(
	accountId: string,
	privateKeyStr: string,
): Promise<void> {
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
}

export async function connectExternal(
	accountId: string,
	wallet: SupportedWallets,
): Promise<void> {
	await Network.connect(
		new ConnectRequest({
			account: { accountId },
			network: 'testnet',
			mirrorNode: mirrorNodeConfig,
			rpcNode: rpcNodeConfig,
			wallet,
		}),
	);
}

// ─── Token setup ──────────────────────────────────────────────────────────────

export interface StablecoinSetup {
	tokenId: string;
	reserveAddress: string;
	proxyAddress: string;
}

export async function createStablecoin(
	accountId: string,
	name: string,
	symbol: string,
): Promise<StablecoinSetup> {
	console.log('\n[Setup] Creating stablecoin...');
	const createResult = (await StableCoin.create(
		new CreateRequest({
			name,
			symbol,
			decimals: 2,
			initialSupply: '1000',
			freezeKey: { key: 'null', type: 'null' },
			kycKey: { key: 'null', type: 'null' },
			wipeKey: { key: 'null', type: 'null' },
			pauseKey: { key: 'null', type: 'null' },
			feeScheduleKey: { key: 'null', type: 'null' },
			supplyType: TokenSupplyType.INFINITE,
			createReserve: true,
			reserveInitialAmount: '10000',
			reserveConfigId: RESERVE_CONFIG_ID,
			reserveConfigVersion: 1,
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

	const tokenId =
		(createResult.coin as { tokenId?: string }).tokenId ?? '';
	const reserveAddress =
		(createResult.reserve as { proxyAddress?: string }).proxyAddress ?? '';
	const proxyAddress =
		(createResult.coin as { proxyAddress?: any }).proxyAddress?.toString() ??
		'';

	if (!tokenId) throw new Error('Token creation failed – tokenId missing');
	console.log(`  ✓ Token created: ${tokenId}`);
	if (reserveAddress) console.log(`  ✓ Reserve created: ${reserveAddress}`);
	if (proxyAddress) console.log(`  ✓ Proxy address: ${proxyAddress}`);
	return { tokenId, reserveAddress, proxyAddress };
}

export async function setupToken(
	tokenId: string,
	accountId: string,
): Promise<void> {
	console.log('\n[Setup] Associating token + granting KYC...');
	await StableCoin.associate(
		new AssociateTokenRequest({ targetId: accountId, tokenId }),
	);
	console.log('  ✓ Associated');

	await StableCoin.grantKyc(new KYCRequest({ targetId: accountId, tokenId }));
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

// ─── Test context ─────────────────────────────────────────────────────────────

export interface TestContext {
	accountId: string;
	privateKeyStr: string;
	tokenId: string;
	reserveAddress: string;
	proxyAddress: string;
	resolverAddress: string;
}

// ─── Full test suite ──────────────────────────────────────────────────────────

export async function runTestSuite(
	signer: ExternalSigner,
	ctx: TestContext,
): Promise<void> {
	const { tokenId, accountId, reserveAddress, proxyAddress, resolverAddress } =
		ctx;

	// ── Category 1: Basic token operations ────────────────────────────────

	await signer.run(
		'cashIn (mint 10 to account)',
		() =>
			StableCoin.buildCashIn(
				new CashInRequest({ tokenId, targetId: accountId, amount: '10' }),
			),
	);

	await signer.run(
		'burn (5 from treasury supply)',
		() => StableCoin.buildBurn(new BurnRequest({ tokenId, amount: '5' })),
	);

	await signer.run(
		'wipe (3 from account balance)',
		() =>
			StableCoin.buildWipe(
				new WipeRequest({ tokenId, targetId: accountId, amount: '3' }),
			),
	);

	// ── Associate test ─────────────────────────────────────────────────────
	// The main token is already associated. Create a temp token via CLIENT
	// wallet so we can test the buildAssociate() flow on a fresh token.
	console.log(
		'\n[Associate Test] Creating temporary token for association test...',
	);
	let tempTokenId = '';
	try {
		await connectClient(accountId, ctx.privateKeyStr);
		const tempCreateResult = (await StableCoin.create(
			new CreateRequest({
				name: 'Temp Associate Test',
				symbol: 'TEMPASSOC',
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
		tempTokenId =
			(
				tempCreateResult.coin as {
					tokenId?: { toString(): string } | string;
				}
			).tokenId?.toString() ?? '';
		console.log(`  ✓ Temp token created: ${tempTokenId}`);
		await waitMs(5000);
	} catch (error: any) {
		console.log(
			`  ✗ Failed to create temp token: ${error?.message ?? error}`,
		);
	} finally {
		// Always reconnect to the external wallet regardless of whether the
		// temp token creation succeeded or failed, so subsequent tests run
		// with the correct adapter.
		await connectExternal(accountId, signer.wallet);
	}

	if (tempTokenId) {
		await signer.run(
			'associate',
			() =>
				StableCoin.buildAssociate(
					new AssociateTokenRequest({
						targetId: accountId,
						tokenId: tempTokenId,
					}),
				),
		);
	} else {
		testResults.push({ name: 'associate', status: 'SKIP' });
		console.log('\n  ○ associate → SKIP (temp token creation failed)');
	}

	// transfers() is not implemented in any adapter
	testResults.push({
		name: 'transfers (not implemented in adapters)',
		status: 'SKIP',
	});
	console.log('\n  ○ transfers (not implemented in any adapter) → SKIP');

	// ── Category 2: Compliance ────────────────────────────────────────────

	await signer.run(
		'freeze (freeze account)',
		() =>
			StableCoin.buildFreeze(
				new FreezeAccountRequest({ tokenId, targetId: accountId }),
			),
	);

	await signer.run(
		'unFreeze (unfreeze account)',
		() =>
			StableCoin.buildUnFreeze(
				new FreezeAccountRequest({ tokenId, targetId: accountId }),
			),
	);

	await signer.run(
		'revokeKyc (revoke KYC from account)',
		() =>
			StableCoin.buildRevokeKyc(new KYCRequest({ tokenId, targetId: accountId })),
	);

	// Wait for mirror node to index revokeKyc before granting again.
	// GrantKycCommandHandler checks KYC status on the mirror node.
	console.log('\n  ⏳ Waiting 5s for mirror node to index revokeKyc...');
	await waitMs(5000);

	await signer.run(
		'grantKyc (re-grant KYC to account)',
		() =>
			StableCoin.buildGrantKyc(new KYCRequest({ tokenId, targetId: accountId })),
	);

	await signer.run(
		'pause (pause token)',
		() => StableCoin.buildPause(new PauseRequest({ tokenId })),
	);

	await signer.run(
		'unPause (unpause token)',
		() => StableCoin.buildUnPause(new PauseRequest({ tokenId })),
	);

	// ── Category 3: Token update ───────────────────────────────────────────

	await signer.run(
		'update (rename token)',
		() =>
			StableCoin.buildUpdate(
				new UpdateRequest({
					tokenId,
					name: 'External Updated',
					symbol: 'EXTTEST2',
				}),
			),
	);

	// ── Category 4: Roles ─────────────────────────────────────────────────

	await signer.run(
		'revokeRole (revoke BURN_ROLE)',
		() =>
			Role.buildRevokeRole(
				new RevokeRoleRequest({
					tokenId,
					targetId: accountId,
					role: StableCoinRole.BURN_ROLE,
				}),
			),
	);

	await signer.run(
		'grantRole (grant BURN_ROLE)',
		() =>
			Role.buildGrantRole(
				new GrantRoleRequest({
					tokenId,
					targetId: accountId,
					role: StableCoinRole.BURN_ROLE,
				}),
			),
	);

	await signer.run(
		'revokeMultiRoles (revoke FREEZE_ROLE)',
		() =>
			Role.buildRevokeMultiRoles(
				new RevokeMultiRolesRequest({
					tokenId,
					targetsId: [accountId],
					roles: [StableCoinRole.FREEZE_ROLE],
				}),
			),
	);

	await signer.run(
		'grantMultiRoles (grant FREEZE_ROLE)',
		() =>
			Role.buildGrantMultiRoles(
				new GrantMultiRolesRequest({
					tokenId,
					targetsId: [accountId],
					roles: [StableCoinRole.FREEZE_ROLE],
				}),
			),
	);

	// ── Category 5: Supplier allowance ────────────────────────────────────
	// Must revoke unlimited role first; contract rejects unlimited→limited directly.

	await signer.run(
		'revokeRole CASHIN_ROLE (prep: remove unlimited)',
		() =>
			Role.buildRevokeRole(
				new RevokeRoleRequest({
					tokenId,
					targetId: accountId,
					role: StableCoinRole.CASHIN_ROLE,
				}),
			),
	);

	await signer.run(
		'grantRole CASHIN_ROLE limited (100)',
		() =>
			Role.buildGrantRole(
				new GrantRoleRequest({
					tokenId,
					targetId: accountId,
					role: StableCoinRole.CASHIN_ROLE,
					supplierType: 'limited',
					amount: '100',
				}),
			),
	);

	await signer.run(
		'increaseAllowance (+50)',
		() =>
			Role.buildIncreaseAllowance(
				new IncreaseSupplierAllowanceRequest({
					tokenId,
					targetId: accountId,
					amount: '50',
				}),
			),
	);

	await signer.run(
		'decreaseAllowance (-25)',
		() =>
			Role.buildDecreaseAllowance(
				new DecreaseSupplierAllowanceRequest({
					tokenId,
					targetId: accountId,
					amount: '25',
				}),
			),
	);

	await signer.run(
		'resetAllowance',
		() =>
			Role.buildResetAllowance(
				new ResetSupplierAllowanceRequest({ tokenId, targetId: accountId }),
			),
	);

	await signer.run(
		'grantRole CASHIN_ROLE unlimited (restore)',
		() =>
			Role.buildGrantRole(
				new GrantRoleRequest({
					tokenId,
					targetId: accountId,
					role: StableCoinRole.CASHIN_ROLE,
					supplierType: 'unlimited',
				}),
			),
	);

	// ── Category 6: Custom fees ───────────────────────────────────────────

	await signer.run(
		'addFixedFee (HBAR-denominated, 0.01 HBAR)',
		// tokenIdCollected '0.0.0' → HederaId.NULL → isNull()=true → HBAR fee
		() =>
			Fees.buildAddFixedFee(
				new AddFixedFeeRequest({
					tokenId,
					collectorId: accountId,
					collectorsExempt: true,
					decimals: 2,
					tokenIdCollected: '0.0.0',
					amount: '1',
				}),
			),
	);

	await signer.run(
		'addFractionalFee (1% fee)',
		() =>
			Fees.buildAddFractionalFee(
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
	);

	await signer.run(
		'updateCustomFees (clear all fees)',
		() =>
			Fees.buildUpdateCustomFees(
				new UpdateCustomFeesRequest({ tokenId, customFees: [] }),
			),
	);

	// ── Category 7: Rescue ────────────────────────────────────────────────

	await signer.run(
		'rescue (attempt rescue HTS tokens)',
		() => StableCoin.buildRescue(new RescueRequest({ tokenId, amount: '1' })),
	);

	await signer.run(
		'rescueHBAR (rescue 0.1 HBAR from proxy)',
		() =>
			proxyAddress
				? StableCoin.buildRescueHBAR(
						new RescueHBARRequest({ tokenId, amount: '0.1' }),
					)
				: Promise.reject(
						new Error('No proxy address available for rescueHBAR'),
					),
	);

	// ── Category 8: Reserve operations ───────────────────────────────────
	// buildUpdateReserveAddress('0.0.0') clears the reserve without a mirror node query.

	await signer.run(
		'updateReserveAddress (set to 0.0.0)',
		() =>
			StableCoin.buildUpdateReserveAddress(
				new UpdateReserveAddressRequest({
					tokenId,
					reserveAddress: '0.0.0',
				}),
			),
	);

	await signer.run(
		'updateReserveAmount (set to 1000)',
		() =>
			reserveAddress
				? ReserveDataFeed.buildUpdateReserveAmount(
						new UpdateReserveAmountRequest({
							reserveAddress,
							reserveAmount: '1000',
						}),
					)
				: Promise.reject(
						new Error(
							'No reserve address available for updateReserveAmount',
						),
					),
	);

	// ── Category 9: Hold operations ───────────────────────────────────────

	const expirationDate = Math.floor(Date.now() / 1000 + 3600).toString(); // 1h

	// createHold → releaseHold
	let holdId1 = -1;
	await signer.run(
		'createHold (hold 5 tokens, escrow=self)',
		() =>
			StableCoin.buildCreateHold(
				new CreateHoldRequest({
					tokenId,
					amount: '5',
					escrow: accountId,
					expirationDate,
					targetId: accountId,
				}),
			),
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
		holdId1 = ids.length > 0 ? (ids[ids.length - 1] as number) : -1;
		console.log(`\n    ↳ holdId1=${holdId1}`);
	} catch (_) {
		/* ignore */
	}

	await signer.run(
		`releaseHold (holdId=${holdId1})`,
		() =>
			holdId1 >= 0
				? StableCoin.buildReleaseHold(
						new ReleaseHoldRequest({
							tokenId,
							sourceId: accountId,
							holdId: holdId1,
							amount: '5',
						}),
					)
				: Promise.reject(
						new Error('No holdId – createHold may not be indexed yet'),
					),
	);

	// createHold → executeHold
	let holdId2 = -1;
	await signer.run(
		'createHold (hold 5 tokens for executeHold)',
		() =>
			StableCoin.buildCreateHold(
				new CreateHoldRequest({
					tokenId,
					amount: '5',
					escrow: accountId,
					expirationDate,
					targetId: accountId,
				}),
			),
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

	await signer.run(
		`executeHold (holdId=${holdId2})`,
		() =>
			holdId2 >= 0
				? StableCoin.buildExecuteHold(
						new ExecuteHoldRequest({
							tokenId,
							sourceId: accountId,
							holdId: holdId2,
							amount: '5',
							targetId: accountId,
						}),
					)
				: Promise.reject(new Error('No holdId available')),
	);

	// createHoldByController
	await signer.run(
		'createHoldByController (controller creates hold)',
		() =>
			StableCoin.buildCreateHoldByController(
				new CreateHoldByControllerRequest({
					tokenId,
					amount: '5',
					escrow: accountId,
					expirationDate,
					sourceId: accountId,
					targetId: accountId,
				}),
			),
	);

	// reclaimHold (short expiration +10s)
	const shortExpirationDate = Math.floor(Date.now() / 1000 + 10).toString();
	let reclaimHoldId = -1;

	await signer.run(
		'createHold (short expiration for reclaim test)',
		() =>
			StableCoin.buildCreateHold(
				new CreateHoldRequest({
					tokenId,
					amount: '5',
					escrow: accountId,
					expirationDate: shortExpirationDate,
					targetId: accountId,
				}),
			),
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

	await signer.run(
		`reclaimHold (expired hold, holdId=${reclaimHoldId})`,
		() =>
			reclaimHoldId >= 0
				? StableCoin.buildReclaimHold(
						new ReclaimHoldRequest({
							tokenId,
							sourceId: accountId,
							holdId: reclaimHoldId,
						}),
					)
				: Promise.reject(new Error('No holdId available for reclaim')),
	);

	// ── Category 10: Management ───────────────────────────────────────────

	await signer.run(
		'updateConfig (same configId+version)',
		() =>
			Management.buildUpdateConfig(
				new UpdateConfigRequest({
					tokenId,
					configId: CONFIG_ID,
					configVersion: 1,
				}),
			),
	);

	await signer.run(
		'updateConfigVersion (version=1)',
		() =>
			Management.buildUpdateConfigVersion(
				new UpdateConfigVersionRequest({ tokenId, configVersion: 1 }),
			),
	);

	await signer.run(
		'updateResolver (same resolver)',
		() =>
			Management.buildUpdateResolver(
				new UpdateResolverRequest({
					tokenId,
					configId: CONFIG_ID,
					configVersion: 1,
					resolver: resolverAddress,
				}),
			),
	);

	// ── Category 11: Dangerous – delete last ─────────────────────────────

	await signer.run(
		'delete (permanent – runs last)',
		() => StableCoin.buildDelete(new DeleteRequest({ tokenId })),
	);
}
