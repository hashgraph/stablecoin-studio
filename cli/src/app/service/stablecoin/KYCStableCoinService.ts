import { language } from '../../../index.js';
import { utilsService } from '../../../index.js';
import Service from '../Service.js';
import { KYCRequest, StableCoin } from 'hedera-stable-coin-sdk';

/**
 * Create Role Stable Coin Service
 */
export default class KYCStableCoinService extends Service {
  constructor() {
    super('KYC Stable Coin');
  }

  public async grantKYCToAccount(req: KYCRequest): Promise<void> {
    await utilsService.showSpinner(StableCoin.grantKyc(req), {
      text: language.getText('state.loading'),
      successText: language.getText('state.KYCGranted') + '\n',
    });

    console.log(language.getText('operation.success'));

    utilsService.breakLine();
  }

  public async revokeKYCFromAccount(req: KYCRequest): Promise<void> {
    await utilsService.showSpinner(StableCoin.revokeKyc(req), {
      text: language.getText('state.loading'),
      successText: language.getText('state.KYCRevoked') + '\n',
    });

    console.log(language.getText('operation.success'));

    utilsService.breakLine();
  }
}
