import fs from 'fs';
import path from 'path';
import { FireblocksConfig } from '../../src/strategies/StrategyConfig';
import { FireblocksSignatureRequest } from '../../src/models/signature/FireblocksSignatureRequest';
import { FireblocksStrategy } from '../../src/strategies/signature/FireblocksStrategy';
import { config } from 'dotenv';

config();

const FIREBLOCKS_API_SECRET_KEY = fs.readFileSync(
  path.resolve(process.env.FIREBLOCKS_API_SECRET_PATH!),
  'utf8',
);
const FIREBLOCKS_API_KEY = process.env.FIREBLOCKS_API_KEY ?? '';
const FIREBLOCKS_BASE_URL = process.env.FIREBLOCKS_BASE_URL ?? '';
const vaultAccountId = process.env.FIREBLOCKS_VAULT ?? '';
const fireblocksAccountId = process.env.FIREBLOCKS_ACCOUNT_ID;
const TEST_TIMEOUT = 10000;

const FireblocksStrategyConfig = new FireblocksConfig(
  FIREBLOCKS_API_KEY,
  FIREBLOCKS_API_SECRET_KEY,
  FIREBLOCKS_BASE_URL,
);

let fireblocksSignatureStrategy = new FireblocksStrategy(
  FireblocksStrategyConfig,
);
describe('Strategy TESTS', () => {
  describe('[Fireblocks] Signatures', () => {
    beforeAll(() => {});

    it(
      'Sign bunch of bytes',
      async () => {
        const message = new Uint8Array([1, 2, 3]);

        const fireblocksSignatureRequest = new FireblocksSignatureRequest(
          vaultAccountId,
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
});
