/*
 *
 * Hedera Stablecoin CLI
 *
 * Copyright (C) 2023 Hedera Hashgraph, LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 *
 */

import { configurationService, language } from './../../../index.js';
import { utilsService } from '../../../index.js';
import {
  Account,
  CreateRequest,
  GetPublicKeyRequest,
  KYCRequest,
  RequestAccount,
  RequestPrivateKey,
  RequestPublicKey,
  StableCoin,
  StableCoinViewModel,
  TokenSupplyType,
} from '@hashgraph/stablecoin-npm-sdk';

import { IManagedFeatures } from '../../../domain/configuration/interfaces/IManagedFeatures.js';
import Service from '../Service.js';
import SetConfigurationService from '../configuration/SetConfigurationService.js';
import SetResolverAndFactoryService from '../configuration/SetResolverAndFactoryService.js';
import AssociateStableCoinService from './AssociateStableCoinService.js';
import KYCStableCoinService from './KYCStableCoinService.js';
import { AccountType } from '../../../domain/configuration/interfaces/AccountType';
import {
  CONFIG_ID_SC,
  DEFAULT_VERSION,
  ZERO_ADDRESS,
} from '../../../core/Constants.js';

/**
 * Create Stablecoin Service
 */
export default class CreateStableCoinService extends Service {
  constructor() {
    super('Create Stablecoin');
  }

  /**
   * Create stablecoin in hedera
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

    const resolverAndFactoryService: SetResolverAndFactoryService =
      new SetResolverAndFactoryService();

    if (!utilsService.isAccountConfigValid(currentAccount)) {
      await setConfigurationService.initConfiguration(
        configurationService.getDefaultConfigurationPath(),
        currentAccount.network,
      );
    }
    if (
      utilsService.getCurrentFactory().id !==
        (await resolverAndFactoryService.getSDKFactory()) ||
      utilsService.getCurrentResolver().id !==
        (await resolverAndFactoryService.getSDKResolver())
    ) {
      await resolverAndFactoryService.setSDKResolverAndFactory(
        utilsService.getCurrentResolver().id,
        utilsService.getCurrentFactory().id,
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

    const associateService = new AssociateStableCoinService();
    await associateService.associateStableCoin(
      currentAccount.accountId,
      createdToken?.tokenId?.toString(),
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
   * Specific function for wizard to create stablecoin
   * @returns
   */
  public async wizardCreateStableCoin(): Promise<[CreateRequest, boolean]> {
    const currentAccount = utilsService.getCurrentAccount();
    // Call to create stablecoin sdk function
    let tokenToCreate = new CreateRequest({
      name: '',
      symbol: '',
      decimals: 6,
      createReserve: false,
      configId: '',
      configVersion: 1,
      proxyOwnerAccount: currentAccount.accountId,
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

    tokenToCreate = await this.selectResolverConfiguration(tokenToCreate);

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
      configId: tokenToCreate.configId,
      configVersion: tokenToCreate.configVersion,
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
          language.getArrayFromObject('wizard.nonNoneFeatureOptions'),
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
      if (tokenToCreate.feeScheduleKey == Account.NullPublicKey)
        tokenToCreate.feeRoleAccount = currentAccount.accountId;
      tokenToCreate.holdCreatorRoleAccount = currentAccount.accountId;
    }

    const reserve = await this.askForReserve();
    let existingReserve = false;
    if (reserve) {
      existingReserve = await this.askForExistingReserve();
      tokenToCreate = await this.configureReserve(
        tokenToCreate,
        existingReserve,
      );
    }

    tokenToCreate.stableCoinFactory = utilsService.getCurrentFactory().id;

    const stableCoinResume = {
      name: tokenToCreate.name,
      symbol: tokenToCreate.symbol,
      configId: tokenToCreate.configId,
      configVersion: tokenToCreate.configVersion,
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
      feeRole: tokenToCreate.feeRoleAccount,
      cashinRole: tokenToCreate.cashInRoleAccount,
      cashinAllowance: tokenToCreate.cashInRoleAllowance,
      metadata: tokenToCreate.metadata,
    };
    console.log(stableCoinResume);
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

  private async askForReserveConfigVersion(val?: string): Promise<number> {
    return Number(
      await utilsService.defaultSingleAsk(
        language.getText('stablecoin.askReserveConfigVersion'),
        val || '1',
      ),
    );
  }

  private async askForReserveConfigId(val?: string): Promise<string> {
    return await utilsService.defaultSingleAsk(
      language.getText('stablecoin.askReserveConfigId'),
      val ||
        '0x0000000000000000000000000000000000000000000000000000000000000003',
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

    if (tokenToCreate.feeScheduleKey == Account.NullPublicKey)
      await this.askForAccount(
        language.getText('stablecoin.initialRoles.feeSchedule'),
        currentAccountId,
        tokenToCreate,
        'feeRoleAccount',
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
    await this.askForAccount(
      language.getText('stablecoin.initialRoles.holdCreator'),
      currentAccountId,
      tokenToCreate,
      'holdCreatorRoleAccount',
    );
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
      | 'cashInRoleAccount'
      | 'feeRoleAccount'
      | 'holdCreatorRoleAccount',
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
        switch (currentAccount.type) {
          case AccountType.Fireblocks:
            return Promise.resolve({
              key: currentAccount.custodial.fireblocks.hederaAccountPublicKey,
              type: 'ED25519',
            });
          case AccountType.Dfns:
            return Promise.resolve({
              key: currentAccount.custodial.dfns.hederaAccountPublicKey,
              type: currentAccount.custodial.dfns.hederaAccountKeyType,
            });
          case AccountType.AWSKMS:
            return Promise.resolve({
              key: currentAccount.custodial.awsKms.hederaAccountPublicKey,
              type: 'ECDSA',
            });
        }
        const privateKey: RequestPrivateKey = {
          key: currentAccount.selfCustodial.privateKey.key,
          type: currentAccount.selfCustodial.privateKey.type,
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

  private async selectResolverConfiguration(
    tokenToCreate: CreateRequest,
  ): Promise<CreateRequest> {
    await utilsService.handleValidation(
      () => tokenToCreate.validate('configId'),
      async () => {
        tokenToCreate.configId = await utilsService.defaultSingleAsk(
          language.getText('stablecoin.askConfigId'),
          tokenToCreate.configId || CONFIG_ID_SC,
        );
      },
    );
    await utilsService.handleValidation(
      () => tokenToCreate.validate('configVersion'),
      async () => {
        tokenToCreate.configVersion = Number(
          await utilsService.defaultSingleAsk(
            language.getText('stablecoin.askConfigVersion'),
            tokenToCreate.configVersion.toString() || DEFAULT_VERSION,
          ),
        );
      },
    );

    return tokenToCreate;
  }

  private async configureReserve(
    tokenToCreate: CreateRequest,
    existingReserve: boolean,
  ): Promise<CreateRequest> {
    if (!existingReserve) {
      tokenToCreate.createReserve = true;
      await utilsService.handleValidation(
        () => tokenToCreate.validate('reserveConfigId'),
        async () => {
          tokenToCreate.reserveConfigId = await this.askForReserveConfigId();
        },
      );
      await utilsService.handleValidation(
        () => tokenToCreate.validate('reserveConfigVersion'),
        async () => {
          tokenToCreate.reserveConfigVersion =
            await this.askForReserveConfigVersion();
        },
      );
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
            tokenToCreate.reserveAddress || ZERO_ADDRESS,
          );
        },
      );
    }
    return tokenToCreate;
  }
}
