import { IPrivateKey } from './IPrivateKey.js';
import { IImportedToken } from './IImportedToken';

export interface IAccountConfig {
  accountId: string;
  privateKey: IPrivateKey;
  network: string;
  alias: string;
  importedTokens?: IImportedToken[];
}
