import { ethers } from 'ethers';
import { BasePipeline } from './BasePipeline.js';
import { BuildEVMStep } from './steps/BuildEVMStep.js';
import { SerializeEVMStep } from './steps/SerializeEVMStep.js';
import { SignWithExternalStep, ExternalSigningClient } from './steps/SignWithExternalStep.js';
import { SubmitSignedEVMTransactionStep } from './steps/SubmitSignedEVMTransactionStep.js';
import { ParseEVMReceiptStep } from './steps/ParseEVMReceiptStep.js';
import { AnalyzeStep } from './steps/AnalyzeStep.js';

export class EVMSerializePipeline extends BasePipeline {
  constructor(provider: ethers.Provider, externalClient: ExternalSigningClient) {
    super([
      new BuildEVMStep(),
      new SerializeEVMStep(),
      new SignWithExternalStep(externalClient),
      new SubmitSignedEVMTransactionStep(provider),
      new ParseEVMReceiptStep(),
      new AnalyzeStep(),
    ]);
  }
}
