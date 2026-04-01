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

import {
  ConnectRequest,
  InitializationData,
  InitializationRequest,
  Network,
  SupportedWallets,
} from '@hashgraph/stablecoin-npm-sdk';
import {
  utilsService,
  configurationService,
  setMirrorNodeService,
  setRPCService,
} from '../../../../src/index.js';
import { AccountType } from '../../../../src/domain/configuration/interfaces/AccountType';
import { MIRROR_NODE, RPC } from '../../../../src/core/Constants.js';

const checkBox_question = 'What do you want to do?';
const options = ['option_1', 'option_2', 'option_3'];
const loop = false;
const atLeastOne = false;
const selectedOptions = ['option_1', 'option_3'];

const confirm_question = 'Do you confirm?';
const selectedConfirmation = true;

const error_question = 'Error Message Question';
const errorConfirmation = true;

const confirm_continue_question = 'Do you accept?';
const selectedContinueConfirmation = false;

const password_question = 'Enter your password?';
const selectedPassword = 'password';

jest.mock('inquirer', () => {
  const actual = jest.requireActual('inquirer');

  return {
    ...actual,
    prompt: jest.fn().mockImplementation(async (input: any): Promise<any> => {
      switch (input.message) {
        case checkBox_question:
          // eslint-disable-next-line jest/no-standalone-expect
          expect(input.choices.length).toEqual(options.length);
          // eslint-disable-next-line jest/no-standalone-expect
          expect(input.loop).toEqual(loop);

          for (let i = 0; i < options.length; i++) {
            // eslint-disable-next-line jest/no-standalone-expect
            expect(input.choices[i]).toEqual(options[i]);
          }

          return {
            response: selectedOptions,
          };

        case confirm_question:
          // eslint-disable-next-line jest/no-standalone-expect
          expect(input.default()).toEqual(!selectedConfirmation);
          return {
            response: selectedConfirmation,
          };

        case error_question:
          return {
            response: errorConfirmation,
          };

        case confirm_continue_question:
          return {
            response: selectedContinueConfirmation,
          };

        case password_question:
          return {
            response: selectedPassword,
          };

        default:
          throw new Error();
      }
    }),
  };
});

describe('UtilitiesService', () => {
  const network = 'testnet';
  // mocks
  const mockAccount = {
    accountId: 'mockAccountId',
    type: AccountType.SelfCustodial,
    selfCustodial: {
      privateKey: {
        key: 'mockPrivateKey',
        type: 'mockPrivateKeyType',
      },
    },
    network: network,
    alias: 'mockAlias',
  };

  const mockCurrentNetwork = {
    name: network,
    chainId: 1234,
    consensusNodes: [
      {
        url: 'whatever',
        nodeId: '3',
      },
    ],
  };

  const mockCurrentMirror = {
    name: 'MirrorNodeName',
    network: network,
    baseUrl: 'https://testnet.mirrornode.com',
    apiKey: '',
    headerName: '',
    selected: true,
  };
  const mockCurrentRPC = {
    name: 'RPCNodeName',
    network: network,
    baseUrl: 'https://testnet.rpc.com',
    apiKey: '',
    headerName: '',
    selected: true,
  };

  const mockCurrentBackend = {
    endpoint: 'http://localhost:3000/path',
  };

  const mockLogConfiguration = {
    level: 'debug',
  };

  const mockCurrentFactory = {
    id: '0.0.1234567',
    network: network,
  };

  const mockCurrentResolver = {
    id: '0.0.1234567',
    network: network,
  };

  const mockCurrentHederaTokenManager = {
    id: '0.0.7654321',
    network: network,
  };

  configurationService.getLogConfiguration = jest
    .fn()
    .mockReturnValue(mockLogConfiguration);

  configurationService.getConfiguration = jest.fn().mockReturnValue({
    defaultNetwork: 'testnet',
    networks: [mockCurrentNetwork],
    accounts: [mockAccount],
    mirrors: [mockCurrentMirror],
    rpcs: [mockCurrentRPC],
    backend: mockCurrentBackend,
    logs: mockLogConfiguration,
    factories: [mockCurrentFactory],
  });

  const mocks: Record<string, jest.SpyInstance> = {};

  let networkInitSpy: jest.SpyInstance<
    Promise<SupportedWallets[]>,
    [req: InitializationRequest],
    any
  >;
  let networkConnectSpy: jest.SpyInstance<
    Promise<InitializationData>,
    [req: ConnectRequest],
    any
  >;

  beforeAll(() => {
    // Mock all unwanted outputs
    mocks.showSpinner = jest
      .spyOn(utilsService, 'showSpinner')
      .mockImplementation();
    mocks.log = jest.spyOn(console, 'log').mockImplementation();
    mocks.info = jest.spyOn(console, 'info').mockImplementation();
    mocks.error = jest.spyOn(console, 'warn').mockImplementation();
    mocks.error = jest.spyOn(console, 'error').mockImplementation();
    mocks.dir = jest.spyOn(console, 'dir').mockImplementation();
    mocks.cleanAndShowBanner = jest
      .spyOn(utilsService, 'cleanAndShowBanner')
      .mockImplementation();
    mocks.showMessage = jest
      .spyOn(utilsService, 'showMessage')
      .mockImplementation();
  });

  beforeEach(() => {
    networkInitSpy = jest.spyOn(Network, 'init').mockResolvedValue(undefined);
    networkConnectSpy = jest
      .spyOn(Network, 'connect')
      .mockResolvedValue(undefined);
  });

  afterEach(() => {
    // restore mocks
    networkInitSpy.mockRestore();
    networkConnectSpy.mockRestore();
  });

  it('should initialize the SDK and connect to the network', async () => {
    // method call
    await expect(utilsService.initSDK()).rejects.toThrow();
    utilsService.setCurrentAccount(mockAccount);
    await expect(utilsService.initSDK()).rejects.toThrow();
    utilsService.setCurrentNetwotk(mockCurrentNetwork);
    await expect(utilsService.initSDK()).rejects.toThrow();
    utilsService.setCurrentMirror(mockCurrentMirror);
    await expect(utilsService.initSDK()).rejects.toThrow();
    utilsService.setCurrentBackend(mockCurrentBackend);
    await expect(utilsService.initSDK()).rejects.toThrow();
    utilsService.setCurrentRPC(mockCurrentRPC);
    utilsService.setCurrentResolverAndFactory(
      mockCurrentFactory,
      mockCurrentResolver,
    );
    utilsService.setCurrentHederaTokenManager(mockCurrentHederaTokenManager);
    await utilsService.initSDK();

    const account = utilsService.getCurrentAccount();
    const backend = utilsService.getCurrentBackend();
    const factory = utilsService.getCurrentFactory();
    const hederaTokenManager = utilsService.getCurrentHederaTokenManager();
    const mirrorNode = utilsService.getCurrentMirror();
    const network = utilsService.getCurrentNetwork();
    const rpc = utilsService.getCurrentRPC();

    // verify
    expect(configurationService.getLogConfiguration).toHaveBeenCalledTimes(5);
    expect(account).toEqual(mockAccount);
    expect(backend).toEqual(mockCurrentBackend);
    expect(factory).toEqual(mockCurrentFactory);
    expect(hederaTokenManager).toEqual(mockCurrentHederaTokenManager);
    expect(mirrorNode).toEqual(mockCurrentMirror);
    expect(network).toEqual(mockCurrentNetwork);
    expect(rpc).toEqual(mockCurrentRPC);
  });

  it('configure network', async () => {
    jest
      .spyOn(setMirrorNodeService, 'manageMirrorNodeMenu')
      .mockImplementation(async (_network: string): Promise<void> => {
        expect(_network).toEqual(network);
      });
    jest
      .spyOn(setRPCService, 'manageRPCMenu')
      .mockImplementation(async (_network: string): Promise<void> => {
        expect(_network).toEqual(network);
      });

    jest.spyOn(utilsService, 'showError').mockImplementation();

    // method call
    utilsService.setCurrentAccount(mockAccount);
    utilsService.setCurrentNetwotk(mockCurrentNetwork);
    utilsService.setCurrentMirror(mockCurrentMirror);
    utilsService.setCurrentBackend(mockCurrentBackend);
    utilsService.setCurrentRPC(mockCurrentRPC);
    utilsService.setCurrentResolverAndFactory(
      mockCurrentFactory,
      mockCurrentResolver,
    );
    utilsService.setCurrentHederaTokenManager(mockCurrentHederaTokenManager);
    await utilsService.initSDK();

    jest.spyOn(utilsService, 'defaultMultipleAsk').mockResolvedValue(network);

    await utilsService.configureNetwork(MIRROR_NODE);
    await utilsService.configureNetwork(RPC);
    await utilsService.configureNetwork('nothing');
    expect(utilsService.showError).toHaveBeenCalledTimes(1);
  });

  it('format Date', () => {
    const year = 1987;
    const month = 7;
    const day = 5;
    const hours = 9;
    const minutes = 5;
    const seconds = 0;
    const milliseconds = 0;
    const date = new Date(
      Date.UTC(year, month, day, hours, minutes, seconds, milliseconds),
    );
    const formattedDate = utilsService.formatDateTime(date);
    expect(formattedDate).toEqual(
      `${year}-0${month + 1}-0${day}T0${hours}:0${minutes}:0${seconds}Z`,
    );
  });

  it('display User Info', async () => {
    utilsService.setCurrentMirror(mockCurrentMirror);
    utilsService.setCurrentBackend(mockCurrentBackend);
    utilsService.setCurrentRPC(mockCurrentRPC);
    const token = '0.0.2222222';

    jest
      .spyOn(utilsService, 'showMessage')
      .mockImplementation((message: string): void => {
        expect(message.includes(token)).toBe(true);
        expect(message.includes(mockAccount.accountId)).toBe(true);
        expect(message.includes(mockAccount.alias)).toBe(true);
        expect(message.includes(mockCurrentMirror.name)).toBe(true);
        expect(message.includes(mockCurrentBackend.endpoint)).toBe(true);
        expect(message.includes(mockCurrentRPC.name)).toBe(true);
        expect(message.includes(network)).toBe(true);
      });

    utilsService.displayCurrentUserInfo(mockAccount, token);
  });

  it('checkbox multiple ask', async () => {
    const result = await utilsService.checkBoxMultipleAsk(
      checkBox_question,
      options,
      loop,
      atLeastOne,
    );

    expect(result.length).toEqual(selectedOptions.length);
    for (let i = 0; i < selectedOptions.length; i++) {
      expect(result[i]).toEqual(selectedOptions[i]);
    }
  });

  it('confirm ask', async () => {
    const result = await utilsService.defaultConfirmAsk(
      confirm_question,
      !selectedConfirmation,
    );

    expect(result).toEqual(selectedConfirmation);
  });

  it('confirm error ask', async () => {
    const result = await utilsService.defaultErrorConfirm(error_question);

    expect(result).toEqual(errorConfirmation);
  });

  it('confirm continue ask', async () => {
    const result = await utilsService.confirmContinue(
      confirm_continue_question,
    );

    expect(result).toEqual(selectedContinueConfirmation);
  });

  it('password ask', async () => {
    const result = await utilsService.defaultPasswordAsk(password_question);

    expect(result).toEqual(selectedPassword);
  });

  it('public key ask', async () => {
    const publicKey_OK =
      '0x0001020304050607000102030405060700010203040506070001020304050607';
    const publicKey_Wrong = '0x123';

    jest
      .spyOn(utilsService, 'defaultSingleAsk')
      .mockResolvedValueOnce(publicKey_Wrong)
      .mockResolvedValueOnce(publicKey_OK);

    const result = await utilsService.defaultPublicKeyAsk();

    expect(result.key).toEqual(publicKey_OK.substring(2));
  });
});
