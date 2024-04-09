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

import { configurationService, utilsService } from '../../../../src/index.js';
import Language from '../../../../src/domain/language/Language.js';
import { IConfiguration } from 'domain/configuration/interfaces/IConfiguration.js';
import { LogOptions } from '@hashgraph/stablecoin-npm-sdk';
import { rimraf } from 'rimraf';
import { AccountType } from '../../../../src/domain/configuration/interfaces/AccountType';

const language: Language = new Language();
const accountId = '0.0.123456';
const testDir = 'test';
const path = `${testDir}/hsca-config.yaml`;

describe('configurationService', () => {
  const configurationMock: IConfiguration = {
    defaultNetwork: 'testnet',
    networks: [],
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
        alias: 'test account',
        importedTokens: [],
      },
      {
        accountId: '0.0.456789',
        type: AccountType.SelfCustodial,
        selfCustodial: {
          privateKey: {
            key: '0xbcdef0123456789abcdef0123456789abcdef0123456789abcdef0123456789a',
            type: 'ED25519',
          },
        },
        network: 'testnet',
        alias: 'New account alias',
        importedTokens: [],
      },
      {
        accountId: '0.0.654321',
        type: AccountType.SelfCustodial,
        selfCustodial: {
          privateKey: {
            key: 'abcdef0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef0123456789',
            type: 'ED25519',
          },
        },
        network: 'testnet',
        alias: 'another test account',
        importedTokens: [],
      },
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
        id: '0.0.13579',
        network: 'testnet',
      },
      {
        id: '0.0.02468',
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

  it('should init configuration with no initial configuration or a file path', async () => {
    const defaultSingleAskMock = jest
      .spyOn(utilsService, 'defaultSingleAsk')
      .mockImplementation((question: string) => {
        switch (question) {
          case language.getText('configuration.askPath'):
            return Promise.resolve(path);

          case language.getText('configuration.askAccountId'):
            return Promise.resolve(accountId);

          case language.getText('configuration.askAlias'):
            return Promise.resolve('test');

          case language.getText('configuration.askFactoryAddress') +
            ' | TESTNET':
            return Promise.resolve('0.0.13579');

          case language.getText('configuration.askFactoryAddress') +
            ' | PREVIEWNET':
            return Promise.resolve('0.0.02468');

          default:
            return Promise.resolve('');
        }
      });

    const defaultConfirmAskMock = jest
      .spyOn(utilsService, 'defaultConfirmAsk')
      .mockImplementation((question: string) => {
        switch (question) {
          case language.getText('configuration.askCreateConfig'):
            return Promise.resolve(true);

          case language.getText('configuration.askMoreAccounts'):
            return Promise.resolve(false);

          case language.getText('configuration.askConfigurateFactories'):
            return Promise.resolve(true);

          case language.getText(
            'configuration.askConfigurateDefaultMirrorsAndRPCs',
          ):
            return Promise.resolve(true);

          default:
            return Promise.resolve(false);
        }
      });

    const defaultMultipleAskMock = jest
      .spyOn(utilsService, 'defaultMultipleAsk')
      .mockImplementation((question: string) => {
        switch (question) {
          case language.getText('configuration.askAccountType'):
            return Promise.resolve('SELF-CUSTODIAL');

          case language.getText('configuration.askPrivateKeyType'):
            return Promise.resolve('ED25519');

          case language.getText('configuration.askNetworkAccount'):
            return Promise.resolve('testnet');

          case language.getText('configuration.askNetwork'):
            return Promise.resolve('testnet');

          default:
            return Promise.resolve('');
        }
      });

    const defaultPasswordAskMock = jest
      .spyOn(utilsService, 'defaultPasswordAsk')
      .mockImplementation((question: string) => {
        switch (question) {
          case language.getText('configuration.askPrivateKey') +
            ` '96|64|66|68 characters' (${accountId})`:
            return Promise.resolve(
              '01234567890abcdef0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcde',
            );

          default:
            return Promise.resolve('');
        }
      });

    await configurationService.init();

    expect(configurationService).not.toBeNull();
    expect(defaultSingleAskMock).toHaveBeenCalledTimes(5);
    expect(defaultConfirmAskMock).toHaveBeenCalledTimes(5);
    expect(defaultMultipleAskMock).toHaveBeenCalledTimes(4);
    expect(defaultPasswordAskMock).toHaveBeenCalledTimes(1);
  });

  it('should init configuration with a path', async () => {
    await configurationService.init(configurationMock, path);

    expect(configurationService).not.toBeNull();
  });

  it('should get configuration and log configuration', async () => {
    const conf: IConfiguration = configurationService.getConfiguration();

    expect(configurationService).not.toBeNull();
    expect(conf.defaultNetwork).toStrictEqual(configurationMock.defaultNetwork);
    // expect(conf.accounts).toStrictEqual(configurationMock.accounts);
    expect(conf.factories).toStrictEqual(configurationMock.factories);
    expect(conf.mirrors).toStrictEqual(configurationMock.mirrors);
    expect(conf.rpcs).toStrictEqual(configurationMock.rpcs);
    expect(conf.logs).toStrictEqual(configurationMock.logs);
    expect(configurationService).not.toBeNull();

    const logConf: LogOptions = configurationService.getLogConfiguration();

    expect(logConf.level).toStrictEqual(configurationMock.logs.level);
  });

  it('should show full configuration', async () => {
    jest.spyOn(console, 'dir');

    configurationService.showFullConfiguration();

    expect(configurationService).not.toBeNull();
    expect(console.dir).toHaveBeenCalledTimes(1);
  });

  it('should check the configurated factory id', async () => {
    jest.spyOn(utilsService, 'showWarning');

    configurationService.logFactoryIdWarning(
      '0.0.13570',
      'factory',
      'testnet',
      [
        {
          id: '0.0.13579',
          network: 'testnet',
        },
      ],
    );

    expect(configurationService).not.toBeNull();
    expect(utilsService.showWarning).toHaveBeenCalledTimes(1);
  });

  afterAll(() => {
    jest.restoreAllMocks();
    rimraf(testDir);
  });
});
