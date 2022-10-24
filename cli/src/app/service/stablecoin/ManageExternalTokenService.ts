import Service from '../Service.js';
import { IExternalToken } from '../../../domain/configuration/interfaces/IExternalToken';
import { wizardService } from '../../../index';
import DetailsStableCoinsService from './DetailsStableCoinService.js';
import {
  IStableCoinDetail,
  EOAccount,
  PrivateKey,
} from 'hedera-stable-coin-sdk';
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
        const externalTokens = currentAccount.externalTokens;
        await new DetailsStableCoinsService()
          .getDetailsStableCoins(tokenId, false)
          .then((response: IStableCoinDetail) => {
            symbol = response.symbol;
            proxyContractId = response.memo.proxyContract;
          });
        const capabilities =
          await new CapabilitiesStableCoinsService().getCapabilitiesStableCoins(
            proxyContractId,
            new EOAccount(
              currentAccount.accountId,
              new PrivateKey(
                currentAccount.privateKey.key,
                currentAccount.privateKey.type,
              ),
            ),
            tokenId,
            currentAccount.accountId.toString(),
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
        const tokenToRefresh = await utilsService.defaultMultipleAsk(
          language.getText('manageExternalToken.tokenToRefresh'),
          currentAccount.externalTokens.map((token) => token.id),
        );

        await new DetailsStableCoinsService()
          .getDetailsStableCoins(tokenId, false)
          .then((response: IStableCoinDetail) => {
            symbol = response.symbol;
            proxyContractId = response.memo.proxyContract;
          });
        const capabilitiesToRefresh =
          await new CapabilitiesStableCoinsService().getCapabilitiesStableCoins(
            proxyContractId,
            new EOAccount(
              currentAccount.accountId,
              new PrivateKey(
                currentAccount.privateKey.key,
                currentAccount.privateKey.type,
              ),
            ),
            tokenId,
            currentAccount.accountId.toString(),
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
        const tokenToDelete = await utilsService.defaultMultipleAsk(
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
