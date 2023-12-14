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
import {config} from 'dotenv';
import {DFNSConfig} from '../../src/strategies/config/DFNSConfig';
import {FireblocksConfig} from '../../src/strategies/config/FireblocksConfig';

config();

export const TEST_TIMEOUT = 10000;

// Fireblocks parameters

export const FIREBLOCKS_API_SECRET_KEY = fs.readFileSync(
  path.resolve(process.env.FIREBLOCKS_API_SECRET_KEY_PATH!),
  'utf8',
);
export const FIREBLOCKS_API_KEY = process.env.FIREBLOCKS_API_KEY ?? '';
export const FIREBLOCKS_BASE_URL = process.env.FIREBLOCKS_BASE_URL ?? '';
export const FIREBLOCKS_VAULT = process.env.FIREBLOCKS_VAULT ?? '';

// Fireblocks configuration

export const fireblocksConfig = new FireblocksConfig(
  FIREBLOCKS_API_KEY,
  FIREBLOCKS_API_SECRET_KEY,
  FIREBLOCKS_BASE_URL,
  FIREBLOCKS_VAULT,
);

// DFNS parameters
export const DFNS_SERVICE_ACCOUNT_PRIVATE_KEY = process.env.DFNS_SERVICE_ACCOUNT_PRIVATE_KEY ?? fs.readFileSync(
  path.resolve(process.env.DFNS_SERVICE_ACCOUNT_PRIVATE_KEY_PATH!),
  'utf8',
);
export const DFNS_SERVICE_ACCOUNT_CREDENTIAL_ID =
  process.env.DFNS_SERVICE_ACCOUNT_CREDENTIAL_ID ?? '';
export const DFNS_SERVICE_ACCOUNT_AUTHORIZATION_TOKEN = process.env.DFNS_SERVICE_ACCOUNT_AUTHORIZATION_TOKEN ?? fs.readFileSync(
  path.resolve(process.env.DFNS_SERVICE_ACCOUNT_AUTHORIZATION_TOKEN_PATH!),
  'utf8',
);
export const DFNS_APP_ORIGIN = process.env.DFNS_APP_ORIGIN ?? '';
export const DFNS_APP_ID = process.env.DFNS_APP_ID ?? '';
export const DFNS_WALLET_ID = process.env.DFNS_WALLET_ID ?? '';
export const DFNS_TEST_URL = process.env.DFNS_TEST_URL ?? '';

// DFNS configuration

export const dfnsConfig = new DFNSConfig(
  DFNS_SERVICE_ACCOUNT_PRIVATE_KEY,
  DFNS_SERVICE_ACCOUNT_CREDENTIAL_ID,
  DFNS_SERVICE_ACCOUNT_AUTHORIZATION_TOKEN,
  DFNS_APP_ORIGIN,
  DFNS_APP_ID,
  DFNS_TEST_URL,
  DFNS_WALLET_ID,
);
