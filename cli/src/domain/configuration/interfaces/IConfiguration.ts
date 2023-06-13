import { IAccountConfig } from './IAccountConfig.js';
import { ILogConfig } from './ILogConfig.js';
import { INetworkConfig } from './INetworkConfig.js';
import { IFactoryConfig } from './IFactoryConfig.js';
import { IMirrorsConfig } from './IMirrorsConfig.js';
import { IRPCsConfig } from './IRPCsConfig.js';

export interface IConfiguration {
  defaultNetwork?: string;
  networks?: INetworkConfig[];
  accounts?: IAccountConfig[];
  mirrors?: IMirrorsConfig[];
  rpcs?: IRPCsConfig[];
  logs?: ILogConfig;
  factories?: IFactoryConfig[];
}
