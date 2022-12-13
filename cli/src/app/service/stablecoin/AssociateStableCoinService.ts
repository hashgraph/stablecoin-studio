import { language } from '../../../index.js';
import { utilsService } from '../../../index.js';
import Service from '../Service.js';
import {
  AssociateTokenRequest,
  RequestAccount,
  StableCoin,
} from 'hedera-stable-coin-sdk';

export default class AssociateStableCoinsService extends Service {
  constructor() {
    super('Associate Stable Coin');
  }

  public async associateStableCoin(
    proxyContractId: string,
    account: RequestAccount,
  ): Promise<void> {
    let respDetail;

    await utilsService.showSpinner(
      StableCoin.associate(
        new AssociateTokenRequest({
          proxyContractId,
          account,
        }),
      ).then((response) => (respDetail = response)),
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
