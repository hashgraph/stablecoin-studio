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

import { Client } from '@hiero-ledger/sdk';
import { ethers } from 'ethers';

// ── Sign function ────────────────────────────────────────────────────────────

/** A function that signs raw transaction bytes and returns the signed bytes. */
export type SignFunction = (transactionBytes: Uint8Array) => Promise<Uint8Array>;

/**
 * Minimal interface for custodial signing services (Fireblocks, DFNS, AWS KMS).
 * Compatible with CustodialWalletService from @hashgraph/hedera-custodians-integration.
 */
export interface CustodialSigner {
  sign(signatureRequest: { transactionBytes: Uint8Array }): Promise<Uint8Array>;
}

/**
 * Minimal interface for multi-sig backend coordination.
 * Compatible with BackendAdapter.
 */
export interface MultiSigBackend {
  submitTransaction(transactionBytes: Uint8Array): Promise<string>;
}

// ── Signing variants ─────────────────────────────────────────────────────────

// -- Hedera Client --

/** Simple: just credentials — Client is auto-created from network config. */
export interface ClientCredentialsSigning {
  readonly type: 'client';
  readonly operatorId: string;
  readonly privateKey: string;
}

/** Advanced: bring your own pre-configured Client. */
export interface ClientInstanceSigning {
  readonly type: 'client';
  readonly client: Client;
}

export type ClientSigning = ClientCredentialsSigning | ClientInstanceSigning;

// -- Hedera External --

export interface HederaExternalSigning {
  /** An external wallet signs the serialized Hedera transaction (serialize only, no execution). */
  readonly type: 'hedera-external';
  readonly client: Client;
  readonly sign: SignFunction;
  /** AccountId of the signer — used to freeze the transaction when the client has no operator. */
  readonly accountId?: string;
}

/** A function that signs and executes a Hedera transaction atomically (e.g. WalletConnect). Returns the transaction ID. */
export type SignAndExecuteFunction = (transactionBytes: Uint8Array) => Promise<string>;

export interface HederaExternalExecuteSigning {
  /** An external wallet signs AND executes the transaction in a single atomic operation (e.g. WalletConnect/HashPack). */
  readonly type: 'hedera-external-execute';
  readonly client: Client;
  readonly signAndExecute: SignAndExecuteFunction;
  /** AccountId of the signer — used to freeze the transaction when the client has no operator. */
  readonly accountId: string;
  /** Mirror node base URL (e.g. https://testnet.mirrornode.hedera.com/api/v1/) — used to fetch transaction records without needing a client operator. */
  readonly mirrorNodeBaseUrl: string;
}

// -- Custodial --

export interface CustodialSigning {
  /** Custodial service signs (Fireblocks, DFNS, AWS KMS). */
  readonly type: 'custodial';
  readonly client: Client;
  readonly custodialSigner: CustodialSigner;
}

// -- Multi-sig --

export interface MultiSigSigning {
  /** Multi-sig coordination via backend. */
  readonly type: 'multisig';
  readonly client: Client;
  readonly backend: MultiSigBackend;
}

// -- EVM Signer --

/** Simple: just a private key — Provider and Signer auto-created from network RPC. */
export interface EVMPrivateKeySigning {
  readonly type: 'signer';
  readonly privateKey: string;
}

/** Advanced: bring your own Signer and Provider (MetaMask, WalletConnect, etc). */
export interface EVMInstanceSigning {
  readonly type: 'signer';
  readonly signer: ethers.Signer;
  readonly provider: ethers.Provider;
}

export type EVMSignerSigning = EVMPrivateKeySigning | EVMInstanceSigning;

// -- EVM External --

export interface EVMExternalSigning {
  /** An external wallet signs the serialized EVM transaction. */
  readonly type: 'evm-external';
  readonly provider: ethers.Provider;
  readonly sign: SignFunction;
}

// ── Union type ───────────────────────────────────────────────────────────────

export type SigningConfig =
  | ClientSigning
  | HederaExternalSigning
  | HederaExternalExecuteSigning
  | CustodialSigning
  | MultiSigSigning
  | EVMSignerSigning
  | EVMExternalSigning;

// ── Helpers ──────────────────────────────────────────────────────────────────

/** All signing types that execute on the Hedera native chain. */
export type HederaSigningConfig =
  | ClientSigning
  | HederaExternalSigning
  | HederaExternalExecuteSigning
  | CustodialSigning
  | MultiSigSigning;

/** All signing types that execute on EVM (JSON-RPC relay). */
export type EVMSigningConfig =
  | EVMSignerSigning
  | EVMExternalSigning;

const HEDERA_TYPES = new Set(['client', 'hedera-external', 'hedera-external-execute', 'custodial', 'multisig']);

export function isHederaSigning(config: SigningConfig): config is HederaSigningConfig {
  return HEDERA_TYPES.has(config.type);
}

export function isEVMSigning(config: SigningConfig): config is EVMSigningConfig {
  return !HEDERA_TYPES.has(config.type);
}
