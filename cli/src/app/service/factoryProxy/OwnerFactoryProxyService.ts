import { language } from '../../../index.js';
import { utilsService } from '../../../index.js';
import Service from '../Service.js';
import {
  ChangeFactoryProxyOwnerRequest,
  Proxy,
} from '@hashgraph-dev/stablecoin-npm-sdk';

/**
 * Proxy Owner
 */
export default class OwnerFactoryProxyService extends Service {
  constructor() {
    super('Factory proxy Owner');
  }

  /**
   * change the proxy's owner of the factory
   */
  public async changeFactoryProxyOwner(
    req: ChangeFactoryProxyOwnerRequest,
  ): Promise<void> {
    await utilsService.handleValidation(
      () => req.validate('targetId'),
      async () => {
        req.targetId = await utilsService.defaultSingleAsk(
          language.getText('factory.askNewOwner'),
          '0.0.0',
        );
      },
    );

    await utilsService.showSpinner(Proxy.changeFactoryProxyOwner(req), {
      text: language.getText('state.loading'),
      successText: language.getText('state.changeOwnerCompleted') + '\n',
    });

    console.log(language.getText('operation.success'));

    utilsService.breakLine();
  }
}
