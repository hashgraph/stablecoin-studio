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

import { AccountId, PrivateKey, TokenId } from '@hiero-ledger/sdk';
import { ethers } from 'ethers';

// ── Env ──────────────────────────────────────────────────────────────────────

export const REQUIRED_ENV = [
  'HEDERA_NETWORK',
  'HEDERA_OPERATOR_ID',
  'HEDERA_PRIVATE_KEY',
  'HEDERA_FACTORY_ADDRESS',
  'HEDERA_RESOLVER_ADDRESS',
];

export function isConfigured(): boolean {
  return REQUIRED_ENV.every((key) => !!process.env[key]);
}

export function hasAccount2(): boolean {
  return !!process.env.HEDERA_ACCOUNT2_ID && !!process.env.HEDERA_ACCOUNT2_KEY;
}

// ── Address helpers ──────────────────────────────────────────────────────────

export function toEvmAddress(addr: string): string {
  if (addr.startsWith('0x')) return addr;
  return '0x' + AccountId.fromString(addr).toSolidityAddress();
}

const ED25519_DER_PREFIX = '302e020100300506032b6570';
const ECDSA_DER_PREFIX   = '3030020100300706052b8104000a';

/** Returns true if the key is ED25519 (DER-encoded or raw 32-byte hex). */
export function isEd25519Key(key: string): boolean {
  const clean = key.replace(/^0x/, '');
  return clean.startsWith(ED25519_DER_PREFIX);
}

/**
 * Parse a private key string, correctly detecting ECDSA vs ED25519.
 * - DER-encoded: auto-detected
 * - 0x-prefixed raw hex: ECDSA (Ethereum convention)
 * - Raw hex: ED25519 (Hedera convention)
 */
export function parsePrivateKey(key: string): PrivateKey {
  const isECDSA = key.startsWith('0x');
  const clean = key.replace(/^0x/, '');
  if (clean.startsWith(ED25519_DER_PREFIX) || clean.startsWith(ECDSA_DER_PREFIX)) {
    return PrivateKey.fromString(clean);
  }
  return isECDSA
    ? PrivateKey.fromStringECDSA(clean)
    : PrivateKey.fromStringED25519(clean);
}

/**
 * Derive msg.sender EVM address from a private key.
 * - ECDSA: derives from public key (ethers.computeAddress)
 * - ED25519: cannot derive — use toEvmAddress(accountId) instead
 */
export function evmAliasFromKey(privateKey: string): string {
  if (isEd25519Key(privateKey)) {
    throw new Error('ED25519 keys have no EVM alias — use toEvmAddress(accountId) instead');
  }
  return new ethers.Wallet(privateKey).address;
}

/**
 * Resolve the operator's msg.sender EVM address.
 * ECDSA: derived from private key. ED25519: derived from account ID.
 */
export function resolveOperatorEvm(privateKey: string, accountId: string): string {
  if (isEd25519Key(privateKey)) {
    return toEvmAddress(accountId);
  }
  return new ethers.Wallet(privateKey).address;
}

export function parseTokenId(tokenAddress: string): TokenId | null {
  try {
    return TokenId.fromSolidityAddress(tokenAddress);
  } catch {
    return null;
  }
}

// ── Role constants (from contracts) ──────────────────────────────────────────

export const ROLES = {
  cashin:     '0x53300d27a2268d3ff3ecb0ec8e628321ecfba1a08aed8b817e8acf589a52d25c',
  burn:       '0xe97b137254058bd94f28d2f3eb79e2d34074ffb488d042e3bc958e0a57d2fa22',
  wipe:       '0x515f99f4e5a381c770462a8d9879a01f0fd4a414a168a2404dab62a62e1af0c3',
  rescue:     '0x43f433f336cda92fbbe5bfbdd344a9fd79b2ef138cd6e6fc49d55e2f54e1d99a',
  pause:      '0x139c2898040ef16910dc9f44dc697df79363da767d8bc92f2e310312b816e46d',
  freeze:     '0x5789b43a60de35bcedee40618ae90979bab7d1315fd4b079234241bdab19936d',
  deleteRole: '0x2b73f0f98ad60ca619bbdee4bcd175da1127db86346339f8b718e3f8b4a006e2',
  kyc:        '0xdb11624602202c396fa347735a55e345a3aeb3e60f8885e1a71f1bf8d5886db7',
  hold:       '0xa0edc074322e33cf8b82b4182ff2827f0fef9412190f0e8417c2669a1e8747e4',
  customFees: '0x6db8586688d24c6a6367d21f709d650b12a2a61dd75e834bd8cd90fd6afa794b',
} as const;

export const ROLE_NAMES: Record<string, string> = Object.fromEntries(
  Object.entries(ROLES).map(([name, hash]) => [hash, name]),
);

// ── Logging ──────────────────────────────────────────────────────────────────

export interface OpSummary {
  op: string;
  success: boolean;
  txId: string;
  events: string[];
  error?: string;
}

export function logHeader(label: string, prefix?: string): void {
  const tag = prefix ? `[${prefix}] ${label}` : label;
  console.log(`\n${'='.repeat(60)}`);
  console.log(`  ${tag}`);
  console.log('='.repeat(60));
}

export async function logResult(label: string, result: any, summary?: OpSummary[]): Promise<void> {
  const txId = result.transactionId ?? result.txHash ?? 'N/A';
  console.log(`  OK | txId: ${txId}`);
  if (result.proxyAddress) console.log(`     | proxyAddress: ${result.proxyAddress}`);
  if (result.tokenAddress) console.log(`     | tokenAddress: ${result.tokenAddress}`);
  if (result.reserveProxy) console.log(`     | reserveProxy: ${result.reserveProxy}`);
  if (result.transactionId) {
    console.log(`     | hashscan: https://hashscan.io/testnet/transaction/${toMirrorTxId(result.transactionId)}`);
  }
  summary?.push({ op: label, success: true, txId: result.transactionId ?? '', events: [] });
}

// ── Mirror node helpers ──────────────────────────────────────────────────────

const MIRROR_BASE = 'https://testnet.mirrornode.hedera.com/api/v1';

export function toMirrorTxId(txId: string): string {
  // EVM path returns a tx hash (0x...), not a Hedera txId (account@ts)
  if (!txId.includes('@')) return txId;
  const [account, ts] = txId.split('@');
  const [seconds, nanos] = ts.split('.');
  return `${account}-${seconds}-${nanos}`;
}

const KNOWN_EVENTS = new ethers.Interface([
  'event Transfer(address indexed from, address indexed to, uint256 value)',
  'event Approval(address indexed owner, address indexed spender, uint256 value)',
  'event RoleGranted(bytes32 indexed role, address indexed account, address indexed sender)',
  'event RoleRevoked(bytes32 indexed role, address indexed account, address indexed sender)',
  'event Paused(address account)',
  'event Unpaused(address account)',
  'event TokensMinted(address indexed account, uint256 amount)',
  'event TokensBurned(uint256 amount)',
  'event TokensWiped(address indexed account, uint256 amount)',
  'event AccountFrozen(address indexed account)',
  'event AccountUnfrozen(address indexed account)',
  'event KycGranted(address indexed account)',
  'event KycRevoked(address indexed account)',
  'event SupplierAllowanceChanged(address indexed account, uint256 oldAllowance, uint256 newAllowance)',
  'event Deployed(tuple(address stableCoinProxy, address tokenAddress, address reserveProxy) deployedStableCoin)',
]);

function formatEventArg(name: string, value: unknown): string {
  const s = String(value);
  if (name === 'role' && typeof value === 'string' && ROLE_NAMES[value]) {
    return `${name}=${ROLE_NAMES[value]}`;
  }
  if (typeof value === 'string' && value.startsWith('0x') && value.length === 42) {
    return `${name}=${value.slice(0, 8)}...${value.slice(-4)}`;
  }
  return `${name}=${s}`;
}

export async function fetchEvents(txId: string): Promise<string[]> {
  try {
    const mirrorTxId = toMirrorTxId(txId);
    const txRes = await fetch(`${MIRROR_BASE}/transactions/${mirrorTxId}`);
    const txData = await txRes.json() as any;

    const transactions = txData.transactions ?? [];
    if (transactions.length === 0) return ['(transaction not found in mirror node)'];

    const events: string[] = [];
    for (const tx of transactions) {
      if (tx.name && tx.name !== 'CONTRACTCALL') {
        events.push(`[child] ${tx.name}: ${tx.result}`);
      }
    }

    const consensusTs = transactions[0].consensus_timestamp;
    if (!consensusTs) return events.length > 0 ? events : ['(no consensus timestamp)'];

    const crRes = await fetch(`${MIRROR_BASE}/contracts/results/${consensusTs}`);
    const crData = await crRes.json() as any;

    for (const log of crData.logs ?? []) {
      try {
        const parsed = KNOWN_EVENTS.parseLog({ topics: log.topics, data: log.data });
        if (parsed) {
          const args = parsed.fragment.inputs
            .map((input, i) => formatEventArg(input.name, parsed.args[i]))
            .join(', ');
          events.push(`${parsed.name}(${args})`);
        } else {
          events.push(`UnknownEvent(topic0=${(log.topics?.[0] as string)?.slice(0, 18)}...)`);
        }
      } catch {
        events.push(`RawLog(topic0=${(log.topics?.[0] as string)?.slice(0, 18)}...)`);
      }
    }

    return events.length > 0 ? events : ['(no events)'];
  } catch (e: any) {
    return [`(mirror error: ${e.message})`];
  }
}

export function delay(ms: number): Promise<void> {
  return new Promise((r) => setTimeout(r, ms));
}

export async function fetchAllEvents(summary: OpSummary[]): Promise<void> {
  console.log('\n  Fetching events from mirror node (batch)...');
  await delay(20_000); // mirror node needs ~15-20s to index new transactions
  for (const s of summary) {
    if (!s.txId) continue;
    s.events = await fetchEvents(s.txId);
  }
}

export function printSummary(summary: OpSummary[]): void {
  console.log(`\n${'='.repeat(60)}`);
  console.log('  OPERATION SUMMARY');
  console.log('='.repeat(60));
  for (const s of summary) {
    const mark = s.success ? 'OK' : 'FAIL';
    console.log(`  [${mark}] ${s.op}`);
    if (s.txId) console.log(`        txId: ${s.txId}`);
    if (s.error) console.log(`        error: ${s.error}`);
    for (const e of s.events) {
      console.log(`        ${e}`);
    }
  }
  console.log('='.repeat(60));
}
