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
  Factory,
  GetERC20ListRequest,
} from 'hedera-stable-coin-sdk';
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
    // Call to create stable coin sdk function
    let tokenToCreate = new CreateRequest({
      name: '',
      symbol: '',
      decimals: 6,
      createReserve: false,
      grantKYCToOriginalSender: false,
    });

    // Name
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
    await utilsService.handleValidation(
      () => tokenToCreate.validate('autoRenewAccount'),
      async () => {
        tokenToCreate.autoRenewAccount = await utilsService.defaultSingleAsk(
          language.getText('stablecoin.askAutoRenewAccountId'),
          currentAccount.accountId,
        );
      },
    );

    const optionalProps = await this.askForOptionalProps();
    let initialSupply = '';
    let supplyType = true;
    const totalSupply = undefined;

    if (optionalProps) {
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
        await utilsService.handleValidation(
          () => tokenToCreate.validate('maxSupply'),
          async () => {
            tokenToCreate.maxSupply = await this.askForTotalSupply();
          },
        );
      }

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
      tokenToCreate.adminKey = Account.NullPublicKey;
      tokenToCreate.freezeKey = Account.NullPublicKey;
      tokenToCreate.wipeKey = Account.NullPublicKey;
      tokenToCreate.supplyKey = Account.NullPublicKey;
      tokenToCreate.pauseKey = Account.NullPublicKey;
    } else {
      const { adminKey, supplyKey, freezeKey, wipeKey, pauseKey } =
        await this.configureManagedFeatures();
      tokenToCreate.adminKey = adminKey;
      tokenToCreate.supplyKey = supplyKey;
      tokenToCreate.freezeKey = freezeKey;
      tokenToCreate.wipeKey = wipeKey;
      tokenToCreate.pauseKey = pauseKey;

      const treasury = this.getTreasuryAccountFromSupplyKey(supplyKey);
      tokenToCreate.treasury = treasury;
    }

    // KYC
    const kyc = await this.askForKYC();
    if (kyc) {
      const KYCKey = await this.checkAnswer(
        await utilsService.defaultMultipleAsk(
          language.getText('stablecoin.features.KYC'),
          language.getArrayFromObject('wizard.nonNoneFeatureOptions'),
        ),
      );
      tokenToCreate.kycKey = KYCKey;
      if (
        tokenToCreate.supplyKey == Account.NullPublicKey &&
        KYCKey == Account.NullPublicKey
      ) {
        const grantKYCToOriginalSender = await this.askForKYCGrantToSender();
        tokenToCreate.grantKYCToOriginalSender = grantKYCToOriginalSender;
      }
    }

    // Custom fees
    const customFees = await this.askForCustomFees();
    if (customFees) {
      const feeScheduleKey = await this.checkAnswer(
        await utilsService.defaultMultipleAsk(
          language.getText('stablecoin.features.feeSchedule'),
          language.getArrayFromObject(
            'wizard.nonSmartContractAndNoneFeatureOptions',
          ),
        ),
      );
      tokenToCreate.feeScheduleKey = feeScheduleKey;
    }

    // Manage the initial role assignment
    await this.initialRoleAssignments(tokenToCreate, currentAccount.accountId);

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
          await utilsService.handleValidation(
            () => tokenToCreate.validate('reserveInitialAmount'),
            async () => {
              tokenToCreate.reserveInitialAmount =
                await this.askForReserveInitialAmount();
            },
          );
        } else {
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

    // ASK HederaERC20 version
    tokenToCreate.stableCoinFactory = utilsService.getCurrentFactory().id;

    tokenToCreate.hederaERC20 = await this.askHederaERC20Version(
      tokenToCreate.stableCoinFactory,
    );

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
      burnRole: tokenToCreate.burnRoleAccount,
      wipeRole: tokenToCreate.wipeRoleAccount,
      rescueRole: tokenToCreate.rescueRoleAccount,
      pauseRole: tokenToCreate.pauseRoleAccount,
      freezeRole: tokenToCreate.freezeRoleAccount,
      deleteRole: tokenToCreate.deleteRoleAccount,
      kycRole: tokenToCreate.kycRoleAccount,
      cashinRole: tokenToCreate.cashInRoleAccount,
      cashinAllowance: tokenToCreate.cashInRoleAllowance,
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

  private async askHederaERC20Version(factory: string): Promise<string> {
    const factoryListEvm = await Factory.getHederaERC20List(
      new GetERC20ListRequest({ factoryId: factory }),
    ).then((value) => value.reverse());
    return await utilsService.defaultMultipleAsk(
      language.getText('stablecoin.askHederaERC20Address'),
      factoryListEvm.map((item) => item.toString()),
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

  private async askForKYC(): Promise<boolean> {
    return await utilsService.defaultConfirmAsk(
      language.getText('stablecoin.askKYC'),
      false,
    );
  }

  private async askForCustomFees(): Promise<boolean> {
    return await utilsService.defaultConfirmAsk(
      language.getText('stablecoin.askCustomFees'),
      true,
    );
  }

  private async initialRoleAssignments(
    tokenToCreate: any,
    currentAccountId: string,
  ) {
    if (tokenToCreate.supplyKey == Account.NullPublicKey)
      await this.askForAccount(
        language.getText('stablecoin.initialRoles.burn'),
        currentAccountId,
        tokenToCreate,
        'burnRoleAccount',
      );

    if (tokenToCreate.wipeKey == Account.NullPublicKey)
      await this.askForAccount(
        language.getText('stablecoin.initialRoles.wipe'),
        currentAccountId,
        tokenToCreate,
        'wipeRoleAccount',
      );

    await this.askForAccount(
      language.getText('stablecoin.initialRoles.rescue'),
      currentAccountId,
      tokenToCreate,
      'rescueRoleAccount',
    );

    if (tokenToCreate.pauseKey == Account.NullPublicKey)
      await this.askForAccount(
        language.getText('stablecoin.initialRoles.pause'),
        currentAccountId,
        tokenToCreate,
        'pauseRoleAccount',
      );

    if (tokenToCreate.freezeKey == Account.NullPublicKey)
      await this.askForAccount(
        language.getText('stablecoin.initialRoles.freeze'),
        currentAccountId,
        tokenToCreate,
        'freezeRoleAccount',
      );

    if (tokenToCreate.adminKey == Account.NullPublicKey)
      await this.askForAccount(
        language.getText('stablecoin.initialRoles.delete'),
        currentAccountId,
        tokenToCreate,
        'deleteRoleAccount',
      );

    if (tokenToCreate.kycKey == Account.NullPublicKey)
      await this.askForAccount(
        language.getText('stablecoin.initialRoles.kyc'),
        currentAccountId,
        tokenToCreate,
        'kycRoleAccount',
      );

    if (tokenToCreate.supplyKey == Account.NullPublicKey)
      await this.askForAccount(
        language.getText('stablecoin.initialRoles.cashin'),
        currentAccountId,
        tokenToCreate,
        'cashInRoleAccount',
      );

    if (tokenToCreate.supplyKey == Account.NullPublicKey)
      await utilsService.handleValidation(
        () => tokenToCreate.validate('cashInRoleAllowance'),
        async () => {
          tokenToCreate.cashInRoleAllowance =
            await utilsService.defaultSingleAsk(
              language.getText('stablecoin.initialRoles.cashinAllowance'),
              '0',
            );
        },
      );
  }

  private async askForAccount(
    text: string,
    currentAccountId: string,
    tokenToCreate: any,
    fieldToValidate: string,
  ) {
    const options = [
      language.getText('stablecoin.initialRoles.options.currentAccount'),
      language.getText('stablecoin.initialRoles.options.otherAccount'),
    ];
    const result = await utilsService.defaultMultipleAsk(text, options);
    if (result != options[0]) {
      await utilsService.handleValidation(
        () => tokenToCreate.validate(fieldToValidate),
        async () => {
          tokenToCreate[fieldToValidate] = await utilsService.defaultSingleAsk(
            language.getText('stablecoin.initialRoles.askAccount'),
            '0.0.0',
          );
        },
      );
    } else tokenToCreate[fieldToValidate] = currentAccountId;
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

    return {
      adminKey,
      supplyKey,
      freezeKey,
      wipeKey,
      pauseKey,
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
