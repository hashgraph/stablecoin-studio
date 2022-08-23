import Service from '../Service.js';
import shell from 'shelljs';
import pkg from '../../../../package.json';
import toml, { JsonMap } from '@iarna/toml';
import fs from 'fs-extra';
import { IConfiguration } from '../../../domain/configuration/interfaces/IConfiguration.js';
import { INetworkConfig } from '../../../domain/configuration/interfaces/INetworkConfig.js';
import { IAccountConfig } from '../../../domain/configuration/interfaces/IAccountConfig.js';
import { utilsService } from '../../../index.js';

/**
 * Configuration Service
 */
export default class ConfigurationService extends Service {
  private configuration: IConfiguration;
  private configFileName = '.hedera-stable-cli.toml';
  private firstTime = false;

  constructor() {
    super('Configuration');

    if (!fs.existsSync(this.getDefaultConfigurationPath())) {
      this.setIsFirstTime(true);
      this.createDefaultConfiguration();
    }

    this.configuration = this.setConfigFromConfigFile();
  }

  public getIsFirstTime(): boolean {
    return this.firstTime;
  }

  public setIsFirstTime(_firstTime: boolean): void {
    this.firstTime = _firstTime;
  }

  public getConfiguration(): IConfiguration {
    return this.configuration;
  }

  /**
   * Set the configuration and save to config file
   * @param _configuration 
   * @param _path 
   */
  public setConfiguration(
    _configuration: IConfiguration,
    _path: string | undefined = undefined,
  ): void {
    this.configuration = _configuration;
    fs.writeFileSync(
      _path ?? _configuration.general.configPath,
      toml.stringify(_configuration as unknown as JsonMap),
      'utf8',
    );
  }

  /**
   * Show full configuration in json format
   */
  public showFullConfiguration(): void {
    console.dir(this.getConfiguration(), { depth: null });
  }

  /**
   * Create default configuration file and override if exists
   */
  public createDefaultConfiguration(): void {
    try {
      const defaultConfig = toml.parse(
        fs.readFileSync(`src/resources/config/${this.configFileName}`, 'utf8'),
      );
      const filePath = this.getDefaultConfigurationPath();
      defaultConfig.general['configPath'] = filePath;
      fs.ensureFileSync(filePath);
      fs.writeFileSync(filePath, toml.stringify(defaultConfig), 'utf8');
    } catch (ex) {
      utilsService.showError(ex);
    }
  }

  /**
   * Set config data from config file
   */
  public setConfigFromConfigFile(): IConfiguration {
    let defaultConfigRaw = toml.parse(
      fs.readFileSync(this.getDefaultConfigurationPath(), 'utf8'),
    );

    // Obtain config by config path if exists
    if (
      defaultConfigRaw.general['configPath'] !== '' &&
      fs.existsSync(defaultConfigRaw.general['configPath'])
    ) {
      defaultConfigRaw = toml.parse(
        fs.readFileSync(defaultConfigRaw.general['configPath'], 'utf8'),
      );
    }

    const config: IConfiguration = {
      general: {
        configPath:
          defaultConfigRaw.general['configPath'] !== ''
            ? defaultConfigRaw.general['configPath']
            : this.getDefaultConfigurationPath(),
        network: defaultConfigRaw.general['network'],
      },
      networks: defaultConfigRaw['networks'] as unknown as INetworkConfig[],
      accounts: defaultConfigRaw['accounts'] as unknown as IAccountConfig[],
    };

    this.setConfiguration(config);
    return config;
  }

  /**
   * Get the default path for the configuration
   * @returns 
   */
  public getDefaultConfigurationPath(): string {
    shell.config.silent = true;
    const { stdout } = shell.exec('npm root -g');
    return `${stdout}/${pkg.name}/config/${this.configFileName}`.replace(
      /(\r\n|\n|\r)/gm,
      '',
    );
  }
}
