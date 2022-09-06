import { configurationService, language } from './../../../index.js';
import { StableCoin } from '../../../domain/stablecoin/StableCoin.js';
import { utilsService } from '../../../index.js';
import { SDK, Account } from 'hedera-stable-coin-sdk';
import { IManagedFeatures } from '../../../domain/configuration/interfaces/IManagedFeatures.js';
import Service from '../Service.js';

export const createdStableCoin = {
  name: '',
  symbol: '',
  decimals: '',
  initialSupply: undefined,
  supplyType: true,
  totalSupply: '',
  expirationTime: '',
  memo: '',
  freeze: false,
  admin: '',
  KYC: '',
  wipe: '',
  feeSchedule: '',
};

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

    // Call to create stable coin sdk function
    const sdk: SDK = utilsService.getSDK();

    configurationService.getConfiguration();
    const stableCoinCreated = await sdk.createStableCoin({
      account: configurationService.getConfiguration()
        .accounts[0] as unknown as Account,
      name: stableCoin.name,
      symbol: stableCoin.symbol,
      decimals: stableCoin.decimals,
      initialSupply: stableCoin.initialSupply,
      maxSupply: stableCoin.maxSupply,
      freezeDefault: stableCoin.freezeDefault,
    });
    console.log(stableCoinCreated);

    // Loading
    utilsService.showMessage('\n');
    await utilsService.showSpinner(
      new Promise((resolve) => setTimeout(resolve, 4000)),
      {
        text:
          language.getText('stablecoin.description') + ` ${stableCoin.name}...`,
        failText: 'Error',
        successText: language.getText('stablecoin.created', {
          name: stableCoin.name,
          symbol: stableCoin.symbol,
          decimals: stableCoin.decimals,
        }),
      },
    );
  }

  /**
   * Specific function for wizard to create stable coin
   * @returns
   */
  public async wizardCreateStableCoin(): Promise<StableCoin> {
    utilsService.showMessage(language.getText('general.newLine'));

    const name = await utilsService.defaultSingleAsk(
      language.getText('stablecoin.askName'),
      createdStableCoin.name || 'PAPACOIN',
    );
    createdStableCoin.name = name;

    const symbol = await utilsService.defaultSingleAsk(
      language.getText('stablecoin.askSymbol'),
      createdStableCoin.symbol || 'PPC',
    );
    createdStableCoin.symbol = symbol;

    const optionalProps = await this.askForOptionalProps();
    let decimals = '';
    let initialSupply = '';
    let supplyType = false;
    let totalSupply = '';
    let expirationTime = '';
    let memo = '';
    let freeze = false;

    if (optionalProps) {
      decimals = await this.askForDecimals();

      while (isNaN(Number(decimals))) {
        utilsService.showError(language.getText('general.incorrectParam'));
        decimals = await this.askForDecimals();
      }
      createdStableCoin.decimals = decimals;

      initialSupply = await this.askForInitialSupply();
      createdStableCoin.initialSupply = initialSupply;
      supplyType = await this.askForSupplyType();
      createdStableCoin.supplyType = supplyType;

      if (!supplyType) {
        totalSupply = await this.askForTotalSupply();
        createdStableCoin.totalSupply = totalSupply;
      }

      expirationTime = await this.askForExpirationTime();
      createdStableCoin.expirationTime = expirationTime;
      memo = await this.askForMemo();
      createdStableCoin.memo = memo;
      freeze = await this.askForFreeze();
      createdStableCoin.freeze = freeze;
    }

    const managedBySC = await this.askForManagedFeatures();

    if (!managedBySC) {
      return { name, symbol, decimals: 18 };
    }

    const {
      admin,
      supply,
      KYC,
      freeze: freezeManaged,
      wipe,
      feeSchedule,
    } = await this.configureManagedFeatures();
    createdStableCoin.admin = admin;
    createdStableCoin.totalSupply = supply;
    createdStableCoin.KYC = KYC;
    createdStableCoin.freeze = freeze;
    createdStableCoin.wipe = wipe;
    createdStableCoin.feeSchedule = feeSchedule;

    return {
      name,
      symbol,
      decimals: parseInt(decimals),
      initialSupply: initialSupply === '' ? undefined : BigInt(initialSupply),
      supplyType: supplyType ? 'INFINITE' : 'FINITE',
      maxSupply: supply ? BigInt(supply) : BigInt(totalSupply),
      expirationTime: parseInt(expirationTime),
      memo,
      freezeDefault: freezeManaged ?? freeze,
      KYC,
      wipe,
      feeSchedule,
      admin,
    };
  }

  private async askForDecimals(): Promise<string> {
    return await utilsService.defaultSingleAsk(
      language.getText('stablecoin.askDecimals'),
      createdStableCoin.decimals || '18',
    );
  }

  private async askForOptionalProps(): Promise<boolean> {
    return await utilsService.defaultConfirmAsk(
      language.getText('stablecoin.askOptionalProps'),
      true,
    );
  }

  private async askForInitialSupply(): Promise<string> {
    return await utilsService.defaultSingleAsk(
      language.getText('stablecoin.askInitialSupply'),
      createdStableCoin.initialSupply || undefined,
    );
  }

  private async askForSupplyType(): Promise<boolean> {
    return await utilsService.defaultConfirmAsk(
      language.getText('stablecoin.askSupplyType'),
      createdStableCoin.supplyType || true,
    );
  }

  private async askForTotalSupply(): Promise<string> {
    return await utilsService.defaultSingleAsk(
      language.getText('stablecoin.askTotalSupply'),
      createdStableCoin.totalSupply || '1',
    );
  }

  private async askForExpirationTime(): Promise<string> {
    return await utilsService.defaultSingleAsk(
      language.getText('stablecoin.askExpirationTime'),
      createdStableCoin.expirationTime || '90', //TODO 90 days, have to multiply by 86400 to convert to seconds
    );
  }

  private async askForMemo(): Promise<string> {
    return await utilsService.defaultSingleAsk(
      language.getText('stablecoin.askMemo'),
      createdStableCoin.memo || 'Description about stable coin',
    );
  }

  private async askForFreeze(): Promise<boolean> {
    return await utilsService.defaultConfirmAsk(
      language.getText('stablecoin.askFreezeAccount'),
      createdStableCoin.freeze || false,
    );
  }

  private async askForManagedFeatures(): Promise<boolean> {
    return await utilsService.defaultConfirmAsk(
      language.getText('stablecoin.askFeaturesManagedBy'),
      true,
    );
  }

  private async configureManagedFeatures(): Promise<IManagedFeatures> {
    const admin = await utilsService.defaultSingleAsk(
      language.getText('stablecoin.features.admin'),
      createdStableCoin.admin || '', //TODO Check correct default value
    );

    const supply = await utilsService.defaultSingleAsk(
      language.getText('stablecoin.features.supply'),
      createdStableCoin.totalSupply || '', //TODO Check correct default value
    );

    const KYC = await utilsService.defaultSingleAsk(
      language.getText('stablecoin.features.KYC'),
      createdStableCoin.initialSupply || '', //TODO Check correct default value
    );

    const freeze = await utilsService.defaultConfirmAsk(
      language.getText('stablecoin.features.freeze'),
      createdStableCoin.freeze || false, //TODO Check correct default value
    );

    const wipe = await utilsService.defaultSingleAsk(
      language.getText('stablecoin.features.wipe'),
      createdStableCoin.wipe || '', //TODO Check correct default value
    );

    const feeSchedule = await utilsService.defaultSingleAsk(
      language.getText('stablecoin.features.feeSchedule'),
      createdStableCoin.feeSchedule || '', //TODO Check correct default value
    );

    return { admin, supply, KYC, freeze, wipe, feeSchedule };
  }
}
