import { FireblocksSignatureRequest } from '../../src/models/signature/FireblocksSignatureRequest';
import { DFNSSignatureRequest } from '../../src/index.js';
import {
  TEST_TIMEOUT,
  FIREBLOCKS_VAULT,
  fireblocksConfig,
  DFNS_WALLET_ID,
  dfnsConfig,
} from '../utils/config';
import { DFNSStrategy } from '../../src/strategies/signature/DFNSStrategy.js';
import { FireblocksStrategy } from '../../src/strategies/signature/FireblocksStrategy.js';

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

        const fireblocksSignatureStrategy = new FireblocksStrategy(
          fireblocksConfig,
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

        const dfnsSignatureStrategy = new DFNSStrategy(dfnsConfig);

        const signedMessage = await dfnsSignatureStrategy.sign(
          dfnsSignatureRequest,
        );

        expect(signedMessage.length).toBeGreaterThan(0);
      },
      TEST_TIMEOUT,
    );
  });
});
