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

import { ExecutionContext } from '../../types/ExecutionContext.js';
import { ExecutionStep } from './ExecutionStep.js';
import { ExecutionErrorHandler, DefaultExecutionErrorHandler } from './ExecutionErrorHandler.js';
import { PipelineError } from '../../errors/PipelineError.js';
import { TransactionDiagnostics } from '../shared/TransactionDiagnostics.js';
import type { CallTraceAnalyzer } from '../shared/CallTraceAnalyzer.js';
import { logger } from '../../Logger.js';

/**
 * DiagnosticErrorHandler — decorator that enriches pipeline errors
 * with diagnostic information.
 *
 * When a transaction fails (in submit/parse steps), it queries the
 * appropriate TransactionDiagnostics (mirror node or eth) to obtain
 * the full call trace and decode the revert reason.
 *
 * When a CallTraceAnalyzer is provided (opt-in via tracing config),
 * the raw call trace is enriched with contract names, decoded function
 * selectors, and decoded custom errors, and a formatted tree is logged.
 *
 * Used as a wrapper:
 *   new DiagnosticErrorHandler(diagnostics, inner, abis, analyzer)
 */
export class DiagnosticErrorHandler implements ExecutionErrorHandler {
  /** Steps where diagnostics are meaningful (post-submit) */
  private static readonly DIAGNOSTIC_STEPS = new Set([
    'SubmitToHedera',
    'SubmitToRPC',
    'SubmitSignedHederaTransaction',
    'SubmitSignedEVMTransaction',
    'ParseHederaReceipt',
    'ParseEVMReceipt',
  ]);

  constructor(
    private readonly diagnostics: TransactionDiagnostics,
    private readonly inner: ExecutionErrorHandler = new DefaultExecutionErrorHandler(),
    private readonly abis?: string[],
    private readonly callTraceAnalyzer?: CallTraceAnalyzer,
  ) {}

  async handle(
    error: unknown,
    step: ExecutionStep,
    context: ExecutionContext,
  ): Promise<ExecutionContext> {
    // First try the inner handler (it may retry and succeed)
    try {
      return await this.inner.handle(error, step, context);
    } catch (handlerError: unknown) {
      // If the inner handler could not resolve, enrich with diagnostics
      if (
        handlerError instanceof PipelineError &&
        DiagnosticErrorHandler.DIAGNOSTIC_STEPS.has(step.name)
      ) {
        await this.enrichWithDiagnostics(handlerError, context);
      }
      throw handlerError;
    }
  }

  private async enrichWithDiagnostics(
    error: PipelineError,
    context: ExecutionContext,
  ): Promise<void> {
    // We need a transactionId. It may come from the context or the original error.
    const transactionId = this.extractTransactionId(context, error);
    const contractAddress = (context.params?.contractAddress as string) ?? '';

    if (!transactionId && !contractAddress) return;

    logger.error(`  diagnostic: contract=${contractAddress}${transactionId ? ` txId=${transactionId}` : ''}`);

    try {
      const report = await this.diagnostics.diagnose(
        transactionId ?? '',
        contractAddress,
        this.abis,
      );

      error.diagnostics = report;

      // Enrich the message with the decoded revert reason
      if (report.revertMessage) {
        logger.error(`  revert: ${report.revertMessage}`);
        error.message = `${error.message}\n  Revert reason: ${report.revertMessage}`;
      }

      // Enrich call trace with contract names and decoded selectors (opt-in)
      if (report.callTrace.length > 0) {
        error.context.callTrace = report.callTrace;

        if (this.callTraceAnalyzer) {
          const enriched = this.callTraceAnalyzer.analyzeActions(report.callTrace);
          const formatted = this.callTraceAnalyzer.formatTree(enriched);
          report.formattedCallTrace = formatted;
          logger.error(`  call trace:\n${formatted}`);
        }
      }

      // Decode event logs (opt-in)
      if (this.callTraceAnalyzer && report.logs && report.logs.length > 0) {
        const decodedEvents = this.callTraceAnalyzer.decodeLogs(report.logs);
        if (decodedEvents.length > 0) {
          const eventsStr = decodedEvents.map((e) => `    ${e}`).join('\n');
          report.formattedCallTrace = (report.formattedCallTrace ?? '')
            + `\n  events:\n${eventsStr}`;
          logger.error(`  events:\n${eventsStr}`);
        }
      }

      // Populate HTS-specific fields when available
      if (report.decodedError?.name === 'HTSPrecompileError') {
        error.htsCode = report.decodedError.args.code as number;
        error.htsResponseCode = report.decodedError.args.reason as string;
      }
    } catch {
      // Diagnostics are best-effort — must not prevent the original error from propagating
    }
  }

  private extractTransactionId(
    context: ExecutionContext,
    error: PipelineError,
  ): string | undefined {
    // From the Hedera response
    if (context.response?.transactionId) {
      return String(context.response.transactionId);
    }
    // From the receipt if it exists
    if (context.receipt?.transactionId) {
      return String(context.receipt.transactionId);
    }
    // From the original error
    const cause = error.cause;
    if (cause && typeof cause === 'object' && 'transactionId' in cause) {
      return String((cause as Record<string, unknown>).transactionId);
    }
    return undefined;
  }
}
