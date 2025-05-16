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

import { Network } from '@hashgraph/stablecoin-npm-sdk';
import { rimraf } from 'rimraf';
import fs from 'fs-extra';
import {
  setResolverAndFactoryService,
  utilsService,
  configurationService,
} from '../../../../src/index.js';
import { IConfiguration } from '../../../../src/domain/configuration/interfaces/IConfiguration.js';
import { AccountType } from '../../../../src/domain/configuration/interfaces/AccountType.js';

const CONFIG_FILE_PATH = `hsca-config_test.yaml`;
fs.openSync(CONFIG_FILE_PATH, 'w');

const NETWORKS = {
  test: 'testnet',
  preview: 'previewnet',
  main: 'mainnet',
};

const DEFAULT_CONTRACT_IDS = [
  '0.0.0',
  '0.0.1',
  '0.0.22',
  '0.0.333',
  '0.0.4444',
  '0.0.55555',
];

const CONFIG_MOCK: IConfiguration = {
  defaultNetwork: 'testnet',
  networks: [
    {
      name: 'testnet',
      chainId: 1,
      consensusNodes: [],
    },
  ],
  accounts: [
    {
      accountId: '0.0.123456',
      type: AccountType.SelfCustodial,
      selfCustodial: {
        privateKey: {
          key: '01234567890abcdef0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcde',
          type: 'ED25519',
        },
      },
      network: 'testnet',
      alias: 'test',
      importedTokens: [],
    },
  ],
  logs: {
    path: './logs',
    level: 'ERROR',
  },
  rpcs: [
    {
      name: 'HASHIO',
      network: 'testnet',
      baseUrl: 'https://testnet.hashio.io/api',
      selected: true,
    },
    {
      name: 'HASHIO',
      network: 'previewnet',
      baseUrl: 'https://previewnet.hashio.io/api',
      selected: true,
    },
    {
      name: 'HASHIO',
      network: 'mainnet',
      baseUrl: 'https://mainnet.hashio.io/api',
      selected: true,
    },
  ],
  factories: [
    {
      id: DEFAULT_CONTRACT_IDS[1],
      network: 'testnet',
    },
    {
      id: DEFAULT_CONTRACT_IDS[2],
      network: 'previewnet',
    },
  ],
  resolvers: [
    {
      id: DEFAULT_CONTRACT_IDS[1],
      network: 'testnet',
    },
    {
      id: DEFAULT_CONTRACT_IDS[2],
      network: 'previewnet',
    },
  ],
  mirrors: [
    {
      name: 'HEDERA',
      network: 'testnet',
      baseUrl: 'https://testnet.mirrornode.hedera.com/api/v1/',
      selected: true,
    },
    {
      name: 'HEDERA',
      network: 'previewnet',
      baseUrl: 'https://previewnet.mirrornode.hedera.com/api/v1/',
      selected: true,
    },
    {
      name: 'HEDERA',
      network: 'mainnet',
      baseUrl: 'https://mainnet-public.mirrornode.hedera.com/api/v1/',
      selected: true,
    },
  ],
};

const mocks: Record<string, jest.SpyInstance> = {};

describe('SetResolverAndFactoryService', () => {
  beforeAll(() => {
    // Mock all unwanted outputs
    mocks.log = jest.spyOn(console, 'log').mockImplementation();
    mocks.info = jest.spyOn(console, 'info').mockImplementation();
    mocks.error = jest.spyOn(console, 'warn').mockImplementation();
    mocks.error = jest.spyOn(console, 'error').mockImplementation();
    // Common mocks for all tests
    mocks.configService = jest
      .spyOn(configurationService, 'getDefaultConfigurationPath')
      .mockReturnValue(CONFIG_FILE_PATH);
    mocks.getConfiguration = jest
      .spyOn(configurationService, 'getConfiguration')
      .mockReturnValue(CONFIG_MOCK);
    // Not fixed, only defined
    mocks.defaultSingleAsk = jest.spyOn(utilsService, 'defaultSingleAsk');
  });

  afterAll(() => {
    jest.restoreAllMocks();
    rimraf(CONFIG_FILE_PATH);
  });
  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should configure factories and resolvers', async () => {
    //* 🗂️ Arrange
    mocks.defaultSingleAsk
      .mockResolvedValueOnce(DEFAULT_CONTRACT_IDS[3])
      .mockResolvedValueOnce(DEFAULT_CONTRACT_IDS[3])
      .mockResolvedValueOnce(DEFAULT_CONTRACT_IDS[4])
      .mockResolvedValueOnce(DEFAULT_CONTRACT_IDS[4]);
    mocks.setConfiguration = jest
      .spyOn(configurationService, 'setConfiguration')
      .mockReturnValue();
    const expectedSetConfigurationRequest: IConfiguration = {
      ...CONFIG_MOCK,
      factories: [
        {
          ...CONFIG_MOCK.factories[0],
          id: DEFAULT_CONTRACT_IDS[3],
        },
        { ...CONFIG_MOCK.factories[1], id: DEFAULT_CONTRACT_IDS[4] },
      ],
      resolvers: [
        {
          ...CONFIG_MOCK.resolvers[0],
          id: DEFAULT_CONTRACT_IDS[3],
        },
        { ...CONFIG_MOCK.resolvers[1], id: DEFAULT_CONTRACT_IDS[4] },
      ],
    };
    //* 🎬 Act
    const [resultFactories, resultResolvers] =
      await setResolverAndFactoryService.configureResolversAndFactories();
    //* 🕵️ Assert
    expect(mocks.defaultSingleAsk).toHaveBeenCalledTimes(4);
    expect(mocks.setConfiguration).toHaveBeenCalledTimes(1);
    expect(mocks.setConfiguration).toHaveBeenCalledWith(
      expectedSetConfigurationRequest,
    );
    expect(resultFactories).toBeDefined();
    expect(resultFactories[0].id).toBe(DEFAULT_CONTRACT_IDS[3]);
    expect(resultFactories[1].id).toBe(DEFAULT_CONTRACT_IDS[4]);
    expect(resultFactories[0].network).toBe(NETWORKS.test);
    expect(resultFactories[1].network).toBe(NETWORKS.preview);

    expect(resultResolvers).toBeDefined();
    expect(resultResolvers[0].id).toBe(DEFAULT_CONTRACT_IDS[3]);
    expect(resultResolvers[1].id).toBe(DEFAULT_CONTRACT_IDS[4]);
    expect(resultResolvers[0].network).toBe(NETWORKS.test);
    expect(resultResolvers[1].network).toBe(NETWORKS.preview);
  });

  describe('SDK Factory and Resolver', () => {
    it('should set SDK factory and resolver', async () => {
      //* 🗂️ Arrange
      const setConfigMock = jest
        .spyOn(Network, 'setConfig')
        .mockResolvedValueOnce({
          factoryAddress: DEFAULT_CONTRACT_IDS[5],
          resolverAddress: DEFAULT_CONTRACT_IDS[5],
        });
      //* 🎬 Act
      await setResolverAndFactoryService.setSDKResolverAndFactory(
        DEFAULT_CONTRACT_IDS[5],
        DEFAULT_CONTRACT_IDS[5],
      );
      //* 🕵️ Assert
      expect(setConfigMock).toHaveBeenCalledTimes(1);
      expect(setConfigMock).toHaveBeenCalledWith(
        expect.objectContaining({
          factoryAddress: DEFAULT_CONTRACT_IDS[5],
          resolverAddress: DEFAULT_CONTRACT_IDS[5],
        }),
      );
    });

    it('should get SDK factory and resolver', async () => {
      //* 🗂️ Arrange
      const getFactoryAddressMock = jest
        .spyOn(Network, 'getFactoryAddress')
        .mockReturnValue(DEFAULT_CONTRACT_IDS[4]);
      const getResolverAddressMock = jest
        .spyOn(Network, 'getResolverAddress')
        .mockReturnValue(DEFAULT_CONTRACT_IDS[4]);
      //* 🎬 Act
      const factory = await setResolverAndFactoryService.getSDKFactory();
      const resolver = await setResolverAndFactoryService.getSDKResolver();
      //* 🕵️ Assert
      expect(getFactoryAddressMock).toHaveBeenCalledTimes(1);
      expect(getResolverAddressMock).toHaveBeenCalledTimes(1);
      expect(factory).toBe(DEFAULT_CONTRACT_IDS[4]);
      expect(resolver).toBe(DEFAULT_CONTRACT_IDS[4]);
    });
  });
});
