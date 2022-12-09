import { IAccountConfig } from './IAccountConfig.js';
import { INetworkConfig } from './INetworkConfig.js';
import { IFactoryConfig } from './IFactoryConfig.js';
import { IHederaERC20Config } from './IHederaERC20Config.js';


export interface IConfiguration {
  defaultNetwork?: string;
  networks?: INetworkConfig[];
  accounts?: IAccountConfig[];
  factories?: IFactoryConfig[];
  hederaERC20s?: IHederaERC20Config[];
}
