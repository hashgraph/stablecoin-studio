import { language } from '../../../index.js';
import { utilsService } from '../../../index.js';
import Service from '../Service.js';
import { UpdateRequest, StableCoin } from '@hashgraph/stablecoin-npm-sdk';

export default class UpdateStableCoinService extends Service {
  constructor() {
    super('Update Stablecoin');
  }

  public async update(request: UpdateRequest): Promise<void> {
    await utilsService.showSpinner(StableCoin.update(request), {
      text: language.getText('state.loading'),
      successText: language.getText('state.updateCompleted') + '\n',
    });

    console.log(language.getText('operation.success'));

    utilsService.breakLine();
  }
}
