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

import CreateStableCoinService from '../../../../src/app/service/stablecoin/CreateStableCoinService';
import { configurationService, utilsService } from '../../../../src/index.js';
import Language from '../../../../src/domain/language/Language.js';
import SetResolverAndFactoryService from '../../../../src/app/service/configuration/SetResolverAndFactoryService';
import {
  Account,
  ContractId,
  Factory,
  CreateRequest,
  HederaId,
  PublicKey,
  StableCoin,
} from '@hashgraph/stablecoin-npm-sdk';
import AssociateStableCoinService from '../../../../src/app/service/stablecoin/AssociateStableCoinService';
import SetConfigurationService from '../../../../src/app/service/configuration/SetConfigurationService';
import KYCStableCoinService from '../../../../src/app/service/stablecoin/KYCStableCoinService';
import { AccountType } from '../../../../src/domain/configuration/interfaces/AccountType';

const service = new CreateStableCoinService();
const language: Language = new Language();
const currentAccount = {
  accountId: '0.0.12345',
  type: AccountType.SelfCustodial,
  selfCustodial: {
    privateKey: {
      key: 'key',
      type: 'type',
    },
  },
  network: 'testnet',
  alias: 'alias',
  importedTokens: [
    {
      id: '0.0.12345',
      symbol: 'TEST',
    },
  ],
};
const accounts = [currentAccount];
const request = new CreateRequest({
  name: '',
  symbol: '',
  decimals: 6,
  createReserve: false,
  configId:
    '0x0000000000000000000000000000000000000000000000000000000000000001',
  configVersion: 1,
});

describe(`Testing ManageImportedTokenService class`, () => {
  beforeEach(() => {
    jest
      .spyOn(utilsService, 'getCurrentAccount')
      .mockReturnValue(currentAccount);
    jest
      .spyOn(configurationService, 'getConfiguration')
      .mockReturnValue({ accounts });
    jest.spyOn(configurationService, 'setConfiguration').mockImplementation();
    jest.spyOn(utilsService, 'showMessage').mockImplementation();
    jest.spyOn(utilsService, 'showSpinner').mockImplementation();
    jest.spyOn(console, 'log').mockImplementation();
  });
  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('Should instance createStableCoin with false', async () => {
    const coin = { name: 'name', tokenId: new HederaId('0.0.12345') };
    const reserve = { proxyAddress: new ContractId('0.0.12345') };
    jest
      .spyOn(utilsService, 'getCurrentFactory')
      .mockReturnValue({ id: 'currentFactory', network: 'network' });
    jest
      .spyOn(utilsService, 'getCurrentResolver')
      .mockReturnValue({ id: 'currentResolver', network: 'network' });
    jest
      .spyOn(SetResolverAndFactoryService.prototype, 'getSDKFactory')
      .mockResolvedValue('currentFactory');
    jest
      .spyOn(SetResolverAndFactoryService.prototype, 'getSDKResolver')
      .mockResolvedValue('currentResolver');
    jest.spyOn(StableCoin, 'create').mockResolvedValue({ coin, reserve });
    jest
      .spyOn(AssociateStableCoinService.prototype, 'associateStableCoin')
      .mockImplementation();

    const createdToken = await service.createStableCoin(request);

    expect(service).not.toBeNull();
    expect(createdToken).toEqual({
      name: 'name',
      tokenId: new HederaId('0.0.12345'),
    });
  });

  it('Should instance createStableCoin with true', async () => {
    const coin = { name: 'name', tokenId: new HederaId('0.0.12345') };
    const reserve = { proxyAddress: new ContractId('0.0.12345') };

    // Name
    jest
      .spyOn(utilsService, 'defaultSingleAsk')
      .mockResolvedValueOnce('HEDERACOIN');

    // Symbol
    jest.spyOn(utilsService, 'defaultSingleAsk').mockResolvedValueOnce('HDC');

    // Resolver config
    jest
      .spyOn(utilsService, 'defaultSingleAsk')
      .mockResolvedValueOnce(
        '0x0000000000000000000000000000000000000000000000000000000000000001',
      );
    jest.spyOn(utilsService, 'defaultSingleAsk').mockResolvedValueOnce('1');

    // OptionalProps
    jest.spyOn(utilsService, 'defaultConfirmAsk').mockResolvedValueOnce(true);
    jest.spyOn(utilsService, 'defaultSingleAsk').mockResolvedValueOnce('6');

    // SupplyType
    jest.spyOn(utilsService, 'defaultConfirmAsk').mockResolvedValueOnce(false);
    jest.spyOn(utilsService, 'defaultSingleAsk').mockResolvedValueOnce('1000');

    // InitialSupply
    jest.spyOn(utilsService, 'defaultSingleAsk').mockResolvedValueOnce('1000');

    // Metadata
    jest
      .spyOn(utilsService, 'defaultSingleAsk')
      .mockResolvedValueOnce('metadata');

    // ManagedFeatures
    jest.spyOn(utilsService, 'defaultConfirmAsk').mockResolvedValueOnce(true);

    // KYC
    jest.spyOn(utilsService, 'defaultConfirmAsk').mockResolvedValueOnce(true);
    jest
      .spyOn(utilsService, 'defaultMultipleAsk')
      .mockResolvedValueOnce(
        language.getText('wizard.nonNoneFeatureOptions.SmartContract'),
      );
    jest.spyOn(utilsService, 'defaultConfirmAsk').mockResolvedValueOnce(true);

    // CustomFees
    jest.spyOn(utilsService, 'defaultConfirmAsk').mockResolvedValueOnce(true);
    jest
      .spyOn(utilsService, 'defaultMultipleAsk')
      .mockResolvedValueOnce(
        language.getText(
          'wizard.nonSmartContractAndNoneFeatureOptions.CurrentUser',
        ),
      );

    // RolesManagement
    jest.spyOn(utilsService, 'defaultConfirmAsk').mockResolvedValueOnce(false);

    // Reserve
    jest.spyOn(utilsService, 'defaultConfirmAsk').mockResolvedValueOnce(true);
    jest.spyOn(utilsService, 'defaultConfirmAsk').mockResolvedValueOnce(true);
    jest
      .spyOn(utilsService, 'defaultSingleAsk')
      .mockResolvedValueOnce('0.0.12345');

    // HederaTokenManagerVersion
    jest
      .spyOn(Factory, 'getHederaTokenManagerList')
      .mockResolvedValue([
        new ContractId('0.0.12345'),
        new ContractId('0.0.12347'),
        new ContractId('0.0.12346'),
      ]);
    jest
      .spyOn(utilsService, 'defaultMultipleAsk')
      .mockResolvedValueOnce(
        language.getText('stablecoin.askHederaTokenManagerOther'),
      );
    jest
      .spyOn(utilsService, 'defaultSingleAsk')
      .mockResolvedValueOnce('0.0.12345');

    jest.spyOn(utilsService, 'defaultConfirmAsk').mockResolvedValueOnce(true);

    // grantKYCToOriginalSender true
    jest
      .spyOn(KYCStableCoinService.prototype, 'grantKYCToAccount')
      .mockImplementation();

    jest.spyOn(StableCoin, 'create').mockResolvedValue({ coin, reserve });
    jest
      .spyOn(utilsService, 'getCurrentFactory')
      .mockReturnValue({ id: 'currentFactory', network: 'network' });
    jest
      .spyOn(utilsService, 'getCurrentResolver')
      .mockReturnValue({ id: 'currentResolver', network: 'network' });
    jest
      .spyOn(SetResolverAndFactoryService.prototype, 'getSDKFactory')
      .mockResolvedValue('currentFactory');
    jest
      .spyOn(SetResolverAndFactoryService.prototype, 'getSDKResolver')
      .mockResolvedValue('currentResolver');
    jest.spyOn(StableCoin, 'create').mockResolvedValue({ coin, reserve });
    jest
      .spyOn(AssociateStableCoinService.prototype, 'associateStableCoin')
      .mockImplementation();
    jest
      .spyOn(Account, 'getPublicKey')
      .mockResolvedValue(new PublicKey('0.0.12345'));

    // proxyAdminOwner
    jest.spyOn(utilsService, 'defaultConfirmAsk').mockResolvedValueOnce(true);
    jest
      .spyOn(utilsService, 'defaultMultipleAsk')
      .mockResolvedValueOnce(language.getText('stablecoin.askProxyAdminOwner'));

    const createdToken = await service.createStableCoin(undefined, true, true);

    expect(service).not.toBeNull();
    expect(createdToken).toEqual({
      name: 'name',
      tokenId: new HederaId('0.0.12345'),
    });
  });

  it('Should instance createStableCoin with true and sender', async () => {
    const currentAccount = {
      accountId: '0.0.12345',
      type: AccountType.SelfCustodial,
      selfCustodial: {
        privateKey: {
          key: 'key',
          type: 'type',
        },
      },
      network: 'testnet',
      alias: 'alias',
      importedTokens: [
        {
          id: '0.0.12345',
          symbol: 'TEST',
        },
      ],
    };
    const coin = { name: 'name', tokenId: new HederaId('0.0.12345') };
    const reserve = { proxyAddress: new ContractId('0.0.12345') };

    // Name
    jest
      .spyOn(utilsService, 'defaultSingleAsk')
      .mockResolvedValueOnce('HEDERACOIN');

    // Symbol
    jest.spyOn(utilsService, 'defaultSingleAsk').mockResolvedValueOnce('HDC');

    // Resolver config
    jest
      .spyOn(utilsService, 'defaultSingleAsk')
      .mockResolvedValueOnce(
        '0x0000000000000000000000000000000000000000000000000000000000000001',
      );
    jest.spyOn(utilsService, 'defaultSingleAsk').mockResolvedValueOnce('1');

    // OptionalProps
    jest.spyOn(utilsService, 'defaultConfirmAsk').mockResolvedValueOnce(true);
    jest.spyOn(utilsService, 'defaultSingleAsk').mockResolvedValueOnce('6');

    // SupplyType
    jest.spyOn(utilsService, 'defaultConfirmAsk').mockResolvedValueOnce(true);

    // InitialSupply
    jest.spyOn(utilsService, 'defaultSingleAsk').mockResolvedValueOnce('');

    // Metadata
    jest
      .spyOn(utilsService, 'defaultSingleAsk')
      .mockResolvedValueOnce('metadata');

    // ManagedFeatures
    jest.spyOn(utilsService, 'defaultConfirmAsk').mockResolvedValueOnce(false);
    jest
      .spyOn(utilsService, 'defaultMultipleAsk')
      .mockResolvedValueOnce(
        language.getText('wizard.featureOptions.SmartContract'),
      );
    jest
      .spyOn(utilsService, 'defaultMultipleAsk')
      .mockResolvedValueOnce(
        language.getText('wizard.featureOptions.SmartContract'),
      );
    jest
      .spyOn(utilsService, 'defaultMultipleAsk')
      .mockResolvedValueOnce(
        language.getText('wizard.featureOptions.SmartContract'),
      );

    // KYC
    jest.spyOn(utilsService, 'defaultConfirmAsk').mockResolvedValueOnce(true);
    jest
      .spyOn(utilsService, 'defaultMultipleAsk')
      .mockResolvedValueOnce(
        language.getText('wizard.nonNoneFeatureOptions.SmartContract'),
      );
    jest.spyOn(utilsService, 'defaultConfirmAsk').mockResolvedValueOnce(false);

    // CustomFees
    jest.spyOn(utilsService, 'defaultConfirmAsk').mockResolvedValueOnce(true);
    jest
      .spyOn(utilsService, 'defaultMultipleAsk')
      .mockResolvedValueOnce(
        language.getText(
          'wizard.nonSmartContractAndNoneFeatureOptions.OtherKey',
        ),
      );

    // RolesManagement
    jest.spyOn(utilsService, 'defaultConfirmAsk').mockResolvedValueOnce(true);
    jest
      .spyOn(utilsService, 'defaultMultipleAsk')
      .mockResolvedValueOnce(
        language.getText('stablecoin.initialRoles.options.currentAccount'),
      ); //burn
    jest
      .spyOn(utilsService, 'defaultMultipleAsk')
      .mockResolvedValueOnce(
        language.getText('stablecoin.initialRoles.options.currentAccount'),
      ); //wipe
    jest
      .spyOn(utilsService, 'defaultMultipleAsk')
      .mockResolvedValueOnce(
        language.getText('stablecoin.initialRoles.options.currentAccount'),
      ); //rescue
    jest
      .spyOn(utilsService, 'defaultMultipleAsk')
      .mockResolvedValueOnce(
        language.getText('stablecoin.initialRoles.options.currentAccount'),
      ); //pause
    jest
      .spyOn(utilsService, 'defaultMultipleAsk')
      .mockResolvedValueOnce(
        language.getText('stablecoin.initialRoles.options.currentAccount'),
      ); //freeze
    jest
      .spyOn(utilsService, 'defaultMultipleAsk')
      .mockResolvedValueOnce(
        language.getText('stablecoin.initialRoles.options.currentAccount'),
      ); //delete
    jest
      .spyOn(utilsService, 'defaultMultipleAsk')
      .mockResolvedValueOnce(
        language.getText('stablecoin.initialRoles.options.currentAccount'),
      ); //kyc
    jest
      .spyOn(utilsService, 'defaultMultipleAsk')
      .mockResolvedValueOnce(
        language.getText('stablecoin.initialRoles.options.otherAccount'),
      ); //cashin
    jest
      .spyOn(utilsService, 'defaultSingleAsk')
      .mockResolvedValueOnce('0.0.1234');
    jest.spyOn(utilsService, 'defaultSingleAsk').mockResolvedValueOnce('10'); //cashin

    // Reserve
    jest.spyOn(utilsService, 'defaultConfirmAsk').mockResolvedValueOnce(true);
    jest.spyOn(utilsService, 'defaultConfirmAsk').mockResolvedValueOnce(false);
    jest.spyOn(utilsService, 'defaultSingleAsk').mockResolvedValueOnce('10');

    // HederaTokenManagerVersion
    jest
      .spyOn(Factory, 'getHederaTokenManagerList')
      .mockResolvedValue([
        new ContractId('0.0.12345'),
        new ContractId('0.0.12347'),
        new ContractId('0.0.12346'),
      ]);
    jest
      .spyOn(utilsService, 'defaultMultipleAsk')
      .mockResolvedValueOnce(
        language.getText('stablecoin.askHederaTokenManagerOther'),
      );
    jest
      .spyOn(utilsService, 'defaultSingleAsk')
      .mockResolvedValueOnce('0.0.12345');

    jest.spyOn(utilsService, 'defaultConfirmAsk').mockResolvedValueOnce(true);

    jest
      .spyOn(utilsService, 'getCurrentAccount')
      .mockReturnValue(currentAccount);
    jest
      .spyOn(utilsService, 'defaultPublicKeyAsk')
      .mockResolvedValue({ key: '0.0.12345' });
    jest.spyOn(StableCoin, 'create').mockResolvedValue({ coin, reserve });
    jest
      .spyOn(utilsService, 'getCurrentFactory')
      .mockReturnValue({ id: 'currentFactory', network: 'network' });
    jest
      .spyOn(utilsService, 'getCurrentResolver')
      .mockReturnValue({ id: 'currentResolver', network: 'network' });
    jest
      .spyOn(SetConfigurationService.prototype, 'initConfiguration')
      .mockImplementation();
    jest
      .spyOn(SetResolverAndFactoryService.prototype, 'getSDKFactory')
      .mockResolvedValue('notCurrentFactory');
    jest
      .spyOn(SetResolverAndFactoryService.prototype, 'getSDKResolver')
      .mockResolvedValue('notCurrentResolver');
    jest
      .spyOn(SetResolverAndFactoryService.prototype, 'setSDKResolverAndFactory')
      .mockImplementation();
    //jest.spyOn(StableCoin, 'create').mockRejectedValue({});
    jest.spyOn(StableCoin, 'create').mockResolvedValue({ coin, reserve });
    jest
      .spyOn(AssociateStableCoinService.prototype, 'associateStableCoin')
      .mockImplementation();
    jest
      .spyOn(Account, 'getPublicKey')
      .mockResolvedValue(new PublicKey('0.0.12345'));

    // proxyAdminOwner
    jest.spyOn(utilsService, 'defaultConfirmAsk').mockResolvedValueOnce(true);
    jest
      .spyOn(utilsService, 'defaultMultipleAsk')
      .mockResolvedValueOnce(language.getText('stablecoin.askProxyAdminOwner'));

    const createdToken = await service.createStableCoin(undefined, true, false);

    expect(service).not.toBeNull();
    expect(createdToken).toEqual({
      name: 'name',
      tokenId: new HederaId('0.0.12345'),
    });
  });
});
