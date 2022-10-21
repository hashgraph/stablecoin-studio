import Service from '../Service.js';
import { IExternalToken } from '../../../domain/configuration/interfaces/IExternalToken';
import { wizardService } from '../../../index';
import DetailsStableCoinsService from './DetailsStableCoinService.js';
import { IStableCoinDetail, SDK } from 'hedera-stable-coin-sdk';
import CapabilitiesStableCoinsService from './CapabilitiesStableCoinService.js';
import {
  language,
  utilsService,
  configurationService,
} from '../../../index.js';
import colors from 'colors';

export default class ManageExternalTokenService extends Service {
  constructor() {
    super('Manage External Tokens');
  }

  public async start(): Promise<void> {
    const manageOptions: Array<string> = language.getArray(
      'wizard.manageExternalTokens',
    );
    const currentAccount = utilsService.getCurrentAccount();
    const sdk: SDK = utilsService.getSDK();

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
          '',
        );
        while (!utilsService.validateTokenId(tokenId)) {
          console.log(language.getText('manageExternalToken.tokenIdError'));
          tokenId = await utilsService.defaultSingleAsk(
            language.getText('manageExternalToken.tokenId'),
            '',
          );
        }

        //call to capabilities
        let externalTokens = currentAccount.externalTokens;
        let symbol = '';
        await new DetailsStableCoinsService()
          .getDetailsStableCoins(tokenId, false)
          .then((response: IStableCoinDetail) => {
            symbol = response.symbol;
          });
        const capabilities =
          await new CapabilitiesStableCoinsService().getCapabilitiesStableCoins(
            tokenId,
            sdk.getPublicKey(
              currentAccount.privateKey.key,
              currentAccount.privateKey.type,
            ),
          );
        externalTokens.push({
          id: tokenId,
          capabilities: capabilities,
          symbol,
        });
        this.updateAccount(externalTokens);
        currentAccount.externalTokens = externalTokens;
        break;
      case manageOptions[1]:
        await utilsService.cleanAndShowBanner();
        //show list to refresh
        let tokenToRefresh = await utilsService.defaultMultipleAsk(
          language.getText('manageExternalToken.tokenToRefresh'),
          currentAccount.externalTokens.map((token) => token.id),
        );
        const capabilitiesToRefresh =
          await new CapabilitiesStableCoinsService().getCapabilitiesStableCoins(
            tokenToRefresh,
            sdk.getPublicKey(
              currentAccount.privateKey.key,
              currentAccount.privateKey.type,
            ),
          );
        const externalTokensRefreshed = currentAccount.externalTokens.map(
          (token) => {
            if (token.id === tokenToRefresh) {
              return {
                id: token.id,
                symbol: token.symbol,
                capabilities: capabilitiesToRefresh,
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
        //show list to delete
        let tokenToDelete = await utilsService.defaultMultipleAsk(
          language.getText('manageExternalToken.tokenToDelete'),
          currentAccount.externalTokens.map((token) => token.id),
        );
        const newExternalTokens = currentAccount.externalTokens.filter(
          (token) => token.id !== tokenToDelete,
        );
        this.updateAccount(newExternalTokens);
        currentAccount.externalTokens = newExternalTokens;
        break;
      case manageOptions[manageOptions.length - 1]:
      default:
        wizardService.mainMenu();
    }
    utilsService.showMessage(language.getText('general.newLine'));
    await this.start();
  }

  public updateAccount(externalTokens: IExternalToken[]): void {
    const defaultCfgData = configurationService.getConfiguration();
    const currentAccount = utilsService.getCurrentAccount();
    let accounts = defaultCfgData.accounts;
    let accsToUpdate = accounts.map((acc) => {
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
    const result = tokens.concat(
      language.getText('manageExternalToken.separator'),
      currentAccount.externalTokens.map(
        (token) =>
          `${token.id} - ${token.symbol} - ` +
          colors.yellow(colors.underline('Roles:')) +
          colors.yellow(` ${token.capabilities.join(' | ')}`),
      ),
    );
    return result;
  }
}
