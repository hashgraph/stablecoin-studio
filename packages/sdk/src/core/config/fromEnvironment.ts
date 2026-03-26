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

import type { NetworkConfig } from './HederaNetwork.js';
import type { SigningConfig } from './SigningConfig.js';

export interface EnvironmentConfig {
  network: NetworkConfig;
  signing: SigningConfig;
  diagnostics?: boolean;
}

export function fromEnvironment(
  env: Record<string, string | undefined> = process.env,
): EnvironmentConfig {
  // ── Network ───────────────────────────────────────────────────────────────
  const network = requireEnv(env, 'HEDERA_NETWORK') as NetworkConfig;

  // ── Signing ───────────────────────────────────────────────────────────────
  const signing = resolveSigning(env);

  return { network, signing };
}

// ── Internal ──────────────────────────────────────────────────────────────────

function resolveSigning(env: Record<string, string | undefined>): SigningConfig {
  const operatorId = env.HEDERA_OPERATOR_ID;
  const hederaKey = env.HEDERA_PRIVATE_KEY;
  const evmKey = env.EVM_PRIVATE_KEY;

  // Hedera Client — operatorId + privateKey
  if (operatorId && hederaKey) {
    return { type: 'client', operatorId, privateKey: hederaKey };
  }

  // EVM Signer — just a private key (must be ECDSA, not ED25519)
  if (evmKey) {
    const ED25519_DER_PREFIX = '302e020100300506032b6570';
    if (evmKey.replace(/^0x/, '').startsWith(ED25519_DER_PREFIX)) {
      throw new Error(
        'EVM_PRIVATE_KEY contains an ED25519 key, which is not compatible with the EVM path.\n' +
        'The EVM JSON-RPC relay requires an ECDSA (secp256k1) key.\n' +
        'Use HEDERA_OPERATOR_ID + HEDERA_PRIVATE_KEY for ED25519 keys (Hedera native path).',
      );
    }
    return { type: 'signer', privateKey: evmKey };
  }

  throw new Error(
    'Cannot resolve signing from environment.\n' +
    'Set one of:\n' +
    '  HEDERA_OPERATOR_ID + HEDERA_PRIVATE_KEY  (Hedera native)\n' +
    '  EVM_PRIVATE_KEY                          (EVM / JSON-RPC relay)',
  );
}

function requireEnv(
  env: Record<string, string | undefined>,
  key: string,
): string {
  const value = env[key];
  if (!value) {
    throw new Error(`Missing required environment variable: ${key}`);
  }
  return value;
}
