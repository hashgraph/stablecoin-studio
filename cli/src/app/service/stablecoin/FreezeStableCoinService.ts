import { language } from '../../../index.js';
import { utilsService } from '../../../index.js';
import Service from '../Service.js';
import { FreezeAccountRequest, StableCoin } from 'hedera-stable-coin-sdk';
import colors from 'colors';

/**
 * Create Role Stable Coin Service
 */
export default class FreezeStableCoinService extends Service {
  constructor() {
    super('Freeze Stable Coin');
  }

  public async freezeAccount(req: FreezeAccountRequest): Promise<void> {
    await utilsService.showSpinner(StableCoin.freeze(req), {
      text: language.getText('state.loading'),
      successText: language.getText('state.freezeCompleted') + '\n',
    });

    console.log(language.getText('operation.success'));

    utilsService.breakLine();
  }

  public async unfreezeAccount(req: FreezeAccountRequest): Promise<void> {
    await utilsService.showSpinner(StableCoin.unFreeze(req), {
      text: language.getText('state.loading'),
      successText: language.getText('state.unfreezeCompleted') + '\n',
    });

    console.log(language.getText('operation.success'));

    utilsService.breakLine();
  }

  public async isAccountFrozenDisplay(
    req: FreezeAccountRequest,
  ): Promise<void> {
    let isFrozen = false;
    let response = language.getText('state.accountNotFrozen');
    await utilsService.showSpinner(
      StableCoin.isAccountFrozen(req).then((response) => (isFrozen = response)),
      {
        text: language.getText('state.loading'),
        successText: language.getText('state.loadCompleted') + '\n',
      },
    );
    if (isFrozen) {
      response = language.getText('state.accountFrozen');
    }

    console.log(
      response
        .replace('${address}', req.targetId)
        .replace('${token}', colors.yellow(req.tokenId)) + '\n',
    );

    utilsService.breakLine();
  }

  public async isAccountFrozen(req: FreezeAccountRequest): Promise<boolean> {
    return await StableCoin.isAccountFrozen(req);
  }
}
