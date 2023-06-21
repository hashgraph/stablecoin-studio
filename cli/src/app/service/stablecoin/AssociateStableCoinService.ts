import { language } from '../../../index.js';
import { utilsService } from '../../../index.js';
import Service from '../Service.js';
import {
  AssociateTokenRequest,
  StableCoin,
} from '@hashgraph-dev/stablecoin-npm-sdk';

export default class AssociateStableCoinsService extends Service {
  constructor() {
    super('Associate Stable Coin');
  }

  public async associateStableCoin(
    account: string,
    token: string,
  ): Promise<void> {
    await utilsService.showSpinner(
      StableCoin.associate(
        new AssociateTokenRequest({
          targetId: account,
          tokenId: token,
        }),
      ),
      {
        text: language.getText('state.loading'),
        successText: language.getText('state.associateCompleted') + '\n',
        failText: 'Error associating token to account',
      },
    );

    utilsService.breakLine();
  }
}
