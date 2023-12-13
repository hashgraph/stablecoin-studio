import { FireblocksSignatureRequest } from '../../src/models/signature/FireblocksSignatureRequest';
import { CustodialWalletService } from '../../src/services/CustodialWalletService';
import {
  TEST_TIMEOUT,
  FIREBLOCKS_VAULT,
  DFNS_WALLET_ID,
  fireblocksConfig,
  dfnsConfig,
} from '../utils/config';
import { DFNSSignatureRequest } from '../../src/index.js';

describe('Service TESTS', () => {
  describe('[Fireblocks] Signatures', () => {
    beforeAll(() => {});

    it(
      'Sign bunch of bytes',
      async () => {
        const fireblocksSignatureRequest = new FireblocksSignatureRequest(
          FIREBLOCKS_VAULT,
          new Uint8Array([1, 2, 3]),
        );
        const signatureService = new CustodialWalletService(fireblocksConfig);
        const signature = await signatureService.signTransaction(
          fireblocksSignatureRequest,
        );
        expect(signature.length).toBeGreaterThan(0);
      },
      TEST_TIMEOUT,
    );
  });

  describe('[DFNS] Signatures', () => {
    beforeAll(() => {});

    it(
      'Sign bunch of bytes',
      async () => {
        const dfnsSignatureRequest = new DFNSSignatureRequest(
          DFNS_WALLET_ID,
          new Uint8Array([1, 2, 3]),
        );
        const signatureService = new CustodialWalletService(dfnsConfig);
        const signature = await signatureService.signTransaction(
          dfnsSignatureRequest,
        );
        expect(signature.length).toBeGreaterThan(0);
      },
      TEST_TIMEOUT,
    );
  });
});
