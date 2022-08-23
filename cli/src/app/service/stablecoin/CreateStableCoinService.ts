import { configurationService, language } from './../../../index.js';
import { StableCoin } from '../../../domain/stablecoin/StableCoin.js';
import { utilsService } from '../../../index.js';
import Service from '../Service.js';
import { SDK, Account } from "hedera-stable-coin-sdk";

/**
 * Create Stable Coin Service
 */
export default class CreateStableCoinService extends Service {
  constructor() {
    super('Create Stable Coin');
  }

  /**
   * Create stable coin in hedera
   * @param stableCoin 
   * @param isWizard 
   */
  public async createStableCoin(
    stableCoin: StableCoin,
    isWizard = false,
  ): Promise<void> {

    if (isWizard) {
        stableCoin = await this.wizardCreateStableCoin();
    }

    utilsService.showMessage(language.getText('stablecoin.description') + ` ${stableCoin.name}...\n`);

    // Call to create stable coin sdk function
    const sdk: SDK = new SDK();

    configurationService.getConfiguration()
    const stableCoinCreated = sdk.createStableCoin({
        account: (configurationService.getConfiguration().accounts[0] as unknown) as Account,
        name: stableCoin.name,
        symbol: stableCoin.symbol,
        decimals: stableCoin.decimals
    });
    console.log(stableCoinCreated);

    utilsService.showMessage(
        `Stable Coin ${stableCoin.name} (${stableCoin.symbol}) with ${stableCoin.decimals} decimals have been created!`,
    );
  };

  /**
   * Specific function for wizard to create stable coin
   * @returns
   */
  public async wizardCreateStableCoin(): Promise<StableCoin> {
    utilsService.showMessage(language.getText('general.newLine'));
    const name = await utilsService.defaultSingleAsk(
      language.getText('stablecoin.askName'),
      'PAPACOIN',
    );
    const symbol = await utilsService.defaultSingleAsk(
      language.getText('stablecoin.askSymbol'),
      'PPC',
    );
    let decimals = await this.askForDecimals();

    while (isNaN(Number(decimals))) {
      utilsService.showError(language.getText('general.incorrectParam'));
      decimals = await this.askForDecimals();
    }

    return { name, symbol, decimals: parseInt(decimals) };
  };

  private async askForDecimals(): Promise<string> {
    return await utilsService.defaultSingleAsk(
      language.getText('stablecoin.askDecimals'),
      '18',
    );
  };

}
