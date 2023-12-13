import { ISignatureStrategy } from '../strategies/signature/ISignatureStrategy';
import { StrategyConfig } from '../strategies/StrategyConfig';

export class StrategyFactory {
  static createSignatureStrategy(
    strategyConfig: StrategyConfig,
  ): ISignatureStrategy {
    return strategyConfig.getSignatureStrategy();
  }
}
