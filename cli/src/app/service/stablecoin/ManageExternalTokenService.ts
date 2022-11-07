import Service from '../Service.js';
import { IExternalToken } from '../../../domain/configuration/interfaces/IExternalToken';
import { wizardService } from '../../../index';
import DetailsStableCoinsService from './DetailsStableCoinService.js';
import { IStableCoinDetail, PrivateKey } from 'hedera-stable-coin-sdk';
import {
  language,
  utilsService,
  configurationService,
} from '../../../index.js';
import colors from 'colors';
import RoleStableCoinsService from './RoleStableCoinService';

export default class ManageExternalTokenService extends Service {
  constructor() {
    super('Manage External Tokens');
  }

  public async start(): Promise<void> {
    await utilsService.cleanAndShowBanner();
    const manageOptions: Array<string> = language.getArray(
      'wizard.manageExternalTokens',
    );
    const currentAccount = utilsService.getCurrentAccount();
    let symbol = '';
    let proxyContractId = '';
    switch (
      await utilsService.defaultMultipleAsk(
        language.getText('wizard.externalTokenMenu'),
        manageOptions,
        false,
        currentAccount.network,
        `${currentAccount.accountId} - ${currentAccount.alias}`,
      )
    ) {
      case manageOptions[0]:
        await utilsService.cleanAndShowBanner();
        let tokenId = await utilsService.defaultSingleAsk(
          language.getText('manageExternalToken.tokenId'),
          '0.0.1234567',
        );
        while (!utilsService.validateTokenId(tokenId)) {
          console.log(language.getText('manageExternalToken.tokenIdError'));
          tokenId = await utilsService.defaultSingleAsk(
            language.getText('manageExternalToken.tokenId'),
            '',
          );
        }

        //call to roles
        const externalTokens = currentAccount.externalTokens;
        await new DetailsStableCoinsService()
          .getDetailsStableCoins(tokenId, false)
          .then((response: IStableCoinDetail) => {
            symbol = response.symbol;
            proxyContractId = response.memo.proxyContract;
          });
        const roles = await new RoleStableCoinsService().getRoles(
          proxyContractId,
          currentAccount.accountId,
          new PrivateKey(
            currentAccount.privateKey.key,
            currentAccount.privateKey.type,
          ),
          currentAccount.accountId,
        );
        externalTokens.push({
          id: tokenId,
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
            language.getText('manageExternalToken.noExternalTokensRefresh'),
          );
          await this.start();
        }
        //show list to refresh
        const tokenToRefresh = await utilsService.defaultMultipleAsk(
          language.getText('manageExternalToken.tokenToRefresh'),
          currentAccount.externalTokens.map(
            (token) => `${token.id} - ${token.symbol}`,
          ),
          true,
        );
        if (tokenToRefresh === 'Go back') {
          await this.start();
        }

        await new DetailsStableCoinsService()
          .getDetailsStableCoins(tokenToRefresh.split(' - ')[0], false)
          .then((response: IStableCoinDetail) => {
            symbol = response.symbol;
            proxyContractId = response.memo.proxyContract;
          });
        const rolesToRefresh = await new RoleStableCoinsService().getRoles(
          proxyContractId,
          currentAccount.accountId,
          new PrivateKey(
            currentAccount.privateKey.key,
            currentAccount.privateKey.type,
          ),
          currentAccount.accountId,
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
            language.getText('manageExternalToken.noExternalTokensDelete'),
          );
          await this.start();
        }
        //show list to delete
        const tokenToDelete = await utilsService.defaultMultipleAsk(
          language.getText('manageExternalToken.tokenToDelete'),
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
        console.log('EL TOKEN FILTRADO ES:', token);
        return false;
      }
      return true;
    });
    const result = filterTokens.concat(
      language.getText('manageExternalToken.separator'),
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
