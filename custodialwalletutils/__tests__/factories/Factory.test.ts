import { StrategyFactory } from '../../src/factories/StrategyFactory';
import { FireblocksStrategy } from '../../src/strategies/signature/FireblocksStrategy';
import { DFNSStrategy } from '../../src/strategies/signature/DFNSStrategy';
import { TEST_TIMEOUT, fireblocksConfig, dfnsConfig } from '../utils/config';

describe('🧪 Factory TESTS', () => {
  describe('[Fireblocks] Signatures', () => {
    beforeAll(() => {});

    it(
      'get strategy',
      () => {
        let strategy =
          StrategyFactory.createSignatureStrategy(fireblocksConfig);

        expect(strategy instanceof FireblocksStrategy).toEqual(true);
      },
      TEST_TIMEOUT,
    );
  });

  describe('[DFNS] Signatures', () => {
    beforeAll(() => {});

    it(
      'get strategy',
      () => {
        let strategy = StrategyFactory.createSignatureStrategy(dfnsConfig);

        expect(strategy instanceof DFNSStrategy).toEqual(true);
      },
      TEST_TIMEOUT,
    );
  });
});
