import {
  TEST_TIMEOUT,
  FIREBLOCKS_VAULT,
  DFNS_WALLET_ID,
} from '../utils/config';
import { FireblocksSignatureRequest } from '../../src/models/signature/FireblocksSignatureRequest';
import { DFNSSignatureRequest } from '../../src/models/signature/DFNSSignatureRequest';

describe('🧪 Models TESTS', () => {
  describe('[Fireblocks] Signatures Request', () => {
    beforeAll(() => {});

    it(
      'build request',
      () => {
        let message = new Uint8Array([1, 2, 3]);

        const fireblocksSignatureRequest = new FireblocksSignatureRequest(
          FIREBLOCKS_VAULT,
          message,
        );

        expect(fireblocksSignatureRequest.getVaultAccountId()).toEqual(
          FIREBLOCKS_VAULT,
        );
        expect(fireblocksSignatureRequest.getTransactionBytes()).toEqual(
          message,
        );

        message = new Uint8Array([4, 5, 6]);

        fireblocksSignatureRequest.setVaultAccountId('');
        fireblocksSignatureRequest.setTransactionBytes(message);

        expect(fireblocksSignatureRequest.getVaultAccountId()).toEqual('');
        expect(fireblocksSignatureRequest.getTransactionBytes()).toEqual(
          message,
        );
      },
      TEST_TIMEOUT,
    );
  });

  describe('[DFNS] Signatures Request', () => {
    beforeAll(() => {});

    it(
      'build request',
      () => {
        let message = new Uint8Array([1, 2, 3]);

        const dfnsSignatureRequest = new DFNSSignatureRequest(
          DFNS_WALLET_ID,
          message,
        );

        expect(dfnsSignatureRequest.getWalletId()).toEqual(DFNS_WALLET_ID);
        expect(dfnsSignatureRequest.getTransactionBytes()).toEqual(message);

        message = new Uint8Array([4, 5, 6]);

        dfnsSignatureRequest.setWalletId('');
        dfnsSignatureRequest.setTransactionBytes(message);

        expect(dfnsSignatureRequest.getWalletId()).toEqual('');
        expect(dfnsSignatureRequest.getTransactionBytes()).toEqual(message);
      },
      TEST_TIMEOUT,
    );
  });
});
