import { language } from './../../../index.js';
import { utilsService } from '../../../index.js';
import Service from '../Service.js';
import { StableCoinList } from '../../../domain/stablecoin/StableCoinList.js';

/**
 * Create Stable Coin Service
 */
export default class ListStableCoinsService extends Service {
  private stableCoinId;

  constructor() {
    super('List Stable Coins');
  }

  /**
   * List Stable Coins can be managed
   */
  public async listStableCoins(): Promise<void> {
    // Call to list stable coins
    // const sdk: SDK = new SDK();
    // const accountId =
    //   configurationService.getConfiguration().accounts[0].accountId;

    await utilsService.showSpinner(
      new Promise((promise) => setTimeout(promise, 3000)),
      {
        text: language.getText('state.searching'),
        successText: language.getText('state.searchingSuccess') + '\n',
      },
    );

    const dataList: StableCoinList[] = [
      {
        id: '0.0.0001',
        symbol: 'PPC',
        name: 'PAPACOIN',
        balance: 299,
      },
    ];

    utilsService.drawTableListStableCoin(dataList);
    utilsService.breakLine();

    while (this.stableCoinId !== 'Exit to main menu') {
      this.stableCoinId = await utilsService.defaultMultipleAsk(
        language.getText('stablecoin.askStableCoinDetail'),
        ['Symbol 1', 'Symbol 2', 'Symbol 3', 'Exit to main menu'],
      );
      utilsService.breakLine();
    }
  }
}
