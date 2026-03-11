export class PipelineError extends Error {
  readonly step: string;
  readonly command: string;
  readonly context: Record<string, unknown>;

  constructor(opts: {
    message: string;
    cause?: unknown;
    step: string;
    command: string;
    context?: Record<string, unknown>;
  }) {
    super(opts.message, { cause: opts.cause });
    this.name = 'PipelineError';
    this.step = opts.step;
    this.command = opts.command;
    this.context = opts.context ?? {};
  }
}
