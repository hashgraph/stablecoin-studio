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

import type { ResolvedSigningConfig } from '../config/resolveSigningConfig.js';
import { ExecutionStep } from './base/ExecutionStep.js';

// Hedera steps
import { BuildHederaStep } from './hedera/steps/BuildHederaStep.js';
import { SignWithClientStep } from './hedera/steps/SignWithClientStep.js';
import { SubmitToHederaStep } from './hedera/steps/SubmitToHederaStep.js';
import { ParseHederaReceiptStep } from './hedera/steps/ParseHederaReceiptStep.js';
import { SerializeHederaStep } from './hedera/steps/SerializeHederaStep.js';
import { SubmitSignedHederaTransactionStep } from './hedera/steps/SubmitSignedHederaTransactionStep.js';

// EVM steps
import { BuildEVMStep } from './evm/steps/BuildEVMStep.js';
import { SignWithSignerStep } from './evm/steps/SignWithSignerStep.js';
import { SubmitToRPCStep } from './evm/steps/SubmitToRPCStep.js';
import { ParseEVMReceiptStep } from './evm/steps/ParseEVMReceiptStep.js';
import { SerializeEVMStep } from './evm/steps/SerializeEVMStep.js';
import { SubmitSignedEVMTransactionStep } from './evm/steps/SubmitSignedEVMTransactionStep.js';

// Shared steps
import { ExtractResultStep } from './shared/ExtractResultStep.js';
import { SignWithExternalStep } from './shared/SignWithExternalStep.js';
import { SignAndExecuteExternalStep } from './shared/SignAndExecuteExternalStep.js';
import { ReturnSerializedStep } from './shared/ReturnSerializedStep.js';

export function buildPipeline(signing: ResolvedSigningConfig): ExecutionStep[] {
  switch (signing.type) {

    // ── Hedera native with operator key ──────────────────────────────────
    case 'client':
      return [
        new BuildHederaStep(),
        new SignWithClientStep(signing.client, signing.privateKey),
        new SubmitToHederaStep(signing.client),
        new ParseHederaReceiptStep(signing.client),
        new ExtractResultStep(),
      ];

    // ── EVM with ethers Signer ───────────────────────────────────────────
    case 'signer':
      return [
        new BuildEVMStep(),
        new SignWithSignerStep(signing.signer),
        new SubmitToRPCStep(signing.provider),
        new ParseEVMReceiptStep(),
        new ExtractResultStep(),
      ];

    // ── Hedera with external wallet ──────────────────────────────────────
    // Only builds and serializes — the external system (HashPack, backend)
    // handles signing and submission. Returns serialized transaction bytes.
    case 'hedera-external':
      return [
        new BuildHederaStep(),
        new SerializeHederaStep(signing.client, signing.accountId),
        new ReturnSerializedStep(),
      ];

    // ── Hedera with external wallet (sign + execute atomically) ─────────
    // For wallets like WalletConnect/HashPack that sign and execute
    // in a single atomic operation via hedera_signAndExecuteTransaction.
    // After execution, queries the TransactionRecord so ExtractResultStep
    // can parse event logs (e.g. Deployed event for stablecoin creation).
    case 'hedera-external-execute':
      return [
        new BuildHederaStep(),
        new SerializeHederaStep(signing.client, signing.accountId),
        new SignAndExecuteExternalStep(signing.signAndExecute, signing.mirrorNodeBaseUrl),
        new ExtractResultStep(),
      ];

    // ── EVM with external wallet ─────────────────────────────────────────
    // Only builds and serializes — the external system (MetaMask, backend)
    // handles signing and submission. Returns serialized transaction bytes.
    case 'evm-external':
      return [
        new BuildEVMStep(),
        new SerializeEVMStep(),
        new ReturnSerializedStep(),
      ];

    // ── Custodial (Fireblocks, DFNS, AWS KMS) ────────────────────────────
    // The custodial Client is already configured with setOperatorWith()
    // which uses a signing callback internally. We reuse the same
    // freeze→execute flow as 'client' (no explicit privateKey needed).
    case 'custodial':
      return [
        new BuildHederaStep(),
        new SignWithClientStep(signing.client),
        new SubmitToHederaStep(signing.client),
        new ParseHederaReceiptStep(signing.client),
        new ExtractResultStep(),
      ];

    // ── Multi-sig via backend ────────────────────────────────────────────
    // Same as external — only builds and serializes.
    case 'multisig':
      return [
        new BuildHederaStep(),
        new SerializeHederaStep(signing.client),
        new ReturnSerializedStep(),
      ];
  }
}
