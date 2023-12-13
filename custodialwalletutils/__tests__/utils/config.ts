import fs from 'fs';
import path from 'path';
import { config } from 'dotenv';
import { FireblocksStrategy } from '../../src/strategies/signature/FireblocksStrategy.js';
import {
  DFNSConfig,
  FireblocksConfig,
} from '../../src/strategies/StrategyConfig.js';
import { DFNSStrategy } from '../../src/strategies/signature/DFNSStrategy.js';

config();

export const TEST_TIMEOUT = 10000;

// Fireblocks parameters

export const FIREBLOCKS_API_SECRET_KEY = fs.readFileSync(
  path.resolve(process.env.FIREBLOCKS_API_SECRET_PATH!),
  'utf8',
);
export const FIREBLOCKS_API_KEY = process.env.FIREBLOCKS_API_KEY ?? '';
export const FIREBLOCKS_BASE_URL = process.env.FIREBLOCKS_BASE_URL ?? '';
export const FIREBLOCKS_VAULT = process.env.FIREBLOCKS_VAULT ?? '';
export const FIREBLOCKS_ACCOUNT_ID = process.env.FIREBLOCKS_ACCOUNT_ID;

// Fireblocks configuration

export const fireblocksConfig = new FireblocksConfig(
  FIREBLOCKS_API_KEY,
  FIREBLOCKS_API_SECRET_KEY,
  FIREBLOCKS_BASE_URL,
);

// DFNS parameters
export const DFNS_SERVICE_ACCOUNT_PRIVATE_KEY = fs.readFileSync(
  path.resolve(process.env.DFNS_SERVICE_ACCOUNT_PRIVATE_KEY_PATH!),
  'utf8',
);
export const DFNS_SERVICE_ACCOUNT_CREDENTIAL_ID =
  process.env.DFNS_SERVICE_ACCOUNT_CREDENTIAL_ID ?? '';
export const DFNS_SERVICE_ACCOUNT_AUTHORIZATION_TOKEN = fs.readFileSync(
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
  DFNS_APP_ORIGIN,
  DFNS_APP_ID,
  DFNS_SERVICE_ACCOUNT_AUTHORIZATION_TOKEN,
  DFNS_TEST_URL,
);
