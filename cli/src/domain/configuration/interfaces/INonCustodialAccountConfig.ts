import { IFireblocksAccountConfig } from './IFireblocksAccountConfig';
import { IDfnsAccountConfig } from './IDfnsAccountConfig';

export interface INonCustodialAccountConfig {
  fireblocks?: IFireblocksAccountConfig;
  dfns?: IDfnsAccountConfig;
}
