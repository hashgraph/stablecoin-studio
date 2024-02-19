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

import fs from 'fs';
import path from 'path';
import { config } from 'dotenv';
import { DFNSConfig, FireblocksConfig } from '../../src';

config();

export const TEST_TIMEOUT = 10000;

// Fireblocks configuration
export const fireblocksConfig = new FireblocksConfig(
  process.env.FIREBLOCKS_API_KEY ?? '',
  fs.readFileSync(
    path.resolve(process.env.FIREBLOCKS_API_SECRET_KEY_PATH!),
    'utf8',
  ),
  process.env.FIREBLOCKS_BASE_URL ?? '',
  process.env.FIREBLOCKS_VAULT_ACCOUNT_ID ?? '',
  process.env.FIREBLOCKS_ASSET_ID ?? '',
);

// DFNS configuration
export const dfnsConfig = new DFNSConfig(
  fs.readFileSync(
    path.resolve(process.env.DFNS_SERVICE_ACCOUNT_PRIVATE_KEY_PATH!),
    'utf8',
  ),
  process.env.DFNS_SERVICE_ACCOUNT_CREDENTIAL_ID ?? '',
  process.env.DFNS_SERVICE_ACCOUNT_AUTHORIZATION_TOKEN ?? '',
  process.env.DFNS_APP_ORIGIN ?? '',
  process.env.DFNS_APP_ID ?? '',
  process.env.DFNS_BASE_URL ?? '',
  process.env.DFNS_WALLET_ID ?? '',
);
