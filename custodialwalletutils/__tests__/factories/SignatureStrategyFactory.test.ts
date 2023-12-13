import { FireblocksConfig } from '../../src/strategies/StrategyConfig';
import { StrategyFactory } from '../../src/factories/StrategyFactory';
import { FireblocksStrategy } from '../../src/strategies/signature/FireblocksStrategy';

const API_KEY = 'API_KEY';
const BASE_URL = 'BASE_URL';
const SECRET_KEY_PATH = 'SECRET_KEY_PATH';

describe('🧪 Factory TESTS', () => {
  it('StrategyFactory creates FireblocksStrategy for FireblocksConfig', () => {
    const strategyConfig = new FireblocksConfig(
      API_KEY,
      SECRET_KEY_PATH,
      BASE_URL,
    );
    const strategy = StrategyFactory.createSignatureStrategy(strategyConfig);
    expect(strategy instanceof FireblocksStrategy);
  });

  // it('SignatureStrategyFactory creates DFNSStrategy for DFNSConfig', () => {
  //   const strategyConfig = new DFNSConfig();
  //   const strategy = StrategyFactory.createSignatureStrategy(strategyConfig);
  //   expect(strategy instanceof DFNSStrategy);
  // });

  /* it('SignatureStrategyFactory throws an error for unrecognized config', () => {
    const strategyConfig: StrategyConfig;
    try {
      StrategyFactory.createSignatureStrategy(strategyConfig);
      throw new Error('Test failed: should have thrown an error');
    } catch (error) {
      expect(
        error instanceof Error &&
          error.message === 'Unrecognized signature request type',
      );
    }
  }); */
});
