import { language } from '../../../index.js';
import { utilsService } from '../../../index.js';
import Service from '../Service.js';
import {
  AcceptProxyOwnerRequest,
  ChangeProxyOwnerRequest,
  Proxy,
} from '@hashgraph/stablecoin-npm-sdk';

/**
 * Proxy Owner
 */
export default class OwnerProxyService extends Service {
  constructor() {
    super('Proxy Owner');
  }

  /**
   * change the proxy's owner
   */
  public async changeProxyOwner(req: ChangeProxyOwnerRequest): Promise<void> {
    await utilsService.showSpinner(Proxy.changeProxyOwner(req), {
      text: language.getText('state.loading'),
      successText: language.getText('state.changeOwnerCompleted') + '\n',
    });

    console.log(language.getText('operation.success'));

    utilsService.breakLine();
  }

  /**
   * accept the proxy's owner
   */
  public async acceptProxyOwner(req: AcceptProxyOwnerRequest): Promise<void> {
    await utilsService.showSpinner(Proxy.acceptProxyOwner(req), {
      text: language.getText('state.loading'),
      successText: language.getText('state.acceptOwnerCompleted') + '\n',
    });

    console.log(language.getText('operation.success'));

    utilsService.breakLine();
  }

  /**
   * cancel the proxy's owner
   */
  public async cancelProxyOwner(currentTokenId: string): Promise<void> {
    const configAccount = utilsService.getCurrentAccount();

    const changeProxyOwnerRequest = new ChangeProxyOwnerRequest({
      tokenId: currentTokenId,
      targetId: configAccount.accountId,
    });

    await this.changeProxyOwner(changeProxyOwnerRequest);

    const acceptProxyOwnerRequest = new AcceptProxyOwnerRequest({
      tokenId: currentTokenId,
    });

    await this.acceptProxyOwner(acceptProxyOwnerRequest);
  }
}
