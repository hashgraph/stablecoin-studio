import { IPrivateKey } from './IPrivateKey.js';

export interface IAccountConfig {
  accountId: string;
  privateKey: IPrivateKey;
  network: string;
  alias: string;
}
