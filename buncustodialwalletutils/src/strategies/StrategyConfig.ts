import { DFNSStrategy } from './signature/DFNSStrategy';
import { FireblocksStrategy } from './signature/FireblocksStrategy';
import { ISignatureStrategy } from './signature/ISignatureStrategy';

export interface StrategyConfig {
  getSignatureStrategy(): ISignatureStrategy;
}

export class FireblocksConfig implements StrategyConfig {
  constructor(
    public apiKey: string,
    public apiSecretKey: string,
    public baseUrl: string,
  ) {}

  getSignatureStrategy(): ISignatureStrategy {
    return new FireblocksStrategy(this);
  }
}

export class DFNSConfig implements StrategyConfig {
  constructor() {}

  getSignatureStrategy(): ISignatureStrategy {
    return new DFNSStrategy();
  }
}
