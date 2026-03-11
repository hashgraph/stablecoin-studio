import { ethers } from 'ethers';
import { BasePipeline } from './BasePipeline.js';
import { BuildEVMStep } from './steps/BuildEVMStep.js';
import { SignWithSignerStep } from './steps/SignWithSignerStep.js';
import { SubmitToRPCStep } from './steps/SubmitToRPCStep.js';
import { ParseEVMReceiptStep } from './steps/ParseEVMReceiptStep.js';
import { AnalyzeStep } from './steps/AnalyzeStep.js';

export class EVMExecutePipeline extends BasePipeline {
  constructor(provider: ethers.Provider, signer: ethers.Signer) {
    super([
      new BuildEVMStep(),
      new SignWithSignerStep(signer),
      new SubmitToRPCStep(provider),
      new ParseEVMReceiptStep(),
      new AnalyzeStep(),
    ]);
  }
}
