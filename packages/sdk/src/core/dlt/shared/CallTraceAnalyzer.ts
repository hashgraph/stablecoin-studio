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
import type { ContractCall, RawLog } from './TransactionDiagnostics.js';
import type { ContractErrorRegistry } from './ContractErrorRegistry.js';

// ── Known contract roles ─────────────────────────────────────────────────────

/** Well-known Hedera system contracts. */
const SYSTEM_CONTRACTS: Record<string, string> = {
  '0x0000000000000000000000000000000000000167': 'HTS Precompile',
  '0x0000000000000000000000000000000000000168': 'Exchange Rate Precompile',
  '0x0000000000000000000000000000000000000169': 'PRNG Precompile',
};

/** Known function selectors with human-readable names. */
const KNOWN_SELECTORS: Record<string, string> = {
  // HTS precompile
  '0x0fb65bf3': 'createFungibleToken',
  '0x52f91387': 'freezeToken',
  '0x5b8f8584': 'unfreezeToken',
  '0x49146bde': 'mintToken',
  '0xacb9cff9': 'burnToken',
  '0x9790686d': 'wipeTokenAccount',
  '0x2ccb1b30': 'grantTokenKyc',
  '0x19f37361': 'revokeTokenKyc',
  '0x7c41ad2c': 'pauseToken',
  '0x3b3bff0f': 'unpauseToken',
  '0x63971e1c': 'cryptoTransfer',
  '0x15dacbea': 'transferToken',
  // Resolver
  '0xb9ec2620': 'getAddress (resolver)',
  '0xc595992a': 'setProxyConfig',
  // Common facet methods
  '0x675badf7': 'initialize',
  '0xa002aee3': 'createStableCoin',
};

// ── Types ────────────────────────────────────────────────────────────────────

/** A contract call enriched with resolved names and decoded function/error. */
export interface EnrichedCall {
  /** Nesting depth (0 = top-level) */
  depth: number;
  /** CALL, DELEGATECALL, STATICCALL, CREATE */
  callType: string;
  /** Source address */
  from: string;
  /** Source role name (if resolved) */
  fromName?: string;
  /** Target address */
  to: string;
  /** Target role name (if resolved) */
  toName?: string;
  /** Decoded function name (if recognized) */
  functionName?: string;
  /** Decoded function arguments as "name=value" strings */
  functionArgs?: string[];
  /** Raw 4-byte selector */
  selector?: string;
  /** Whether this call reverted */
  reverted: boolean;
  /** Decoded error (if reverted and decodable) */
  errorName?: string;
  /** Raw error data */
  errorData?: string;
  /** Gas used */
  gasUsed?: number;
  /** Sub-calls (for tree rendering) */
  children: EnrichedCall[];
}

/** Map of EVM address → human-readable role name. */
export type ContractNameMap = Record<string, string>;

// ── Analyzer ─────────────────────────────────────────────────────────────────

/**
 * CallTraceAnalyzer — takes raw mirror node actions or nested call traces
 * and produces an enriched, human-readable call tree.
 *
 * Features:
 * - Resolves contract addresses to role names (Proxy, Factory, Resolver, Facets, HTS Precompile)
 * - Decodes function selectors to human-readable names
 * - Decodes revert reasons using ContractErrorRegistry
 * - Builds a nested tree from flat mirror node actions
 * - Formats the tree as a readable string for logging
 *
 * Opt-in — not used by default. Enable via OrchestratorConfig.tracing.
 *
 * @example
 *   const analyzer = new CallTraceAnalyzer({
 *     contractNames: {
 *       '0x4f06...': 'Stablecoin Proxy',
 *       '0xa565...': 'Token Manager Facet',
 *     },
 *     errorRegistry: ContractErrorRegistry.fromArtifacts(path),
 *     functionAbis: ['function mint(address,int64)', 'function burn(int64)'],
 *   });
 *
 *   const enriched = analyzer.analyzeActions(mirrorNodeActions);
 *   console.log(analyzer.formatTree(enriched));
 */
export class CallTraceAnalyzer {
  private readonly names: ContractNameMap;
  private readonly errorRegistry?: ContractErrorRegistry;
  private readonly functionIface?: ethers.Interface;
  private readonly eventIface?: ethers.Interface;

  constructor(options: {
    /** Map of EVM address → role name */
    contractNames?: ContractNameMap;
    /** Registry for decoding custom errors */
    errorRegistry?: ContractErrorRegistry;
    /** Human-readable function ABIs (e.g. 'function mint(address,int64)') */
    functionAbis?: string[];
    /** Path to Hardhat artifacts dir — loads ALL function/event ABIs including tuple types */
    artifactsPath?: string;
  } = {}) {
    this.names = { ...SYSTEM_CONTRACTS, ...(options.contractNames ?? {}) };
    this.errorRegistry = options.errorRegistry;

    // Load ABIs from artifacts (JSON format with full tuple support)
    if (options.artifactsPath) {
      const { functions, events } = CallTraceAnalyzer.loadAbisFromArtifacts(options.artifactsPath);
      this.functionIface = functions.length > 0 ? new ethers.Interface(functions) : undefined;
      this.eventIface = events.length > 0 ? new ethers.Interface(events) : undefined;
    } else if (options.functionAbis && options.functionAbis.length > 0) {
      this.functionIface = new ethers.Interface(options.functionAbis);
    }
  }

  /** Load all function and event ABI entries (JSON format) from Hardhat artifacts. */
  private static loadAbisFromArtifacts(artifactsPath: string): {
    functions: object[];
    events: object[];
  } {
    // Dynamic require — only available in Node.js environments.
    let fs: any, path: any;
    try {
      fs = typeof require !== 'undefined' ? require('fs') : undefined;
      path = typeof require !== 'undefined' ? require('path') : undefined;
    } catch {
      return { functions: [], events: [] };
    }
    if (!fs || !path) return { functions: [], events: [] };
    const functions: object[] = [];
    const events: object[] = [];

    function scan(dir: string): void {
      for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
        const fp = path.join(dir, entry.name);
        if (entry.isDirectory()) {
          scan(fp);
        } else if (entry.name.endsWith('.json') && !entry.name.endsWith('.dbg.json')) {
          try {
            const artifact = JSON.parse(fs.readFileSync(fp, 'utf-8'));
            for (const item of artifact.abi || []) {
              if (item.type === 'function') functions.push(item);
              else if (item.type === 'event') events.push(item);
            }
          } catch {
            // Skip malformed artifacts
          }
        }
      }
    }
    scan(artifactsPath);
    return { functions, events };
  }

  /**
   * Analyze a flat list of mirror node actions into an enriched tree.
   * Mirror node returns actions in order with `call_depth`.
   */
  analyzeActions(actions: ContractCall[]): EnrichedCall[] {
    // Build tree from flat list using depth
    const roots: EnrichedCall[] = [];
    const stack: EnrichedCall[] = [];

    for (const action of actions) {
      const enriched = this.enrichCall(action);

      // Find parent by depth
      while (stack.length > 0 && stack[stack.length - 1].depth >= enriched.depth) {
        stack.pop();
      }

      if (stack.length > 0) {
        stack[stack.length - 1].children.push(enriched);
      } else {
        roots.push(enriched);
      }
      stack.push(enriched);
    }

    return roots;
  }

  /**
   * Format an enriched call tree as a readable string.
   *
   * Output example:
   *   [0] CALL → Stablecoin Proxy | mint(address,int64) | 119,234 gas
   *     [1] STATICCALL → Resolver Proxy | getAddress | 3,456 gas
   *       [2] DELEGATECALL → Resolver Impl | getAddress | 2,100 gas
   *     [1] DELEGATECALL → Supplier Admin Facet | mint | 98,563 gas
   *       [2] CALL → HTS Precompile | mintToken | 45,000 gas
   */
  formatTree(calls: EnrichedCall[], indent = ''): string {
    const lines: string[] = [];

    for (const call of calls) {
      const parts: string[] = [];

      // Depth and call type
      parts.push(`[${call.depth}] ${call.callType}`);

      // Target
      const target = call.toName ?? this.shortAddr(call.to);
      parts.push(`→ ${target}`);

      // Function with decoded args
      if (call.functionName) {
        const argStr = call.functionArgs?.length
          ? `(${call.functionArgs.join(', ')})`
          : '';
        parts.push(`| ${call.functionName}${argStr}`);
      } else if (call.selector) {
        parts.push(`| ${call.selector}`);
      }

      // Gas
      if (call.gasUsed !== undefined) {
        parts.push(`| ${call.gasUsed.toLocaleString()} gas`);
      }

      // Error
      if (call.reverted) {
        const errMsg = call.errorName ?? call.errorData ?? 'REVERTED';
        parts.push(`| ✗ ${errMsg}`);
      }

      lines.push(indent + parts.join(' '));

      // Recurse into children
      if (call.children.length > 0) {
        lines.push(this.formatTree(call.children, indent + '  '));
      }
    }

    return lines.join('\n');
  }

  /**
   * Decode raw event logs into human-readable strings.
   * Returns one string per decoded log, e.g.:
   *   "RoleGranted(role=burn, account=0x43A2…2a36, sender=0xc3D6…1Cd8)"
   */
  decodeLogs(logs: RawLog[]): string[] {
    if (!this.eventIface || logs.length === 0) return [];

    const decoded: string[] = [];
    for (const log of logs) {
      try {
        const parsed = this.eventIface.parseLog({
          topics: log.topics,
          data: log.data,
        });
        if (!parsed) continue;

        const args = parsed.fragment.inputs.map((inp, i) => {
          const name = inp.name || `arg${i}`;
          const val = parsed.args[i];
          return `${name}=${this.formatArgValue(val)}`;
        }).join(', ');

        const emitter = this.resolveName(log.address.toLowerCase())
          ?? this.shortAddr(log.address);
        decoded.push(`${emitter}: ${parsed.name}(${args})`);
      } catch {
        // Unknown event — skip
      }
    }
    return decoded;
  }

  // ── Private ──────────────────────────────────────────────────────────────

  private enrichCall(action: ContractCall): EnrichedCall {
    const fromAddr = this.normalizeAddress(action.from);
    const toAddr = this.normalizeAddress(action.to);
    const selector = action.input?.length >= 10 ? action.input.slice(0, 10) : undefined;
    const decoded = this.resolveFunction(selector, action.input);

    return {
      depth: action.depth,
      callType: action.callType,
      from: fromAddr,
      fromName: this.resolveName(fromAddr),
      to: toAddr,
      toName: this.resolveName(toAddr),
      functionName: decoded?.name,
      functionArgs: decoded?.args,
      selector,
      reverted: !!action.error,
      errorName: action.error ? this.resolveError(action.error) : undefined,
      errorData: action.error,
      gasUsed: action.gasUsed,
      children: [],
    };
  }

  private resolveName(address: string): string | undefined {
    // Check exact match
    const lower = address.toLowerCase();
    for (const [addr, name] of Object.entries(this.names)) {
      if (addr.toLowerCase() === lower) return name;
    }
    return undefined;
  }

  private resolveFunction(
    selector?: string,
    input?: string,
  ): { name: string; args?: string[] } | undefined {
    if (!selector) return undefined;

    // Try to decode with function ABIs first (gives us params)
    if (this.functionIface && input) {
      try {
        const parsed = this.functionIface.parseTransaction({ data: input });
        if (parsed) {
          const args = parsed.fragment.inputs.map((inp, i) => {
            const name = inp.name || `arg${i}`;
            const val = parsed.args[i];
            return `${name}=${this.formatArgValue(val)}`;
          });
          return { name: parsed.name, args };
        }
      } catch {
        // Not in our ABI — fall through to known selectors
      }
    }

    // Check known selectors (no param decoding)
    if (KNOWN_SELECTORS[selector]) return { name: KNOWN_SELECTORS[selector] };

    return undefined;
  }

  /** Format a decoded argument value for display. */
  private formatArgValue(val: unknown): string {
    if (val === null || val === undefined) return 'null';

    // Address — shorten
    if (typeof val === 'string' && val.startsWith('0x') && val.length === 42) {
      return this.shortAddr(val);
    }

    // Bytes32 or long hex — shorten
    if (typeof val === 'string' && val.startsWith('0x') && val.length > 20) {
      return val.slice(0, 10) + '…';
    }

    // BigInt
    if (typeof val === 'bigint') return val.toString();

    // Arrays / tuples — recurse
    if (Array.isArray(val)) {
      if (val.length > 3) return `[${val.length} items]`;
      return `[${val.map((v) => this.formatArgValue(v)).join(', ')}]`;
    }

    return String(val);
  }

  private resolveError(errorData: string): string | undefined {
    if (!errorData) return undefined;

    // Try error registry first
    if (this.errorRegistry) {
      const decoded = this.errorRegistry.decode(errorData);
      if (decoded) {
        const args = Object.entries(decoded.args)
          .map(([k, v]) => `${k}=${v}`)
          .join(', ');
        return args ? `${decoded.name}(${args})` : decoded.name;
      }
    }

    // Check if it's an ASCII Hedera error (e.g., hex of "INVALID_OPERATION")
    if (errorData.startsWith('0x') && errorData.length > 2) {
      try {
        const ascii = Buffer.from(errorData.slice(2), 'hex').toString('ascii');
        if (/^[A-Z_]+$/.test(ascii)) return ascii;
      } catch {
        // Not ASCII
      }
    }

    return undefined;
  }

  private normalizeAddress(addr: string): string {
    if (!addr) return '';
    // Hedera format 0.0.XXXX → convert to EVM if possible
    if (addr.startsWith('0.0.')) {
      try {
        const num = parseInt(addr.split('.')[2], 10);
        return '0x' + num.toString(16).padStart(40, '0');
      } catch {
        return addr;
      }
    }
    return addr.toLowerCase();
  }

  private shortAddr(addr: string): string {
    if (addr.length <= 12) return addr;
    return addr.slice(0, 6) + '…' + addr.slice(-4);
  }
}
