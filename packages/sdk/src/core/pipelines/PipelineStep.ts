import { PipelineContext } from '../types/PipelineContext.js';

export interface PipelineStep {
  readonly name: string;
  execute(context: PipelineContext): Promise<PipelineContext>;
}
