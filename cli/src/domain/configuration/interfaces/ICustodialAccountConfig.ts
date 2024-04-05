import { IFireblocksAccountConfig } from './IFireblocksAccountConfig';
import { IDfnsAccountConfig } from './IDfnsAccountConfig';

export interface ICustodialAccountConfig {
  fireblocks?: IFireblocksAccountConfig;
  dfns?: IDfnsAccountConfig;
}
