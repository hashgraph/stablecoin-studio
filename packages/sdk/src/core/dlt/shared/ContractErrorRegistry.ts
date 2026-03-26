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

/**
 * Registry of all known custom error signatures from contract ABIs.
 *
 * Loads error definitions from Hardhat artifact JSON files and builds
 * a selector-to-error map for instant decoding. This covers all 55+
 * custom errors defined across stablecoin facets (SupplierAdmin, Freezable,
 * Roles, TokenManager, Factory, Reserve, HoldManagement, etc.).
 *
 * Usage:
 *   const registry = ContractErrorRegistry.fromArtifacts(artifactsPath);
 *   const decoded = registry.decode('0x2079ef14000...');
 *
 * Or with pre-built ABI strings:
 *   const registry = ContractErrorRegistry.fromAbis(abiStrings);
 */
export class ContractErrorRegistry {
  private readonly iface: ethers.Interface;
  private readonly errorCount: number;

  private constructor(abis: string[]) {
    this.iface = new ethers.Interface(abis);
    this.errorCount = abis.filter(a => a.includes('error ')).length;
  }

  /**
   * Create a registry from an array of ABI strings.
   * Each string should be a human-readable ABI fragment like:
   *   'error BurnableAmountExceeded(int64)'
   */
  static fromAbis(abis: string[]): ContractErrorRegistry {
    return new ContractErrorRegistry(abis);
  }

  /**
   * Create a registry by scanning Hardhat artifact JSON files.
   * Extracts all `type: 'error'` entries from every artifact ABI.
   *
   * @param artifactsPath - Path to `contracts/artifacts/contracts/`
   */
  static fromArtifacts(artifactsPath: string): ContractErrorRegistry {
    // Dynamic require — only available in Node.js environments.
    // Wrapped in try/catch so browser builds don't crash at import time.
    let fs: any, path: any;
    try {
      fs = typeof require !== 'undefined' ? require('fs') : undefined;
      path = typeof require !== 'undefined' ? require('path') : undefined;
    } catch {
      throw new Error('fromArtifacts() requires Node.js (fs module). Use fromAbis() in browser environments.');
    }
    if (!fs || !path) {
      throw new Error('fromArtifacts() requires Node.js (fs module). Use fromAbis() in browser environments.');
    }

    const abis: string[] = [];

    function scan(dir: string): void {
      for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
        const fp = path.join(dir, entry.name);
        if (entry.isDirectory()) {
          scan(fp);
        } else if (entry.name.endsWith('.json') && !entry.name.endsWith('.dbg.json')) {
          try {
            const artifact = JSON.parse(fs.readFileSync(fp, 'utf-8'));
            const errors = (artifact.abi || []).filter(
              (e: { type: string }) => e.type === 'error',
            );
            for (const err of errors) {
              const inputs = (err.inputs || [])
                .map((i: { type: string }) => i.type)
                .join(',');
              abis.push(`error ${err.name}(${inputs})`);
            }
          } catch {
            // Skip malformed artifacts
          }
        }
      }
    }

    scan(artifactsPath);

    // Deduplicate (same error can appear in multiple facets)
    const unique = [...new Set(abis)];
    return new ContractErrorRegistry(unique);
  }

  /**
   * Decode a raw hex revert reason using the registered error ABIs.
   * Returns undefined if the selector is not recognized.
   */
  decode(rawHex: string): DecodedError | undefined {
    const hex = rawHex.startsWith('0x') ? rawHex : `0x${rawHex}`;
    if (hex.length < 10) return undefined;

    try {
      const parsed = this.iface.parseError(hex);
      if (!parsed) return undefined;

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
    } catch {
      return undefined;
    }
  }

  /**
   * Get all registered error ABI strings (for passing to decodeRevertReason).
   */
  getAbis(): string[] {
    return this.iface.formatJson()
      ? this.iface.format()
          .filter((f: string) => f.startsWith('error '))
      : [];
  }

  /** Number of registered error signatures. */
  get size(): number {
    return this.errorCount;
  }
}
