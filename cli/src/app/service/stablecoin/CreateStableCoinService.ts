import { configurationService, language } from './../../../index.js';
import { utilsService } from '../../../index.js';
import {
  SDK,
  AccountId,
  PrivateKey,
  PublicKey,
  IStableCoinDetail,
  CreateStableCoinRequest,
  RequestPrivateKey,
  TokenSupplyType,
} from 'hedera-stable-coin-sdk';
import { IManagedFeatures } from '../../../domain/configuration/interfaces/IManagedFeatures.js';
import Service from '../Service.js';
import SetConfigurationService from '../configuration/SetConfigurationService.js';
import { IAccountConfig } from '../../../domain/configuration/interfaces/IAccountConfig.js';

// export const createdStableCoin = {
//   name: '',
//   symbol: '',
//   autoRenewAccount: '',
//   decimals: '',
//   initialSupply: undefined,
//   supplyType: true,
//   totalSupply: '',
//   supplyKey: undefined,
//   freezeKey: undefined,
//   adminKey: undefined,
//   KYCKey: undefined,
//   wipeKey: undefined,
//   pauseKey: undefined,
//   treasury: undefined,
//   autoRenewAccountId: undefined,
// };

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
    stableCoin: CreateStableCoinRequest,
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
        sdk
          .createStableCoin(stableCoin)
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
  public async wizardCreateStableCoin(): Promise<CreateStableCoinRequest> {
    const currentAccount = utilsService.getCurrentAccount();

    utilsService.displayCurrentUserInfo(currentAccount);

    // Call to create stable coin sdk function
    const sdk: SDK = utilsService.getSDK();
    let tokenToCreate = new CreateStableCoinRequest({
      account: {
        accountId: currentAccount.accountId,
        privateKey: {
          key: currentAccount.privateKey.key,
          type: currentAccount.privateKey.type,
        },
      },
      name: '',
      symbol: '',
      decimals: 6,
    });

    const name = await utilsService.defaultSingleAsk(
      language.getText('stablecoin.askName'),
      tokenToCreate.name || 'HEDERACOIN',
    );
    tokenToCreate.name = name;

    const symbol = await utilsService.defaultSingleAsk(
      language.getText('stablecoin.askSymbol'),
      tokenToCreate.symbol || 'HDC',
    );
    tokenToCreate.symbol = symbol;
    let autoRenewAccount = '';
    try {
      autoRenewAccount = await utilsService.defaultSingleAsk(
        language.getText('stablecoin.askAutoRenewAccountId'),
        tokenToCreate.autoRenewAccount || currentAccount.accountId,
      );
      while (autoRenewAccount !== currentAccount.accountId) {
        console.log(language.getText('stablecoin.autoRenewAccountError'));
        autoRenewAccount = await utilsService.defaultSingleAsk(
          language.getText('stablecoin.askAutoRenewAccountId'),
          tokenToCreate.autoRenewAccount || currentAccount.accountId,
        );
      }
      sdk.checkIsAddress(autoRenewAccount);
    } catch (error) {
      console.log(language.getText('account.wrong'));
      autoRenewAccount = await utilsService.defaultSingleAsk(
        language.getText('stablecoin.askAutoRenewAccountId'),
        tokenToCreate.autoRenewAccount || currentAccount.accountId,
      );
    }
    tokenToCreate.autoRenewAccount = autoRenewAccount;

    const optionalProps = await this.askForOptionalProps();
    let decimals = '6';
    let initialSupply = '';
    let supplyType = true;
    let totalSupply = undefined;
    const privateKey: RequestPrivateKey = {
      key: currentAccount.privateKey.key,
      type: currentAccount.privateKey.type,
    };

    if (optionalProps) {
      tokenToCreate.decimals = await this.askForDecimals(decimals);
      await utilsService.handleValidation(
        () => tokenToCreate.validate('decimals'),
        async () => {
          decimals = await this.askForDecimals(tokenToCreate.decimals.toString());
          tokenToCreate.decimals = decimals;
        },
      );

      supplyType = await this.askForSupplyType();
      tokenToCreate.supplyType = supplyType
        ? TokenSupplyType.INFINITE
        : TokenSupplyType.FINITE;

      if (!supplyType) {
        totalSupply = await this.askForTotalSupply();
        while (isNaN(Number(totalSupply))) {
          utilsService.showError(language.getText('general.incorrectParam'));
          totalSupply = await this.askForTotalSupply();
        }
        while (parseFloat(initialSupply) > parseFloat(totalSupply)) {
          utilsService.showError(
            language.getText('stablecoin.initialSupplyError'),
          );
          totalSupply = await this.askForTotalSupply(
            tokenToCreate.maxSupply
              ? tokenToCreate.maxSupply.toString()
              : tokenToCreate.initialSupply?.toString(),
          );
        }
        tokenToCreate.maxSupply = totalSupply;
      }

      initialSupply = await this.askForInitialSupply(
        tokenToCreate.initialSupply?.toString(),
      );
      if (totalSupply) {
        while (parseFloat(initialSupply) > parseFloat(totalSupply)) {
          utilsService.showError(
            language.getText('stablecoin.initialSupplyError'),
          );
          initialSupply = await this.askForInitialSupply();
        }
      }

      while (isNaN(Number(initialSupply))) {
        utilsService.showError(language.getText('general.incorrectParam'));
        initialSupply = await this.askForInitialSupply();
      }

      tokenToCreate.initialSupply = BigInt(initialSupply);
    }

    const managedBySC = await this.askForManagedFeatures();
    console.log({
      name,
      symbol,
      autoRenewAccount,
      decimals: parseInt(decimals),
      initialSupply: initialSupply === '' ? undefined : initialSupply,
      supplyType: supplyType ? 'INFINITE' : 'FINITE',
      maxSupply: totalSupply ?? '',
    });
    if (managedBySC) {
      const currentAccount: IAccountConfig = utilsService.getCurrentAccount();
      console.log('Token to create 1:', tokenToCreate);
      tokenToCreate.adminKey = PublicKey.fromPrivateKey(
        currentAccount.privateKey.key,
        currentAccount.privateKey.type,
      );
      tokenToCreate.freezeKey = PublicKey.NULL;
      //KYCKey,
      tokenToCreate.wipeKey = PublicKey.NULL;
      tokenToCreate.supplyKey = PublicKey.NULL;
      tokenToCreate.pauseKey = PublicKey.NULL;
      tokenToCreate.treasury = AccountId.NULL.id;
      console.log('Token to create:', tokenToCreate);
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

    tokenToCreate.adminKey = adminKey;
    tokenToCreate.supplyKey = supplyKey;
    //tokenToCreate.KYCKey = KYCKey;
    tokenToCreate.freezeKey = freezeKey;
    tokenToCreate.wipeKey = wipeKey;
    tokenToCreate.pauseKey = pauseKey;

    const treasury = this.getTreasuryAccountFromSupplyKey(supplyKey);
    console.log({
      name,
      symbol,
      autoRenewAccount,
      decimals: parseInt(decimals),
      initialSupply: initialSupply === '' ? undefined : initialSupply,
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
      treasury: treasury !== '0.0.0' ? treasury : 'The Smart Contract',
    });
    tokenToCreate = new CreateStableCoinRequest({
      account: {
        accountId: currentAccount.accountId,
        privateKey,
      },
      name,
      symbol,
      autoRenewAccount,
      decimals: parseInt(decimals),
      initialSupply: initialSupply === '' ? undefined : BigInt(initialSupply),
      supplyType: supplyType
        ? TokenSupplyType.INFINITE
        : TokenSupplyType.FINITE,
      maxSupply: totalSupply ? BigInt(totalSupply) : totalSupply,
      freezeKey,
      //KYCKey,
      wipeKey,
      adminKey,
      supplyKey,
      pauseKey,
      treasury: treasury,
    });
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

  private async askForDecimals(val?: string): Promise<string> {
    return await utilsService.defaultSingleAsk(
      language.getText('stablecoin.askDecimals'),
      val || '6',
    );
  }

  private async askForOptionalProps(): Promise<boolean> {
    return await utilsService.defaultConfirmAsk(
      language.getText('stablecoin.askOptionalProps'),
      true,
    );
  }

  private async askForInitialSupply(val?: string): Promise<string> {
    return await utilsService.defaultSingleAsk(
      language.getText('stablecoin.askInitialSupply'),
      val || undefined,
    );
  }

  private async askForSupplyType(val?: boolean): Promise<boolean> {
    return await utilsService.defaultConfirmAsk(
      language.getText('stablecoin.askSupplyType'),
      val || true,
    );
  }

  private async askForTotalSupply(val?: string): Promise<string> {
    return await utilsService.defaultSingleAsk(
      language.getText('stablecoin.askTotalSupply'),
      val || '1',
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

  private getTreasuryAccountFromSupplyKey(supplyKey: PublicKey): string {
    if (supplyKey && !PublicKey.isNull(supplyKey)) {
      const currentAccount = utilsService.getCurrentAccount();
      return currentAccount.accountId;
    } else {
      return AccountId.NULL.id;
    }
  }
}
