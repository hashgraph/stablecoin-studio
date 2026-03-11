import { PipelineContext } from '../types/PipelineContext.js';
import { PipelineStep } from './PipelineStep.js';
import { PipelineError } from '../errors/PipelineError.js';

export interface PipelineErrorHandler {
  handle(
    error: unknown,
    step: PipelineStep,
    context: PipelineContext
  ): Promise<PipelineContext>;
}

export class DefaultPipelineErrorHandler implements PipelineErrorHandler {
  constructor(
    private maxRetries: number = 2,
    private retryableStepNames: Set<string> = new Set([
      'SubmitToHedera', 'SubmitToRPC'
    ])
  ) {}

  async handle(
    error: unknown,
    step: PipelineStep,
    context: PipelineContext
  ): Promise<PipelineContext> {
    const wrappedError = new PipelineError({
      message: `Failed at step '${step.name}' during '${context.command}'`,
      cause: error,
      step: step.name,
      command: context.command,
      context: { hasTransaction: !!context.transaction },
    });

    if (this.isRetryable(error, step)) {
      return this.retryStep(step, context);
    }

    throw wrappedError;
  }

  private isRetryable(error: unknown, step: PipelineStep): boolean {
    if (!this.retryableStepNames.has(step.name)) return false;
    return error instanceof Error && (
      error.message.includes('UNAVAILABLE') ||
      error.message.includes('BUSY') ||
      error.message.includes('timeout')
    );
  }

  private async retryStep(
    step: PipelineStep,
    context: PipelineContext,
    attempt: number = 1
  ): Promise<PipelineContext> {
    if (attempt > this.maxRetries) {
      throw new PipelineError({
        message: `Max retries (${this.maxRetries}) exceeded at step '${step.name}'`,
        step: step.name,
        command: context.command,
      });
    }

    await new Promise(r => setTimeout(r, 500 * attempt));

    try {
      return await step.execute(context);
    } catch (retryError) {
      return this.retryStep(step, context, attempt + 1);
    }
  }
}
