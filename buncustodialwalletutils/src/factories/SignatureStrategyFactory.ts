import { ISignatureStrategy } from "../strategies/signature/ISignatureStrategy";
import { FireblocksStrategy } from "../strategies/signature/FireblocksStrategy";
import { DFNSStrategy } from "../strategies/signature/DFNSStrategy";
import {
  DFNSConfig,
  FireblocksConfig,
  IStrategyConfig,
} from "../strategies/IStrategyConfig";

export class SignatureStrategyFactory {
  static createStrategy(strategyConfig: IStrategyConfig): ISignatureStrategy {
    if (strategyConfig instanceof FireblocksConfig) {
      return new FireblocksStrategy(strategyConfig);
    } else if (strategyConfig instanceof DFNSConfig) {
      return new DFNSStrategy();
    } else {
      throw new Error("Unrecognized signature request type");
    }
  }
}
