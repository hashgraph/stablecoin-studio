import { language } from '../../../index.js';
import { utilsService } from '../../../index.js';
import Service from '../Service.js';
import { KYCRequest, StableCoin } from '@hashgraph-dev/stablecoin-npm-sdk';
import colors from 'colors';

/**
 * Create Role Stablecoin Service
 */
export default class KYCStableCoinService extends Service {
  constructor() {
    super('KYC Stablecoin');
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

  public async isAccountKYCGranted(req: KYCRequest): Promise<void> {
    let isGranted = false;
    let response = language.getText('state.accountKYCNotGranted');
    await utilsService.showSpinner(
      StableCoin.isAccountKYCGranted(req).then(
        (response) => (isGranted = response),
      ),
      {
        text: language.getText('state.loading'),
        successText: language.getText('state.loadCompleted') + '\n',
      },
    );
    if (isGranted) {
      response = language.getText('state.accountKYCGranted');
    }

    console.log(
      response
        .replace('${address}', req.targetId)
        .replace('${token}', colors.yellow(req.tokenId)) + '\n',
    );

    utilsService.breakLine();
  }
}
