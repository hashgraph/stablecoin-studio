import { configurationService, language } from './../../../index.js';
import { StableCoin } from '../../../domain/stablecoin/StableCoin.js';
import { utilsService } from '../../../index.js';
import { SDK, ICreateStableCoinRequest } from 'hedera-stable-coin-sdk';
import { IManagedFeatures } from '../../../domain/configuration/interfaces/IManagedFeatures.js';
import Service from '../Service.js';

export const createdStableCoin = {
  name: '',
  symbol: '',
  autoRenewAccountId: '',
  decimals: '',
  initialSupply: undefined,
  supplyType: true,
  totalSupply: '',
  supplyKey: '',
  freezeKey: '',
  adminKey: '',
  KYCKey: '',
  wipeKey: '',
  pauseKey: '',
  treasuryAccountAddress: '',
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
  ): Promise<StableCoin> {
    if (isWizard) {
      stableCoin = await this.wizardCreateStableCoin();
    }

    // Call to create stable coin sdk function
    const sdk: SDK = utilsService.getSDK();

    configurationService.getConfiguration();

    // Loading
    utilsService.showMessage('\n');
    await utilsService.showSpinner(
      new Promise((resolve, reject) => {
        const req: ICreateStableCoinRequest = {
          accountId:
            configurationService.getConfiguration().accounts[0].accountId,
          privateKey:
            configurationService.getConfiguration().accounts[0].privateKey,
          ...stableCoin,
        };
        console.debug('Final request:', req);
        sdk
          .createStableCoin(req)
          .then((coin) => {
            console.log(coin);
            resolve(coin);
          })
          .catch((err) => {
            reject(err);
          });
      }),
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
    return stableCoin;
  }

  /**
   * Specific function for wizard to create stable coin
   * @returns
   */
  public async wizardCreateStableCoin(): Promise<StableCoin> {
    utilsService.showMessage(language.getText('general.newLine'));
    // Call to create stable coin sdk function
    const sdk: SDK = utilsService.getSDK();

    const name = await utilsService.defaultSingleAsk(
      language.getText('stablecoin.askName'),
      createdStableCoin.name || 'HEDERACOIN',
    );
    createdStableCoin.name = name;

    const symbol = await utilsService.defaultSingleAsk(
      language.getText('stablecoin.askSymbol'),
      createdStableCoin.symbol || 'HDC',
    );
    createdStableCoin.symbol = symbol;
    let autoRenewAccountId = '';
    try {
      autoRenewAccountId = await utilsService.defaultSingleAsk(
        language.getText('stablecoin.askAutoRenewAccountId'),
        createdStableCoin.autoRenewAccountId || '0.0.0',
      );
      sdk.checkIsAddress(autoRenewAccountId);
    } catch (error) {
      console.log(language.getText('account.wrong'));
      autoRenewAccountId = await utilsService.defaultSingleAsk(
        language.getText('stablecoin.askAutoRenewAccountId'),
        createdStableCoin.autoRenewAccountId || '0.0.0',
      );
    }
    createdStableCoin.autoRenewAccountId = autoRenewAccountId;

    const optionalProps = await this.askForOptionalProps();
    let decimals = '6';
    let initialSupply = '';
    let supplyType = false;
    let totalSupply = undefined;

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
    }

    const managedBySC = await this.askForManagedFeatures();
    if (managedBySC) {
      return {
        name,
        symbol,
        autoRenewAccountId,
        decimals: parseInt(decimals),
        initialSupply: initialSupply === '' ? undefined : BigInt(initialSupply),
        supplyType: supplyType ? 'INFINITE' : 'FINITE',
        maxSupply: totalSupply ? BigInt(totalSupply) : totalSupply,
      };
    }

    const { adminKey, supplyKey, KYCKey, freezeKey, wipeKey, pauseKey } =
      await this.configureManagedFeatures();

    createdStableCoin.adminKey = adminKey;
    createdStableCoin.supplyKey = supplyKey;
    createdStableCoin.KYCKey = KYCKey;
    createdStableCoin.freezeKey = freezeKey;
    createdStableCoin.wipeKey = wipeKey;
    createdStableCoin.pauseKey = pauseKey;

    let treasuryAccountAddress;

    if (supplyKey !== language.getArray('wizard.featureOptions')[0]) {
      try {
        await utilsService.defaultSingleAsk(
          language.getText('stablecoin.askTreasuryAccountAddress'),
          createdStableCoin.treasuryAccountAddress || '0.0.0',
        );
        sdk.checkIsAddress(treasuryAccountAddress);
      } catch (error) {
        console.log(language.getText('account.wrong'));
        treasuryAccountAddress = await utilsService.defaultSingleAsk(
          language.getText('stablecoin.askTreasuryAccountAddress'),
          createdStableCoin.treasuryAccountAddress || '0.0.0',
        );
      }
      createdStableCoin.treasuryAccountAddress = treasuryAccountAddress;
    }

    return {
      name,
      symbol,
      autoRenewAccountId,
      decimals: parseInt(decimals),
      initialSupply: initialSupply === '' ? undefined : BigInt(initialSupply),
      supplyType: supplyType ? 'INFINITE' : 'FINITE',
      maxSupply: totalSupply ? BigInt(totalSupply) : totalSupply,
      freezeKey,
      KYCKey,
      wipeKey,
      adminKey,
      supplyKey,
      pauseKey,
      treasuryAccountAddress,
    };
  }

  private async askForDecimals(): Promise<string> {
    return await utilsService.defaultSingleAsk(
      language.getText('stablecoin.askDecimals'),
      createdStableCoin.decimals || '6',
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

  private async askForManagedFeatures(): Promise<boolean> {
    return await utilsService.defaultConfirmAsk(
      language.getText('stablecoin.askFeaturesManagedBy'),
      true,
    );
  }

  private async configureManagedFeatures(): Promise<IManagedFeatures> {
    const adminKey = await this.checkOtherKey(
      await utilsService.defaultMultipleAsk(
        language.getText('stablecoin.features.admin'),
        language.getArray('wizard.featureOptions'),
      ),
    );

    const KYCKey = await this.checkOtherKey(
      await utilsService.defaultMultipleAsk(
        language.getText('stablecoin.features.KYC'),
        language.getArray('wizard.featureOptions'),
      ),
    );

    const freezeKey = await this.checkOtherKey(
      await utilsService.defaultMultipleAsk(
        language.getText('stablecoin.features.freeze'),
        language.getArray('wizard.featureOptions'),
      ),
    );

    const wipeKey = await this.checkOtherKey(
      await utilsService.defaultMultipleAsk(
        language.getText('stablecoin.features.wipe'),
        language.getArray('wizard.featureOptions'),
      ),
    );

    const pauseKey = await this.checkOtherKey(
      await utilsService.defaultMultipleAsk(
        language.getText('stablecoin.features.pause'),
        language.getArray('wizard.featureOptions'),
      ),
    );

    const supplyKey = await this.checkOtherKey(
      await utilsService.defaultMultipleAsk(
        language.getText('stablecoin.features.supply'),
        language.getArray('wizard.featureOptions'),
      ),
    );

    return { adminKey, supplyKey, KYCKey, freezeKey, wipeKey, pauseKey };
  }

  private async checkOtherKey(answer: string): Promise<string> {
    if (answer === 'Other key') {
      answer = await utilsService.defaultSingleAsk(
        language.getText('stablecoin.features.key'),
        '0.0.0',
      );
    }
    return answer;
  }
}
