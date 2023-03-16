import { IAccountConfig } from './IAccountConfig.js';
import { ILogConfig } from './ILogConfig.js';
import { INetworkConfig } from './INetworkConfig.js';
import { IFactoryConfig } from './IFactoryConfig.js';

export interface IConfiguration {
  defaultNetwork?: string;
  networks?: INetworkConfig[];
  accounts?: IAccountConfig[];
  logs?: ILogConfig;
  factories?: IFactoryConfig[];
}
