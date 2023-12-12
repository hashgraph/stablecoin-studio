import { expect, test } from 'bun:test';
import fs from 'fs';
import path from 'path';
import { FireblocksConfig } from '../../src/strategies/IStrategyConfig';
import { FireblocksSignatureRequest } from '../../src/models/signature/FireblocksSignatureRequest';
import { CustodialWalletService } from '../../src/services/CustodialWalletService.ts';

const FIREBLOCKS_API_SECRET_KEY = fs.readFileSync(
  path.resolve('../../utils/fireblocks-secret.key'),
  'utf8',
);
const FIREBLOCKS_API_KEY = '652415d5-e004-4dfd-9b3b-d93e8fc939d7';
const FIREBLOCKS_BASE_URL = 'https://api.fireblocks.io';
const vaultAccountId = '2';
const fireblocksAccountId = '0.0.5712904';

test('[Fireblocks] signTransaction calls the correct strategy with the correct request', async () => {
  const FireblocksStrategyConfig = new FireblocksConfig(
    FIREBLOCKS_API_KEY,
    FIREBLOCKS_API_SECRET_KEY,
    FIREBLOCKS_BASE_URL,
  );
  const fireblocksSignatureRequest = new FireblocksSignatureRequest(
    vaultAccountId,
    new Uint8Array([1, 2, 3]),
  );
  const signatureService = new CustodialWalletService(FireblocksStrategyConfig);
  const signature = await signatureService.signTransaction(
    fireblocksSignatureRequest,
  );
  expect(signature).not.toBeEmpty();
  console.log(signature);
});
