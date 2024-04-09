/*
 *
 * Hedera Stablecoin CLI
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

import { IAccountConfig } from './IAccountConfig.js';
import { ILogConfig } from './ILogConfig.js';
import { INetworkConfig } from './INetworkConfig.js';
import { IFactoryConfig } from './IFactoryConfig.js';
import { IMirrorsConfig } from './IMirrorsConfig.js';
import { IRPCsConfig } from './IRPCsConfig.js';
import BackendConfig from './BackendConfig.js';

export interface IConfiguration {
  defaultNetwork?: string;
  networks?: INetworkConfig[];
  accounts?: IAccountConfig[];
  mirrors?: IMirrorsConfig[];
  rpcs?: IRPCsConfig[];
  backend?: BackendConfig;
  logs?: ILogConfig;
  factories?: IFactoryConfig[];
}
