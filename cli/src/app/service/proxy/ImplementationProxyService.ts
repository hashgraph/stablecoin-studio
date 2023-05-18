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
  ): Promise<void> {
    await this.askHederaTokenManagerVersion(req);

    await utilsService.showSpinner(Proxy.upgradeImplementation(req), {
      text: language.getText('state.loading'),
      successText:
        language.getText('state.upgradeImplementationCompleted') + '\n',
    });

    console.log(language.getText('operation.success'));

    utilsService.breakLine();
  }

  private async askHederaTokenManagerVersion(request: any): Promise<void> {
    const factory = utilsService.getCurrentFactory().id;

    const factoryListEvm = await Factory.getHederaTokenManagerList(
      new GetTokenManagerListRequest({ factoryId: factory }),
    ).then((value) => value.reverse());

    const choices = factoryListEvm.map((item) => item.toString());
    choices.push(language.getText('stablecoin.askHederaTokenManagerOther'));

    const versionSelection = await utilsService.defaultMultipleAsk(
      language.getText('stablecoin.askHederaTokenManagerVersion'),
      choices,
    );

    if (versionSelection === choices[choices.length - 1]) {
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
  }
}
