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

import { QUERY_CONFIGS } from '../../operations/config/queries.js';
import { ConfigDrivenQuery } from '../../operations/ConfigDrivenQuery.js';
import { BaseContractQuery } from '../../operations/BaseContractQuery.js';
import { BaseRegistry } from './BaseRegistry.js';
import { GetHoldQuery } from '../../operations/GetHoldQuery.js';

export class ContractQueryRegistry extends BaseRegistry<BaseContractQuery<any, any>> {
  constructor() {
    super();
    for (const config of QUERY_CONFIGS) {
      this.items.set(config.name, new ConfigDrivenQuery(config));
    }
    // Custom queries that need tuple encoding
    this.items.set('getHold', new GetHoldQuery());
  }
}
