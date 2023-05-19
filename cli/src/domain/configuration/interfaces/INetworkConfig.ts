import { IConsensusNodeConfig } from './IConsensusNodeConfig.js';

export interface INetworkConfig {
  name: string;
  chainId: number;
  consensusNodes: IConsensusNodeConfig[];
}
