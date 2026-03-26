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

import { ExecutionContext, OperationOutcome, TransactionBuilder } from '../types/ExecutionContext.js';
import { PipelineExecutor } from '../dlt/base/PipelineExecutor.js';
import {
  DefaultExecutionErrorHandler,
  ExecutionErrorHandler,
} from '../dlt/base/ExecutionErrorHandler.js';
import { DiagnosticErrorHandler } from '../dlt/base/DiagnosticErrorHandler.js';
import { MirrorNodeDiagnostics } from '../dlt/hedera/MirrorNodeDiagnostics.js';
import { EVMDiagnostics } from '../dlt/evm/EVMDiagnostics.js';
import { buildPipeline } from '../dlt/buildPipeline.js';
import { OperationRegistry } from './registry/OperationRegistry.js';
import { ContractQueryRegistry } from './registry/ContractQueryRegistry.js';
import {
  NetworkEndpoints,
  resolveNetwork,
} from '../config/HederaNetwork.js';
import {
  isHederaSigning,
  isEVMSigning,
} from '../config/SigningConfig.js';
import {
  resolveSigningConfig,
  ResolvedSigningConfig,
} from '../config/resolveSigningConfig.js';
import type { NetworkConfig } from '../config/HederaNetwork.js';
import type { SigningConfig } from '../config/SigningConfig.js';
import { CallTraceAnalyzer } from '../dlt/shared/CallTraceAnalyzer.js';
import { ContractErrorRegistry } from '../dlt/shared/ContractErrorRegistry.js';
import { logger } from '../Logger.js';
import { ethers } from 'ethers';
import type { QueryResult } from '../operations/types.js';

// ── Config ───────────────────────────────────────────────────────────────────

/**
 * Opt-in tracing configuration for enriched call traces.
 * When enabled, failed transactions include a human-readable call tree
 * with resolved contract names, decoded function selectors, and decoded errors.
 */
export interface TracingConfig {
  /** Path to Hardhat artifacts dir (e.g. 'contracts/artifacts/contracts/') for loading all custom errors. */
  artifactsPath?: string;
  /** Pre-built error ABI strings (alternative to artifactsPath). */
  errorAbis?: string[];
  /** Map of EVM address → human-readable name (e.g. { '0x4f06...': 'Stablecoin Proxy' }). */
  contractNames?: Record<string, string>;
  /** Additional function ABI strings for decoding selectors beyond the built-in set. */
  functionAbis?: string[];
}

/**
 * Everything the orchestrator needs — network, signing, and options.
 *
 * @example
 *   // Minimal — Hedera testnet with operator key
 *   { network: 'testnet', signing: { type: 'client', client } }
 *
 *   // EVM with MetaMask
 *   { network: 'testnet', signing: { type: 'signer', signer, provider } }
 *
 *   // With tracing (opt-in)
 *   {
 *     network: 'testnet',
 *     signing: { type: 'client', client },
 *     tracing: {
 *       artifactsPath: 'contracts/artifacts/contracts/',
 *       contractNames: { '0x4f06...': 'Stablecoin Proxy' },
 *     },
 *   }
 */
export interface OrchestratorConfig {
  network: NetworkConfig;
  signing: SigningConfig;
  /** Enable transaction diagnostics on failure (mirror node / eth_call). Default: true. */
  diagnostics?: boolean;
  /** Opt-in: enriched call traces with contract names, decoded selectors, and all custom errors. */
  tracing?: TracingConfig;
}

// ── Orchestrator ─────────────────────────────────────────────────────────────

/**
 * TransactionOrchestrator — resolves an operation by name, builds the
 * execution pipeline from the signing config, and runs it.
 *
 * The pipeline (steps) is determined entirely by `signing.type`:
 *   - 'client'          → Build → Sign → Submit → Parse → Extract  (Hedera native)
 *   - 'signer'          → Build → Sign → Submit → Parse → Extract  (EVM)
 *   - 'custodial'       → Build → Serialize → Sign → Submit → Parse → Extract  (Fireblocks/DFNS/KMS)
 *   - 'hedera-external' → Build → Serialize → ReturnBytes  (consumer signs & submits)
 *   - 'evm-external'    → Build → Serialize → ReturnBytes  (consumer signs & submits)
 *   - 'multisig'        → Build → Serialize → ReturnBytes  (backend handles the rest)
 *
 * Diagnostics (mirror node for Hedera, eth_call for EVM) are wired
 * automatically unless `diagnostics: false`.
 */
export class TransactionOrchestrator {
  private readonly network: NetworkEndpoints;
  private readonly signing: ResolvedSigningConfig;
  private readonly operationRegistry: OperationRegistry;
  private readonly queryRegistry: ContractQueryRegistry;
  private readonly tracingComponents: { analyzer?: CallTraceAnalyzer; errorAbis?: string[] };

  constructor(private readonly config: OrchestratorConfig) {
    this.network = resolveNetwork(config.network);
    this.signing = resolveSigningConfig(config.signing, this.network);
    this.operationRegistry = new OperationRegistry();
    this.queryRegistry = new ContractQueryRegistry();
    this.tracingComponents = this.buildTracingComponents();
  }

  async execute(
    operationName: string,
    params: Record<string, unknown>,
  ): Promise<OperationOutcome> {
    const mode = isHederaSigning(this.signing) ? 'hedera' : 'evm';
    logger.info(`execute '${operationName}' (${mode})`);

    try {
      const context = this.prepareContext(operationName, params);
      const executor = this.createExecutor();
      const result = await executor.execute(context);
      logger.info(`✓ '${operationName}' ok${result.transactionId ? ` (txId=${result.transactionId})` : ''}`);

      // Opt-in: log call trace + events on success when tracing is configured
      if (this.tracingComponents.analyzer && result.transactionId) {
        await this.logSuccessTrace(result.transactionId, params, operationName);
      }

      return result;
    } catch (error) {
      logger.error(`✗ '${operationName}' failed: ${error instanceof Error ? error.message : String(error)}`);
      throw error;
    }
  }

  /**
   * Build + serialize a transaction without signing or submitting.
   * Useful for external wallets or multi-sig flows.
   */
  async serialize(
    operationName: string,
    params: Record<string, unknown>,
  ): Promise<ExecutionContext> {
    const context = this.prepareContext(operationName, params);
    const steps = buildPipeline(this.signing);
    // Run only Build + Serialize steps (by name, not position)
    const SERIALIZE_STEP_NAMES = new Set([
      'BuildHedera', 'BuildEVM', 'SerializeHedera', 'SerializeEVM',
    ]);
    const serializeSteps = steps.filter(s => SERIALIZE_STEP_NAMES.has(s.name));
    let ctx: ExecutionContext = context;
    for (const step of serializeSteps) {
      ctx = await step.execute(ctx);
    }
    return ctx;
  }

  /**
   * Execute a view/pure query against the contract.
   *
   * Queries don't go through the pipeline — they call the RPC node directly
   * via ethers.Provider. No signing, no transaction, no gas.
   */
  async executeQuery(
    queryName: string,
    params: Record<string, unknown>,
  ): Promise<QueryResult> {
    logger.info(`query '${queryName}'`);

    try {
      const query = this.queryRegistry.get(queryName);
      const provider = this.getProvider();
      const result = await query.execute(provider, params as any);
      logger.info(`✓ query '${queryName}' ok`);
      return result;
    } catch (error) {
      logger.error(`✗ query '${queryName}' failed: ${error instanceof Error ? error.message : String(error)}`);
      throw error;
    }
  }

  /**
   * Get an ethers Provider for queries.
   * Uses the JSON-RPC relay endpoint from network config.
   */
  private getProvider(): ethers.Provider {
    // If signing config already has a provider, reuse it
    if ('provider' in this.signing && this.signing.provider) {
      return this.signing.provider as ethers.Provider;
    }
    // Otherwise create one from the network RPC endpoint
    return new ethers.JsonRpcProvider(this.network.jsonRpcRelay);
  }

  private prepareContext(
    operationName: string,
    params: Record<string, unknown>,
  ): ExecutionContext {
    const builder = this.resolveBuilder(operationName);
    const mode = isHederaSigning(this.signing) ? 'hedera' : 'evm';

    if (!builder.supportsMode(mode)) {
      throw new Error(
        `Operation '${operationName}' does not support mode '${mode}'. ` +
        `Supported: ${builder.getSupportedModes().join(', ')}`,
      );
    }

    builder.validate(params);

    return { operationName, params, builder };
  }

  private resolveBuilder(operationName: string): TransactionBuilder {
    return this.operationRegistry.get(operationName) as TransactionBuilder;
  }

  private createExecutor(): PipelineExecutor {
    const steps = buildPipeline(this.signing);
    const errorHandler = this.createErrorHandler();
    return new PipelineExecutor(steps, errorHandler);
  }

  private createErrorHandler(): ExecutionErrorHandler {
    if (this.config.diagnostics === false) {
      return new DefaultExecutionErrorHandler();
    }

    const { analyzer, errorAbis } = this.tracingComponents;

    if (isHederaSigning(this.signing)) {
      const diagnostics = new MirrorNodeDiagnostics(this.network.mirrorNode);
      return new DiagnosticErrorHandler(diagnostics, new DefaultExecutionErrorHandler(), errorAbis, analyzer);
    }

    if (isEVMSigning(this.signing) && 'provider' in this.signing) {
      const diagnostics = new EVMDiagnostics(this.signing.provider);
      return new DiagnosticErrorHandler(diagnostics, new DefaultExecutionErrorHandler(), errorAbis, analyzer);
    }

    return new DefaultExecutionErrorHandler();
  }

  /** Build tracing components if configured (opt-in). Registry is loaded once. */
  private buildTracingComponents(): {
    analyzer?: CallTraceAnalyzer;
    errorAbis?: string[];
  } {
    const tracing = this.config.tracing;
    if (!tracing) return {};

    // Build error registry once — shared by both analyzer and diagnostics decoder
    let errorRegistry: ContractErrorRegistry | undefined;
    if (tracing.artifactsPath) {
      errorRegistry = ContractErrorRegistry.fromArtifacts(tracing.artifactsPath);
      logger.info(`tracing: loaded ${errorRegistry.size} custom errors from artifacts`);
    } else if (tracing.errorAbis?.length) {
      errorRegistry = ContractErrorRegistry.fromAbis(tracing.errorAbis);
    }

    const analyzer = new CallTraceAnalyzer({
      contractNames: tracing.contractNames,
      errorRegistry,
      artifactsPath: tracing.artifactsPath,
      functionAbis: tracing.functionAbis,
    });

    const errorAbis = errorRegistry?.getAbis() ?? tracing.errorAbis;

    return { analyzer, errorAbis };
  }

  /**
   * Best-effort: query mirror node for the call trace and events of a
   * successful transaction and log them via the CallTraceAnalyzer.
   * Only runs when tracing is configured — never blocks the result.
   */
  private async logSuccessTrace(
    transactionId: string,
    params: Record<string, unknown>,
    operationName: string,
  ): Promise<void> {
    try {
      const diagnostics = isHederaSigning(this.signing)
        ? new MirrorNodeDiagnostics(this.network.mirrorNode)
        : isEVMSigning(this.signing) && 'provider' in this.signing
          ? new EVMDiagnostics(this.signing.provider)
          : null;

      if (!diagnostics) return;

      const contractAddress = (params.contractAddress as string) ?? '';
      const report = await diagnostics.diagnose(
        transactionId,
        contractAddress,
        this.tracingComponents.errorAbis,
      );

      const analyzer = this.tracingComponents.analyzer!;

      if (report.callTrace.length > 0) {
        const enriched = analyzer.analyzeActions(report.callTrace);
        const formatted = analyzer.formatTree(enriched);
        logger.info(`  call trace ('${operationName}'):\n${formatted}`);
      }

      if (report.logs && report.logs.length > 0) {
        const decodedEvents = analyzer.decodeLogs(report.logs);
        if (decodedEvents.length > 0) {
          const eventsStr = decodedEvents.map((e) => `    ${e}`).join('\n');
          logger.info(`  events:\n${eventsStr}`);
        }
      }
    } catch {
      // Best-effort — never fail a successful transaction for tracing
    }
  }
}
