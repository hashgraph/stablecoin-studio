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

import { Client, PrivateKey } from '@hiero-ledger/sdk';
import { ethers } from 'ethers';
import type { NetworkEndpoints } from './HederaNetwork.js';
import type {
  SigningConfig,
  ClientSigning,
  EVMSignerSigning,
} from './SigningConfig.js';

// ── Resolved types (always have concrete instances) ──────────────────────────

export interface ResolvedClientSigning {
  readonly type: 'client';
  readonly client: Client;
  /** Present when credentials were provided (vs pre-configured client). */
  readonly privateKey?: PrivateKey;
}

export interface ResolvedEVMSignerSigning {
  readonly type: 'signer';
  readonly signer: ethers.Signer;
  readonly provider: ethers.Provider;
}

/** SigningConfig with all credentials resolved to concrete instances. */
export type ResolvedSigningConfig =
  | ResolvedClientSigning
  | ResolvedEVMSignerSigning
  | Exclude<SigningConfig, ClientSigning | EVMSignerSigning>;

// ── Network → Client mapping ─────────────────────────────────────────────────

const NETWORK_CLIENT_FACTORIES: Record<string, () => Client> = {
  'https://testnet.mirrornode.hedera.com': () => Client.forTestnet(),
  'https://mainnet-public.mirrornode.hedera.com': () => Client.forMainnet(),
  'https://previewnet.mirrornode.hedera.com': () => Client.forPreviewnet(),
};

function createClientForNetwork(network: NetworkEndpoints): Client {
  const factory = NETWORK_CLIENT_FACTORIES[network.mirrorNode];
  if (factory) {
    return factory();
  }
  throw new Error(
    `Cannot auto-create Hedera Client for custom network (mirrorNode: ${network.mirrorNode}). ` +
    `Pass a pre-configured Client instead:\n` +
    `  signing: { type: 'client', client: myClient }`,
  );
}

// ── Key type detection ───────────────────────────────────────────────────────

const ED25519_DER_PREFIX = '302e020100300506032b6570';
const ECDSA_DER_PREFIX   = '3030020100300706052b8104000a';

function isEd25519Key(key: string): boolean {
  return key.replace(/^0x/, '').startsWith(ED25519_DER_PREFIX);
}

/**
 * Parse a private key string into a PrivateKey instance.
 *
 * Key type detection:
 * - DER-encoded keys (302e... or 3030...): auto-detected by PrivateKey.fromString
 * - 0x-prefixed raw hex: ECDSA (Ethereum convention)
 * - Raw hex without prefix: ED25519 (Hedera convention)
 */
function parsePrivateKey(key: string): PrivateKey {
  const isECDSA = key.startsWith('0x');
  const clean = key.replace(/^0x/, '');
  // DER-encoded keys contain their own type info — auto-detect
  if (clean.startsWith(ED25519_DER_PREFIX) || clean.startsWith(ECDSA_DER_PREFIX)) {
    return PrivateKey.fromString(clean);
  }
  // Raw hex: use 0x prefix as ECDSA indicator
  return isECDSA
    ? PrivateKey.fromStringECDSA(clean)
    : PrivateKey.fromStringED25519(clean);
}

// ── Resolver ─────────────────────────────────────────────────────────────────

export function resolveSigningConfig(
  signing: SigningConfig,
  network: NetworkEndpoints,
): ResolvedSigningConfig {
  // Client signing — may need to create Client from credentials
  if (signing.type === 'client') {
    if ('client' in signing) {
      return signing as ResolvedClientSigning;
    }
    // Has operatorId + privateKey — auto-create Client
    const client = createClientForNetwork(network);
    const privateKey = parsePrivateKey(signing.privateKey);
    client.setOperator(signing.operatorId, privateKey);
    return { type: 'client', client, privateKey };
  }

  // EVM signer — may need to create Provider + Wallet from private key
  if (signing.type === 'signer') {
    if ('signer' in signing) {
      return signing as ResolvedEVMSignerSigning;
    }
    // ED25519 keys are not compatible with EVM signing (ethers.js requires ECDSA/secp256k1)
    if (isEd25519Key(signing.privateKey)) {
      throw new Error(
        'ED25519 keys are not compatible with EVM signing. ' +
        'The EVM path requires an ECDSA (secp256k1) key.\n' +
        'Use signing type \'client\' with HEDERA_OPERATOR_ID + HEDERA_PRIVATE_KEY for ED25519 keys.',
      );
    }
    // Has privateKey — auto-create provider from network RPC + Wallet
    const provider = new ethers.JsonRpcProvider(network.jsonRpcRelay);
    const signer = new ethers.Wallet(signing.privateKey, provider);
    return { type: 'signer', signer, provider };
  }

  // All other types already have concrete instances
  return signing as ResolvedSigningConfig;
}
