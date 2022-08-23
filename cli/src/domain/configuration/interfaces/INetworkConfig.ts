import { IConsensusNodeConfig } from './IConsensusNodeConfig.js';

export interface INetworkConfig {
    name:           string;
    mirrorNodeUrl:  string;
    chainId:        number;
    consensusNodes: IConsensusNodeConfig[];
}