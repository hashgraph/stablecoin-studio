import { IAccountConfig } from "./IAccountConfig.js";
import { IGeneralConfig } from "./IGeneralConfig.js";
import { INetworkConfig } from "./INetworkConfig.js";

export interface IConfiguration {
    general?: IGeneralConfig;
    networks?: INetworkConfig[];
    accounts?: IAccountConfig[];
}