import { Client } from '@hiero-ledger/sdk';
import { BasePipeline } from './BasePipeline.js';
import { BuildHederaStep } from './steps/BuildHederaStep.js';
import { SignWithClientStep } from './steps/SignWithClientStep.js';
import { SubmitToHederaStep } from './steps/SubmitToHederaStep.js';
import { ParseHederaReceiptStep } from './steps/ParseHederaReceiptStep.js';
import { AnalyzeStep } from './steps/AnalyzeStep.js';

export class HederaExecutePipeline extends BasePipeline {
  constructor(client: Client) {
    super([
      new BuildHederaStep(),
      new SignWithClientStep(client),
      new SubmitToHederaStep(client),
      new ParseHederaReceiptStep(client),
      new AnalyzeStep(),
    ]);
  }
}
