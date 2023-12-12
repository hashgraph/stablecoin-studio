import { ISignatureStrategy } from '../strategies/signature/ISignatureStrategy';
import { IStrategyConfig } from '../strategies/IStrategyConfig';

export class StrategyFactory {
  static createSignatureStrategy(
    strategyConfig: IStrategyConfig,
  ): ISignatureStrategy {
    return strategyConfig.getSignatureStrategy();
  }
}
