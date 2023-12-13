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
      'Try Sign bunch of bytes Using the wrong request',
      async () => {
        let dfnsSignatureRequest = new DFNSSignatureRequest(
          DFNS_WALLET_ID,
          new Uint8Array([1, 2, 3]),
        );
        let signatureService = new CustodialWalletService(fireblocksConfig);
        try {
          await signatureService.signTransaction(dfnsSignatureRequest);
          expect(false).toEqual(true);
        } catch (e) {
          expect(true).toEqual(true);
        }
      },
      TEST_TIMEOUT,
    );

    it(
      'Sign bunch of bytes',
      async () => {
        let fireblocksSignatureRequest = new FireblocksSignatureRequest(
          FIREBLOCKS_VAULT,
          new Uint8Array([1, 2, 3]),
        );
        let signatureService = new CustodialWalletService(fireblocksConfig);
        let signature = await signatureService.signTransaction(
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
      'Try Sign bunch of bytes Using the wrong request',
      async () => {
        let fireblocksSignatureRequest = new FireblocksSignatureRequest(
          FIREBLOCKS_VAULT,
          new Uint8Array([1, 2, 3]),
        );
        let signatureService = new CustodialWalletService(dfnsConfig);
        try {
          await signatureService.signTransaction(fireblocksSignatureRequest);
          expect(false).toEqual(true);
        } catch (e) {
          expect(true).toEqual(true);
        }
      },
      TEST_TIMEOUT,
    );

    it(
      'Sign bunch of bytes',
      async () => {
        let dfnsSignatureRequest = new DFNSSignatureRequest(
          DFNS_WALLET_ID,
          new Uint8Array([1, 2, 3]),
        );
        let signatureService = new CustodialWalletService(dfnsConfig);
        let signature = await signatureService.signTransaction(
          dfnsSignatureRequest,
        );
        expect(signature.length).toBeGreaterThan(0);
      },
      TEST_TIMEOUT,
    );
  });
});
