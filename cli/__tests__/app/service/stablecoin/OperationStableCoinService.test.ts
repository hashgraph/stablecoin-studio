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

import { utilsService, wizardService } from '../../../../src/index.js';
import Language from '../../../../src/domain/language/Language.js';
import OperationStableCoinService from '../../../../src/app/service/stablecoin/OperationStableCoinService';
import CapabilitiesStableCoinsService from '../../../../src/app/service/stablecoin/CapabilitiesStableCoinService.js';
import {
  Account,
  HederaId,
  Operation,
  PublicKey,
  StableCoinRole,
  StableCoinViewModel,
} from '@hashgraph/stablecoin-npm-sdk';
import FreezeStableCoinService from '../../../../src/app/service/stablecoin/FreezeStableCoinService.js';
import BalanceOfStableCoinsService from '../../../../src/app/service/stablecoin/BalanceOfStableCoinService.js';
import ConfigurationProxyService from '../../../../src/app/service/proxy/ConfigurationProxyService.js';
import RoleStableCoinService from '../../../../src/app/service/stablecoin/RoleStableCoinService.js';
import TransfersStableCoinService from '../../../../src/app/service/stablecoin/TransfersStableCoinService.js';
import CashInStableCoinService from '../../../../src/app/service/stablecoin/CashInStableCoinService.js';
import DetailsStableCoinService from '../../../../src/app/service/stablecoin/DetailsStableCoinService.js';
import BurnStableCoinsService from '../../../../src/app/service/stablecoin/BurnStableCoinService.js';
import WipeStableCoinService from '../../../../src/app/service/stablecoin/WipeStableCoinService.js';
import RescueStableCoinService from '../../../../src/app/service/stablecoin/RescueStableCoinService.js';
import RescueHBARStableCoinService from '../../../../src/app/service/stablecoin/RescueHBARStableCoinService.js';
import KYCStableCoinService from '../../../../src/app/service/stablecoin/KYCStableCoinService.js';
import FeeStableCoinService from '../../../../src/app/service/stablecoin/FeeStableCoinService.js';
import ImplementationProxyService from '../../../../src/app/service/proxy/ImplementationProxyService.js';
import OwnerProxyService from '../../../../src/app/service/proxy/OwnerProxyService.js';
import UpdateStableCoinService from '../../../../src/app/service/stablecoin/UpdateStableCoinService.js';
import PauseStableCoinService from '../../../../src/app/service/stablecoin/PauseStableCoinService.js';
import DeleteStableCoinService from '../../../../src/app/service/stablecoin/DeleteStableCoinService.js';
import ListStableCoinService from '../../../../src/app/service/stablecoin/ListStableCoinService.js';
import { AccountType } from '../../../../src/domain/configuration/interfaces/AccountType';

const service = new OperationStableCoinService('tokenId', 'memo', 'symbol');
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
const currentMirror = {
  name: 'name',
  network: 'network',
  baseUrl: 'baseUrl',
  apiKey: 'apiKey',
  headerName: 'headerName',
  selected: true,
};
const currentRPC = {
  name: 'name',
  network: 'network',
  baseUrl: 'baseUrl',
  apiKey: 'apiKey',
  headerName: 'headerName',
  selected: true,
};
const account = {
  id: new HederaId('0.0.12345'),
  publicKey: new PublicKey({
    key: 'key',
    type: 'type',
  }),
};
const coin = {
  name: 'name',
  symbol: 'Test',
  decimals: 6,
  createReserve: false,
  deleted: false,
  paused: false,
  kycKey: false,
  freezeKey: false,
  tokenId: account.id,
  adminKey: 'admin',
  proxyAddress: 'admin',
};
const capabilities = [
  { operation: Operation.CASH_IN, access: 1 },
  { operation: Operation.BURN, access: 1 },
  { operation: Operation.WIPE, access: 1 },
  { operation: Operation.FREEZE, access: 1 },
  { operation: Operation.UNFREEZE, access: 1 },
  { operation: Operation.PAUSE, access: 1 },
  { operation: Operation.UNPAUSE, access: 1 },
  { operation: Operation.DELETE, access: 1 },
  { operation: Operation.RESCUE, access: 1 },
  { operation: Operation.RESCUE_HBAR, access: 1 },
  { operation: Operation.ROLE_MANAGEMENT, access: 1 },
  { operation: Operation.ROLE_ADMIN_MANAGEMENT, access: 1 },
  { operation: Operation.RESERVE_MANAGEMENT, access: 1 },
  { operation: Operation.GRANT_KYC, access: 1 },
  { operation: Operation.REVOKE_KYC, access: 1 },
  { operation: Operation.CREATE_CUSTOM_FEE, access: 1 },
  { operation: Operation.REMOVE_CUSTOM_FEE, access: 1 },
  { operation: Operation.TRANSFERS, access: 1 },
  { operation: Operation.UPDATE, access: 1 },
];
const roles = [
  StableCoinRole.CASHIN_ROLE,
  StableCoinRole.BURN_ROLE,
  StableCoinRole.WIPE_ROLE,
  StableCoinRole.RESCUE_ROLE,
  StableCoinRole.PAUSE_ROLE,
  StableCoinRole.FREEZE_ROLE,
  StableCoinRole.DELETE_ROLE,
  StableCoinRole.DEFAULT_ADMIN_ROLE,
  StableCoinRole.WITHOUT_ROLE,
  StableCoinRole.KYC_ROLE,
];
describe(`Testing OperationStableCoinService class`, () => {
  beforeEach(() => {
    jest.spyOn(utilsService, 'showSpinner').mockImplementation();
    jest.spyOn(utilsService, 'cleanAndShowBanner').mockImplementation();
    jest
      .spyOn(utilsService, 'getCurrentAccount')
      .mockReturnValue(currentAccount);
    jest.spyOn(utilsService, 'getCurrentMirror').mockReturnValue(currentMirror);
    jest.spyOn(utilsService, 'getCurrentRPC').mockReturnValue(currentRPC);

    CapabilitiesStableCoinsService.prototype.getCapabilitiesStableCoins = jest
      .fn()
      .mockImplementation(() => {
        return { coin, capabilities, account };
      });
    FreezeStableCoinService.prototype.isAccountFrozen = jest
      .fn()
      .mockResolvedValue(false);
    ConfigurationProxyService.prototype.getProxyconfiguration = jest
      .fn()
      .mockResolvedValue({
        implementationAddress: 'implementationAddress',
        owner: 'owner',
        pendingOwner: 'pendingOwner',
      });
    RoleStableCoinService.prototype.getRolesWithoutPrinting = jest
      .fn()
      .mockResolvedValue(roles);
    jest.spyOn(utilsService, 'displayCurrentUserInfo').mockImplementation();
    jest.spyOn(wizardService, 'mainMenu').mockImplementation();
    jest.spyOn(console, 'log').mockImplementation();

    const keep = (OperationStableCoinService.prototype as any)
      .operationsStableCoin;
    jest
      .spyOn(
        OperationStableCoinService.prototype as any,
        'operationsStableCoin',
      )
      .mockImplementationOnce(keep)
      .mockImplementation(jest.fn());
  });
  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('Should instance start with send', async () => {
    jest
      .spyOn(utilsService, 'defaultMultipleAsk')
      .mockResolvedValueOnce(language.getText('wizard.stableCoinOptions.Send'));
    jest
      .spyOn(BalanceOfStableCoinsService.prototype, 'getBalanceOfStableCoin_2')
      .mockResolvedValue('10');
    jest
      .spyOn(utilsService, 'defaultSingleAsk')
      .mockResolvedValueOnce('0.0.12345')
      .mockResolvedValueOnce('1');
    jest
      .spyOn(utilsService, 'defaultConfirmAsk')
      .mockResolvedValueOnce(false)
      .mockResolvedValueOnce(true);
    TransfersStableCoinService.prototype.transfersStableCoin = jest
      .fn()
      .mockImplementation();
    jest
      .spyOn(utilsService, 'defaultMultipleAsk')
      .mockResolvedValueOnce('Go back');

    await service.start();

    expect(service).not.toBeNull();
    expect(utilsService.cleanAndShowBanner).toHaveBeenCalled();
  });

  it('Should instance start with CashIn', async () => {
    jest
      .spyOn(utilsService, 'defaultMultipleAsk')
      .mockResolvedValueOnce(
        language.getText('wizard.stableCoinOptions.CashIn'),
      );
    jest
      .spyOn(utilsService, 'defaultSingleAsk')
      .mockResolvedValueOnce('0.0.12345')
      .mockResolvedValueOnce('1');
    jest
      .spyOn(utilsService, 'defaultConfirmAsk')
      .mockResolvedValueOnce(false)
      .mockResolvedValueOnce(true);
    CashInStableCoinService.prototype.cashInStableCoin = jest
      .fn()
      .mockImplementation();
    jest
      .spyOn(utilsService, 'defaultMultipleAsk')
      .mockResolvedValueOnce('Go back');

    await service.start();

    expect(service).not.toBeNull();
    expect(utilsService.cleanAndShowBanner).toHaveBeenCalled();
  });

  it('Should instance start with Details', async () => {
    jest
      .spyOn(utilsService, 'defaultMultipleAsk')
      .mockResolvedValueOnce(
        language.getText('wizard.stableCoinOptions.Details'),
      );
    DetailsStableCoinService.prototype.getDetailsStableCoins = jest
      .fn()
      .mockImplementation();
    jest
      .spyOn(utilsService, 'defaultMultipleAsk')
      .mockResolvedValueOnce('Go back');

    await service.start();

    expect(service).not.toBeNull();
    expect(utilsService.cleanAndShowBanner).toHaveBeenCalled();
  });

  it('Should instance start with Balance', async () => {
    jest
      .spyOn(utilsService, 'defaultMultipleAsk')
      .mockResolvedValueOnce(
        language.getText('wizard.stableCoinOptions.Balance'),
      );
    jest
      .spyOn(utilsService, 'defaultSingleAsk')
      .mockResolvedValueOnce('0.0.12345');
    BalanceOfStableCoinsService.prototype.getBalanceOfStableCoin = jest
      .fn()
      .mockImplementation();
    jest
      .spyOn(utilsService, 'defaultMultipleAsk')
      .mockResolvedValueOnce('Go back');

    await service.start();

    expect(service).not.toBeNull();
    expect(utilsService.cleanAndShowBanner).toHaveBeenCalled();
  });

  it('Should instance start with Burn', async () => {
    jest
      .spyOn(utilsService, 'defaultMultipleAsk')
      .mockResolvedValueOnce(language.getText('wizard.stableCoinOptions.Burn'));
    jest.spyOn(utilsService, 'defaultSingleAsk').mockResolvedValueOnce('10');
    BurnStableCoinsService.prototype.burnStableCoin = jest
      .fn()
      .mockImplementation();
    jest
      .spyOn(utilsService, 'defaultMultipleAsk')
      .mockResolvedValueOnce('Go back');

    await service.start();

    expect(service).not.toBeNull();
    expect(utilsService.cleanAndShowBanner).toHaveBeenCalled();
  });

  it('Should instance start with Wipe', async () => {
    jest
      .spyOn(utilsService, 'defaultMultipleAsk')
      .mockResolvedValueOnce(language.getText('wizard.stableCoinOptions.Wipe'));
    jest
      .spyOn(utilsService, 'defaultSingleAsk')
      .mockResolvedValueOnce('0.0.12345')
      .mockResolvedValueOnce('10');
    WipeStableCoinService.prototype.wipeStableCoin = jest
      .fn()
      .mockImplementation();
    jest
      .spyOn(utilsService, 'defaultMultipleAsk')
      .mockResolvedValueOnce('Go back');

    await service.start();

    expect(service).not.toBeNull();
    expect(utilsService.cleanAndShowBanner).toHaveBeenCalled();
  });

  it('Should instance start with Rescue', async () => {
    jest
      .spyOn(utilsService, 'defaultMultipleAsk')
      .mockResolvedValueOnce(
        language.getText('wizard.stableCoinOptions.Rescue'),
      );
    jest.spyOn(utilsService, 'defaultSingleAsk').mockResolvedValueOnce('10');
    RescueStableCoinService.prototype.rescueStableCoin = jest
      .fn()
      .mockImplementation();
    jest
      .spyOn(utilsService, 'defaultMultipleAsk')
      .mockResolvedValueOnce('Go back');

    await service.start();

    expect(service).not.toBeNull();
    expect(utilsService.cleanAndShowBanner).toHaveBeenCalled();
  });

  it('Should instance start with RescueHBAR', async () => {
    jest
      .spyOn(utilsService, 'defaultMultipleAsk')
      .mockResolvedValueOnce(
        language.getText('wizard.stableCoinOptions.RescueHBAR'),
      );
    jest.spyOn(utilsService, 'defaultSingleAsk').mockResolvedValueOnce('10');
    RescueHBARStableCoinService.prototype.rescueHBARStableCoin = jest
      .fn()
      .mockImplementation();
    jest
      .spyOn(utilsService, 'defaultMultipleAsk')
      .mockResolvedValueOnce('Go back');

    await service.start();

    expect(service).not.toBeNull();
    expect(utilsService.cleanAndShowBanner).toHaveBeenCalled();
  });

  it('Should instance start with Freeze', async () => {
    jest
      .spyOn(utilsService, 'defaultMultipleAsk')
      .mockResolvedValueOnce(
        language.getText('wizard.stableCoinOptions.FreezeMgmt'),
      );
    jest
      .spyOn(utilsService, 'defaultMultipleAsk')
      .mockResolvedValueOnce(
        language.getText('freezeManagement.options.Freeze'),
      );
    jest
      .spyOn(utilsService, 'defaultSingleAsk')
      .mockResolvedValueOnce('0.0.12345');
    FreezeStableCoinService.prototype.freezeAccount = jest
      .fn()
      .mockImplementation();
    jest
      .spyOn(utilsService, 'defaultMultipleAsk')
      .mockResolvedValueOnce('Go back')
      .mockResolvedValueOnce('Go back');

    const keepFlow = (OperationStableCoinService.prototype as any)
      .freezeManagementFlow;
    jest
      .spyOn(
        OperationStableCoinService.prototype as any,
        'freezeManagementFlow',
      )
      .mockImplementationOnce(keepFlow)
      .mockImplementation(jest.fn());
    await service.start();

    expect(service).not.toBeNull();
    expect(utilsService.cleanAndShowBanner).toHaveBeenCalled();
  });

  it('Should instance start with UnFreeze', async () => {
    jest
      .spyOn(utilsService, 'defaultMultipleAsk')
      .mockResolvedValueOnce(
        language.getText('wizard.stableCoinOptions.FreezeMgmt'),
      );
    jest
      .spyOn(utilsService, 'defaultMultipleAsk')
      .mockResolvedValueOnce(
        language.getText('freezeManagement.options.UnFreeze'),
      );
    jest
      .spyOn(utilsService, 'defaultSingleAsk')
      .mockResolvedValueOnce('0.0.12345');
    FreezeStableCoinService.prototype.unfreezeAccount = jest
      .fn()
      .mockImplementation();
    jest
      .spyOn(utilsService, 'defaultMultipleAsk')
      .mockResolvedValueOnce('Go back')
      .mockResolvedValueOnce('Go back');

    const keepFlow = (OperationStableCoinService.prototype as any)
      .freezeManagementFlow;
    jest
      .spyOn(
        OperationStableCoinService.prototype as any,
        'freezeManagementFlow',
      )
      .mockImplementationOnce(keepFlow)
      .mockImplementation(jest.fn());
    await service.start();

    expect(service).not.toBeNull();
    expect(utilsService.cleanAndShowBanner).toHaveBeenCalled();
  });

  it('Should instance start with AccountFrozen', async () => {
    jest
      .spyOn(utilsService, 'defaultMultipleAsk')
      .mockResolvedValueOnce(
        language.getText('wizard.stableCoinOptions.FreezeMgmt'),
      );
    jest
      .spyOn(utilsService, 'defaultMultipleAsk')
      .mockResolvedValueOnce(
        language.getText('freezeManagement.options.AccountFrozen'),
      );
    jest
      .spyOn(utilsService, 'defaultSingleAsk')
      .mockResolvedValueOnce('0.0.12345');
    FreezeStableCoinService.prototype.isAccountFrozenDisplay = jest
      .fn()
      .mockImplementation();
    jest
      .spyOn(utilsService, 'defaultMultipleAsk')
      .mockResolvedValueOnce('Go back')
      .mockResolvedValueOnce('Go back');

    const keepFlow = (OperationStableCoinService.prototype as any)
      .freezeManagementFlow;
    jest
      .spyOn(
        OperationStableCoinService.prototype as any,
        'freezeManagementFlow',
      )
      .mockImplementationOnce(keepFlow)
      .mockImplementation(jest.fn());
    await service.start();

    expect(service).not.toBeNull();
    expect(utilsService.cleanAndShowBanner).toHaveBeenCalled();
  });

  it('Should instance start with GrantKYC', async () => {
    jest
      .spyOn(utilsService, 'defaultMultipleAsk')
      .mockResolvedValueOnce(
        language.getText('wizard.stableCoinOptions.KYCMgmt'),
      );
    jest
      .spyOn(utilsService, 'defaultMultipleAsk')
      .mockResolvedValueOnce(
        language.getText('kycManagement.options.GrantKYC'),
      );
    jest
      .spyOn(utilsService, 'defaultSingleAsk')
      .mockResolvedValueOnce('0.0.12345');
    KYCStableCoinService.prototype.grantKYCToAccount = jest
      .fn()
      .mockImplementation();
    jest
      .spyOn(utilsService, 'defaultMultipleAsk')
      .mockResolvedValueOnce('Go back')
      .mockResolvedValueOnce('Go back');

    const keepFlow = (OperationStableCoinService.prototype as any)
      .kycManagementFlow;
    jest
      .spyOn(OperationStableCoinService.prototype as any, 'kycManagementFlow')
      .mockImplementationOnce(keepFlow)
      .mockImplementation(jest.fn());
    await service.start();

    expect(service).not.toBeNull();
    expect(utilsService.cleanAndShowBanner).toHaveBeenCalled();
  });

  it('Should instance start with RevokeKYC', async () => {
    jest
      .spyOn(utilsService, 'defaultMultipleAsk')
      .mockResolvedValueOnce(
        language.getText('wizard.stableCoinOptions.KYCMgmt'),
      );
    jest
      .spyOn(utilsService, 'defaultMultipleAsk')
      .mockResolvedValueOnce(
        language.getText('kycManagement.options.RevokeKYC'),
      );
    jest
      .spyOn(utilsService, 'defaultSingleAsk')
      .mockResolvedValueOnce('0.0.12345');
    KYCStableCoinService.prototype.revokeKYCFromAccount = jest
      .fn()
      .mockImplementation();
    jest
      .spyOn(utilsService, 'defaultMultipleAsk')
      .mockResolvedValueOnce('Go back')
      .mockResolvedValueOnce('Go back');

    const keepFlow = (OperationStableCoinService.prototype as any)
      .kycManagementFlow;
    jest
      .spyOn(OperationStableCoinService.prototype as any, 'kycManagementFlow')
      .mockImplementationOnce(keepFlow)
      .mockImplementation(jest.fn());
    await service.start();

    expect(service).not.toBeNull();
    expect(utilsService.cleanAndShowBanner).toHaveBeenCalled();
  });

  it('Should instance start with AccountKYCGranted', async () => {
    jest
      .spyOn(utilsService, 'defaultMultipleAsk')
      .mockResolvedValueOnce(
        language.getText('wizard.stableCoinOptions.KYCMgmt'),
      );
    jest
      .spyOn(utilsService, 'defaultMultipleAsk')
      .mockResolvedValueOnce(
        language.getText('kycManagement.options.AccountKYCGranted'),
      );
    jest
      .spyOn(utilsService, 'defaultSingleAsk')
      .mockResolvedValueOnce('0.0.12345');
    KYCStableCoinService.prototype.isAccountKYCGranted = jest
      .fn()
      .mockImplementation();
    jest
      .spyOn(utilsService, 'defaultMultipleAsk')
      .mockResolvedValueOnce('Go back')
      .mockResolvedValueOnce('Go back');

    const keepFlow = (OperationStableCoinService.prototype as any)
      .kycManagementFlow;
    jest
      .spyOn(OperationStableCoinService.prototype as any, 'kycManagementFlow')
      .mockImplementationOnce(keepFlow)
      .mockImplementation(jest.fn());
    await service.start();

    expect(service).not.toBeNull();
    expect(utilsService.cleanAndShowBanner).toHaveBeenCalled();
  });

  it('Should instance start with createFixedFee', async () => {
    jest
      .spyOn(utilsService, 'defaultMultipleAsk')
      .mockResolvedValueOnce(
        language.getText('wizard.stableCoinOptions.FeesMgmt'),
      );
    jest
      .spyOn(utilsService, 'defaultMultipleAsk')
      .mockResolvedValueOnce(language.getText('feeManagement.options.Create'));
    jest
      .spyOn(utilsService, 'defaultMultipleAsk')
      .mockResolvedValueOnce(
        language.getText('feeManagement.chooseFeeType.FixedFee'),
      );
    jest.spyOn(utilsService, 'defaultConfirmAsk').mockResolvedValueOnce(false);
    jest
      .spyOn(utilsService, 'defaultSingleAsk')
      .mockResolvedValueOnce('0.0.123456');
    DetailsStableCoinService.prototype.getDetailsStableCoins = jest
      .fn()
      .mockResolvedValue({ decimals: 6 });
    jest.spyOn(utilsService, 'defaultSingleAsk').mockResolvedValueOnce('10');
    jest
      .spyOn(utilsService, 'defaultConfirmAsk')
      .mockResolvedValueOnce(true)
      .mockResolvedValueOnce(true);
    jest
      .spyOn(utilsService, 'defaultSingleAsk')
      .mockResolvedValueOnce('0.0.123456');

    FeeStableCoinService.prototype.addFixedFee = jest.fn().mockImplementation();
    jest
      .spyOn(utilsService, 'defaultMultipleAsk')
      .mockResolvedValueOnce('Go back')
      .mockResolvedValueOnce('Go back');

    const keepFlow = (OperationStableCoinService.prototype as any)
      .feesManagementFlow;
    jest
      .spyOn(OperationStableCoinService.prototype as any, 'feesManagementFlow')
      .mockImplementationOnce(keepFlow)
      .mockImplementation(jest.fn());
    await service.start();

    expect(service).not.toBeNull();
    expect(utilsService.cleanAndShowBanner).toHaveBeenCalled();
  });

  it('Should instance start with createFractionalFee Percentage', async () => {
    jest
      .spyOn(utilsService, 'defaultMultipleAsk')
      .mockResolvedValueOnce(
        language.getText('wizard.stableCoinOptions.FeesMgmt'),
      );
    jest
      .spyOn(utilsService, 'defaultMultipleAsk')
      .mockResolvedValueOnce(language.getText('feeManagement.options.Create'));
    jest
      .spyOn(utilsService, 'defaultMultipleAsk')
      .mockResolvedValueOnce(
        language.getText('feeManagement.chooseFeeType.FractionalFee'),
      );
    jest
      .spyOn(utilsService, 'defaultMultipleAsk')
      .mockResolvedValueOnce(
        language.getText('feeManagement.chooseFractionalType.Percentage'),
      );
    DetailsStableCoinService.prototype.getDetailsStableCoins = jest
      .fn()
      .mockResolvedValue({ decimals: 6 });
    jest.spyOn(utilsService, 'defaultSingleAsk').mockResolvedValueOnce('1');
    jest
      .spyOn(utilsService, 'defaultSingleAsk')
      .mockResolvedValueOnce('1')
      .mockResolvedValueOnce('1');
    jest
      .spyOn(utilsService, 'defaultConfirmAsk')
      .mockResolvedValueOnce(true)
      .mockResolvedValueOnce(true);
    jest
      .spyOn(utilsService, 'defaultSingleAsk')
      .mockResolvedValueOnce('0.0.123456');
    jest.spyOn(utilsService, 'defaultConfirmAsk').mockResolvedValueOnce(true);
    FeeStableCoinService.prototype.addFractionalFee = jest
      .fn()
      .mockImplementation();
    jest
      .spyOn(utilsService, 'defaultMultipleAsk')
      .mockResolvedValueOnce('Go back')
      .mockResolvedValueOnce('Go back');

    const keepFlow = (OperationStableCoinService.prototype as any)
      .feesManagementFlow;
    jest
      .spyOn(OperationStableCoinService.prototype as any, 'feesManagementFlow')
      .mockImplementationOnce(keepFlow)
      .mockImplementation(jest.fn());
    await service.start();

    expect(service).not.toBeNull();
    expect(utilsService.cleanAndShowBanner).toHaveBeenCalled();
  });

  it('Should instance start with createFractionalFee Fraction', async () => {
    jest
      .spyOn(utilsService, 'defaultMultipleAsk')
      .mockResolvedValueOnce(
        language.getText('wizard.stableCoinOptions.FeesMgmt'),
      );
    jest
      .spyOn(utilsService, 'defaultMultipleAsk')
      .mockResolvedValueOnce(language.getText('feeManagement.options.Create'));
    jest
      .spyOn(utilsService, 'defaultMultipleAsk')
      .mockResolvedValueOnce(
        language.getText('feeManagement.chooseFeeType.FractionalFee'),
      );
    jest
      .spyOn(utilsService, 'defaultMultipleAsk')
      .mockResolvedValueOnce(
        language.getText('feeManagement.chooseFractionalType.Fraction'),
      );
    DetailsStableCoinService.prototype.getDetailsStableCoins = jest
      .fn()
      .mockResolvedValue({ decimals: 6 });
    jest
      .spyOn(utilsService, 'defaultSingleAsk')
      .mockResolvedValueOnce('1')
      .mockResolvedValueOnce('2');
    jest
      .spyOn(utilsService, 'defaultSingleAsk')
      .mockResolvedValueOnce('1')
      .mockResolvedValueOnce('1');
    jest
      .spyOn(utilsService, 'defaultConfirmAsk')
      .mockResolvedValueOnce(true)
      .mockResolvedValueOnce(true);
    jest
      .spyOn(utilsService, 'defaultSingleAsk')
      .mockResolvedValueOnce('0.0.123456');
    jest.spyOn(utilsService, 'defaultConfirmAsk').mockResolvedValueOnce(true);
    FeeStableCoinService.prototype.addFractionalFee = jest
      .fn()
      .mockImplementation();
    jest
      .spyOn(utilsService, 'defaultMultipleAsk')
      .mockResolvedValueOnce('Go back')
      .mockResolvedValueOnce('Go back');

    const keepFlow = (OperationStableCoinService.prototype as any)
      .feesManagementFlow;
    jest
      .spyOn(OperationStableCoinService.prototype as any, 'feesManagementFlow')
      .mockImplementationOnce(keepFlow)
      .mockImplementation(jest.fn());
    await service.start();

    expect(service).not.toBeNull();
    expect(utilsService.cleanAndShowBanner).toHaveBeenCalled();
  });

  it('Should instance start with Fees Remove', async () => {
    const customFees = {
      collectorId: 'collectorId',
      collectorsExempt: true,
      decimals: 6,
    };
    jest
      .spyOn(utilsService, 'defaultMultipleAsk')
      .mockResolvedValueOnce(
        language.getText('wizard.stableCoinOptions.FeesMgmt'),
      );
    jest
      .spyOn(utilsService, 'defaultMultipleAsk')
      .mockResolvedValueOnce(language.getText('feeManagement.options.Remove'));
    DetailsStableCoinService.prototype.getDetailsStableCoins = jest
      .fn()
      .mockResolvedValue({ customFees });
    FeeStableCoinService.prototype.getSerializedFees = jest
      .fn()
      .mockImplementation();
    jest.spyOn(utilsService, 'checkBoxMultipleAsk').mockImplementation();
    jest.spyOn(utilsService, 'defaultConfirmAsk').mockResolvedValueOnce(true);
    FeeStableCoinService.prototype.getRemainingFees = jest
      .fn()
      .mockImplementation();
    FeeStableCoinService.prototype.updateFees = jest.fn().mockImplementation();
    jest
      .spyOn(utilsService, 'defaultMultipleAsk')
      .mockResolvedValueOnce('Go back')
      .mockResolvedValueOnce('Go back');

    const keepFlow = (OperationStableCoinService.prototype as any)
      .feesManagementFlow;
    jest
      .spyOn(OperationStableCoinService.prototype as any, 'feesManagementFlow')
      .mockImplementationOnce(keepFlow)
      .mockImplementation(jest.fn());
    await service.start();

    expect(service).not.toBeNull();
    expect(utilsService.cleanAndShowBanner).toHaveBeenCalled();
  });

  it('Should instance start with Fees List', async () => {
    const customFees = {
      collectorId: 'collectorId',
      collectorsExempt: true,
      decimals: 6,
    };
    jest
      .spyOn(utilsService, 'defaultMultipleAsk')
      .mockResolvedValueOnce(
        language.getText('wizard.stableCoinOptions.FeesMgmt'),
      );
    jest
      .spyOn(utilsService, 'defaultMultipleAsk')
      .mockResolvedValueOnce(language.getText('feeManagement.options.List'));
    DetailsStableCoinService.prototype.getDetailsStableCoins = jest
      .fn()
      .mockResolvedValue({ customFees });
    FeeStableCoinService.prototype.getSerializedFees = jest
      .fn()
      .mockImplementation();
    jest
      .spyOn(utilsService, 'defaultMultipleAsk')
      .mockResolvedValueOnce('Go back')
      .mockResolvedValueOnce('Go back');

    const keepFlow = (OperationStableCoinService.prototype as any)
      .feesManagementFlow;
    jest
      .spyOn(OperationStableCoinService.prototype as any, 'feesManagementFlow')
      .mockImplementationOnce(keepFlow)
      .mockImplementation(jest.fn());
    await service.start();

    expect(service).not.toBeNull();
    expect(utilsService.cleanAndShowBanner).toHaveBeenCalled();
  });

  it('Should instance start with roles grant check', async () => {
    jest
      .spyOn(utilsService, 'defaultMultipleAsk')
      .mockResolvedValueOnce(
        language.getText('wizard.stableCoinOptions.RoleMgmt'),
      );
    jest
      .spyOn(utilsService, 'defaultMultipleAsk')
      .mockResolvedValueOnce(
        language.getText('wizard.roleManagementOptions.CheckAccountsWithRole'),
      );
    jest
      .spyOn(utilsService, 'defaultMultipleAsk')
      .mockResolvedValueOnce(
        language.getText('wizard.CheckAccountsWithRoleOptions.Admin'),
      );
    jest
      .spyOn(utilsService, 'defaultMultipleAsk')
      .mockResolvedValueOnce(
        language.getText('wizard.roleManagementOptions.CheckAccountsWithRole'),
      );
    jest
      .spyOn(utilsService, 'defaultMultipleAsk')
      .mockResolvedValueOnce(
        language.getText('wizard.CheckAccountsWithRoleOptions.CashIn'),
      );
    jest
      .spyOn(utilsService, 'defaultMultipleAsk')
      .mockResolvedValueOnce(
        language.getText('wizard.roleManagementOptions.CheckAccountsWithRole'),
      );
    jest
      .spyOn(utilsService, 'defaultMultipleAsk')
      .mockResolvedValueOnce(
        language.getText('wizard.CheckAccountsWithRoleOptions.Burn'),
      );
    jest
      .spyOn(utilsService, 'defaultMultipleAsk')
      .mockResolvedValueOnce(
        language.getText('wizard.roleManagementOptions.CheckAccountsWithRole'),
      );
    jest
      .spyOn(utilsService, 'defaultMultipleAsk')
      .mockResolvedValueOnce(
        language.getText('wizard.CheckAccountsWithRoleOptions.Wipe'),
      );
    jest
      .spyOn(utilsService, 'defaultMultipleAsk')
      .mockResolvedValueOnce(
        language.getText('wizard.roleManagementOptions.CheckAccountsWithRole'),
      );
    jest
      .spyOn(utilsService, 'defaultMultipleAsk')
      .mockResolvedValueOnce(
        language.getText('wizard.CheckAccountsWithRoleOptions.Rescue'),
      );
    jest
      .spyOn(utilsService, 'defaultMultipleAsk')
      .mockResolvedValueOnce(
        language.getText('wizard.roleManagementOptions.CheckAccountsWithRole'),
      );
    jest
      .spyOn(utilsService, 'defaultMultipleAsk')
      .mockResolvedValueOnce(
        language.getText('wizard.CheckAccountsWithRoleOptions.RescueHBAR'),
      );
    jest
      .spyOn(utilsService, 'defaultMultipleAsk')
      .mockResolvedValueOnce(
        language.getText('wizard.roleManagementOptions.CheckAccountsWithRole'),
      );
    jest
      .spyOn(utilsService, 'defaultMultipleAsk')
      .mockResolvedValueOnce(
        language.getText('wizard.CheckAccountsWithRoleOptions.Pause'),
      );
    jest
      .spyOn(utilsService, 'defaultMultipleAsk')
      .mockResolvedValueOnce(
        language.getText('wizard.roleManagementOptions.CheckAccountsWithRole'),
      );
    jest
      .spyOn(utilsService, 'defaultMultipleAsk')
      .mockResolvedValueOnce(
        language.getText('wizard.CheckAccountsWithRoleOptions.Freeze'),
      );
    jest
      .spyOn(utilsService, 'defaultMultipleAsk')
      .mockResolvedValueOnce(
        language.getText('wizard.roleManagementOptions.CheckAccountsWithRole'),
      );
    jest
      .spyOn(utilsService, 'defaultMultipleAsk')
      .mockResolvedValueOnce(
        language.getText('wizard.CheckAccountsWithRoleOptions.Delete'),
      );
    jest
      .spyOn(utilsService, 'defaultMultipleAsk')
      .mockResolvedValueOnce(
        language.getText('wizard.roleManagementOptions.CheckAccountsWithRole'),
      );
    jest
      .spyOn(utilsService, 'defaultMultipleAsk')
      .mockResolvedValueOnce(
        language.getText('wizard.CheckAccountsWithRoleOptions.KYC'),
      );
    jest
      .spyOn(utilsService, 'defaultMultipleAsk')
      .mockResolvedValueOnce(
        language.getText('wizard.roleManagementOptions.CheckAccountsWithRole'),
      );
    jest
      .spyOn(utilsService, 'defaultMultipleAsk')
      .mockResolvedValueOnce('Go back');
    RoleStableCoinService.prototype.getAccountsWithRole = jest
      .fn()
      .mockImplementation();
    jest
      .spyOn(utilsService, 'defaultMultipleAsk')
      .mockResolvedValueOnce('Go back')
      .mockResolvedValueOnce('Go back');

    const keepFlow = (OperationStableCoinService.prototype as any)
      .roleManagementFlow;
    jest
      .spyOn(OperationStableCoinService.prototype as any, 'roleManagementFlow')
      .mockImplementationOnce(keepFlow)
      .mockImplementationOnce(keepFlow)
      .mockImplementationOnce(keepFlow)
      .mockImplementationOnce(keepFlow)
      .mockImplementationOnce(keepFlow)
      .mockImplementationOnce(keepFlow)
      .mockImplementationOnce(keepFlow)
      .mockImplementationOnce(keepFlow)
      .mockImplementationOnce(keepFlow)
      .mockImplementationOnce(keepFlow)
      .mockImplementationOnce(keepFlow)
      .mockImplementation(jest.fn());
    await service.start();

    expect(service).not.toBeNull();
    expect(utilsService.cleanAndShowBanner).toHaveBeenCalled();
  });

  it('Should instance start with roles grant', async () => {
    jest
      .spyOn(utilsService, 'defaultMultipleAsk')
      .mockResolvedValueOnce(
        language.getText('wizard.stableCoinOptions.RoleMgmt'),
      );
    jest
      .spyOn(utilsService, 'defaultMultipleAsk')
      .mockResolvedValueOnce(
        language.getText('wizard.roleManagementOptions.Grant'),
      );
    jest
      .spyOn(OperationStableCoinService.prototype as any, 'validateTokenId')
      .mockImplementation(jest.fn());
    jest
      .spyOn(utilsService, 'checkBoxMultipleAsk')
      .mockResolvedValue(['Admin Role']);
    jest
      .spyOn(utilsService, 'defaultSingleAsk')
      .mockResolvedValueOnce('0.0.12345');
    jest.spyOn(utilsService, 'defaultConfirmAsk').mockResolvedValueOnce(false);
    jest.spyOn(utilsService, 'defaultSingleAsk').mockResolvedValueOnce('10');
    jest
      .spyOn(utilsService, 'defaultConfirmAsk')
      .mockResolvedValueOnce(false)
      .mockResolvedValueOnce(true);
    RoleStableCoinService.prototype.grantMultiRolesStableCoin = jest
      .fn()
      .mockImplementation();
    jest
      .spyOn(utilsService, 'defaultMultipleAsk')
      .mockResolvedValueOnce('Go back')
      .mockResolvedValueOnce('Go back');

    const keepFlow = (OperationStableCoinService.prototype as any)
      .roleManagementFlow;
    jest
      .spyOn(OperationStableCoinService.prototype as any, 'roleManagementFlow')
      .mockImplementationOnce(keepFlow)
      .mockImplementation(jest.fn());
    await service.start();

    expect(service).not.toBeNull();
    expect(utilsService.cleanAndShowBanner).toHaveBeenCalled();
  });

  it('Should instance start with roles Revoke', async () => {
    jest
      .spyOn(utilsService, 'defaultMultipleAsk')
      .mockResolvedValueOnce(
        language.getText('wizard.stableCoinOptions.RoleMgmt'),
      );
    jest
      .spyOn(utilsService, 'defaultMultipleAsk')
      .mockResolvedValueOnce(
        language.getText('wizard.roleManagementOptions.Revoke'),
      );
    jest
      .spyOn(OperationStableCoinService.prototype as any, 'validateTokenId')
      .mockImplementation(jest.fn());
    jest
      .spyOn(OperationStableCoinService.prototype as any, 'getRoles')
      .mockImplementation(jest.fn());
    jest
      .spyOn(OperationStableCoinService.prototype as any, 'getAccounts')
      .mockImplementation(jest.fn());
    jest.spyOn(utilsService, 'defaultConfirmAsk').mockResolvedValueOnce(true);
    RoleStableCoinService.prototype.revokeMultiRolesStableCoin = jest
      .fn()
      .mockImplementation();
    jest
      .spyOn(utilsService, 'defaultMultipleAsk')
      .mockResolvedValueOnce('Go back')
      .mockResolvedValueOnce('Go back');

    const keepFlow = (OperationStableCoinService.prototype as any)
      .roleManagementFlow;
    jest
      .spyOn(OperationStableCoinService.prototype as any, 'roleManagementFlow')
      .mockImplementationOnce(keepFlow)
      .mockImplementation(jest.fn());
    await service.start();

    expect(service).not.toBeNull();
    expect(utilsService.cleanAndShowBanner).toHaveBeenCalled();
  });

  it('Should instance start with roles edit Increase', async () => {
    jest
      .spyOn(utilsService, 'defaultMultipleAsk')
      .mockResolvedValueOnce(
        language.getText('wizard.stableCoinOptions.RoleMgmt'),
      );
    jest
      .spyOn(utilsService, 'defaultMultipleAsk')
      .mockResolvedValueOnce(
        language.getText('wizard.roleManagementOptions.Edit'),
      );
    jest
      .spyOn(utilsService, 'defaultMultipleAsk')
      .mockResolvedValueOnce(
        language.getText('roleManagement.editAction.Increase'),
      );
    jest
      .spyOn(OperationStableCoinService.prototype as any, 'validateTokenId')
      .mockImplementation(jest.fn());
    jest
      .spyOn(utilsService, 'defaultSingleAsk')
      .mockResolvedValueOnce('0.0.12345');
    jest
      .spyOn(
        RoleStableCoinService.prototype as any,
        'checkCashInRoleStableCoin',
      )
      .mockResolvedValueOnce(false);
    jest
      .spyOn(
        RoleStableCoinService.prototype as any,
        'checkCashInRoleStableCoin',
      )
      .mockResolvedValueOnce(true);
    jest.spyOn(utilsService, 'defaultSingleAsk').mockResolvedValueOnce('1');
    jest
      .spyOn(
        RoleStableCoinService.prototype as any,
        'increaseLimitSupplierRoleStableCoin',
      )
      .mockImplementation();
    jest
      .spyOn(RoleStableCoinService.prototype as any, 'getSupplierAllowance')
      .mockImplementation();
    jest
      .spyOn(utilsService, 'defaultMultipleAsk')
      .mockResolvedValueOnce('Go back')
      .mockResolvedValueOnce('Go back');

    const keepFlow = (OperationStableCoinService.prototype as any)
      .roleManagementFlow;
    jest
      .spyOn(OperationStableCoinService.prototype as any, 'roleManagementFlow')
      .mockImplementationOnce(keepFlow)
      .mockImplementation(jest.fn());
    await service.start();

    expect(service).not.toBeNull();
    expect(utilsService.cleanAndShowBanner).toHaveBeenCalled();
  });

  it('Should instance start with roles edit Decrease', async () => {
    jest
      .spyOn(utilsService, 'defaultMultipleAsk')
      .mockResolvedValueOnce(
        language.getText('wizard.stableCoinOptions.RoleMgmt'),
      );
    jest
      .spyOn(utilsService, 'defaultMultipleAsk')
      .mockResolvedValueOnce(
        language.getText('wizard.roleManagementOptions.Edit'),
      );
    jest
      .spyOn(utilsService, 'defaultMultipleAsk')
      .mockResolvedValueOnce(
        language.getText('roleManagement.editAction.Decrease'),
      );
    jest
      .spyOn(OperationStableCoinService.prototype as any, 'validateTokenId')
      .mockImplementation(jest.fn());
    jest
      .spyOn(utilsService, 'defaultSingleAsk')
      .mockResolvedValueOnce('0.0.12345');
    jest
      .spyOn(
        RoleStableCoinService.prototype as any,
        'checkCashInRoleStableCoin',
      )
      .mockResolvedValueOnce(false);
    jest
      .spyOn(
        RoleStableCoinService.prototype as any,
        'checkCashInRoleStableCoin',
      )
      .mockResolvedValueOnce(true);
    jest.spyOn(utilsService, 'defaultSingleAsk').mockResolvedValueOnce('1');
    jest
      .spyOn(
        RoleStableCoinService.prototype as any,
        'decreaseLimitSupplierRoleStableCoin',
      )
      .mockImplementation();
    jest
      .spyOn(RoleStableCoinService.prototype as any, 'getSupplierAllowance')
      .mockImplementation();
    jest
      .spyOn(utilsService, 'defaultMultipleAsk')
      .mockResolvedValueOnce('Go back')
      .mockResolvedValueOnce('Go back');

    const keepFlow = (OperationStableCoinService.prototype as any)
      .roleManagementFlow;
    jest
      .spyOn(OperationStableCoinService.prototype as any, 'roleManagementFlow')
      .mockImplementationOnce(keepFlow)
      .mockImplementation(jest.fn());
    await service.start();

    expect(service).not.toBeNull();
    expect(utilsService.cleanAndShowBanner).toHaveBeenCalled();
  });

  it('Should instance start with roles edit Reset', async () => {
    jest
      .spyOn(utilsService, 'defaultMultipleAsk')
      .mockResolvedValueOnce(
        language.getText('wizard.stableCoinOptions.RoleMgmt'),
      );
    jest
      .spyOn(utilsService, 'defaultMultipleAsk')
      .mockResolvedValueOnce(
        language.getText('wizard.roleManagementOptions.Edit'),
      );
    jest
      .spyOn(utilsService, 'defaultMultipleAsk')
      .mockResolvedValueOnce(
        language.getText('roleManagement.editAction.Reset'),
      );
    jest
      .spyOn(utilsService, 'defaultSingleAsk')
      .mockResolvedValueOnce('0.0.12345');
    jest
      .spyOn(
        RoleStableCoinService.prototype as any,
        'checkCashInRoleStableCoin',
      )
      .mockResolvedValueOnce(false);
    jest
      .spyOn(
        RoleStableCoinService.prototype as any,
        'checkCashInRoleStableCoin',
      )
      .mockResolvedValueOnce(false);
    jest
      .spyOn(
        RoleStableCoinService.prototype as any,
        'resetLimitSupplierRoleStableCoin',
      )
      .mockImplementation();
    jest
      .spyOn(utilsService, 'defaultMultipleAsk')
      .mockResolvedValueOnce('Go back')
      .mockResolvedValueOnce('Go back');

    const keepFlow = (OperationStableCoinService.prototype as any)
      .roleManagementFlow;
    jest
      .spyOn(OperationStableCoinService.prototype as any, 'roleManagementFlow')
      .mockImplementationOnce(keepFlow)
      .mockImplementation(jest.fn());
    await service.start();

    expect(service).not.toBeNull();
    expect(utilsService.cleanAndShowBanner).toHaveBeenCalled();
  });

  it('Should instance start with roles edit check', async () => {
    jest
      .spyOn(utilsService, 'defaultMultipleAsk')
      .mockResolvedValueOnce(
        language.getText('wizard.stableCoinOptions.RoleMgmt'),
      );
    jest
      .spyOn(utilsService, 'defaultMultipleAsk')
      .mockResolvedValueOnce(
        language.getText('wizard.roleManagementOptions.Edit'),
      );
    jest
      .spyOn(utilsService, 'defaultMultipleAsk')
      .mockResolvedValueOnce(
        language.getText('roleManagement.editAction.Check'),
      );
    jest
      .spyOn(OperationStableCoinService.prototype as any, 'validateTokenId')
      .mockImplementation(jest.fn());
    jest
      .spyOn(utilsService, 'defaultSingleAsk')
      .mockResolvedValueOnce('0.0.12345');
    jest
      .spyOn(
        RoleStableCoinService.prototype as any,
        'checkCashInRoleStableCoin',
      )
      .mockResolvedValueOnce(true);
    jest
      .spyOn(RoleStableCoinService.prototype as any, 'getSupplierAllowance')
      .mockImplementation();
    jest
      .spyOn(utilsService, 'defaultMultipleAsk')
      .mockResolvedValueOnce('Go back')
      .mockResolvedValueOnce('Go back');

    const keepFlow = (OperationStableCoinService.prototype as any)
      .roleManagementFlow;
    jest
      .spyOn(OperationStableCoinService.prototype as any, 'roleManagementFlow')
      .mockImplementationOnce(keepFlow)
      .mockImplementation(jest.fn());
    await service.start();

    expect(service).not.toBeNull();
    expect(utilsService.cleanAndShowBanner).toHaveBeenCalled();
  });

  it('Should instance start with roles edit go back', async () => {
    jest
      .spyOn(utilsService, 'defaultMultipleAsk')
      .mockResolvedValueOnce(
        language.getText('wizard.stableCoinOptions.RoleMgmt'),
      );
    jest
      .spyOn(utilsService, 'defaultMultipleAsk')
      .mockResolvedValueOnce(
        language.getText('wizard.roleManagementOptions.Edit'),
      );
    jest
      .spyOn(utilsService, 'defaultMultipleAsk')
      .mockResolvedValueOnce('Go back');
    jest
      .spyOn(utilsService, 'defaultMultipleAsk')
      .mockResolvedValueOnce('Go back')
      .mockResolvedValueOnce('Go back');

    const keepFlow = (OperationStableCoinService.prototype as any)
      .roleManagementFlow;
    jest
      .spyOn(OperationStableCoinService.prototype as any, 'roleManagementFlow')
      .mockImplementationOnce(keepFlow)
      .mockImplementation(jest.fn());
    await service.start();

    expect(service).not.toBeNull();
    expect(utilsService.cleanAndShowBanner).toHaveBeenCalled();
  });

  it('Should instance start with roles get', async () => {
    jest
      .spyOn(utilsService, 'defaultMultipleAsk')
      .mockResolvedValueOnce(
        language.getText('wizard.stableCoinOptions.RoleMgmt'),
      );
    jest
      .spyOn(utilsService, 'defaultMultipleAsk')
      .mockResolvedValueOnce(
        language.getText('wizard.roleManagementOptions.GetRole'),
      );
    jest
      .spyOn(utilsService, 'defaultSingleAsk')
      .mockResolvedValueOnce('0.0.12345');
    jest
      .spyOn(RoleStableCoinService.prototype as any, 'getRoles')
      .mockImplementation();
    jest
      .spyOn(utilsService, 'defaultMultipleAsk')
      .mockResolvedValueOnce('Go back')
      .mockResolvedValueOnce('Go back');

    const keepFlow = (OperationStableCoinService.prototype as any)
      .roleManagementFlow;
    jest
      .spyOn(OperationStableCoinService.prototype as any, 'roleManagementFlow')
      .mockImplementationOnce(keepFlow)
      .mockImplementation(jest.fn());
    await service.start();

    expect(service).not.toBeNull();
    expect(utilsService.cleanAndShowBanner).toHaveBeenCalled();
  });

  it('Should instance start with Configuration proxy implementation', async () => {
    jest
      .spyOn(utilsService, 'defaultMultipleAsk')
      .mockResolvedValueOnce(
        language.getText('wizard.stableCoinOptions.Configuration'),
      );
    jest
      .spyOn(utilsService, 'defaultMultipleAsk')
      .mockResolvedValueOnce(
        language.getText('stableCoinConfiguration.options.proxyConfiguration'),
      );
    jest
      .spyOn(utilsService, 'defaultMultipleAsk')
      .mockResolvedValueOnce(
        language.getText('proxyConfiguration.options.implementation'),
      );
    jest
      .spyOn(
        ImplementationProxyService.prototype as any,
        'upgradeImplementationOwner',
      )
      .mockImplementation();
    jest
      .spyOn(utilsService, 'defaultMultipleAsk')
      .mockResolvedValueOnce('Go back');

    await service.start();

    expect(service).not.toBeNull();
    expect(utilsService.cleanAndShowBanner).toHaveBeenCalled();
  });

  it('Should instance start with Configuration proxy owner', async () => {
    jest
      .spyOn(utilsService, 'defaultMultipleAsk')
      .mockResolvedValueOnce(
        language.getText('wizard.stableCoinOptions.Configuration'),
      );
    jest
      .spyOn(utilsService, 'defaultMultipleAsk')
      .mockResolvedValueOnce(
        language.getText('stableCoinConfiguration.options.proxyConfiguration'),
      );
    jest
      .spyOn(utilsService, 'defaultMultipleAsk')
      .mockResolvedValueOnce(
        language.getText('proxyConfiguration.options.owner'),
      );
    jest
      .spyOn(utilsService, 'defaultSingleAsk')
      .mockResolvedValueOnce('0.0.12345');
    jest
      .spyOn(OwnerProxyService.prototype as any, 'changeProxyOwner')
      .mockImplementation();
    jest
      .spyOn(utilsService, 'defaultMultipleAsk')
      .mockResolvedValueOnce('Go back');

    await service.start();

    expect(service).not.toBeNull();
    expect(utilsService.cleanAndShowBanner).toHaveBeenCalled();
  });

  it('Should instance start with Configuration proxy go back', async () => {
    jest
      .spyOn(utilsService, 'defaultMultipleAsk')
      .mockResolvedValueOnce(
        language.getText('wizard.stableCoinOptions.Configuration'),
      );
    jest
      .spyOn(utilsService, 'defaultMultipleAsk')
      .mockResolvedValueOnce(
        language.getText('stableCoinConfiguration.options.proxyConfiguration'),
      );
    jest
      .spyOn(utilsService, 'defaultMultipleAsk')
      .mockResolvedValueOnce('Go back')
      .mockResolvedValueOnce('Go back');

    const keepFlow = (OperationStableCoinService.prototype as any)
      .configuration;
    jest
      .spyOn(OperationStableCoinService.prototype as any, 'configuration')
      .mockImplementationOnce(keepFlow)
      .mockImplementation(jest.fn());
    await service.start();

    expect(service).not.toBeNull();
    expect(utilsService.cleanAndShowBanner).toHaveBeenCalled();
  });

  it('Should instance start with Configuration token', async () => {
    jest
      .spyOn(utilsService, 'defaultMultipleAsk')
      .mockResolvedValueOnce(
        language.getText('wizard.stableCoinOptions.Configuration'),
      );
    jest
      .spyOn(utilsService, 'defaultMultipleAsk')
      .mockResolvedValueOnce(
        language.getText('stableCoinConfiguration.options.tokenConfiguration'),
      );
    jest
      .spyOn(DetailsStableCoinService.prototype as any, 'getDetailsStableCoins')
      .mockResolvedValue({} as StableCoinViewModel);
    jest
      .spyOn(utilsService, 'defaultMultipleAsk')
      .mockResolvedValueOnce(
        language.getText('tokenConfiguration.options.name'),
      );
    jest.spyOn(utilsService, 'defaultSingleAsk').mockResolvedValueOnce('name');
    jest
      .spyOn(utilsService, 'defaultMultipleAsk')
      .mockResolvedValueOnce(
        language.getText('tokenConfiguration.options.symbol'),
      );
    jest
      .spyOn(utilsService, 'defaultSingleAsk')
      .mockResolvedValueOnce('symbol');
    jest
      .spyOn(utilsService, 'defaultMultipleAsk')
      .mockResolvedValueOnce(
        language.getText('tokenConfiguration.options.expirationTime'),
      );
    jest.spyOn(utilsService, 'defaultSingleAsk').mockResolvedValueOnce('90');
    jest
      .spyOn(utilsService, 'defaultMultipleAsk')
      .mockResolvedValueOnce(
        language.getText('tokenConfiguration.options.autoRenewPeriod'),
      );
    jest.spyOn(utilsService, 'defaultSingleAsk').mockResolvedValueOnce('90');
    jest
      .spyOn(utilsService, 'defaultMultipleAsk')
      .mockResolvedValueOnce(
        language.getText('tokenConfiguration.options.keys'),
      );
    jest
      .spyOn(Account, 'getPublicKey')
      .mockResolvedValue(new PublicKey('0.0.12345'));
    jest
      .spyOn(utilsService, 'defaultPublicKeyAsk')
      .mockResolvedValue({ key: '0.0.0123456' });
    jest
      .spyOn(utilsService, 'defaultMultipleAsk')
      .mockResolvedValueOnce('kycKey');
    jest
      .spyOn(utilsService, 'defaultMultipleAsk')
      .mockResolvedValueOnce(
        language.getText('wizard.featureOptions.CurrentUser'),
      );
    jest
      .spyOn(utilsService, 'defaultMultipleAsk')
      .mockResolvedValueOnce('freezeKey');
    jest
      .spyOn(utilsService, 'defaultMultipleAsk')
      .mockResolvedValueOnce(
        language.getText('wizard.featureOptions.OtherKey'),
      );
    jest
      .spyOn(utilsService, 'defaultMultipleAsk')
      .mockResolvedValueOnce('wipeKey');
    jest
      .spyOn(utilsService, 'defaultMultipleAsk')
      .mockResolvedValueOnce(language.getText('wizard.featureOptions.None'));
    jest
      .spyOn(utilsService, 'defaultMultipleAsk')
      .mockResolvedValueOnce('pauseKey');
    jest
      .spyOn(utilsService, 'defaultMultipleAsk')
      .mockResolvedValueOnce(
        language.getText('wizard.featureOptions.SmartContract'),
      );
    jest
      .spyOn(utilsService, 'defaultMultipleAsk')
      .mockResolvedValueOnce('feeScheduleKey');
    jest
      .spyOn(utilsService, 'defaultMultipleAsk')
      .mockResolvedValueOnce(
        language.getText('wizard.featureOptions.CurrentUser'),
      );
    jest
      .spyOn(utilsService, 'defaultMultipleAsk')
      .mockResolvedValueOnce('go back');
    jest
      .spyOn(utilsService, 'defaultMultipleAsk')
      .mockResolvedValueOnce(
        language.getText('tokenConfiguration.options.metadata'),
      );
    jest
      .spyOn(utilsService, 'defaultSingleAsk')
      .mockResolvedValueOnce('metadata');
    jest
      .spyOn(utilsService, 'defaultMultipleAsk')
      .mockResolvedValueOnce(
        language.getText('tokenConfiguration.options.save'),
      );
    jest.spyOn(utilsService, 'defaultConfirmAsk').mockResolvedValueOnce(true);
    jest
      .spyOn(UpdateStableCoinService.prototype as any, 'update')
      .mockImplementation();
    jest
      .spyOn(utilsService, 'defaultMultipleAsk')
      .mockResolvedValueOnce('Go back');
    jest.spyOn(utilsService, 'defaultConfirmAsk').mockResolvedValueOnce(true);

    const keepFlowData = (OperationStableCoinService.prototype as any)
      .tokenConfigurationCollectData;
    jest
      .spyOn(
        OperationStableCoinService.prototype as any,
        'tokenConfigurationCollectData',
      )
      .mockImplementationOnce(keepFlowData)
      .mockImplementationOnce(keepFlowData)
      .mockImplementationOnce(keepFlowData)
      .mockImplementationOnce(keepFlowData)
      .mockImplementationOnce(keepFlowData)
      .mockImplementationOnce(keepFlowData)
      .mockImplementationOnce(keepFlowData)
      .mockImplementationOnce(keepFlowData)
      .mockImplementationOnce(keepFlowData)
      .mockImplementation(jest.fn());

    const keepFlowKeys = (OperationStableCoinService.prototype as any)
      .keysManagement;
    jest
      .spyOn(OperationStableCoinService.prototype as any, 'keysManagement')
      .mockImplementationOnce(keepFlowKeys)
      .mockImplementationOnce(keepFlowKeys)
      .mockImplementationOnce(keepFlowKeys)
      .mockImplementationOnce(keepFlowKeys)
      .mockImplementationOnce(keepFlowKeys)
      .mockImplementation(jest.fn());
    const keepFlow = (OperationStableCoinService.prototype as any)
      .configuration;
    jest
      .spyOn(OperationStableCoinService.prototype as any, 'configuration')
      .mockImplementationOnce(keepFlow)
      .mockImplementation(jest.fn());

    await service.start();

    expect(service).not.toBeNull();
    expect(utilsService.cleanAndShowBanner).toHaveBeenCalled();
  });
  it('Should instance start with Configuration go back', async () => {
    jest
      .spyOn(utilsService, 'defaultMultipleAsk')
      .mockResolvedValueOnce(
        language.getText('wizard.stableCoinOptions.Configuration'),
      );
    jest
      .spyOn(utilsService, 'defaultMultipleAsk')
      .mockResolvedValueOnce('Go back')
      .mockResolvedValueOnce('Go back');

    await service.start();

    expect(service).not.toBeNull();
    expect(utilsService.cleanAndShowBanner).toHaveBeenCalled();
  });

  it('Should instance start with DangerZone Pause', async () => {
    jest
      .spyOn(utilsService, 'defaultMultipleAsk')
      .mockResolvedValueOnce(
        language.getText('wizard.stableCoinOptions.DangerZone'),
      );
    jest
      .spyOn(utilsService, 'defaultMultipleAsk')
      .mockResolvedValueOnce(language.getText('dangerZone.options.Pause'));
    jest.spyOn(utilsService, 'defaultConfirmAsk').mockResolvedValueOnce(true);
    jest
      .spyOn(PauseStableCoinService.prototype as any, 'pauseStableCoin')
      .mockImplementation();
    jest
      .spyOn(utilsService, 'defaultMultipleAsk')
      .mockResolvedValueOnce('Go back');

    const keepFlow = (OperationStableCoinService.prototype as any).dangerZone;
    jest
      .spyOn(OperationStableCoinService.prototype as any, 'dangerZone')
      .mockImplementationOnce(keepFlow)
      .mockImplementation(jest.fn());
    await service.start();

    expect(service).not.toBeNull();
    expect(utilsService.cleanAndShowBanner).toHaveBeenCalled();
  });

  it('Should instance start with DangerZone unpause', async () => {
    jest
      .spyOn(utilsService, 'defaultMultipleAsk')
      .mockResolvedValueOnce(
        language.getText('wizard.stableCoinOptions.DangerZone'),
      );
    jest
      .spyOn(utilsService, 'defaultMultipleAsk')
      .mockResolvedValueOnce(language.getText('dangerZone.options.UnPause'));
    jest.spyOn(utilsService, 'defaultConfirmAsk').mockResolvedValueOnce(true);
    jest
      .spyOn(PauseStableCoinService.prototype as any, 'unpauseStableCoin')
      .mockImplementation();
    jest
      .spyOn(utilsService, 'defaultMultipleAsk')
      .mockResolvedValueOnce('Go back');

    const keepFlow = (OperationStableCoinService.prototype as any).dangerZone;
    jest
      .spyOn(OperationStableCoinService.prototype as any, 'dangerZone')
      .mockImplementationOnce(keepFlow)
      .mockImplementation(jest.fn());
    await service.start();

    expect(service).not.toBeNull();
    expect(utilsService.cleanAndShowBanner).toHaveBeenCalled();
  });

  it('Should instance start with DangerZone Delete', async () => {
    jest
      .spyOn(utilsService, 'defaultMultipleAsk')
      .mockResolvedValueOnce(
        language.getText('wizard.stableCoinOptions.DangerZone'),
      );
    jest
      .spyOn(utilsService, 'defaultMultipleAsk')
      .mockResolvedValueOnce(language.getText('dangerZone.options.Delete'));
    jest.spyOn(utilsService, 'defaultConfirmAsk').mockResolvedValueOnce(true);
    jest
      .spyOn(DeleteStableCoinService.prototype as any, 'deleteStableCoin')
      .mockImplementation();
    jest
      .spyOn(utilsService, 'defaultMultipleAsk')
      .mockResolvedValueOnce('Go back');

    const keepFlow = (OperationStableCoinService.prototype as any).dangerZone;
    jest
      .spyOn(OperationStableCoinService.prototype as any, 'dangerZone')
      .mockImplementationOnce(keepFlow)
      .mockImplementation(jest.fn());
    await service.start();

    expect(service).not.toBeNull();
    expect(utilsService.cleanAndShowBanner).toHaveBeenCalled();
  });

  it('Should instance start with DangerZone go back', async () => {
    jest
      .spyOn(utilsService, 'defaultMultipleAsk')
      .mockResolvedValueOnce(
        language.getText('wizard.stableCoinOptions.DangerZone'),
      );
    jest
      .spyOn(utilsService, 'defaultMultipleAsk')
      .mockResolvedValueOnce('Go back')
      .mockResolvedValueOnce('Go back');

    const keepFlow = (OperationStableCoinService.prototype as any).dangerZone;
    jest
      .spyOn(OperationStableCoinService.prototype as any, 'dangerZone')
      .mockImplementationOnce(keepFlow)
      .mockImplementation(jest.fn());
    await service.start();

    expect(service).not.toBeNull();
    expect(utilsService.cleanAndShowBanner).toHaveBeenCalled();
  });

  it('Should instance start with go back', async () => {
    jest
      .spyOn(utilsService, 'defaultMultipleAsk')
      .mockResolvedValueOnce('Go back')
      .mockResolvedValueOnce('Go back');

    await service.start();

    expect(service).not.toBeNull();
    expect(utilsService.cleanAndShowBanner).toHaveBeenCalled();
  });

  it('Should instance start with stableCoinId undefined', async () => {
    const coins = [
      {
        symbol: 'TEST',
        id: '0.0.12345',
      },
    ];
    jest
      .spyOn(ListStableCoinService.prototype, 'listStableCoins')
      .mockResolvedValue({ coins });
    jest
      .spyOn(utilsService, 'defaultMultipleAsk')
      .mockResolvedValueOnce(`${coins[0].id} - ${coins[0].symbol}`);
    DetailsStableCoinService.prototype.getDetailsStableCoins = jest
      .fn()
      .mockImplementation();
    jest
      .spyOn(utilsService, 'defaultMultipleAsk')
      .mockResolvedValueOnce('Go back');

    const service = new OperationStableCoinService(undefined, 'memo', 'symbol');
    await service.start();

    expect(service).not.toBeNull();
    expect(utilsService.cleanAndShowBanner).toHaveBeenCalled();
  });
});
