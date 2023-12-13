import fs from 'fs';
import path from 'path';
import {
  DFNSConfig,
  FireblocksConfig,
} from '../../src/strategies/StrategyConfig';
import { FireblocksSignatureRequest } from '../../src/models/signature/FireblocksSignatureRequest';
import { FireblocksStrategy } from '../../src/strategies/signature/FireblocksStrategy';
import { config } from 'dotenv';
import { DFNSSignatureRequest } from '../../src/index.js';
import { DFNSStrategy } from '../../src/strategies/signature/DFNSStrategy.js';

config();

// Fireblocks parameters

const FIREBLOCKS_API_SECRET_KEY = fs.readFileSync(
  path.resolve(process.env.FIREBLOCKS_API_SECRET_PATH!),
  'utf8',
);
const FIREBLOCKS_API_KEY = process.env.FIREBLOCKS_API_KEY ?? '';
const FIREBLOCKS_BASE_URL = process.env.FIREBLOCKS_BASE_URL ?? '';
const FIREBLOCKS_VAULT = process.env.FIREBLOCKS_VAULT ?? '';
const FIREBLOCKS_ACCOUNT_ID = process.env.FIREBLOCKS_ACCOUNT_ID;
const TEST_TIMEOUT = 10000;

// Fireblocks configuration

const FireblocksStrategyConfig = new FireblocksConfig(
  FIREBLOCKS_API_KEY,
  FIREBLOCKS_API_SECRET_KEY,
  FIREBLOCKS_BASE_URL,
);

let fireblocksSignatureStrategy = new FireblocksStrategy(
  FireblocksStrategyConfig,
);

// DFNS parameters
const DFNS_SERVICE_ACCOUNT_PRIVATE_KEY = fs.readFileSync(
  path.resolve(process.env.DFNS_SERVICE_ACCOUNT_PRIVATE_KEY_PATH!),
  'utf8',
);
const DFNS_SERVICE_ACCOUNT_CREDENTIAL_ID =
  process.env.DFNS_SERVICE_ACCOUNT_CREDENTIAL_ID ?? '';
const DFNS_SERVICE_ACCOUNT_AUTHORIZATION_TOKEN = fs.readFileSync(
  path.resolve(process.env.DFNS_SERVICE_ACCOUNT_AUTHORIZATION_TOKEN_PATH!),
  'utf8',
);
const DFNS_APP_ORIGIN = process.env.DFNS_APP_ORIGIN ?? '';
const DFNS_APP_ID = process.env.DFNS_APP_ID ?? '';
const DFNS_WALLET_ID = process.env.DFNS_WALLET_ID ?? '';
const DFNS_TEST_URL = process.env.DFNS_TEST_URL ?? '';

// DFNS configuration

const DFNSStrategyConfig = new DFNSConfig(
  DFNS_SERVICE_ACCOUNT_PRIVATE_KEY,
  DFNS_SERVICE_ACCOUNT_CREDENTIAL_ID,
  DFNS_APP_ORIGIN,
  DFNS_APP_ID,
  DFNS_SERVICE_ACCOUNT_AUTHORIZATION_TOKEN,
  DFNS_TEST_URL,
);

let DFNSSignatureStrategy = new DFNSStrategy(DFNSStrategyConfig);

describe('Strategy TESTS', () => {
  describe('[Fireblocks] Signatures', () => {
    beforeAll(() => {});

    it(
      'Sign bunch of bytes',
      async () => {
        const message = new Uint8Array([1, 2, 3]);

        const fireblocksSignatureRequest = new FireblocksSignatureRequest(
          FIREBLOCKS_VAULT,
          message,
        );

        const signedMessage = await fireblocksSignatureStrategy.sign(
          fireblocksSignatureRequest,
        );

        expect(signedMessage.length).toBeGreaterThan(0);
      },
      TEST_TIMEOUT,
    );
  });

  describe('[DFNS] Signatures', () => {
    beforeAll(() => {});

    it(
      'Sign bunch of bytes',
      async () => {
        const message = new Uint8Array([1, 2, 3]);

        const dfnsSignatureRequest = new DFNSSignatureRequest(
          DFNS_WALLET_ID,
          message,
        );

        const signedMessage = await DFNSSignatureStrategy.sign(
          dfnsSignatureRequest,
        );

        expect(signedMessage.length).toBeGreaterThan(0);
      },
      TEST_TIMEOUT,
    );
  });
});
