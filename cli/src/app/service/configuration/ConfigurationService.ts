import Service from '../Service.js';
import shell from 'shelljs';
import pkg from '../../../../package.json';
import yaml from 'js-yaml';
import fs from 'fs-extra';
import { IConfiguration } from '../../../domain/configuration/interfaces/IConfiguration.js';
import { INetworkConfig } from '../../../domain/configuration/interfaces/INetworkConfig.js';
import { IAccountConfig } from '../../../domain/configuration/interfaces/IAccountConfig.js';
import { configurationService, utilsService } from '../../../index.js';
import SetConfigurationService from './SetConfigurationService.js';
import MaskData from 'maskdata';
import {
  LoggerOptions,
  DailyRotateFile,
  DefaultLoggerFormat,
} from 'hedera-stable-coin-sdk';
import { ILogConfig } from '../../../domain/configuration/interfaces/ILogConfig.js';

/**
 * Configuration Service
 */
export default class ConfigurationService extends Service {
  private configuration: IConfiguration;
  private configFileName = '.hedera-stable-coin-cli.yaml';
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
      const setConfigurationService: SetConfigurationService =
        new SetConfigurationService();
      await setConfigurationService.initConfiguration(
        path,
        overrides?.defaultNetwork,
      );
    }
    this.configuration = this.setConfigFromConfigFile();
    if (overrides?.defaultNetwork) {
      this.configuration.defaultNetwork = overrides.defaultNetwork;
    }
    if (overrides?.logs) {
      this.configuration.logs = overrides.logs;
    }
  }

  public getConfiguration(): IConfiguration {
    return this.configuration;
  }

  public getLogConfiguration(): LoggerOptions {
    if (!this.configuration.logs) return undefined;
    return {
      level: this.configuration.logs.level ?? 'ERROR',
      transports: [
        new DailyRotateFile({
          filename: `%DATE%.log`,
          dirname: this.configuration.logs.path ?? './logs',
          datePattern: 'YYYY_MM_DD',
          maxSize: '500k',
          maxFiles: '14d',
          format: DefaultLoggerFormat,
        }),
      ],
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
        privateKey: {
          key: MaskData.maskPassword(acc.privateKey.key, maskJSONOptions),
          type: acc.privateKey.type,
        },
        accountId: acc.accountId,
        network: acc.network,
        alias: acc.alias,
        importedTokens: acc.importedTokens,
      };
    });
    console.dir(result, { depth: null });
  }

  /**
   * Create default configuration file and override if exists
   */
  public createDefaultConfiguration(path?: string): void {
    try {
      const defaultConfig = yaml.load(
        fs.readFileSync(
          `${this.getGlobalPath()}/src/resources/config/${this.configFileName}`,
        ),
      );
      const filePath = path ?? this.getDefaultConfigurationPath();
      this.path = filePath;
      fs.ensureFileSync(filePath);
      fs.writeFileSync(filePath, yaml.dump(defaultConfig), 'utf8');
      configurationService.setConfiguration(defaultConfig, filePath);
    } catch (ex) {
      utilsService.showError(ex);
    }
  }

  /**
   * Set config data from config file
   */
  public setConfigFromConfigFile(): IConfiguration {
    const defaultConfigRaw = yaml.load(
      fs.readFileSync(this.getDefaultConfigurationPath(), 'utf8'),
    );
    const config: IConfiguration = {
      defaultNetwork: defaultConfigRaw['defaultNetwork'],
      networks: defaultConfigRaw['networks'] as unknown as INetworkConfig[],
      accounts: defaultConfigRaw['accounts'] as unknown as IAccountConfig[],
      logs: defaultConfigRaw['logs'] as unknown as ILogConfig,
    };
    this.setConfiguration(config);
    return config;
  }

  /**
   * Get the default path for the configuration
   * @returns
   */
  public getDefaultConfigurationPath(): string {
    if (this.path) return this.path;
    return `${this.getGlobalPath()}/config/${this.configFileName}`;
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
}
