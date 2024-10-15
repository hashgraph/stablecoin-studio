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

import shell from 'shelljs';
import yaml from 'js-yaml';
import fs from 'fs-extra';
import MaskData from 'maskdata';
import {
  DailyRotateFile,
  DefaultLoggerFormat,
  LogOptions,
} from '@hashgraph/stablecoin-npm-sdk';
import { utilsService, setConfigurationService } from '../../../index.js';
import Service from '../Service.js';
import pkg from '../../../../package.json';
import { IConfiguration } from '../../../domain/configuration/interfaces/IConfiguration.js';

/**
 * Configuration Service
 */
export default class ConfigurationService extends Service {
  private configuration: IConfiguration;
  private configFileName = '.hedera-stable-coin-cli.yaml'; // TODO: this should not be hardcoded
  private path = this.getDefaultConfigurationPath();

  constructor() {
    super('Configuration');
  }

  public async init(overrides?: IConfiguration, path?: string): Promise<void> {
    if (path) {
      this.path = path;
    }

    if (
      !fs.existsSync(this.getDefaultConfigurationPath()) ||
      !this.validateConfigurationFile()
    ) {
      await setConfigurationService.initConfiguration(
        path,
        overrides?.defaultNetwork,
      );
    }

    this.configuration = this.setConfigFromConfigFile();
    if (overrides) {
      if (overrides.defaultNetwork) {
        this.configuration.defaultNetwork = overrides.defaultNetwork;
      }
      if (overrides.logs) {
        this.configuration.logs = overrides.logs;
      }
      if (overrides.accounts) {
        this.configuration.accounts = overrides.accounts;
      }
      if (overrides.networks) {
        this.configuration.networks = overrides.networks;
      }
      if (overrides.mirrors) {
        this.configuration.mirrors = overrides.mirrors;
      }
      if (overrides.rpcs) {
        this.configuration.rpcs = overrides.rpcs;
      }
      if (overrides.backend) {
        this.configuration.backend = overrides.backend;
      }
      if (overrides.factories) {
        this.configuration.factories = overrides.factories;
      }
    }
  }

  public getConfiguration(): IConfiguration {
    return this.configuration;
  }

  public getLogConfiguration(): LogOptions {
    if (!this.configuration.logs) return undefined;
    return {
      level: this.configuration.logs.level ?? 'ERROR',
      transports: new DailyRotateFile({
        filename: `%DATE%.log`,
        dirname: this.configuration.logs.path ?? './logs',
        datePattern: 'YYYY_MM_DD',
        maxSize: '500k',
        maxFiles: '14d',
        format: DefaultLoggerFormat,
      }),
    };
  }

  /**
   * Set the configuration and save to config file
   * @param _configuration
   * @param _path
   */
  public setConfiguration(
    _configuration: IConfiguration,
    _path?: string,
  ): void {
    this.configuration = _configuration;
    fs.writeFileSync(
      _path ?? this.getDefaultConfigurationPath(),
      yaml.dump(_configuration as unknown),
      'utf8',
    );
  }

  /**
   * Show full configuration in json format
   */
  public showFullConfiguration(): void {
    const maskJSONOptions = {
      maskWith: '.',
      unmaskedStartCharacters: 4,
      unmaskedEndCharacters: 4,
    };
    const configuration = this.getConfiguration();
    const result = { ...configuration };
    result.accounts = configuration.accounts.map((acc) => {
      return {
        accountId: acc.accountId,
        type: acc.type,
        network: acc.network,
        alias: acc.alias,
        importedTokens: acc.importedTokens,
        selfCustodial: !acc.selfCustodial
          ? undefined
          : {
              privateKey: {
                key: MaskData.maskPassword(
                  acc.selfCustodial.privateKey.key,
                  maskJSONOptions,
                ),
                type: acc.selfCustodial.privateKey.type,
              },
            },
        custodial: !acc.custodial
          ? undefined
          : {
              fireblocks: !acc.custodial.fireblocks
                ? undefined
                : {
                    apiSecretKeyPath: acc.custodial.fireblocks.apiSecretKeyPath,
                    apiKey: MaskData.maskPassword(
                      acc.custodial.fireblocks.apiKey,
                      maskJSONOptions,
                    ),
                    baseUrl: acc.custodial.fireblocks.baseUrl,
                    assetId: acc.custodial.fireblocks.assetId,
                    vaultAccountId: acc.custodial.fireblocks.vaultAccountId,
                    hederaAccountPublicKey:
                      acc.custodial.fireblocks.hederaAccountPublicKey,
                  },
              dfns: !acc.custodial.dfns
                ? undefined
                : {
                    authorizationToken: MaskData.maskPassword(
                      acc.custodial.dfns.authorizationToken,
                      maskJSONOptions,
                    ),
                    credentialId: acc.custodial.dfns.credentialId,
                    privateKeyPath: acc.custodial.dfns.privateKeyPath,
                    appOrigin: acc.custodial.dfns.appOrigin,
                    appId: acc.custodial.dfns.appId,
                    testUrl: acc.custodial.dfns.testUrl,
                    walletId: acc.custodial.dfns.walletId,
                    hederaAccountPublicKey:
                      acc.custodial.dfns.hederaAccountPublicKey,
                    hederaAccountKeyType:
                      acc.custodial.dfns.hederaAccountKeyType,
                  },
            },
      };
    });
    console.dir(result, { depth: null });
  }

  public createDefaultConfiguration(path?: string): void {
    try {
      const defaultConfigPath = `${this.getGlobalPath()}/build/src/resources/config/${
        this.configFileName
      }`;
      const fallbackConfigPath = `src/resources/config/${this.configFileName}`;

      const configPath = fs.existsSync(defaultConfigPath)
        ? defaultConfigPath
        : fallbackConfigPath;
      const defaultConfig: IConfiguration = yaml.load(
        fs.readFileSync(configPath, 'utf8'),
      );

      const filePath = path ?? this.getDefaultConfigurationPath();
      this.path = filePath;

      fs.ensureFileSync(filePath);
      fs.writeFileSync(filePath, yaml.dump(defaultConfig), 'utf8');

      this.setConfiguration(defaultConfig, filePath);
    } catch (ex) {
      utilsService.showError(ex);
    }
  }

  /**
   * Set config data from config file
   */
  public setConfigFromConfigFile(): IConfiguration {
    const config = yaml.load(
      fs.readFileSync(this.getDefaultConfigurationPath(), 'utf8'),
    ) as IConfiguration;
    this.setConfiguration(config);
    return config;
  }

  /**
   * Get the default path for the configuration
   * @returns
   */
  public getDefaultConfigurationPath(): string {
    if (this.path) return this.path;
    return `${this.getGlobalPath()}/build/src/resources/config/${
      this.configFileName
    }`;
  }

  private getGlobalPath(): string {
    shell.config.silent = true;
    const { stdout } = shell.exec('npm root -g');
    return `${stdout}/${pkg.name}`.replace(/(\r\n|\n|\r)/gm, '');
  }

  public validateConfigurationFile(): boolean {
    const config: IConfiguration = yaml.load(
      fs.readFileSync(this.getDefaultConfigurationPath(), 'utf8'),
    );
    return (
      config?.defaultNetwork &&
      !!config?.accounts &&
      Array.isArray(config?.accounts) &&
      config?.accounts[0].accountId.length > 0
    );
  }

  /**
   * Logs a warning if the factory ID of a target does not match the latest version of the SDK in the configuration.
   * @param targetId - The ID of the target.
   * @param targetName - The name of the target.
   * @param network - The network of the target.
   * @param arr - An optional array of objects containing IDs and networks.
   */
  public logFactoryIdWarning(
    targetId: string,
    targetName: string,
    network: string,
    arr?: { id: string; network: string }[],
  ): void {
    if (arr && arr.length > 0) {
      arr.map(({ id, network: n }) => {
        if (network === n && id !== targetId)
          utilsService.showWarning(
            `The ${targetName} version in the configuration does not match the latest version of the SDK:\n\tLatest: ${targetId}\n\tCurrently: ${id}\n`,
          );
      });
    }
  }
}
