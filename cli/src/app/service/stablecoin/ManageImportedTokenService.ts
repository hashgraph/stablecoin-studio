import Service from '../Service.js';
import { IExternalToken } from '../../../domain/configuration/interfaces/IExternalToken';
import { wizardService } from '../../../index';
import DetailsStableCoinsService from './DetailsStableCoinService.js';
import { IStableCoinDetail } from 'hedera-stable-coin-sdk';
import {
  language,
  utilsService,
  configurationService,
} from '../../../index.js';
import { GetRolesRequest } from 'hedera-stable-coin-sdk';
import colors from 'colors';
import RoleStableCoinsService from './RoleStableCoinService';

export default class ManageImportedTokenService extends Service {
  constructor() {
    super('Manage External Tokens');
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
        const externalTokens = currentAccount.externalTokens;
        await new DetailsStableCoinsService()
          .getDetailsStableCoins(getRolesRequestForAdding.tokenId, false)
          .then((response: IStableCoinDetail) => {
            console.log('Mirror:', response);
            symbol = response.symbol;
            getRolesRequestForAdding.proxyContractId =
              response.memo.proxyContract;
          });
        const roles = await new RoleStableCoinsService().getRoles(
          getRolesRequestForAdding,
        );
        externalTokens.push({
          id: getRolesRequestForAdding.tokenId,
          roles,
          symbol,
        });
        this.updateAccount(externalTokens);
        currentAccount.externalTokens = externalTokens;
        break;
      case manageOptions[1]:
        await utilsService.cleanAndShowBanner();
        if (currentAccount.externalTokens.length === 0) {
          console.log(
            language.getText('manageImportedToken.noImportedTokensRefresh'),
          );
          await this.start();
        }
        //show list to refresh
        const tokenToRefresh = await utilsService.defaultMultipleAsk(
          language.getText('manageImportedToken.tokenToRefresh'),
          currentAccount.externalTokens.map(
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
          .then((response: IStableCoinDetail) => {
            symbol = response.symbol;
            getRolesRequestForRefreshing.proxyContractId =
              response.memo.proxyContract;
          });

        const rolesToRefresh = await new RoleStableCoinsService().getRoles(
          getRolesRequestForRefreshing,
        );

        const externalTokensRefreshed = currentAccount.externalTokens.map(
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
        this.updateAccount(externalTokensRefreshed);
        currentAccount.externalTokens = externalTokensRefreshed;
        break;
      case manageOptions[2]:
        await utilsService.cleanAndShowBanner();
        if (currentAccount.externalTokens.length === 0) {
          console.log(
            language.getText('manageImportedToken.noImportedTokensDelete'),
          );
          await this.start();
        }
        //show list to delete
        const tokenToDelete = await utilsService.defaultMultipleAsk(
          language.getText('manageImportedToken.tokenToDelete'),
          currentAccount.externalTokens.map(
            (token) => `${token.id} - ${token.symbol}`,
          ),
          true,
        );
        if (tokenToDelete === 'Go back') {
          await this.start();
        }
        const newExternalTokens = currentAccount.externalTokens.filter(
          (token) => token.id !== tokenToDelete.split(' - ')[0],
        );
        this.updateAccount(newExternalTokens);
        currentAccount.externalTokens = newExternalTokens;
        break;
      case manageOptions[manageOptions.length - 1]:
      default:
        await utilsService.cleanAndShowBanner();
        await wizardService.mainMenu();
    }
    utilsService.showMessage(language.getText('general.newLine'));
    await this.start();
  }

  public updateAccount(externalTokens: IExternalToken[]): void {
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
          externalTokens: externalTokens,
        };
      }
      return acc;
    });
    defaultCfgData.accounts = accsToUpdate;

    configurationService.setConfiguration(defaultCfgData);
  }

  public mixExternalTokens(tokens: string[]): string[] {
    const currentAccount = utilsService.getCurrentAccount();
    const filterTokens = tokens.filter((token) => {
      if (
        currentAccount.externalTokens.find(
          (tok) => tok.id === token.split(' - ')[0],
        )
      ) {
        return false;
      }
      return true;
    });
    const result = filterTokens.concat(
      language.getText('manageImportedToken.separator'),
      currentAccount.externalTokens.map(
        (token) =>
          `${token.id} - ${token.symbol} - ` +
          colors.yellow(colors.underline('Roles:')) +
          colors.yellow(` ${token.roles.join(' | ')}`),
      ),
    );
    return result;
  }
}
