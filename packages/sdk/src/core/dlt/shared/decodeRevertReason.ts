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

import { ethers } from 'ethers';
import type { DecodedError } from './TransactionDiagnostics.js';

// ── HTS Precompile Response Codes ──────────────────────────────────────────
// The stablecoin contracts define `error ResponseCodeInvalid(int64 code)` in
// ICommon.sol.  Its selector is keccak256("ResponseCodeInvalid(int64)")[0:4].
// Older precompile wrappers used int32 — we match both for safety.
// See: https://github.com/hashgraph/hedera-services/blob/main/hedera-node/hapi/src/main/java/com/hedera/hapi/node/base/ResponseCodeEnum.java

const HTS_RESPONSE_SELECTOR_INT64 = '0x241f500f'; // ResponseCodeInvalid(int64) — used by stablecoin contracts
const HTS_RESPONSE_SELECTOR_INT32 = '0x5416eb98'; // ResponseCodeInvalid(int32) — older precompile wrapper

const HTS_RESPONSE_CODES: Record<number, string> = {
  7: 'INVALID_ACCOUNT_ID',
  16: 'ACCOUNT_DELETED',
  22: 'INVALID_SIGNATURE',
  78: 'INVALID_TOKEN_ID',
  82: 'TOKEN_WAS_DELETED',
  165: 'INVALID_FULL_PREFIX_SIGNATURE_FOR_PRECOMPILE',
  167: 'TOKEN_NOT_ASSOCIATED_TO_ACCOUNT',
  168: 'INVALID_TOKEN_BURN_AMOUNT',
  170: 'INVALID_TOKEN_MINT_AMOUNT',
  174: 'TOKEN_HAS_NO_SUPPLY_KEY',
  178: 'TOKEN_HAS_NO_WIPE_KEY',
  180: 'ACCOUNT_FROZEN_FOR_TOKEN',
  181: 'TOKEN_HAS_NO_FREEZE_KEY',
  184: 'ACCOUNT_KYC_NOT_GRANTED_FOR_TOKEN',
  185: 'TOKEN_HAS_NO_KYC_KEY',
  189: 'INSUFFICIENT_TOKEN_BALANCE',
  190: 'TOKEN_HAS_NO_FEE_SCHEDULE_KEY',
  195: 'TOKEN_HAS_NO_PAUSE_KEY',
  197: 'TOKEN_IS_PAUSED',
  235: 'SPENDER_DOES_NOT_HAVE_ALLOWANCE',
  236: 'AMOUNT_EXCEEDS_ALLOWANCE',
  280: 'INVALID_ACCOUNT_AMOUNTS',
  282: 'INVALID_ALIAS_KEY',
  283: 'UNEXPECTED_TOKEN_DECIMALS',
};

// ── Panic Codes ────────────────────────────────────────────────────────────

const PANIC_MESSAGES: Record<number, string> = {
  0x00: 'Generic compiler panic',
  0x01: 'Assert failed',
  0x11: 'Arithmetic overflow/underflow',
  0x12: 'Division by zero',
  0x21: 'Invalid enum value',
  0x22: 'Storage encoding error',
  0x31: 'Pop on empty array',
  0x32: 'Array index out of bounds',
  0x41: 'Too much memory allocated',
  0x51: 'Zero-initialized function pointer',
};

// ── Public API ─────────────────────────────────────────────────────────────

/**
 * Decodes a raw hex-encoded revert reason into a structured error.
 *
 * Handles (in order):
 * 1. Standard `Error(string)` — Solidity `revert("message")`
 * 2. `Panic(uint256)` — Solidity assert failures
 * 3. HTS precompile `ResponseCodeInvalid(int32)` — Hedera Token Service errors
 * 4. Custom errors from provided ABIs
 * 5. Falls back to raw hex as `UnknownError`
 */
export function decodeRevertReason(
  rawReason: string,
  abis?: string[],
): DecodedError | string | undefined {
  if (!rawReason) return undefined;

  const hex = rawReason.startsWith('0x') ? rawReason : `0x${rawReason}`;

  // 1. Error(string) — standard revert
  if (hex.startsWith('0x08c379a0')) {
    try {
      const decoded = ethers.AbiCoder.defaultAbiCoder().decode(
        ['string'],
        `0x${hex.slice(10)}`,
      );
      return decoded[0] as string;
    } catch {
      // Could not decode as Error(string)
    }
  }

  // 2. Panic(uint256) — assert failures
  if (hex.startsWith('0x4e487b71')) {
    try {
      const decoded = ethers.AbiCoder.defaultAbiCoder().decode(
        ['uint256'],
        `0x${hex.slice(10)}`,
      );
      const panicCode = Number(decoded[0]);
      return {
        name: 'Panic',
        args: {
          code: `0x${panicCode.toString(16)}`,
          message: PANIC_MESSAGES[panicCode] ?? 'Unknown panic code',
        },
        selector: '0x4e487b71',
      };
    } catch {
      // Could not decode as Panic
    }
  }

  // 3. HTS precompile — ResponseCodeInvalid(int64) or ResponseCodeInvalid(int32)
  const htsMatch = hex.startsWith(HTS_RESPONSE_SELECTOR_INT64)
    ? { selector: HTS_RESPONSE_SELECTOR_INT64, type: 'int64' as const }
    : hex.startsWith(HTS_RESPONSE_SELECTOR_INT32)
      ? { selector: HTS_RESPONSE_SELECTOR_INT32, type: 'int32' as const }
      : null;

  if (htsMatch) {
    try {
      const decoded = ethers.AbiCoder.defaultAbiCoder().decode(
        [htsMatch.type],
        `0x${hex.slice(10)}`,
      );
      const htsCode = Number(decoded[0]);
      const codeName = HTS_RESPONSE_CODES[htsCode] ?? `HTS_CODE_${htsCode}`;
      return {
        name: 'HTSPrecompileError',
        args: { code: htsCode, reason: codeName },
        selector: htsMatch.selector,
      };
    } catch {
      // Could not decode as HTS error
    }
  }

  // 4. Custom errors via ABI
  if (abis && abis.length > 0) {
    const iface = new ethers.Interface(abis);
    try {
      const parsed = iface.parseError(hex);
      if (parsed) {
        const args: Record<string, unknown> = {};
        for (let i = 0; i < parsed.fragment.inputs.length; i++) {
          args[parsed.fragment.inputs[i].name || `arg${i}`] =
            String(parsed.args[i]);
        }
        return {
          name: parsed.name,
          args,
          selector: parsed.selector,
        };
      }
    } catch {
      // ABI does not match
    }
  }

  // 5. Raw hex fallback
  return hex.length > 10
    ? { name: 'UnknownError', args: { data: hex }, selector: hex.slice(0, 10) }
    : undefined;
}

/**
 * Formats a decoded error into a human-readable message string.
 */
export function formatRevertMessage(
  decoded: DecodedError | string | undefined,
): string | undefined {
  if (typeof decoded === 'string') return decoded;
  if (!decoded?.name) return undefined;
  return `${decoded.name}(${Object.entries(decoded.args).map(([k, v]) => `${k}=${v}`).join(', ')})`;
}
