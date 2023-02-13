import { configurationService, language } from './../../../index.js';
import { utilsService } from '../../../index.js';
import {
  CreateRequest,
  StableCoin,
  StableCoinViewModel,
  TokenSupplyType,
  RequestPrivateKey,
  RequestPublicKey,
  GetPublicKeyRequest,
  RequestAccount,
  Account,
} from '@hashgraph-dev/stablecoin-npm-sdk';
import { IManagedFeatures } from '../../../domain/configuration/interfaces/IManagedFeatures.js';
import Service from '../Service.js';
import SetConfigurationService from '../configuration/SetConfigurationService.js';

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
    stableCoin: CreateRequest,
    isWizard = false,
  ): Promise<StableCoinViewModel> {
    if (isWizard) {
      stableCoin = await this.wizardCreateStableCoin();
    }

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
        StableCoin.create(stableCoin)
          .then((response) => {
            console.log(response);
            createdToken = response.coin;
            resolve(response);
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
  public async wizardCreateStableCoin(): Promise<CreateRequest> {
    const currentAccount = utilsService.getCurrentAccount();
    utilsService.displayCurrentUserInfo(currentAccount);

    // Call to create stable coin sdk function
    let tokenToCreate = new CreateRequest({
      name: '',
      symbol: '',
      decimals: 6,
      createReserve: false,
      grantKYCToOriginalSender: false,
    });

    // Name
    tokenToCreate.name = await utilsService.defaultSingleAsk(
      language.getText('stablecoin.askName'),
      tokenToCreate.name || 'HEDERACOIN',
    );
    await utilsService.handleValidation(
      () => tokenToCreate.validate('name'),
      async () => {
        tokenToCreate.name = await utilsService.defaultSingleAsk(
          language.getText('stablecoin.askName'),
          tokenToCreate.name || 'HEDERACOIN',
        );
      },
    );

    // Symbol
    tokenToCreate.symbol = await utilsService.defaultSingleAsk(
      language.getText('stablecoin.askSymbol'),
      tokenToCreate.symbol || 'HDC',
    );
    await utilsService.handleValidation(
      () => tokenToCreate.validate('symbol'),
      async () => {
        tokenToCreate.symbol = await utilsService.defaultSingleAsk(
          language.getText('stablecoin.askSymbol'),
          tokenToCreate.symbol || 'HDC',
        );
      },
    );

    // Auto renew account
    tokenToCreate.autoRenewAccount = await utilsService.defaultSingleAsk(
      language.getText('stablecoin.askAutoRenewAccountId'),
      tokenToCreate.autoRenewAccount || currentAccount.accountId,
    );
    await utilsService.handleValidation(
      () => tokenToCreate.validate('autoRenewAccount'),
      async () => {
        tokenToCreate.autoRenewAccount = await utilsService.defaultSingleAsk(
          language.getText('stablecoin.askAutoRenewAccountId'),
          tokenToCreate.autoRenewAccount || currentAccount.accountId,
        );
      },
    );

    const optionalProps = await this.askForOptionalProps();
    let initialSupply = '';
    let supplyType = true;
    const totalSupply = undefined;

    if (optionalProps) {
      tokenToCreate.decimals = await this.askForDecimals(
        tokenToCreate.decimals.toString(),
      );
      await utilsService.handleValidation(
        () => tokenToCreate.validate('decimals'),
        async () => {
          tokenToCreate.decimals = await this.askForDecimals(
            tokenToCreate.decimals.toString(),
          );
        },
      );

      supplyType = await this.askForSupplyType();
      tokenToCreate.supplyType = supplyType
        ? TokenSupplyType.INFINITE
        : TokenSupplyType.FINITE;

      tokenToCreate.maxSupply = totalSupply;

      if (!supplyType) {
        tokenToCreate.maxSupply = await this.askForTotalSupply();
        await utilsService.handleValidation(
          () => tokenToCreate.validate('maxSupply'),
          async () => {
            tokenToCreate.maxSupply = await this.askForTotalSupply();
          },
        );
      }

      initialSupply = await this.askForInitialSupply(
        tokenToCreate.initialSupply?.toString(),
      );
      tokenToCreate.initialSupply = initialSupply;
      await utilsService.handleValidation(
        () => tokenToCreate.validate('initialSupply'),
        async () => {
          initialSupply = await this.askForInitialSupply(
            tokenToCreate.initialSupply?.toString(),
          );
          tokenToCreate.initialSupply = initialSupply;
        },
      );
    }

    const managedBySC = await this.askForManagedFeatures();
    console.log({
      name: tokenToCreate.name,
      symbol: tokenToCreate.symbol,
      autoRenewAccount: tokenToCreate.autoRenewAccount,
      decimals: tokenToCreate.decimals,
      initialSupply:
        initialSupply === '' || !initialSupply ? undefined : initialSupply,
      supplyType: supplyType
        ? TokenSupplyType.INFINITE
        : TokenSupplyType.FINITE,
      maxSupply: tokenToCreate.maxSupply,
    });

    if (managedBySC) {
      const currentUserPublicKey = await this.checkAnswer(
        language.getText('wizard.featureOptions.CurrentUser'),
      );
      tokenToCreate.adminKey = Account.NullPublicKey;
      tokenToCreate.freezeKey = Account.NullPublicKey;
      tokenToCreate.kycKey = Account.NullPublicKey;
      tokenToCreate.wipeKey = Account.NullPublicKey;
      tokenToCreate.supplyKey = Account.NullPublicKey;
      tokenToCreate.pauseKey = Account.NullPublicKey;
      tokenToCreate.kycKey = undefined;
      tokenToCreate.feeScheduleKey = currentUserPublicKey;
    } else {
      const {
        adminKey,
        supplyKey,
        freezeKey,
        wipeKey,
        pauseKey,
        KYCKey,
        feeScheduleKey,
        grantKYCToOriginalSender,
      } = await this.configureManagedFeatures();
      tokenToCreate.adminKey = adminKey;
      tokenToCreate.supplyKey = supplyKey;
      tokenToCreate.kycKey = KYCKey;
      tokenToCreate.freezeKey = freezeKey;
      tokenToCreate.wipeKey = wipeKey;
      tokenToCreate.pauseKey = pauseKey;
      tokenToCreate.feeScheduleKey = feeScheduleKey;
      tokenToCreate.grantKYCToOriginalSender = grantKYCToOriginalSender;

      const treasury = this.getTreasuryAccountFromSupplyKey(supplyKey);
      tokenToCreate.treasury = treasury;
    }

    // Proof of Reserve
    let reserve = false;
    let existingReserve = false;
    if (
      tokenToCreate.supplyKey !== undefined &&
      tokenToCreate.supplyKey.key === 'null'
    ) {
      reserve = await this.askForReserve();

      if (reserve) {
        existingReserve = await this.askForExistingReserve();
        if (!existingReserve) {
          tokenToCreate.createReserve = true;
          tokenToCreate.reserveInitialAmount =
            await this.askForReserveInitialAmount();
          await utilsService.handleValidation(
            () => tokenToCreate.validate('reserveInitialAmount'),
            async () => {
              tokenToCreate.reserveInitialAmount =
                await this.askForReserveInitialAmount();
            },
          );
        } else {
          tokenToCreate.reserveAddress = await utilsService.defaultSingleAsk(
            language.getText('stablecoin.askReserveAddress'),
            tokenToCreate.reserveAddress || '0.0.0',
          );
          await utilsService.handleValidation(
            () => tokenToCreate.validate('reserveAddress'),
            async () => {
              tokenToCreate.reserveAddress =
                await utilsService.defaultSingleAsk(
                  language.getText('stablecoin.askReserveAddress'),
                  tokenToCreate.reserveAddress || '0.0.0',
                );
            },
          );
        }
      }
    }

    console.log({
      name: tokenToCreate.name,
      symbol: tokenToCreate.symbol,
      autoRenewAccount: tokenToCreate.autoRenewAccount,
      decimals: tokenToCreate.decimals,
      initialSupply: initialSupply === '' ? undefined : initialSupply,
      supplyType: supplyType
        ? TokenSupplyType.INFINITE
        : TokenSupplyType.FINITE,
      maxSupply: totalSupply ? BigInt(totalSupply) : totalSupply,
      freezeKey:
        tokenToCreate.freezeKey === undefined
          ? language.getText('wizard.featureOptions.None')
          : tokenToCreate.freezeKey.key !== 'null'
          ? tokenToCreate.freezeKey
          : language.getText('wizard.featureOptions.SmartContract'),
      KYCKey:
        tokenToCreate.kycKey === undefined
          ? language.getText('wizard.featureOptions.None')
          : tokenToCreate.kycKey.key !== 'null'
          ? tokenToCreate.kycKey
          : language.getText('wizard.featureOptions.SmartContract'),
      wipeKey:
        tokenToCreate.wipeKey === undefined
          ? language.getText('wizard.featureOptions.None')
          : tokenToCreate.wipeKey.key !== 'null'
          ? tokenToCreate.wipeKey
          : language.getText('wizard.featureOptions.SmartContract'),
      adminKey:
        tokenToCreate.adminKey === undefined
          ? language.getText('wizard.adminFeatureOptions.None')
          : tokenToCreate.adminKey.key !== 'null'
          ? tokenToCreate.adminKey
          : language.getText('wizard.adminFeatureOptions.SmartContract'),
      supplyKey:
        tokenToCreate.supplyKey === undefined
          ? language.getText('wizard.featureOptions.None')
          : tokenToCreate.supplyKey.key !== 'null'
          ? tokenToCreate.supplyKey
          : language.getText('wizard.featureOptions.SmartContract'),
      pauseKey:
        tokenToCreate.pauseKey === undefined
          ? language.getText('wizard.featureOptions.None')
          : tokenToCreate.pauseKey.key !== 'null'
          ? tokenToCreate.pauseKey
          : language.getText('wizard.featureOptions.SmartContract'),
      feeScheduleKey:
        tokenToCreate.feeScheduleKey === undefined
          ? language.getText('wizard.featureOptions.None')
          : tokenToCreate.feeScheduleKey.key !== 'null'
          ? tokenToCreate.feeScheduleKey
          : language.getText('wizard.featureOptions.SmartContract'),
      treasury:
        tokenToCreate.treasury !== '0.0.0' &&
        tokenToCreate.treasury !== undefined
          ? tokenToCreate.treasury
          : language.getText('wizard.featureOptions.SmartContract'),
      reserve:
        reserve == false
          ? '-'
          : existingReserve
          ? tokenToCreate.reserveAddress
          : 'Proof of Reserve Feed initial amount : ' +
            tokenToCreate.reserveInitialAmount,
      grantKYCToOriginalSender: tokenToCreate.grantKYCToOriginalSender,
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

  private async askForReserve(): Promise<boolean> {
    return await utilsService.defaultConfirmAsk(
      language.getText('stablecoin.askReserve'),
      true,
    );
  }

  private async askForExistingReserve(): Promise<boolean> {
    return await utilsService.defaultConfirmAsk(
      language.getText('stablecoin.askExistingReserve'),
      true,
    );
  }

  private async askForInitialSupply(val?: string): Promise<string> {
    return await utilsService.defaultSingleAsk(
      language.getText('stablecoin.askInitialSupply'),
      val || '0',
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

  private async askForReserveInitialAmount(val?: string): Promise<string> {
    return await utilsService.defaultSingleAsk(
      language.getText('stablecoin.askReserveInitialAmount'),
      val || '1',
    );
  }

  private async askForManagedFeatures(): Promise<boolean> {
    return await utilsService.defaultConfirmAsk(
      language.getText('stablecoin.askFeaturesManagedBy'),
      true,
    );
  }

  private async askForKYCGrantToSender(): Promise<boolean> {
    return await utilsService.defaultConfirmAsk(
      language.getText('stablecoin.askGrantKYCToSender'),
      true,
    );
  }

  private async configureManagedFeatures(): Promise<IManagedFeatures> {
    const adminKey = await this.checkAnswer(
      await utilsService.defaultMultipleAsk(
        language.getText('stablecoin.features.admin'),
        language.getArrayFromObject('wizard.adminFeatureOptions'),
      ),
    );

    const freezeKey = await this.checkAnswer(
      await utilsService.defaultMultipleAsk(
        language.getText('stablecoin.features.freeze'),
        language.getArrayFromObject('wizard.featureOptions'),
      ),
    );

    const wipeKey = await this.checkAnswer(
      await utilsService.defaultMultipleAsk(
        language.getText('stablecoin.features.wipe'),
        language.getArrayFromObject('wizard.featureOptions'),
      ),
    );

    const pauseKey = await this.checkAnswer(
      await utilsService.defaultMultipleAsk(
        language.getText('stablecoin.features.pause'),
        language.getArrayFromObject('wizard.featureOptions'),
      ),
    );

    const supplyKey = await this.checkAnswer(
      await utilsService.defaultMultipleAsk(
        language.getText('stablecoin.features.supply'),
        language.getArrayFromObject('wizard.featureOptions'),
      ),
    );

    const KYCKey = await this.checkAnswer(
      await utilsService.defaultMultipleAsk(
        language.getText('stablecoin.features.KYC'),
        language.getArrayFromObject('wizard.featureOptions'),
      ),
    );

    const feeScheduleKey = await this.checkAnswer(
      await utilsService.defaultMultipleAsk(
        language.getText('stablecoin.features.feeSchedule'),
        language.getArrayFromObject('wizard.nonSmartContractFeatureOptions'),
      ),
    );

    let grantKYCToOriginalSender = false;

    if (supplyKey == Account.NullPublicKey && KYCKey == Account.NullPublicKey) {
      grantKYCToOriginalSender = await this.askForKYCGrantToSender();
    }

    return {
      adminKey,
      supplyKey,
      freezeKey,
      wipeKey,
      pauseKey,
      KYCKey,
      feeScheduleKey,
      grantKYCToOriginalSender,
    };
  }

  private async checkAnswer(answer: string): Promise<RequestPublicKey> {
    switch (answer) {
      case language.getText('wizard.featureOptions.CurrentUser'): {
        const currentAccount = utilsService.getCurrentAccount();
        const privateKey: RequestPrivateKey = {
          key: currentAccount.privateKey.key,
          type: currentAccount.privateKey.type,
        };
        const reqAccount: RequestAccount = {
          accountId: currentAccount.accountId,
          privateKey: privateKey,
        };
        const req: GetPublicKeyRequest = new GetPublicKeyRequest({
          account: reqAccount,
        });
        return Account.getPublicKey(req);
      }

      case language.getText('wizard.featureOptions.OtherKey'): {
        const { key } = await utilsService.defaultPublicKeyAsk();
        return {
          key: key,
        };
      }

      case language.getText('wizard.featureOptions.None'):
        return undefined;

      case language.getText('wizard.featureOptions.SmartContract'):
        return Account.NullPublicKey;

      default:
        throw new Error('Selected option not recognized : ' + answer);
    }
  }

  private getTreasuryAccountFromSupplyKey(supplyKey: RequestPublicKey): string {
    if (supplyKey && !Account.isPublicKeyNull(supplyKey)) {
      const currentAccount = utilsService.getCurrentAccount();
      return currentAccount.accountId;
    } else {
      return undefined;
    }
  }
}
