import { IAccountConfig } from './IAccountConfig.js';
import { INetworkConfig } from './INetworkConfig.js';

export interface IConfiguration {
  defaultNetwork?: string;
  networks?: INetworkConfig[];
  accounts?: IAccountConfig[];
}
