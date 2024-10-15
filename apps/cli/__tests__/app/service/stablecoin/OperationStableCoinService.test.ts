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
import OperationStableCoinService from '../../../../src/app/service/stablecoin/OperationStableCoinService.js';
import CapabilitiesStableCoinsService from '../../../../src/app/service/stablecoin/CapabilitiesStableCoinService.js';
import {
  Account,
  AddFixedFeeRequest,
  AddFractionalFeeRequest,
  BurnRequest,
  CashInRequest,
  DeleteRequest,
  FreezeAccountRequest,
  GetAccountBalanceRequest,
  GetAccountsWithRolesRequest,
  GrantMultiRolesRequest,
  HederaId,
  KYCRequest,
  Operation,
  PauseRequest,
  PublicKey,
  RequestCustomFee,
  RescueRequest,
  StableCoinRole,
  StableCoinViewModel,
  UpdateCustomFeesRequest,
  WipeRequest,
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
import { AccountType } from '../../../../src/domain/configuration/interfaces/AccountType.js';

const tokenId = '0.0.5555555';
const tokenMemo = 'memo';
const tokenSymbol = 'symbol';
const service = new OperationStableCoinService(tokenId, tokenMemo, tokenSymbol);
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
  tokenId: new HederaId('0.0.5555555'),
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
    jest.spyOn(utilsService, 'showMessage').mockImplementation();
    jest.spyOn(console, 'log').mockImplementation();
    jest.spyOn(console, 'info').mockImplementation();
    jest.spyOn(console, 'warn').mockImplementation();
    jest.spyOn(console, 'error').mockImplementation();
    jest.spyOn(console, 'dir').mockImplementation();
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
    const account = '0.0.12345';
    const amount = '1';
    jest
      .spyOn(utilsService, 'defaultMultipleAsk')
      .mockResolvedValueOnce(
        language.getText('wizard.stableCoinOptions.CashIn'),
      );
    jest
      .spyOn(utilsService, 'defaultSingleAsk')
      .mockResolvedValueOnce(account)
      .mockResolvedValueOnce(amount);
    jest
      .spyOn(utilsService, 'defaultConfirmAsk')
      .mockResolvedValueOnce(false)
      .mockResolvedValueOnce(true);
    CashInStableCoinService.prototype.cashInStableCoin = jest
      .fn()
      .mockImplementation(async (request: CashInRequest): Promise<void> => {
        expect(request.targetId).toEqual(account);
        expect(request.tokenId).toEqual(tokenId);
        expect(request.amount).toEqual(amount);
      });
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
    const account = '0.0.7654321';
    jest
      .spyOn(utilsService, 'defaultMultipleAsk')
      .mockResolvedValueOnce(
        language.getText('wizard.stableCoinOptions.Balance'),
      );
    jest.spyOn(utilsService, 'defaultSingleAsk').mockResolvedValueOnce(account);
    BalanceOfStableCoinsService.prototype.getBalanceOfStableCoin = jest
      .fn()
      .mockImplementation(
        async (request: GetAccountBalanceRequest): Promise<void> => {
          expect(request.targetId).toEqual(account);
          expect(request.tokenId).toEqual(tokenId);
        },
      );
    jest
      .spyOn(utilsService, 'defaultMultipleAsk')
      .mockResolvedValueOnce('Go back');

    await service.start();

    expect(service).not.toBeNull();
    expect(utilsService.cleanAndShowBanner).toHaveBeenCalled();
  });

  it('Should instance start with Burn', async () => {
    const amount = '10';
    jest
      .spyOn(utilsService, 'defaultMultipleAsk')
      .mockResolvedValueOnce(language.getText('wizard.stableCoinOptions.Burn'));
    jest.spyOn(utilsService, 'defaultSingleAsk').mockResolvedValueOnce(amount);
    BurnStableCoinsService.prototype.burnStableCoin = jest
      .fn()
      .mockImplementation(async (request: BurnRequest): Promise<void> => {
        expect(request.amount).toEqual(amount);
        expect(request.tokenId).toEqual(tokenId);
      });
    jest
      .spyOn(utilsService, 'defaultMultipleAsk')
      .mockResolvedValueOnce('Go back');

    await service.start();

    expect(service).not.toBeNull();
    expect(utilsService.cleanAndShowBanner).toHaveBeenCalled();
  });

  it('Should instance start with Wipe', async () => {
    const account = '0.0.1111111';
    const amount = '52';
    jest
      .spyOn(utilsService, 'defaultMultipleAsk')
      .mockResolvedValueOnce(language.getText('wizard.stableCoinOptions.Wipe'));
    jest
      .spyOn(utilsService, 'defaultSingleAsk')
      .mockResolvedValueOnce(account)
      .mockResolvedValueOnce(amount);
    WipeStableCoinService.prototype.wipeStableCoin = jest
      .fn()
      .mockImplementation(async (request: WipeRequest): Promise<void> => {
        expect(request.targetId).toEqual(account);
        expect(request.tokenId).toEqual(tokenId);
        expect(request.amount).toEqual(amount);
      });
    jest
      .spyOn(utilsService, 'defaultMultipleAsk')
      .mockResolvedValueOnce('Go back');

    await service.start();

    expect(service).not.toBeNull();
    expect(utilsService.cleanAndShowBanner).toHaveBeenCalled();
  });

  it('Should instance start with Rescue', async () => {
    const amount = '3.5';
    jest
      .spyOn(utilsService, 'defaultMultipleAsk')
      .mockResolvedValueOnce(
        language.getText('wizard.stableCoinOptions.Rescue'),
      );
    jest.spyOn(utilsService, 'defaultSingleAsk').mockResolvedValueOnce(amount);
    RescueStableCoinService.prototype.rescueStableCoin = jest
      .fn()
      .mockImplementation(async (request: RescueRequest): Promise<void> => {
        expect(request.tokenId).toEqual(tokenId);
        expect(request.amount).toEqual(amount);
      });
    jest
      .spyOn(utilsService, 'defaultMultipleAsk')
      .mockResolvedValueOnce('Go back');

    await service.start();

    expect(service).not.toBeNull();
    expect(utilsService.cleanAndShowBanner).toHaveBeenCalled();
  });

  it('Should instance start with RescueHBAR', async () => {
    const amount = '35';

    jest
      .spyOn(utilsService, 'defaultMultipleAsk')
      .mockResolvedValueOnce(
        language.getText('wizard.stableCoinOptions.RescueHBAR'),
      );
    jest.spyOn(utilsService, 'defaultSingleAsk').mockResolvedValueOnce(amount);
    RescueHBARStableCoinService.prototype.rescueHBARStableCoin = jest
      .fn()
      .mockImplementation(async (request: RescueRequest): Promise<void> => {
        expect(request.tokenId).toEqual(tokenId);
        expect(request.amount).toEqual(amount);
      });
    jest
      .spyOn(utilsService, 'defaultMultipleAsk')
      .mockResolvedValueOnce('Go back');

    await service.start();

    expect(service).not.toBeNull();
    expect(utilsService.cleanAndShowBanner).toHaveBeenCalled();
  });

  it('Should instance start with Freeze', async () => {
    const account = '0.0.54321';
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
    jest.spyOn(utilsService, 'defaultSingleAsk').mockResolvedValueOnce(account);
    FreezeStableCoinService.prototype.freezeAccount = jest
      .fn()
      .mockImplementation(
        async (request: FreezeAccountRequest): Promise<void> => {
          expect(request.tokenId).toEqual(tokenId);
          expect(request.targetId).toEqual(account);
        },
      );
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
    const account = '0.0.54321';

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
    jest.spyOn(utilsService, 'defaultSingleAsk').mockResolvedValueOnce(account);
    FreezeStableCoinService.prototype.unfreezeAccount = jest
      .fn()
      .mockImplementation(
        async (request: FreezeAccountRequest): Promise<void> => {
          expect(request.tokenId).toEqual(tokenId);
          expect(request.targetId).toEqual(account);
        },
      );
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
    const account = '0.0.54321';

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
    jest.spyOn(utilsService, 'defaultSingleAsk').mockResolvedValueOnce(account);
    FreezeStableCoinService.prototype.isAccountFrozenDisplay = jest
      .fn()
      .mockImplementation(
        async (request: FreezeAccountRequest): Promise<void> => {
          expect(request.tokenId).toEqual(tokenId);
          expect(request.targetId).toEqual(account);
        },
      );
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
    const account = '0.0.54321';

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
    jest.spyOn(utilsService, 'defaultSingleAsk').mockResolvedValueOnce(account);
    KYCStableCoinService.prototype.grantKYCToAccount = jest
      .fn()
      .mockImplementation(async (request: KYCRequest): Promise<void> => {
        expect(request.tokenId).toEqual(tokenId);
        expect(request.targetId).toEqual(account);
      });
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
    const account = '0.0.54321';

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
    jest.spyOn(utilsService, 'defaultSingleAsk').mockResolvedValueOnce(account);
    KYCStableCoinService.prototype.revokeKYCFromAccount = jest
      .fn()
      .mockImplementation(async (request: KYCRequest): Promise<void> => {
        expect(request.tokenId).toEqual(tokenId);
        expect(request.targetId).toEqual(account);
      });
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
    const account = '0.0.54321';

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
    jest.spyOn(utilsService, 'defaultSingleAsk').mockResolvedValueOnce(account);
    KYCStableCoinService.prototype.isAccountKYCGranted = jest
      .fn()
      .mockImplementation(async (request: KYCRequest): Promise<void> => {
        expect(request.tokenId).toEqual(tokenId);
        expect(request.targetId).toEqual(account);
      });
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
    const tokenIdCollected = '0.0.7654321';
    const collectorAccount = '0.0.1234567';
    const decimals = 3;
    const collectorsExempt = false;
    const amount = '11';

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
      .mockResolvedValueOnce(tokenIdCollected);
    DetailsStableCoinService.prototype.getDetailsStableCoins = jest
      .fn()
      .mockResolvedValue({ decimals: decimals });
    jest.spyOn(utilsService, 'defaultSingleAsk').mockResolvedValueOnce(amount);
    jest
      .spyOn(utilsService, 'defaultConfirmAsk')
      .mockResolvedValueOnce(collectorsExempt)
      .mockResolvedValueOnce(true);
    jest
      .spyOn(utilsService, 'defaultSingleAsk')
      .mockResolvedValueOnce(collectorAccount);

    FeeStableCoinService.prototype.addFixedFee = jest
      .fn()
      .mockImplementation(
        async (request: AddFixedFeeRequest): Promise<void> => {
          expect(request.tokenId).toEqual(tokenId);
          expect(request.collectorId).toEqual(collectorAccount);
          expect(request.collectorsExempt).toEqual(collectorsExempt);
          expect(request.decimals).toEqual(decimals);
          expect(request.tokenIdCollected).toEqual(tokenIdCollected);
          expect(request.amount).toEqual(amount);
        },
      );
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
    const collectorAccount = '0.0.1234567';
    const decimals = 3;
    const collectorsExempt = false;
    const net = false;
    const percentage = '1';
    const min = '2';
    const max = '3';

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
      .mockResolvedValue({ decimals: decimals });
    jest
      .spyOn(utilsService, 'defaultSingleAsk')
      .mockResolvedValueOnce(percentage);
    jest
      .spyOn(utilsService, 'defaultSingleAsk')
      .mockResolvedValueOnce(min)
      .mockResolvedValueOnce(max);
    jest
      .spyOn(utilsService, 'defaultConfirmAsk')
      .mockResolvedValueOnce(net)
      .mockResolvedValueOnce(collectorsExempt);
    jest
      .spyOn(utilsService, 'defaultSingleAsk')
      .mockResolvedValueOnce(collectorAccount);
    jest.spyOn(utilsService, 'defaultConfirmAsk').mockResolvedValueOnce(true);
    FeeStableCoinService.prototype.addFractionalFee = jest
      .fn()
      .mockImplementation(
        async (request: AddFractionalFeeRequest): Promise<void> => {
          expect(request.tokenId).toEqual(tokenId);
          expect(request.collectorId).toEqual(collectorAccount);
          expect(request.collectorsExempt).toEqual(collectorsExempt);
          expect(request.decimals).toEqual(decimals);
          expect(request.min).toEqual(min);
          expect(request.max).toEqual(max);
          expect(request.net).toEqual(net);
        },
      );
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
    const collectorAccount = '0.0.1234567';
    const decimals = 3;
    const collectorsExempt = true;
    const net = false;
    const numerator = '1';
    const denominator = '2';
    const min = '3';
    const max = '4';

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
      .mockResolvedValue({ decimals: decimals });
    jest
      .spyOn(utilsService, 'defaultSingleAsk')
      .mockResolvedValueOnce(numerator)
      .mockResolvedValueOnce(denominator);
    jest
      .spyOn(utilsService, 'defaultSingleAsk')
      .mockResolvedValueOnce(min)
      .mockResolvedValueOnce(max);
    jest
      .spyOn(utilsService, 'defaultConfirmAsk')
      .mockResolvedValueOnce(net)
      .mockResolvedValueOnce(collectorsExempt);
    jest
      .spyOn(utilsService, 'defaultSingleAsk')
      .mockResolvedValueOnce(collectorAccount);
    jest.spyOn(utilsService, 'defaultConfirmAsk').mockResolvedValueOnce(true);
    FeeStableCoinService.prototype.addFractionalFee = jest
      .fn()
      .mockImplementation(
        async (request: AddFractionalFeeRequest): Promise<void> => {
          expect(request.tokenId).toEqual(tokenId);
          expect(request.collectorId).toEqual(collectorAccount);
          expect(request.collectorsExempt).toEqual(collectorsExempt);
          expect(request.decimals).toEqual(decimals);
          expect(request.amountNumerator).toEqual(numerator);
          expect(request.amountDenominator).toEqual(denominator);
          expect(request.min).toEqual(min);
          expect(request.max).toEqual(max);
          expect(request.net).toEqual(net);
        },
      );
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
    FeeStableCoinService.prototype.updateFees = jest
      .fn()
      .mockImplementation(
        async (request: UpdateCustomFeesRequest): Promise<void> => {
          expect(request.tokenId).toEqual(tokenId);
          expect(request.customFees).toBeUndefined();
        },
      );
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
    const customFees = [
      {
        collectorId: 'collectorId',
        collectorsExempt: true,
        decimals: 6,
      },
    ];
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
      .mockImplementation(
        async (listOfFees: RequestCustomFee[]): Promise<void> => {
          expect(listOfFees.length).toEqual(customFees.length);
          for (let i = 0; i < customFees.length; i++) {
            expect(listOfFees[i].collectorId).toEqual(
              customFees[i].collectorId,
            );
            expect(listOfFees[i].collectorsExempt).toEqual(
              customFees[i].collectorsExempt,
            );
            expect(listOfFees[i].decimals).toEqual(customFees[i].decimals);
          }
        },
      );
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
      .mockResolvedValueOnce('Go back');
    RoleStableCoinService.prototype.getAccountsWithRole = jest
      .fn()
      .mockImplementation(
        async (request: GetAccountsWithRolesRequest): Promise<void> => {
          expect(request.tokenId).toEqual(tokenId);
          expect(request.roleId).toEqual(
            '0x0000000000000000000000000000000000000000000000000000000000000000',
          );
        },
      );
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

  it('Should instance start with roles grant', async () => {
    const targetsId = ['0.0.1234567'];
    const roles = ['Admin Role'];
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
    jest.spyOn(utilsService, 'checkBoxMultipleAsk').mockResolvedValue(roles);
    jest
      .spyOn(utilsService, 'defaultSingleAsk')
      .mockResolvedValueOnce(targetsId[0]);
    jest.spyOn(utilsService, 'defaultConfirmAsk').mockResolvedValueOnce(false);
    jest.spyOn(utilsService, 'defaultConfirmAsk').mockResolvedValueOnce(true);
    RoleStableCoinService.prototype.grantMultiRolesStableCoin = jest
      .fn()
      .mockImplementation(
        async (request: GrantMultiRolesRequest): Promise<void> => {
          expect(request.tokenId).toEqual(tokenId);
          expect(request.roles.length).toEqual(roles.length);
          expect(request.targetsId.length).toEqual(targetsId.length);
          for (let i = 0; i < targetsId.length; i++) {
            expect(request.targetsId[i]).toEqual(targetsId[i]);
          }
        },
      );
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
    const account = '0.0.9999999';
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
    jest.spyOn(utilsService, 'defaultSingleAsk').mockResolvedValueOnce(account);
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
      .mockImplementation(async (request: PauseRequest): Promise<void> => {
        expect(request.tokenId).toEqual(tokenId);
      });
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
      .mockImplementation(async (request: PauseRequest): Promise<void> => {
        expect(request.tokenId).toEqual(tokenId);
      });
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
      .mockImplementation(async (request: DeleteRequest): Promise<void> => {
        expect(request.tokenId).toEqual(tokenId);
      });
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
