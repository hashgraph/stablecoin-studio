import Service from '../Service.js';
import { IImportedToken } from '../../../domain/configuration/interfaces/IImportedToken';
import { wizardService } from '../../../index';
import DetailsStableCoinsService from './DetailsStableCoinService.js';
import { StableCoinViewModel } from 'hedera-stable-coin-sdk';
import {
  language,
  utilsService,
  configurationService,
} from '../../../index.js';
import { GetRolesRequest } from 'hedera-stable-coin-sdk';
import RoleStableCoinsService from './RoleStableCoinService';

export default class ManageImportedTokenService extends Service {
  constructor() {
    super('Manage Imported Tokens');
  }

  public async start(): Promise<void> {
    await utilsService.cleanAndShowBanner();
    const manageOptions: Array<string> = language.getArray(
      'wizard.manageImportedTokens',
    );
    const currentAccount = utilsService.getCurrentAccount();
    let symbol = '';
    switch (
      await utilsService.defaultMultipleAsk(
        language.getText('wizard.importedTokenMenu'),
        manageOptions,
        false,
        currentAccount.network,
        `${currentAccount.accountId} - ${currentAccount.alias}`,
      )
    ) {
      case manageOptions[0]:
        await utilsService.cleanAndShowBanner();

        let tokenId = '';
        const getRolesRequestForAdding: GetRolesRequest = new GetRolesRequest({
          proxyContractId: '',
          account: {
            accountId: currentAccount.accountId,
            privateKey: {
              key: currentAccount.privateKey.key,
              type: currentAccount.privateKey.type,
            },
          },
          targetId: currentAccount.accountId,
          tokenId: '',
        });

        getRolesRequestForAdding.tokenId = await utilsService.defaultSingleAsk(
          language.getText('manageImportedToken.tokenId'),
          '0.0.1234567',
        );
        await utilsService.handleValidation(
          () => getRolesRequestForAdding.validate('tokenId'),
          async () => {
            tokenId = await utilsService.defaultSingleAsk(
              language.getText('manageImportedToken.tokenId'),
              '',
            );
            getRolesRequestForAdding.tokenId = tokenId;
          },
        );

        //call to roles
        const importedTokens = currentAccount.importedTokens;
        await new DetailsStableCoinsService()
          .getDetailsStableCoins(getRolesRequestForAdding.tokenId, false)
          .then((response: StableCoinViewModel) => {
            console.log('Mirror:', response);
            symbol = response.symbol;
            getRolesRequestForAdding.proxyContractId =
              response.proxyAddress.toString();
          });
        const roles = await new RoleStableCoinsService().getRoles(
          getRolesRequestForAdding,
        );
        importedTokens.push({
          id: getRolesRequestForAdding.tokenId,
          roles,
          symbol,
        });
        this.updateAccount(importedTokens);
        currentAccount.importedTokens = importedTokens;
        break;
      case manageOptions[1]:
        await utilsService.cleanAndShowBanner();
        if (currentAccount.importedTokens.length === 0) {
          console.log(
            language.getText('manageImportedToken.noImportedTokensRefresh'),
          );
          await this.start();
        }
        //show list to refresh
        const tokenToRefresh = await utilsService.defaultMultipleAsk(
          language.getText('manageImportedToken.tokenToRefresh'),
          currentAccount.importedTokens.map(
            (token) => `${token.id} - ${token.symbol}`,
          ),
          true,
        );
        if (tokenToRefresh === 'Go back') {
          await this.start();
        }

        const getRolesRequestForRefreshing: GetRolesRequest =
          new GetRolesRequest({
            proxyContractId: '',
            account: {
              accountId: currentAccount.accountId,
              privateKey: {
                key: currentAccount.privateKey.key,
                type: currentAccount.privateKey.type,
              },
            },
            targetId: currentAccount.accountId,
            tokenId: tokenToRefresh,
          });

        await new DetailsStableCoinsService()
          .getDetailsStableCoins(tokenToRefresh.split(' - ')[0], false)
          .then((response: StableCoinViewModel) => {
            symbol = response.symbol;
            getRolesRequestForRefreshing.proxyContractId =
              response.proxyAddress.toString();
          });

        const rolesToRefresh = await new RoleStableCoinsService().getRoles(
          getRolesRequestForRefreshing,
        );

        const importedTokensRefreshed = currentAccount.importedTokens.map(
          (token) => {
            if (token.id === tokenToRefresh.split(' - ')[0]) {
              return {
                id: token.id,
                symbol: token.symbol,
                roles: rolesToRefresh,
              };
            }
            return token;
          },
        );
        this.updateAccount(importedTokensRefreshed);
        currentAccount.importedTokens = importedTokensRefreshed;
        break;
      case manageOptions[2]:
        await utilsService.cleanAndShowBanner();
        if (currentAccount.importedTokens.length === 0) {
          console.log(
            language.getText('manageImportedToken.noImportedTokensDelete'),
          );
          await this.start();
        }
        //show list to delete
        const tokenToDelete = await utilsService.defaultMultipleAsk(
          language.getText('manageImportedToken.tokenToDelete'),
          currentAccount.importedTokens.map(
            (token) => `${token.id} - ${token.symbol}`,
          ),
          true,
        );
        if (tokenToDelete === 'Go back') {
          await this.start();
        }
        const newImportedTokens = currentAccount.importedTokens.filter(
          (token) => token.id !== tokenToDelete.split(' - ')[0],
        );
        this.updateAccount(newImportedTokens);
        currentAccount.importedTokens = newImportedTokens;
        break;
      case manageOptions[manageOptions.length - 1]:
      default:
        await utilsService.cleanAndShowBanner();
        await wizardService.mainMenu();
    }
    utilsService.showMessage(language.getText('general.newLine'));
    await this.start();
  }

  public updateAccount(importedTokens: IImportedToken[]): void {
    const defaultCfgData = configurationService.getConfiguration();
    const currentAccount = utilsService.getCurrentAccount();
    const accounts = defaultCfgData.accounts;
    const accsToUpdate = accounts.map((acc) => {
      if (
        acc.alias === currentAccount.alias &&
        acc.accountId === currentAccount.accountId
      ) {
        return {
          accountId: acc.accountId,
          network: acc.network,
          alias: acc.alias,
          privateKey: acc.privateKey,
          importedTokens: importedTokens,
        };
      }
      return acc;
    });
    defaultCfgData.accounts = accsToUpdate;

    configurationService.setConfiguration(defaultCfgData);
  }

  public mixImportedTokens(tokens: string[]): string[] {
    const currentAccount = utilsService.getCurrentAccount();
    const filterTokens = tokens.filter((token) => {
      if (
        currentAccount.importedTokens &&
        currentAccount.importedTokens.find(
          (tok) => tok.id === token.split(' - ')[0],
        )
      ) {
        return false;
      }
      return true;
    });
    return filterTokens;
  }
}
