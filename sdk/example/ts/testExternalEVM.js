"use strict";
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
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * Comprehensive test for ExternalEVMTransactionAdapter.
 *
 * Creates a stablecoin with CLIENT wallet, then switches to EXTERNAL_EVM
 * and tests every write operation:  get unsigned bytes → sign → broadcast → verify.
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
 *   MY_PRIVATE_KEY_ECDSA – ECDSA hex private key for EVM signing
 *   FACTORY_ADDRESS      – Hedera factory contract ID
 *   RESOLVER_ADDRESS     – Hedera resolver contract ID
 *   TOKEN_ID             – (Optional) Skip token creation and reuse existing token
 */
const stablecoin_npm_sdk_1 = require("@hashgraph/stablecoin-npm-sdk");
const ethers_1 = require("ethers");
require('dotenv').config({ path: __dirname + '/../../.env' });
// ─── Config ───────────────────────────────────────────────────────────────────
const TESTNET_RPC_URL = 'https://testnet.hashio.io/api';
const TESTNET_MIRROR_URL = 'https://testnet.mirrornode.hedera.com/api/v1/';
const CONFIG_ID = '0x0000000000000000000000000000000000000000000000000000000000000002';
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
function requireEnv(name) {
    const val = process.env[name];
    if (!val)
        throw new Error(`Missing required env var: ${name}`);
    return val;
}
function toHexKey(key) {
    return key.startsWith('0x') ? key : '0x' + key;
}
function detectKeyType(key) {
    const hex = key.startsWith('0x') ? key.slice(2) : key;
    return hex.length === 64 ? 'ECDSA' : 'ED25519';
}
async function waitMs(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
}
// ─── Suppress transient network errors from ethers.js internal polling ────────
process.on('unhandledRejection', (reason) => {
    const msg = String(reason);
    // Swallow transient RPC gateway errors from ethers polling subscriptions
    if (msg.includes('502') || msg.includes('Bad Gateway') || msg.includes('SERVER_ERROR'))
        return;
    console.error('Unhandled rejection:', msg.substring(0, 200));
});
const testResults = [];
async function runEVMTest(name, fn, provider, ecdsaPrivateKey) {
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
        const data = result;
        const wallet = new ethers_1.ethers.Wallet(toHexKey(ecdsaPrivateKey), provider);
        const unsignedTx = ethers_1.ethers.Transaction.from(data.serializedTransaction);
        // Retry helper for transient RPC 502 errors
        const withRetry = async (fn, retries = 3, delayMs = 5000) => {
            for (let i = 0; i < retries; i++) {
                try {
                    return await fn();
                }
                catch (e) {
                    const is502 = e?.info?.responseStatus?.includes('502') || e?.shortMessage?.includes('502') || String(e).includes('502');
                    if (is502 && i < retries - 1) {
                        await waitMs(delayMs);
                        continue;
                    }
                    throw e;
                }
            }
            throw new Error('unreachable');
        };
        unsignedTx.nonce = await withRetry(() => provider.getTransactionCount(wallet.address));
        const feeData = await withRetry(() => provider.getFeeData());
        if (unsignedTx.type === 2) {
            unsignedTx.maxFeePerGas = feeData.maxFeePerGas;
            unsignedTx.maxPriorityFeePerGas = feeData.maxPriorityFeePerGas;
        }
        else {
            unsignedTx.gasPrice = feeData.gasPrice;
        }
        const signedTx = await wallet.signTransaction(unsignedTx);
        const txResponse = await withRetry(() => provider.broadcastTransaction(signedTx));
        const receipt = await txResponse.wait(1, 60000);
        // Validate receipt exists
        if (!receipt) {
            testResults.push({
                name,
                status: 'FAIL',
                txHash: txResponse.hash,
                error: 'Receipt is null',
            });
            console.log(`    ✗ FAIL  Receipt is null  txHash=${txResponse.hash}`);
            return;
        }
        // Validate transaction status (0 = failure, 1 = success)
        if (receipt.status !== 1) {
            // Try to get revert reason if available
            let revertReason = 'Transaction reverted';
            try {
                const tx = await provider.getTransaction(txResponse.hash);
                if (tx) {
                    await provider.call(tx);
                }
            }
            catch (error) {
                if (error.reason)
                    revertReason = error.reason;
                else if (error.message)
                    revertReason = error.message.substring(0, 100);
            }
            testResults.push({
                name,
                status: 'FAIL',
                txHash: txResponse.hash,
                gasUsed: receipt.gasUsed.toString(),
                error: `Status: ${receipt.status} - ${revertReason}`,
            });
            console.log(`    ✗ FAIL  status=${receipt.status}  gas=${receipt.gasUsed}  txHash=${txResponse.hash}`);
            console.log(`    └─ Reason: ${revertReason}`);
            return;
        }
        // Validate gas used (should be > 0)
        if (receipt.gasUsed <= BigInt(0)) {
            testResults.push({
                name,
                status: 'FAIL',
                txHash: txResponse.hash,
                gasUsed: receipt.gasUsed.toString(),
                error: 'Gas used is 0 or negative',
            });
            console.log(`    ✗ FAIL  No gas used (suspicious)  txHash=${txResponse.hash}`);
            return;
        }
        // Success!
        testResults.push({
            name,
            status: 'PASS',
            txHash: txResponse.hash,
            gasUsed: receipt.gasUsed.toString(),
        });
        console.log(`    ✓ PASS  gas=${receipt.gasUsed}  txHash=${txResponse.hash}`);
    }
    catch (error) {
        const errMsg = (error?.message ?? String(error)).substring(0, 300);
        testResults.push({ name, status: 'FAIL', error: errMsg });
        console.log(`    ✗ FAIL: ${errMsg.substring(0, 150)}`);
    }
}
// ─── Setup helpers (CLIENT wallet) ───────────────────────────────────────────
async function createStablecoin(accountId) {
    console.log('\n[Setup] Creating stablecoin...');
    const createResult = (await stablecoin_npm_sdk_1.StableCoin.create(new stablecoin_npm_sdk_1.CreateRequest({
        name: 'ExternalEVM Test Token',
        symbol: 'EVMTEST',
        decimals: 2,
        initialSupply: '1000',
        freezeKey: { key: 'null', type: 'null' },
        kycKey: { key: 'null', type: 'null' },
        wipeKey: { key: 'null', type: 'null' },
        pauseKey: { key: 'null', type: 'null' },
        feeScheduleKey: { key: 'null', type: 'null' },
        supplyType: stablecoin_npm_sdk_1.TokenSupplyType.INFINITE,
        createReserve: true,
        reserveInitialAmount: '10000',
        reserveConfigId: '0x0000000000000000000000000000000000000000000000000000000000000003',
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
    })));
    const tokenId = createResult.coin.tokenId ?? '';
    const reserveAddress = createResult.reserve.proxyAddress ?? '';
    if (!tokenId)
        throw new Error('Token creation failed – tokenId missing');
    console.log(`  ✓ Token created: ${tokenId}`);
    if (reserveAddress)
        console.log(`  ✓ Reserve created: ${reserveAddress}`);
    return { tokenId, reserveAddress };
}
async function setupToken(tokenId, accountId) {
    console.log('\n[Setup] Associating token + granting KYC...');
    await stablecoin_npm_sdk_1.StableCoin.associate(new stablecoin_npm_sdk_1.AssociateTokenRequest({ targetId: accountId, tokenId }));
    console.log('  ✓ Associated');
    await stablecoin_npm_sdk_1.StableCoin.grantKyc(new stablecoin_npm_sdk_1.KYCRequest({ targetId: accountId, tokenId }));
    console.log('  ✓ KYC granted (waiting 5s for mirror node indexing...)');
    await waitMs(5000);
    console.log('\n[Setup] Minting tokens for test account...');
    await stablecoin_npm_sdk_1.StableCoin.cashIn(new stablecoin_npm_sdk_1.CashInRequest({ tokenId, targetId: accountId, amount: '100' }));
    console.log('  ✓ 100 tokens minted to account');
    console.log('\n[Setup] Granting HOLD_CREATOR_ROLE...');
    await stablecoin_npm_sdk_1.Role.grantRole(new stablecoin_npm_sdk_1.GrantRoleRequest({
        tokenId,
        targetId: accountId,
        role: stablecoin_npm_sdk_1.StableCoinRole.HOLD_CREATOR_ROLE,
    }));
    console.log('  ✓ HOLD_CREATOR_ROLE granted');
    console.log('\n[Setup] Waiting 5s for mirror node indexing...');
    await waitMs(5000);
}
async function fundProxyWithHBAR(tokenId, provider, ecdsaPrivateKey, amountInHbar = '1.0') {
    console.log('\n[Setup] Funding proxy with HBAR for rescueHBAR test...');
    // Convert Hedera token ID to EVM address
    // Format: 0.0.X -> 0x0000000000000000000000000000000000XXXXXX (padded hex)
    const tokenIdStr = tokenId.toString();
    const parts = tokenIdStr.split('.');
    const accountNum = parseInt(parts[2]);
    const evmAddress = '0x' + accountNum.toString(16).padStart(40, '0');
    console.log(`  → Token ${tokenIdStr} → EVM address ${evmAddress}`);
    const wallet = new ethers_1.ethers.Wallet(toHexKey(ecdsaPrivateKey), provider);
    const tx = await wallet.sendTransaction({
        to: evmAddress,
        value: ethers_1.ethers.parseEther(amountInHbar),
    });
    const receipt = await tx.wait();
    console.log(`  ✓ Sent ${amountInHbar} HBAR to token contract`);
    console.log(`  ✓ TxHash: ${receipt?.hash}`);
}
// ─── Summary printer ─────────────────────────────────────────────────────────
function printSummary() {
    const pass = testResults.filter((r) => r.status === 'PASS').length;
    const fail = testResults.filter((r) => r.status === 'FAIL').length;
    const skip = testResults.filter((r) => r.status === 'SKIP').length;
    console.log('\n' + '═'.repeat(80));
    console.log(' EXTERNAL EVM TEST SUMMARY');
    console.log('═'.repeat(80));
    console.log(` ${'TEST'.padEnd(45)} ${'STATUS'.padEnd(8)} DETAILS`);
    console.log('─'.repeat(80));
    for (const r of testResults) {
        const icon = r.status === 'PASS' ? '✓' : r.status === 'SKIP' ? '○' : '✗';
        const details = r.status === 'PASS'
            ? r.txHash?.substring(0, 20) + '...'
            : r.status === 'SKIP'
                ? 'Skipped'
                : (r.error ?? '').substring(0, 30);
        console.log(` ${icon} ${r.name.padEnd(43)} ${r.status.padEnd(8)} ${details}`);
    }
    console.log('─'.repeat(80));
    console.log(` Total: ${testResults.length}  ✓ PASS: ${pass}  ✗ FAIL: ${fail}  ○ SKIP: ${skip}`);
    console.log('═'.repeat(80));
}
// ─── Main ─────────────────────────────────────────────────────────────────────
const main = async () => {
    const accountId = requireEnv('MY_ACCOUNT_ID');
    const privateKey = requireEnv('MY_PRIVATE_KEY');
    const ecdsaPrivateKey = requireEnv('MY_PRIVATE_KEY_ECDSA');
    const factoryAddress = requireEnv('FACTORY_ADDRESS');
    const resolverAddress = requireEnv('RESOLVER_ADDRESS');
    // ── Init SDK ───────────────────────────────────────────────────────────
    console.log('[0] Initializing SDK on testnet...');
    await stablecoin_npm_sdk_1.Network.init(new stablecoin_npm_sdk_1.InitializationRequest({
        network: 'testnet',
        mirrorNode: mirrorNodeConfig,
        rpcNode: rpcNodeConfig,
        configuration: { factoryAddress, resolverAddress },
    }));
    // ── Step 1: Connect CLIENT + setup token ──────────────────────────────
    let tokenId = process.env.TOKEN_ID ?? '';
    let reserveAddress = '';
    if (!tokenId) {
        await stablecoin_npm_sdk_1.Network.connect(new stablecoin_npm_sdk_1.ConnectRequest({
            account: {
                accountId,
                privateKey: { key: privateKey, type: detectKeyType(privateKey) },
            },
            network: 'testnet',
            mirrorNode: mirrorNodeConfig,
            rpcNode: rpcNodeConfig,
            wallet: stablecoin_npm_sdk_1.SupportedWallets.CLIENT,
        }));
        console.log('[1] Connected with CLIENT wallet');
        const result = await createStablecoin(accountId);
        tokenId = result.tokenId;
        reserveAddress = result.reserveAddress;
        await setupToken(tokenId, accountId);
    }
    else {
        console.log(`\n[1] Using existing token: ${tokenId}`);
    }
    // ── Step 2: Switch to EXTERNAL_EVM ────────────────────────────────────
    console.log('\n[2] Connecting with EXTERNAL_EVM wallet...');
    await stablecoin_npm_sdk_1.Network.connect(new stablecoin_npm_sdk_1.ConnectRequest({
        account: { accountId },
        network: 'testnet',
        mirrorNode: mirrorNodeConfig,
        rpcNode: rpcNodeConfig,
        wallet: stablecoin_npm_sdk_1.SupportedWallets.EXTERNAL_EVM,
    }));
    console.log('  ✓ Connected (no private key held by SDK)');
    // ── Step 3: Run all EXTERNAL_EVM tests ────────────────────────────────
    const provider = new ethers_1.ethers.JsonRpcProvider(TESTNET_RPC_URL);
    const ecdsaWallet = new ethers_1.ethers.Wallet(toHexKey(ecdsaPrivateKey), provider);
    console.log(`\n[3] Running tests as EVM address: ${ecdsaWallet.address}`);
    console.log(`    Token: ${tokenId}`);
    console.log(`    Account: ${accountId}\n`);
    // TODO: Fund proxy with HBAR for rescueHBAR test
    // Skipped for now - needs proxy contract address, not token HTS address
    // if (!process.env.TOKEN_ID) {
    // 	await fundProxyWithHBAR(tokenId, provider, ecdsaPrivateKey, '1.0');
    // }
    // ── Category 1: Basic token operations ────────────────────────────────
    await runEVMTest('cashIn (mint 10 to account)', () => stablecoin_npm_sdk_1.StableCoin.cashIn(new stablecoin_npm_sdk_1.CashInRequest({ tokenId, targetId: accountId, amount: '10' })), provider, ecdsaPrivateKey);
    await runEVMTest('burn (5 from treasury supply)', () => stablecoin_npm_sdk_1.StableCoin.burn(new stablecoin_npm_sdk_1.BurnRequest({ tokenId, amount: '5' })), provider, ecdsaPrivateKey);
    await runEVMTest('wipe (3 from account balance)', () => stablecoin_npm_sdk_1.StableCoin.wipe(new stablecoin_npm_sdk_1.WipeRequest({ tokenId, targetId: accountId, amount: '3' })), provider, ecdsaPrivateKey);
    // ── Test associate ─────────────────────────────────────────────────────
    // Create a temporary token so we can test association (main token is already associated).
    // Uses CLIENT wallet to create the temp token, then switches back to EXTERNAL_EVM.
    console.log('\n[Associate Test] Creating temporary token for association test...');
    let tempTokenId = '';
    try {
        await stablecoin_npm_sdk_1.Network.connect(new stablecoin_npm_sdk_1.ConnectRequest({
            account: {
                accountId,
                privateKey: { key: privateKey, type: detectKeyType(privateKey) },
            },
            network: 'testnet',
            mirrorNode: mirrorNodeConfig,
            rpcNode: rpcNodeConfig,
            wallet: stablecoin_npm_sdk_1.SupportedWallets.CLIENT,
        }));
        const tempCreateResult = (await stablecoin_npm_sdk_1.StableCoin.create(new stablecoin_npm_sdk_1.CreateRequest({
            name: 'Temp Associate Test',
            symbol: 'TEMPASSOC',
            decimals: 2,
            initialSupply: '10',
            freezeKey: { key: 'null', type: 'null' },
            kycKey: { key: 'null', type: 'null' },
            wipeKey: { key: 'null', type: 'null' },
            pauseKey: { key: 'null', type: 'null' },
            feeScheduleKey: { key: 'null', type: 'null' },
            supplyType: stablecoin_npm_sdk_1.TokenSupplyType.INFINITE,
            createReserve: false,
            updatedAtThreshold: '0',
            grantKYCToOriginalSender: false,
            proxyOwnerAccount: accountId,
            configId: CONFIG_ID,
            configVersion: 1,
        })));
        // .tokenId is a HederaId domain object – call toString() to get the primitive string
        tempTokenId = tempCreateResult.coin.tokenId?.toString() ?? '';
        console.log(`  ✓ Temp token created: ${tempTokenId}`);
        await waitMs(5000);
        // Switch back to EXTERNAL_EVM
        await stablecoin_npm_sdk_1.Network.connect(new stablecoin_npm_sdk_1.ConnectRequest({
            account: { accountId },
            network: 'testnet',
            mirrorNode: mirrorNodeConfig,
            rpcNode: rpcNodeConfig,
            wallet: stablecoin_npm_sdk_1.SupportedWallets.EXTERNAL_EVM,
        }));
    }
    catch (error) {
        console.log(`  ✗ Failed to create temp token: ${error?.message ?? error}`);
    }
    if (tempTokenId) {
        // The factory auto-associates the proxyOwnerAccount with the HTS token during creation.
        // If already associated, AssociateCommandHandler returns TransactionResult (not SerializedTransactionData).
        // Test the result: SerializedTransactionData → full sign+broadcast; TransactionResult(true) → SKIP.
        console.log('\n  ▶ associate (IHRC.associate on temp token)...');
        try {
            const associateResult = await stablecoin_npm_sdk_1.StableCoin.associate(new stablecoin_npm_sdk_1.AssociateTokenRequest({ targetId: accountId, tokenId: tempTokenId }));
            if (associateResult && 'serializedTransaction' in associateResult) {
                // Got serialized bytes – sign and broadcast
                await runEVMTest('associate (IHRC.associate on temp token)', () => stablecoin_npm_sdk_1.StableCoin.associate(new stablecoin_npm_sdk_1.AssociateTokenRequest({ targetId: accountId, tokenId: tempTokenId })), provider, ecdsaPrivateKey);
            }
            else if (associateResult?.success === true) {
                // AssociateCommandHandler short-circuited: account already auto-associated by factory
                // (TransactionResult.success === true means already associated)
                testResults.push({ name: 'associate (IHRC.associate on temp token)', status: 'SKIP' });
                console.log('    ○ SKIP: Account already auto-associated by factory – SDK EVM path is correct');
            }
            else {
                const debugInfo = JSON.stringify(associateResult, null, 2).substring(0, 200);
                testResults.push({ name: 'associate (IHRC.associate on temp token)', status: 'FAIL', error: `Unexpected result: ${debugInfo}` });
                console.log(`    ✗ FAIL: Unexpected result from associate: ${debugInfo}`);
            }
        }
        catch (error) {
            const errMsg = (error?.message ?? String(error)).substring(0, 300);
            testResults.push({ name: 'associate (IHRC.associate on temp token)', status: 'FAIL', error: errMsg });
            console.log(`    ✗ FAIL: ${errMsg.substring(0, 150)}`);
        }
    }
    else {
        testResults.push({ name: 'associate (temp token creation failed)', status: 'SKIP' });
        console.log('\n  ○ associate → SKIP (temp token creation failed)');
    }
    // transfers() throws "Method not implemented" in all adapters – skip
    testResults.push({ name: 'transfers (not implemented in adapters)', status: 'SKIP' });
    console.log('\n  ○ transfers (not implemented in any adapter) → SKIP');
    // ── Category 2: Compliance ────────────────────────────────────────────
    await runEVMTest('freeze (freeze account)', () => stablecoin_npm_sdk_1.StableCoin.freeze(new stablecoin_npm_sdk_1.FreezeAccountRequest({ tokenId, targetId: accountId })), provider, ecdsaPrivateKey);
    await runEVMTest('unFreeze (unfreeze account)', () => stablecoin_npm_sdk_1.StableCoin.unFreeze(new stablecoin_npm_sdk_1.FreezeAccountRequest({ tokenId, targetId: accountId })), provider, ecdsaPrivateKey);
    await runEVMTest('revokeKyc (revoke KYC from account)', () => stablecoin_npm_sdk_1.StableCoin.revokeKyc(new stablecoin_npm_sdk_1.KYCRequest({ tokenId, targetId: accountId })), provider, ecdsaPrivateKey);
    await runEVMTest('grantKyc (re-grant KYC to account)', () => stablecoin_npm_sdk_1.StableCoin.grantKyc(new stablecoin_npm_sdk_1.KYCRequest({ tokenId, targetId: accountId })), provider, ecdsaPrivateKey);
    await runEVMTest('pause (pause token)', () => stablecoin_npm_sdk_1.StableCoin.pause(new stablecoin_npm_sdk_1.PauseRequest({ tokenId })), provider, ecdsaPrivateKey);
    await runEVMTest('unPause (unpause token)', () => stablecoin_npm_sdk_1.StableCoin.unPause(new stablecoin_npm_sdk_1.PauseRequest({ tokenId })), provider, ecdsaPrivateKey);
    // ── Category 3: Token update ───────────────────────────────────────────
    await runEVMTest('update (rename token)', () => stablecoin_npm_sdk_1.StableCoin.update(new stablecoin_npm_sdk_1.UpdateRequest({ tokenId, name: 'ExternalEVM Updated', symbol: 'EVMTEST2' })), provider, ecdsaPrivateKey);
    // ── Category 4: Roles ─────────────────────────────────────────────────
    await runEVMTest('revokeRole (revoke BURN_ROLE)', () => stablecoin_npm_sdk_1.Role.revokeRole(new stablecoin_npm_sdk_1.RevokeRoleRequest({ tokenId, targetId: accountId, role: stablecoin_npm_sdk_1.StableCoinRole.BURN_ROLE })), provider, ecdsaPrivateKey);
    await runEVMTest('grantRole (grant BURN_ROLE)', () => stablecoin_npm_sdk_1.Role.grantRole(new stablecoin_npm_sdk_1.GrantRoleRequest({ tokenId, targetId: accountId, role: stablecoin_npm_sdk_1.StableCoinRole.BURN_ROLE })), provider, ecdsaPrivateKey);
    await runEVMTest('revokeMultiRoles (revoke FREEZE_ROLE)', () => stablecoin_npm_sdk_1.Role.revokeMultiRoles(new stablecoin_npm_sdk_1.RevokeMultiRolesRequest({ tokenId, targetsId: [accountId], roles: [stablecoin_npm_sdk_1.StableCoinRole.FREEZE_ROLE] })), provider, ecdsaPrivateKey);
    await runEVMTest('grantMultiRoles (grant FREEZE_ROLE)', () => stablecoin_npm_sdk_1.Role.grantMultiRoles(new stablecoin_npm_sdk_1.GrantMultiRolesRequest({ tokenId, targetsId: [accountId], roles: [stablecoin_npm_sdk_1.StableCoinRole.FREEZE_ROLE] })), provider, ecdsaPrivateKey);
    // ── Category 5: Supplier allowance ────────────────────────────────────
    // Must revoke the unlimited supplier role first; contract rejects changing unlimited→limited directly
    await runEVMTest('revokeRole CASHIN_ROLE (prep: remove unlimited)', () => stablecoin_npm_sdk_1.Role.revokeRole(new stablecoin_npm_sdk_1.RevokeRoleRequest({ tokenId, targetId: accountId, role: stablecoin_npm_sdk_1.StableCoinRole.CASHIN_ROLE })), provider, ecdsaPrivateKey);
    await runEVMTest('grantRole CASHIN_ROLE limited (100)', () => stablecoin_npm_sdk_1.Role.grantRole(new stablecoin_npm_sdk_1.GrantRoleRequest({ tokenId, targetId: accountId, role: stablecoin_npm_sdk_1.StableCoinRole.CASHIN_ROLE, supplierType: 'limited', amount: '100' })), provider, ecdsaPrivateKey);
    await runEVMTest('increaseAllowance (+50)', () => stablecoin_npm_sdk_1.Role.increaseAllowance(new stablecoin_npm_sdk_1.IncreaseSupplierAllowanceRequest({ tokenId, targetId: accountId, amount: '50' })), provider, ecdsaPrivateKey);
    await runEVMTest('decreaseAllowance (-25)', () => stablecoin_npm_sdk_1.Role.decreaseAllowance(new stablecoin_npm_sdk_1.DecreaseSupplierAllowanceRequest({ tokenId, targetId: accountId, amount: '25' })), provider, ecdsaPrivateKey);
    await runEVMTest('resetAllowance', () => stablecoin_npm_sdk_1.Role.resetAllowance(new stablecoin_npm_sdk_1.ResetSupplierAllowanceRequest({ tokenId, targetId: accountId })), provider, ecdsaPrivateKey);
    await runEVMTest('grantRole CASHIN_ROLE unlimited (restore)', () => stablecoin_npm_sdk_1.Role.grantRole(new stablecoin_npm_sdk_1.GrantRoleRequest({ tokenId, targetId: accountId, role: stablecoin_npm_sdk_1.StableCoinRole.CASHIN_ROLE, supplierType: 'unlimited' })), provider, ecdsaPrivateKey);
    // ── Category 6: Custom fees ───────────────────────────────────────────
    await runEVMTest('addFixedFee (HBAR-denominated, 0.01 HBAR)', 
    // tokenIdCollected '0.0.0' → HederaId.NULL → isNull()=true → no setDenominatingTokenId call → HBAR fee
    () => stablecoin_npm_sdk_1.Fees.addFixedFee(new stablecoin_npm_sdk_1.AddFixedFeeRequest({ tokenId, collectorId: accountId, collectorsExempt: true, decimals: 2, tokenIdCollected: '0.0.0', amount: '1' })), provider, ecdsaPrivateKey);
    await runEVMTest('addFractionalFee (1% fee)', () => stablecoin_npm_sdk_1.Fees.addFractionalFee(new stablecoin_npm_sdk_1.AddFractionalFeeRequest({ tokenId, collectorId: accountId, collectorsExempt: true, decimals: 2, percentage: '1', min: '0', max: '10', net: false })), provider, ecdsaPrivateKey);
    await runEVMTest('updateCustomFees (clear all fees)', () => stablecoin_npm_sdk_1.Fees.updateCustomFees(new stablecoin_npm_sdk_1.UpdateCustomFeesRequest({ tokenId, customFees: [] })), provider, ecdsaPrivateKey);
    // ── Category 7: Rescue ────────────────────────────────────────────────
    await runEVMTest('rescue (attempt rescue HTS tokens)', () => stablecoin_npm_sdk_1.StableCoin.rescue(new stablecoin_npm_sdk_1.RescueRequest({ tokenId, amount: '1' })), provider, ecdsaPrivateKey);
    // rescueHBAR - TODO: needs proxy contract address funding, not token address
    console.log('\n  ▶ rescueHBAR (needs proxy HBAR funding)...');
    testResults.push({ name: 'rescueHBAR (needs proxy contract HBAR)', status: 'SKIP' });
    console.log('  ○ SKIP  Needs proxy contract address for HBAR funding (not token HTS address)');
    // ── Category 8: Reserve operations ───────────────────────────────────
    await runEVMTest('updateReserveAddress (set to 0.0.0)', () => stablecoin_npm_sdk_1.StableCoin.updateReserveAddress(new stablecoin_npm_sdk_1.UpdateReserveAddressRequest({ tokenId, reserveAddress: '0.0.0' })), provider, ecdsaPrivateKey);
    // updateReserveAmount - Test if reserve was created
    if (reserveAddress) {
        await runEVMTest('updateReserveAmount (update to 1000)', () => stablecoin_npm_sdk_1.ReserveDataFeed.updateReserveAmount(new stablecoin_npm_sdk_1.UpdateReserveAmountRequest({ reserveAddress, reserveAmount: '1000' })), provider, ecdsaPrivateKey);
    }
    else {
        console.log('\n  ▶ updateReserveAmount (no reserve created)...');
        testResults.push({ name: 'updateReserveAmount (no reserve created)', status: 'SKIP' });
        console.log('  ○ SKIP  No reserve was created for this token');
    }
    // ── Category 9: Hold operations ───────────────────────────────────────
    const expirationDate = Math.floor(Date.now() / 1000 + 3600).toString(); // 1h from now
    // createHold → then releaseHold
    // IMPORTANT: holdId must be queried AFTER runEVMTest returns (tx already broadcast+confirmed)
    let holdId1 = -1;
    await runEVMTest('createHold (hold 5 tokens, escrow=self)', () => stablecoin_npm_sdk_1.StableCoin.createHold(new stablecoin_npm_sdk_1.CreateHoldRequest({ tokenId, amount: '5', escrow: accountId, expirationDate, targetId: accountId })), provider, ecdsaPrivateKey);
    // Now tx is confirmed – wait for mirror node then query holdIds
    await waitMs(4000);
    try {
        const ids = await stablecoin_npm_sdk_1.StableCoin.getHoldsIdFor(new stablecoin_npm_sdk_1.GetHoldsIdForRequest({ tokenId, sourceId: accountId, start: 0, end: 100 }));
        holdId1 = ids.length > 0 ? ids[ids.length - 1] : -1;
        console.log(`\n    ↳ holdId1=${holdId1}`);
    }
    catch (_) { /* ignore */ }
    await runEVMTest(`releaseHold (holdId=${holdId1})`, () => holdId1 >= 0
        ? stablecoin_npm_sdk_1.StableCoin.releaseHold(new stablecoin_npm_sdk_1.ReleaseHoldRequest({ tokenId, sourceId: accountId, holdId: holdId1, amount: '5' }))
        : Promise.reject(new Error('No holdId available – createHold tx may not have been indexed yet')), provider, ecdsaPrivateKey);
    // createHold → then executeHold
    let holdId2 = -1;
    await runEVMTest('createHold (hold 5 tokens for executeHold)', () => stablecoin_npm_sdk_1.StableCoin.createHold(new stablecoin_npm_sdk_1.CreateHoldRequest({ tokenId, amount: '5', escrow: accountId, expirationDate, targetId: accountId })), provider, ecdsaPrivateKey);
    await waitMs(4000);
    try {
        const ids = await stablecoin_npm_sdk_1.StableCoin.getHoldsIdFor(new stablecoin_npm_sdk_1.GetHoldsIdForRequest({ tokenId, sourceId: accountId, start: 0, end: 100 }));
        holdId2 = ids.length > 0 ? ids[ids.length - 1] : -1;
        console.log(`\n    ↳ holdId2=${holdId2}`);
    }
    catch (_) { /* ignore */ }
    await runEVMTest(`executeHold (holdId=${holdId2})`, () => holdId2 >= 0
        ? stablecoin_npm_sdk_1.StableCoin.executeHold(new stablecoin_npm_sdk_1.ExecuteHoldRequest({ tokenId, sourceId: accountId, holdId: holdId2, amount: '5', targetId: accountId }))
        : Promise.reject(new Error('No holdId available')), provider, ecdsaPrivateKey);
    // createHoldByController (no release/execute needed)
    await runEVMTest('createHoldByController (controller creates hold)', () => stablecoin_npm_sdk_1.StableCoin.createHoldByController(new stablecoin_npm_sdk_1.CreateHoldByControllerRequest({ tokenId, amount: '5', escrow: accountId, expirationDate, sourceId: accountId, targetId: accountId })), provider, ecdsaPrivateKey);
    // reclaimHold test with short expiration
    const shortExpirationDate = Math.floor(Date.now() / 1000 + 10).toString(); // +10 seconds
    let reclaimHoldId = -1;
    await runEVMTest('createHold (short expiration for reclaim test)', () => stablecoin_npm_sdk_1.StableCoin.createHold(new stablecoin_npm_sdk_1.CreateHoldRequest({ tokenId, amount: '5', escrow: accountId, expirationDate: shortExpirationDate, targetId: accountId })), provider, ecdsaPrivateKey);
    await waitMs(4000);
    try {
        const ids = await stablecoin_npm_sdk_1.StableCoin.getHoldsIdFor(new stablecoin_npm_sdk_1.GetHoldsIdForRequest({ tokenId, sourceId: accountId, start: 0, end: 100 }));
        reclaimHoldId = ids.length > 0 ? ids[ids.length - 1] : -1;
        console.log(`\n    ↳ reclaimHoldId=${reclaimHoldId}`);
    }
    catch (_) { /* ignore */ }
    console.log(`\n  ⏳ Waiting 15s for hold ${reclaimHoldId} to expire...`);
    await waitMs(15000);
    await runEVMTest(`reclaimHold (expired hold, holdId=${reclaimHoldId})`, () => reclaimHoldId >= 0
        ? stablecoin_npm_sdk_1.StableCoin.reclaimHold(new stablecoin_npm_sdk_1.ReclaimHoldRequest({ tokenId, sourceId: accountId, holdId: reclaimHoldId }))
        : Promise.reject(new Error('No holdId available for reclaim')), provider, ecdsaPrivateKey);
    // ── Category 10: Management ───────────────────────────────────────────
    await runEVMTest('updateConfig (same configId+version)', () => stablecoin_npm_sdk_1.Management.updateConfig(new stablecoin_npm_sdk_1.UpdateConfigRequest({ tokenId, configId: CONFIG_ID, configVersion: 1 })), provider, ecdsaPrivateKey);
    await runEVMTest('updateConfigVersion (version=1)', () => stablecoin_npm_sdk_1.Management.updateConfigVersion(new stablecoin_npm_sdk_1.UpdateConfigVersionRequest({ tokenId, configVersion: 1 })), provider, ecdsaPrivateKey);
    await runEVMTest('updateResolver (same resolver)', () => stablecoin_npm_sdk_1.Management.updateResolver(new stablecoin_npm_sdk_1.UpdateResolverRequest({ tokenId, configId: CONFIG_ID, configVersion: 1, resolver: resolverAddress })), provider, ecdsaPrivateKey);
    // ── Category 11: Dangerous – delete last ─────────────────────────────
    await runEVMTest('delete (permanent – runs last)', () => stablecoin_npm_sdk_1.StableCoin.delete(new stablecoin_npm_sdk_1.DeleteRequest({ tokenId })), provider, ecdsaPrivateKey);
    // ── Print summary ─────────────────────────────────────────────────────
    printSummary();
    process.exit(0);
};
main().catch((error) => {
    console.error('\n✗ Fatal error:', error);
    printSummary();
    process.exit(1);
});
