import { configurationService, language } from './../../../index.js';
import { utilsService } from '../../../index.js';
import {
  SDK,
  ICreateStableCoinRequest,
  AccountId,
  PrivateKey,
  PublicKey,
  IStableCoinDetail,
  EOAccount,
} from 'hedera-stable-coin-sdk';
import { IManagedFeatures } from '../../../domain/configuration/interfaces/IManagedFeatures.js';
import Service from '../Service.js';
import SetConfigurationService from '../configuration/SetConfigurationService.js';
import { StableCoin } from '../../../domain/stablecoin/StableCoin.js';
import { IAccountConfig } from '../../../domain/configuration/interfaces/IAccountConfig.js';

export const createdStableCoin = {
  name: '',
  symbol: '',
  autoRenewAccount: '',
  decimals: '',
  initialSupply: undefined,
  supplyType: true,
  totalSupply: '',
  supplyKey: undefined,
  freezeKey: undefined,
  adminKey: undefined,
  KYCKey: undefined,
  wipeKey: undefined,
  pauseKey: undefined,
  treasury: undefined,
  autoRenewAccountId: undefined,
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
  ): Promise<IStableCoinDetail> {
    if (isWizard) {
      stableCoin = await this.wizardCreateStableCoin();
    }

    // Call to create stable coin sdk function
    const sdk: SDK = utilsService.getSDK();
    const currentAccount = utilsService.getCurrentAccount();

    if (
      currentAccount.privateKey == null ||
      currentAccount.privateKey == undefined ||
      currentAccount.privateKey.key == ''
    ) {
      const setConfigurationService: SetConfigurationService =
        new SetConfigurationService();
      await setConfigurationService.initConfiguration(
        configurationService.getDefaultConfigurationPath(),
        currentAccount.network,
      );
    }
    let createdToken;

    // Loading
    utilsService.showMessage('\n');
    await utilsService.showSpinner(
      new Promise((resolve, reject) => {
        const req: ICreateStableCoinRequest = {
          account: new EOAccount(
            currentAccount.accountId,
            new PrivateKey(
              currentAccount.privateKey.key,
              currentAccount.privateKey.type,
            ),
          ),
          ...stableCoin,
        };
        sdk
          .createStableCoin(req)
          .then((coin) => {
            console.log(coin);
            createdToken = coin;
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
    return createdToken;
  }

  /**
   * Specific function for wizard to create stable coin
   * @returns
   */
  public async wizardCreateStableCoin(): Promise<StableCoin> {
    const currentAccount = utilsService.getCurrentAccount();

    utilsService.displayCurrentUserInfo(currentAccount);

    // Call to create stable coin sdk function
    const sdk: SDK = utilsService.getSDK();
    let tokenToCreate: StableCoin;

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
    let autoRenewAccount = '';
    try {
      autoRenewAccount = await utilsService.defaultSingleAsk(
        language.getText('stablecoin.askAutoRenewAccountId'),
        createdStableCoin.autoRenewAccount || currentAccount.accountId,
      );
      sdk.checkIsAddress(autoRenewAccount);
    } catch (error) {
      console.log(language.getText('account.wrong'));
      autoRenewAccount = await utilsService.defaultSingleAsk(
        language.getText('stablecoin.askAutoRenewAccountId'),
        createdStableCoin.autoRenewAccount || currentAccount.accountId,
      );
    }
    createdStableCoin.autoRenewAccount = autoRenewAccount;

    const optionalProps = await this.askForOptionalProps();
    let decimals = '6';
    let initialSupply = '';
    let supplyType = true;
    let totalSupply = undefined;

    if (optionalProps) {
      decimals = await this.askForDecimals();

      while (isNaN(Number(decimals))) {
        utilsService.showError(language.getText('general.incorrectParam'));
        decimals = await this.askForDecimals();
      }
      createdStableCoin.decimals = decimals;

      supplyType = await this.askForSupplyType();
      createdStableCoin.supplyType = supplyType;

      if (!supplyType) {
        totalSupply = await this.askForTotalSupply();
        createdStableCoin.totalSupply = totalSupply;
      }

      initialSupply = await this.askForInitialSupply();
      if (totalSupply) {
        while (parseFloat(initialSupply) > parseFloat(totalSupply)) {
          console.error(language.getText('stablecoin.initialSupplyError'));
          initialSupply = await this.askForInitialSupply();
        }
      }
      createdStableCoin.initialSupply = initialSupply;
    }

    const managedBySC = await this.askForManagedFeatures();
    console.log({
      name,
      symbol,
      autoRenewAccount,
      decimals: parseInt(decimals),
      initialSupply: initialSupply === '' ? undefined : BigInt(initialSupply),
      supplyType: supplyType ? 'INFINITE' : 'FINITE',
      maxSupply: totalSupply ? BigInt(totalSupply) : totalSupply,
    });
    if (managedBySC) {
      const currentAccount: IAccountConfig = utilsService.getCurrentAccount();
      const privateKey: PrivateKey = new PrivateKey(
        currentAccount.privateKey.key,
        currentAccount.privateKey.type,
      );
      tokenToCreate = {
        name,
        symbol,
        autoRenewAccount,
        decimals: parseInt(decimals),
        initialSupply: initialSupply === '' ? undefined : BigInt(initialSupply),
        supplyType: supplyType ? 'INFINITE' : 'FINITE',
        maxSupply: totalSupply ? BigInt(totalSupply) : totalSupply,
        adminKey: privateKey.publicKey,
        freezeKey: PublicKey.NULL,
        //KYCKey,
        wipeKey: PublicKey.NULL,
        supplyKey: PublicKey.NULL,
        pauseKey: PublicKey.NULL,
        treasury: AccountId.NULL,
      };
      if (
        !(await utilsService.defaultConfirmAsk(
          language.getText('stablecoin.askConfirmCreation'),
          true,
        ))
      ) {
        await utilsService.cleanAndShowBanner();

        tokenToCreate = await this.wizardCreateStableCoin();
      }
      return tokenToCreate;
    }

    const { adminKey, supplyKey, freezeKey, wipeKey, pauseKey } =
      await this.configureManagedFeatures();

    createdStableCoin.adminKey = adminKey;
    createdStableCoin.supplyKey = supplyKey;
    //createdStableCoin.KYCKey = KYCKey;
    createdStableCoin.freezeKey = freezeKey;
    createdStableCoin.wipeKey = wipeKey;
    createdStableCoin.pauseKey = pauseKey;

    const treasury = this.getTreasuryAccountFromSupplyKey(supplyKey);
    console.log({
      name,
      symbol,
      autoRenewAccount,
      decimals: parseInt(decimals),
      initialSupply: initialSupply === '' ? undefined : BigInt(initialSupply),
      supplyType: supplyType ? 'INFINITE' : 'FINITE',
      maxSupply: totalSupply ? BigInt(totalSupply) : totalSupply,
      freezeKey:
        freezeKey === undefined
          ? 'None'
          : freezeKey.key !== 'null'
          ? freezeKey
          : 'The Smart Contract',
      //KYCKey,
      wipeKey:
        wipeKey === undefined
          ? 'None'
          : wipeKey.key !== 'null'
          ? wipeKey
          : 'The Smart Contract',
      adminKey: adminKey ?? 'None',
      supplyKey:
        supplyKey === undefined
          ? 'None'
          : supplyKey.key !== 'null'
          ? supplyKey
          : 'The Smart Contract',
      pauseKey:
        pauseKey === undefined
          ? 'None'
          : pauseKey.key !== 'null'
          ? pauseKey
          : 'The Smart Contract',
      treasury: treasury.id !== '0.0.0' ? treasury : 'The Smart Contract',
    });
    tokenToCreate = {
      name,
      symbol,
      autoRenewAccount,
      decimals: parseInt(decimals),
      initialSupply: initialSupply === '' ? undefined : BigInt(initialSupply),
      supplyType: supplyType ? 'INFINITE' : 'FINITE',
      maxSupply: totalSupply ? BigInt(totalSupply) : totalSupply,
      freezeKey,
      //KYCKey,
      wipeKey,
      adminKey,
      supplyKey,
      pauseKey,
      treasury,
    };
    if (
      !(await utilsService.defaultConfirmAsk(
        language.getText('stablecoin.askConfirmCreation'),
        true,
      ))
    ) {
      await utilsService.cleanAndShowBanner();

      tokenToCreate = await this.wizardCreateStableCoin();
    }
    return tokenToCreate;
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
      createdStableCoin.totalSupply || createdStableCoin.initialSupply || '1',
    );
  }

  private async askForManagedFeatures(): Promise<boolean> {
    return await utilsService.defaultConfirmAsk(
      language.getText('stablecoin.askFeaturesManagedBy'),
      true,
    );
  }

  private async configureManagedFeatures(): Promise<IManagedFeatures> {
    const adminKey = await this.checkAnswer(
      await utilsService.defaultMultipleAsk(
        language.getText('stablecoin.features.admin'),
        language.getArray('wizard.adminFeatureOptions'),
      ),
    );

    /*const KYCKey = await this.checkAnswer(
      await utilsService.defaultMultipleAsk(
        language.getText('stablecoin.features.KYC'),
        language.getArray('wizard.featureOptions'),
      ),
    );*/

    const freezeKey = await this.checkAnswer(
      await utilsService.defaultMultipleAsk(
        language.getText('stablecoin.features.freeze'),
        language.getArray('wizard.featureOptions'),
      ),
    );

    const wipeKey = await this.checkAnswer(
      await utilsService.defaultMultipleAsk(
        language.getText('stablecoin.features.wipe'),
        language.getArray('wizard.featureOptions'),
      ),
    );

    const pauseKey = await this.checkAnswer(
      await utilsService.defaultMultipleAsk(
        language.getText('stablecoin.features.pause'),
        language.getArray('wizard.featureOptions'),
      ),
    );

    const supplyKey = await this.checkAnswer(
      await utilsService.defaultMultipleAsk(
        language.getText('stablecoin.features.supply'),
        language.getArray('wizard.featureOptions'),
      ),
    );

    return { adminKey, supplyKey, freezeKey, wipeKey, pauseKey };
  }

  private async checkAnswer(answer: string): Promise<PublicKey> {
    switch (answer) {
      case 'Current user key': {
        const currentAccount = utilsService.getCurrentAccount();
        const privateKey: PrivateKey = new PrivateKey(
          currentAccount.privateKey.key,
          currentAccount.privateKey.type,
        );
        return privateKey.publicKey;
      }

      case 'Other key': {
        const key = await utilsService.defaultPublicKeyAsk();
        return new PublicKey({
          key: key,
          type: 'ED25519',
        });
      }

      case 'None':
        return undefined;

      case 'The Smart Contract':
      default:
        return PublicKey.NULL;
    }
  }

  private getTreasuryAccountFromSupplyKey(supplyKey: PublicKey): AccountId {
    if (supplyKey && supplyKey !== PublicKey.NULL) {
      const currentAccount = utilsService.getCurrentAccount();
      return new AccountId(currentAccount.accountId);
    } else {
      return AccountId.NULL;
    }
  }
}
