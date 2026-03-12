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
