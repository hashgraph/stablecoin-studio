import { language } from '../../../index.js';
import { utilsService } from '../../../index.js';
import Service from '../Service.js';
import {
  UpgradeImplementationRequest,
  Proxy,
  Factory,
  GetTokenManagerListRequest,
} from '@hashgraph-dev/stablecoin-npm-sdk';

/**
 * Proxy Implementation
 */
export default class ImplementationProxyService extends Service {
  constructor() {
    super('Proxy Implementation');
  }

  /**
   * upgrade the proxy implementation
   */
  public async upgradeImplementationOwner(
    req: UpgradeImplementationRequest,
    currentImpl: string,
  ): Promise<void> {
    const result = await this.askHederaTokenManagerVersion(req, currentImpl);

    if (!result) return;

    await utilsService.showSpinner(Proxy.upgradeImplementation(req), {
      text: language.getText('state.loading'),
      successText:
        language.getText('state.upgradeImplementationCompleted') + '\n',
    });

    console.log(language.getText('operation.success'));

    utilsService.breakLine();
  }

  private async askHederaTokenManagerVersion(
    request: any,
    currentImpl: string,
  ): Promise<boolean> {
    const factory = utilsService.getCurrentFactory().id;

    const factoryListEvm = await Factory.getHederaTokenManagerList(
      new GetTokenManagerListRequest({ factoryId: factory }),
    ).then((value) => value.reverse());

    const choices = factoryListEvm.map((item) => item.toString());
    choices.push(language.getText('stablecoin.askHederaTokenManagerOther'));

    const filteredChoices = choices.filter((choice) => {
      if (choice === currentImpl) return false;
      return true;
    });

    const versionSelection = await utilsService.defaultMultipleAsk(
      language.getText('stablecoin.askHederaTokenManagerVersion'),
      filteredChoices,
      true,
    );

    if (versionSelection === language.getText('wizard.backOption.goBack')) {
      return false;
    } else if (
      versionSelection === filteredChoices[filteredChoices.length - 1]
    ) {
      await utilsService.handleValidation(
        () => request.validate('implementationAddress'),
        async () => {
          request.implementationAddress = await utilsService.defaultSingleAsk(
            language.getText('stablecoin.askHederaTokenManagerImplementation'),
            '0.0.0',
          );
        },
      );
    } else request.implementationAddress = versionSelection;
    return true;
  }
}
