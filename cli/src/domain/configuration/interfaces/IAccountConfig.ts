import { IPrivateKey } from './IPrivateKey.js';
import { IExternalToken } from './IExternalToken';

export interface IAccountConfig {
  accountId: string;
  privateKey: IPrivateKey;
  network: string;
  alias: string;
  externalTokens?: IExternalToken[];
}
