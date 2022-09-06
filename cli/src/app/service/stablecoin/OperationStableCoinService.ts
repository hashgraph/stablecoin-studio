/* eslint-disable no-case-declarations */
import {
  StableCoinDetail,
  StableCoinList,
} from '../../../domain/stablecoin/StableCoinList.js';
import {
  language,
  utilsService,
  wizardService,
  configurationService,
} from '../../../index.js';
import Service from '../Service.js';
import DetailsStableCoinsService from './DetailsStableCoinService.js';
import { SDK } from 'hedera-stable-coin-sdk';
import BalanceOfStableCoinsService from './BalanceOfStableCoinService.js';
import CashInStableCoinsService from './CashInStableCoinService.js';
import WipeStableCoinsService from './WipeStableCoinService.js';
import RescueStableCoinsService from './RescueStableCoinService.js';

/**
 * Operation Stable Coin Service
 */
export default class OperationStableCoinService extends Service {
  private stableCoinId;
  private treasuryStableCoinId;

  constructor() {
    super('Operation Stable Coin');
  }

  /**
   * Start the wizard for operation a stable coin
   */
  public async start(): Promise<void> {
    const sdk: SDK = utilsService.getSDK();
    let resp: StableCoinList[];

    //Get list of stable coins to display
    await utilsService.showSpinner(
      sdk
        .getListStableCoin({
          privateKey:
            configurationService.getConfiguration().accounts[0].privateKey,
        })
        .then((response: StableCoinList[]) => (resp = response)),
      {
        text: language.getText('state.searching'),
        successText: language.getText('state.searchingSuccess') + '\n',
      },
    );

    this.stableCoinId = await utilsService.defaultMultipleAsk(
      language.getText('stablecoin.askToken'),
      resp
        .map((item) => {
          return `${item.id} - ${item.symbol}`;
        })
        .concat('Exit to main menu'),
    );
    this.stableCoinId = this.stableCoinId.split(' - ')[0];

    if (this.stableCoinId === 'Exit to main menu') {
      await wizardService.mainMenu();
    } else {
      // Get details to obtain treasury
      await new DetailsStableCoinsService()
        .getDetailsStableCoins(this.stableCoinId, false)
        .then((response: StableCoinDetail) => {
          this.treasuryStableCoinId = response.memo;
        });

      await this.operationsStableCoin();
    }
  }

  private async operationsStableCoin(): Promise<void> {
    const wizardOperationsStableCoinOptions = language.getArray(
      'wizard.stableCoinOptions',
    );

    switch (
      await utilsService.defaultMultipleAsk(
        language.getText('stablecoin.askDoSomething') +
          ` (${this.stableCoinId})`,
        wizardOperationsStableCoinOptions,
      )
    ) {
      case wizardOperationsStableCoinOptions[0]:
        // Call to mint
        const amount2Mint = await utilsService.defaultSingleAsk(
          language.getText('stablecoin.askCashInAmount'),
          '1',
        );

        await new CashInStableCoinsService().cashInStableCoin(
          this.treasuryStableCoinId,
          configurationService.getConfiguration().accounts[0].privateKey,
          configurationService.getConfiguration().accounts[0].accountId,
          parseInt(amount2Mint) * 1000,
        );

        break;
      case wizardOperationsStableCoinOptions[1]:
        // Call to details
        await new DetailsStableCoinsService().getDetailsStableCoins(
          this.stableCoinId,
        );
        break;
      case wizardOperationsStableCoinOptions[2]:
        // Call to balance
        await new BalanceOfStableCoinsService().getBalanceOfStableCoin(
          this.treasuryStableCoinId,
          configurationService.getConfiguration().accounts[0].privateKey,
          configurationService.getConfiguration().accounts[0].accountId,
        );

        break;
      case wizardOperationsStableCoinOptions[3]:
        // Call to burn
        break;
      case wizardOperationsStableCoinOptions[4]:
        // Call to Wipe
        const amount2Wipe = await utilsService.defaultSingleAsk(
          language.getText('stablecoin.askWipeAmount'),
          '1',
        );

        await new WipeStableCoinsService().wipeStableCoin(
          this.treasuryStableCoinId,
          configurationService.getConfiguration().accounts[0].privateKey,
          configurationService.getConfiguration().accounts[0].accountId,
          parseInt(amount2Wipe) * 1000,
        );

        break;
      case wizardOperationsStableCoinOptions[5]:
        // Call to Rescue
        const amount2Rescue = await utilsService.defaultSingleAsk(
          language.getText('stablecoin.askWipeAmount'),
          '1',
        );

        await new RescueStableCoinsService().rescueStableCoin(
          this.treasuryStableCoinId,
          configurationService.getConfiguration().accounts[0].privateKey,
          configurationService.getConfiguration().accounts[0].accountId,
          parseInt(amount2Rescue) * 1000,
        );

        console.log(
          language
            .getText('rescue.success')
            .replace('${tokens}', amount2Rescue),
        );

        utilsService.breakLine();

        // Call to balance
        await new BalanceOfStableCoinsService().getBalanceOfStableCoin(
          this.treasuryStableCoinId,
          configurationService.getConfiguration().accounts[0].privateKey,
          configurationService.getConfiguration().accounts[0].accountId,
        );

        break;
      case wizardOperationsStableCoinOptions[
        wizardOperationsStableCoinOptions.length - 1
      ]:
      default:
        await wizardService.mainMenu();
    }

    await this.operationsStableCoin();
  }
}
