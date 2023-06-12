import { language } from '../../../index.js';
import { utilsService } from '../../../index.js';
import Service from '../Service.js';
import {
  UpgradeFactoryImplementationRequest,
  Proxy,
} from '@hashgraph-dev/stablecoin-npm-sdk';

/**
 * Factory Proxy Implementation
 */
export default class ImplementationFactoryProxyService extends Service {
  constructor() {
    super('Factory Proxy Implementation');
  }

  /**
   * upgrade the proxy implementation
   */
  public async upgradeImplementation(
    req: UpgradeFactoryImplementationRequest,
    currentImpl: string,
  ): Promise<void> {
    console.log(
      language.getText('proxyConfiguration.currentImplementation') +
        currentImpl,
    );

    await utilsService.handleValidation(
      () => req.validate('implementationAddress'),
      async () => {
        req.implementationAddress = await utilsService.defaultSingleAsk(
          language.getText('wizard.askFactoryImplementation'),
          '0.0.0',
        );
      },
    );

    await utilsService.showSpinner(Proxy.upgradeFactoryImplementation(req), {
      text: language.getText('state.loading'),
      successText:
        language.getText('state.upgradeImplementationCompleted') + '\n',
    });

    console.log(language.getText('operation.success'));

    utilsService.breakLine();
  }
}
