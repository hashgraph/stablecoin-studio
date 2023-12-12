import { DFNSStrategy } from './signature/DFNSStrategy.ts';
import { FireblocksStrategy } from './signature/FireblocksStrategy.ts';
import { ISignatureStrategy } from './signature/ISignatureStrategy.ts';

export interface IStrategyConfig {
  getSignatureStrategy(): ISignatureStrategy;
}

export class FireblocksConfig implements IStrategyConfig {
  constructor(
    public apiKey: string,
    public apiSecretKey: string,
    public baseUrl: string,
  ) {}

  getSignatureStrategy(): ISignatureStrategy {
    return new FireblocksStrategy(this);
  }
}

export class DFNSConfig implements IStrategyConfig {
  constructor() {}

  getSignatureStrategy(): ISignatureStrategy {
    return new DFNSStrategy();
  }
}
