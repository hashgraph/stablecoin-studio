import { IImportedToken } from './IImportedToken';
import { ISelfCustodialAccountConfig } from './ISelfCustodialAccountConfig';
import { INonCustodialAccountConfig } from './INonCustodialAccountConfig';
import { AccountType } from './AccountType';

export interface IAccountConfig {
  accountId: string;
  type: AccountType;
  network: string;
  alias: string;
  importedTokens?: IImportedToken[];
  selfCustodial?: ISelfCustodialAccountConfig;
  nonCustodial?: INonCustodialAccountConfig;
}
