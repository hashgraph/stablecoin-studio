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
