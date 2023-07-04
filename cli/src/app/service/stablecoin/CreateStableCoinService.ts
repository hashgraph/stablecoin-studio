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
  GetTokenManagerListRequest,
  KYCRequest,
} from '@hashgraph-dev/stablecoin-npm-sdk';

import { IManagedFeatures } from '../../../domain/configuration/interfaces/IManagedFeatures.js';
import Service from '../Service.js';
import SetConfigurationService from '../configuration/SetConfigurationService.js';
import SetFactoryService from '../configuration/SetFactoryService.js';
import AssociateStableCoinsService from './AssociateStableCoinService.js';
import KYCStableCoinService from './KYCStableCoinService.js';

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
    grantKYCToOriginalSender = false,
  ): Promise<StableCoinViewModel> {
    if (isWizard) {
      [stableCoin, grantKYCToOriginalSender] =
        await this.wizardCreateStableCoin();
    }

    const currentAccount = utilsService.getCurrentAccount();

    const setConfigurationService: SetConfigurationService =
      new SetConfigurationService();

    const factoryService: SetFactoryService = new SetFactoryService();

    if (
      currentAccount.privateKey == null ||
      currentAccount.privateKey == undefined ||
      currentAccount.privateKey.key == ''
    ) {
      await setConfigurationService.initConfiguration(
        configurationService.getDefaultConfigurationPath(),
        currentAccount.network,
      );
    }
    if (
      utilsService.getCurrentFactory().id !==
      (await factoryService.getSDKFactory())
    ) {
      await factoryService.setSDKFactory(utilsService.getCurrentFactory().id);
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

    const associateService = new AssociateStableCoinsService();
    await associateService.associateStableCoin(
      currentAccount.accountId,
      createdToken.tokenId.toString(),
    );

    if (grantKYCToOriginalSender) {
      const kycService = new KYCStableCoinService();
      const kycRequest = new KYCRequest({
        targetId: currentAccount.accountId,
        tokenId: createdToken.tokenId.toString(),
      });
      await kycService.grantKYCToAccount(kycRequest);
    }

    return createdToken;
  }

  /**
   * Specific function for wizard to create stable coin
   * @returns
   */
  public async wizardCreateStableCoin(): Promise<[CreateRequest, boolean]> {
    const currentAccount = utilsService.getCurrentAccount();
    // Call to create stable coin sdk function
    const tokenToCreate = new CreateRequest({
      name: '',
      symbol: '',
      decimals: 6,
      createReserve: false,
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

      await utilsService.handleValidation(
        () => tokenToCreate.validate('metadata'),
        async () => {
          tokenToCreate.metadata = await utilsService.defaultSingleAsk(
            language.getText('stablecoin.askMetadata'),
            tokenToCreate.metadata || '',
          );
        },
      );
    }

    const managedBySC = await this.askForManagedFeatures();
    console.log({
      name: tokenToCreate.name,
      symbol: tokenToCreate.symbol,
      decimals: tokenToCreate.decimals,
      initialSupply:
        initialSupply === '' || !initialSupply ? undefined : initialSupply,
      supplyType: supplyType
        ? TokenSupplyType.INFINITE
        : TokenSupplyType.FINITE,
      maxSupply: tokenToCreate.maxSupply,
    });

    if (managedBySC) {
      tokenToCreate.freezeKey = Account.NullPublicKey;
      tokenToCreate.wipeKey = Account.NullPublicKey;
      tokenToCreate.pauseKey = Account.NullPublicKey;
    } else {
      const { freezeKey, wipeKey, pauseKey } =
        await this.configureManagedFeatures();
      tokenToCreate.freezeKey = freezeKey;
      tokenToCreate.wipeKey = wipeKey;
      tokenToCreate.pauseKey = pauseKey;
    }

    // KYC
    const kyc = await this.askForKYC();
    let grantKYCToOriginalSender = false;

    if (kyc) {
      const KYCKey = await this.checkAnswer(
        await utilsService.defaultMultipleAsk(
          language.getText('stablecoin.features.KYC'),
          language.getArrayFromObject('wizard.nonNoneFeatureOptions'),
        ),
      );
      tokenToCreate.kycKey = KYCKey;

      if (KYCKey == Account.NullPublicKey) {
        grantKYCToOriginalSender = await this.askForKYCGrantToSender();
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
    const changeRoleAssignment = await this.askForRolesManagement();
    if (changeRoleAssignment) {
      await this.initialRoleAssignments(
        tokenToCreate,
        currentAccount.accountId,
      );
    } else {
      tokenToCreate.burnRoleAccount = currentAccount.accountId;
      tokenToCreate.deleteRoleAccount = currentAccount.accountId;
      tokenToCreate.cashInRoleAccount = currentAccount.accountId;
      tokenToCreate.cashInRoleAllowance = '0';
      tokenToCreate.rescueRoleAccount = currentAccount.accountId;
      if (tokenToCreate.wipeKey == Account.NullPublicKey)
        tokenToCreate.wipeRoleAccount = currentAccount.accountId;
      if (tokenToCreate.pauseKey == Account.NullPublicKey)
        tokenToCreate.pauseRoleAccount = currentAccount.accountId;
      if (tokenToCreate.freezeKey == Account.NullPublicKey)
        tokenToCreate.freezeRoleAccount = currentAccount.accountId;
      if (tokenToCreate.kycKey == Account.NullPublicKey)
        tokenToCreate.kycRoleAccount = currentAccount.accountId;
    }

    // Proof of Reserve
    let reserve = false;
    let existingReserve = false;
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
            tokenToCreate.reserveAddress = await utilsService.defaultSingleAsk(
              language.getText('stablecoin.askReserveAddress'),
              tokenToCreate.reserveAddress || '0.0.0',
            );
          },
        );
      }
    }

    // ASK HederaTokenManager version
    tokenToCreate.stableCoinFactory = utilsService.getCurrentFactory().id;

    await this.askHederaTokenManagerVersion(
      tokenToCreate.stableCoinFactory,
      tokenToCreate,
    );

    console.log({
      hederaTokenManager: tokenToCreate.hederaTokenManager,
      name: tokenToCreate.name,
      symbol: tokenToCreate.symbol,
      decimals: tokenToCreate.decimals,
      initialSupply: initialSupply === '' ? undefined : initialSupply,
      supplyType: supplyType
        ? TokenSupplyType.INFINITE
        : TokenSupplyType.FINITE,
      maxSupply: tokenToCreate.maxSupply ?? undefined,
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
      adminKey: language.getText('wizard.adminFeatureOptions.SmartContract'),
      supplyKey: language.getText('wizard.featureOptions.SmartContract'),
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
      treasury: language.getText('wizard.featureOptions.SmartContract'),
      reserve:
        reserve == false
          ? '-'
          : existingReserve
          ? tokenToCreate.reserveAddress
          : 'Proof of Reserve Feed initial amount : ' +
            tokenToCreate.reserveInitialAmount,
      burnRole: tokenToCreate.burnRoleAccount,
      wipeRole: tokenToCreate.wipeRoleAccount,
      rescueRole: tokenToCreate.rescueRoleAccount,
      pauseRole: tokenToCreate.pauseRoleAccount,
      freezeRole: tokenToCreate.freezeRoleAccount,
      deleteRole: tokenToCreate.deleteRoleAccount,
      kycRole: tokenToCreate.kycRoleAccount,
      cashinRole: tokenToCreate.cashInRoleAccount,
      cashinAllowance: tokenToCreate.cashInRoleAllowance,
      metadata: tokenToCreate.metadata,
    });
    if (
      !(await utilsService.defaultConfirmAsk(
        language.getText('stablecoin.askConfirmCreation'),
        true,
      ))
    ) {
      await utilsService.cleanAndShowBanner();

      return await this.wizardCreateStableCoin();
    }
    return [tokenToCreate, grantKYCToOriginalSender];
  }

  private async askForDecimals(val?: string): Promise<string> {
    return await utilsService.defaultSingleAsk(
      language.getText('stablecoin.askDecimals'),
      val || '6',
    );
  }

  private async askHederaTokenManagerVersion(
    factory: string,
    request: CreateRequest,
  ): Promise<void> {
    const factoryListEvm = await Factory.getHederaTokenManagerList(
      new GetTokenManagerListRequest({ factoryId: factory }),
    ).then((value) => value.reverse());

    const choices = factoryListEvm
      .map((item) => item.toString())
      .sort((token1, token2) =>
        +token1.split('.').slice(-1)[0] > +token2.split('.').slice(-1)[0]
          ? -1
          : 1,
      );
    choices.push(language.getText('stablecoin.askHederaTokenManagerOther'));

    const versionSelection = await utilsService.defaultMultipleAsk(
      language.getText('stablecoin.askHederaTokenManagerVersion'),
      choices,
    );

    if (versionSelection === choices[choices.length - 1]) {
      await utilsService.handleValidation(
        () => request.validate('hederaTokenManager'),
        async () => {
          request.hederaTokenManager = await utilsService.defaultSingleAsk(
            language.getText('stablecoin.askHederaTokenManagerImplementation'),
            '0.0.0',
          );
        },
      );
    } else request.hederaTokenManager = versionSelection;
  }

  private async askForOptionalProps(): Promise<boolean> {
    return await utilsService.defaultConfirmAsk(
      language.getText('stablecoin.askOptionalProps'),
      false,
    );
  }

  private async askForReserve(): Promise<boolean> {
    return await utilsService.defaultConfirmAsk(
      language.getText('stablecoin.askReserve'),
      false,
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

  private async askForRolesManagement(): Promise<boolean> {
    return await utilsService.defaultConfirmAsk(
      language.getText('stablecoin.askRolesManagedBy'),
      false,
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
      false,
    );
  }

  private async initialRoleAssignments(
    tokenToCreate: CreateRequest,
    currentAccountId: string,
  ): Promise<void> {
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

    const result: string = await this.askForAccount(
      language.getText('stablecoin.initialRoles.cashin'),
      currentAccountId,
      tokenToCreate,
      'cashInRoleAccount',
    );
    if (
      result !== language.getText('stablecoin.initialRoles.options.noAccount')
    ) {
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
  }

  private async askForAccount(
    text: string,
    currentAccountId: string,
    tokenToCreate: CreateRequest,
    fieldToValidate:
      | 'burnRoleAccount'
      | 'wipeRoleAccount'
      | 'rescueRoleAccount'
      | 'pauseRoleAccount'
      | 'freezeRoleAccount'
      | 'deleteRoleAccount'
      | 'kycRoleAccount'
      | 'cashInRoleAccount',
  ): Promise<string> {
    const options = [
      language.getText('stablecoin.initialRoles.options.currentAccount'),
      language.getText('stablecoin.initialRoles.options.otherAccount'),
      language.getText('stablecoin.initialRoles.options.noAccount'),
    ];
    const result = await utilsService.defaultMultipleAsk(text, options);
    if (result === options[0])
      tokenToCreate[fieldToValidate] = currentAccountId;
    else if (result === options[1]) {
      await utilsService.handleValidation(
        () => tokenToCreate.validate(fieldToValidate),
        async () => {
          tokenToCreate[fieldToValidate] = await utilsService.defaultSingleAsk(
            language.getText('stablecoin.initialRoles.askAccount'),
            '0.0.0',
          );
        },
      );
    }
    return result;
  }

  private async configureManagedFeatures(): Promise<IManagedFeatures> {
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

    return {
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
}
