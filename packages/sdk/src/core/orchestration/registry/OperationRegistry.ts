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

import { getRegisteredOperations } from '../../decorator/OperationDecorator.js';
import { OPERATION_CONFIGS } from '../../operations/config/operations.js';
import { ConfigDrivenOperation } from '../../operations/ConfigDrivenOperation.js';
import { BaseRegistry } from './BaseRegistry.js';
import type { TransactionBuilder } from '../../types/ExecutionContext.js';
// Side-effect imports: trigger @Operation decorators so classes register themselves
import '../../operations/CreateStableCoinOperation.js';
import '../../operations/UpdateTokenOperation.js';
import '../../operations/UpdateCustomFeesOperation.js';
import '../../operations/CreateHoldByControllerOperation.js';
import '../../operations/MultiRoleOperations.js';
import '../../operations/HoldOperations.js';

export class OperationRegistry extends BaseRegistry<TransactionBuilder> {
  constructor() {
    super();
    // Config-driven operations (27 standard operations)
    for (const config of OPERATION_CONFIGS) {
      this.items.set(config.name, new ConfigDrivenOperation(config));
    }
    // Decorator-driven operations (CreateStableCoinOperation, etc.)
    for (const [name, OperationClass] of getRegisteredOperations()) {
      this.items.set(name, new OperationClass());
    }
  }
}
