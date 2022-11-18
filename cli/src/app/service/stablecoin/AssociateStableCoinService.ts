import { language } from '../../../index.js';
import { utilsService } from '../../../index.js';
import Service from '../Service.js';
import { AssociateTokenRequest, EOAccount, SDK } from 'hedera-stable-coin-sdk';

/**
 * Create Stable Coin Service
 */
export default class AssociateStableCoinsService extends Service {
  constructor() {
    super('Associate Stable Coin');
  }

  /**
   * List Stable Coins can be managed
   */
  public async associateStableCoin(
    proxyContractId: string,
    account: EOAccount,
  ): Promise<void> {
    // Call to list stable coins
    const sdk: SDK = utilsService.getSDK();

    let respDetail;

    await utilsService.showSpinner(
      sdk
        .associateToken(
          new AssociateTokenRequest({
            proxyContractId,
            account: {
              accountId: account.accountId.id,
              privateKey: account.privateKey,
            },
          }),
        )
        .then((response) => (respDetail = response)),
      {
        text: language.getText('state.loading'),
        successText: language.getText('state.associateCompleted') + '\n',
      },
    );

    console.log(
      respDetail[0]
        ? language.getText('operation.success')
        : language.getText('operation.reject'),
    );

    utilsService.breakLine();
  }
}
