import { Client } from '@hiero-ledger/sdk';
import { BasePipeline } from './BasePipeline.js';
import { BuildHederaStep } from './steps/BuildHederaStep.js';
import { SerializeHederaStep } from './steps/SerializeHederaStep.js';
import { SignWithExternalStep, ExternalSigningClient } from './steps/SignWithExternalStep.js';
import { SubmitSignedHederaTransactionStep } from './steps/SubmitSignedHederaTransactionStep.js';
import { ParseHederaReceiptStep } from './steps/ParseHederaReceiptStep.js';
import { AnalyzeStep } from './steps/AnalyzeStep.js';

export class HederaSerializePipeline extends BasePipeline {
  constructor(client: Client, externalClient: ExternalSigningClient) {
    super([
      new BuildHederaStep(),
      new SerializeHederaStep(client),
      new SignWithExternalStep(externalClient),
      new SubmitSignedHederaTransactionStep(client),
      new ParseHederaReceiptStep(client),
      new AnalyzeStep(),
    ]);
  }
}
