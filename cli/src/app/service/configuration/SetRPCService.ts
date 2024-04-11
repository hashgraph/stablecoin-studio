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
  HASHIO_RPC_MAINNET_URL,
  HASHIO_RPC_PREVIEWNET_URL,
  HASHIO_RPC_TESTNET_URL,
  HEDERA_RPC_NAME,
} from '../../../core/Constants.js';
import {
  configurationService,
  language,
  utilsService,
  wizardService,
  networkWizardService,
} from '../../../index.js';
import Service from '../Service.js';
import { IRPCsConfig } from 'domain/configuration/interfaces/IRPCsConfig.js';
const colors = require('colors');

interface RPCValidation {
  result: boolean;
  errorMsg?: string;
}

/**
 * Set RPC Service
 */
export default class SetRPCService extends Service {
  readonly URL_REG_EXP =
    /^(http(s)?:\/\/.)[-a-zA-Z0-9@:%._+~#=]{2,256}((\.[a-z]{2,6})?)\b([-a-zA-Z0-9@:%_+.~#?&//=]*)$/;

  constructor() {
    super('Set RPC Configuration');
  }

  /**
   * Function to configure a new rpc
   *
   * @param _network Network to configure the rpc
   *
   * @return RPCs configuration
   */
  public async configureRPC(_network?: string): Promise<IRPCsConfig[]> {
    const configuration = configurationService.getConfiguration();
    const rpcs: IRPCsConfig[] = configuration?.rpcs || [];
    let moreRPCs = true;

    while (moreRPCs) {
      utilsService.showMessage(
        language.getText('configuration.rpcConfigurationMessage'),
      );

      let name = await utilsService.defaultSingleAsk(
        language.getText('configuration.askName'),
        'JSON-RPC-Relay service',
      );
      while (
        rpcs.some((rpc) => rpc.name === name && rpc.network === _network)
      ) {
        utilsService.showError(
          language.getText('validations.duplicatedRPCName', {
            name,
          }),
        );
        name = await utilsService.defaultSingleAsk(
          language.getText('configuration.askName'),
          'JSON-RPC-Relay service',
        );
      }

      let baseUrl = await utilsService.defaultSingleAsk(
        language.getText('configuration.askBaseUrl'),
        'Base Url',
      );
      let rpcValidation: RPCValidation;
      while (
        (rpcValidation = this.isValidRPC(baseUrl, rpcs, _network)) &&
        rpcValidation.result == false
      ) {
        console.log(rpcValidation.errorMsg);

        baseUrl = await utilsService.defaultSingleAsk(
          language.getText('configuration.askBaseUrl'),
          'Base Url',
        );
      }

      let apiKey = '';
      let headerName = '';
      const addKey = await utilsService.defaultConfirmAsk(
        language.getText('configuration.askNeedApiKey'),
        false,
      );
      if (addKey) {
        apiKey = await utilsService.defaultSingleAsk(
          language.getText('configuration.askApiKey'),
          '12345',
        );
        headerName = await utilsService.defaultSingleAsk(
          language.getText('configuration.askHeaderName'),
          'x-api-key',
        );
      }

      const newRPC = {
        name: name,
        network: _network,
        baseUrl: baseUrl,
        selected: false,
        apiKey: apiKey,
        headerName: headerName,
      };
      rpcs.push(newRPC);

      utilsService.showMessage(language.getText('configuration.rpcAdded'));
      console.dir(newRPC),
        {
          depth: null,
        };

      moreRPCs = await utilsService.defaultConfirmAsk(
        language.getText('configuration.askMoreRPCs'),
        false,
      );
    }

    // Set mirrors
    configuration.rpcs = rpcs;
    configurationService.setConfiguration(configuration);
    return rpcs;
  }

  /**
   * Function to remove a rpc
   *
   * @param _network Network to remove the rpc
   */
  public async removeRPC(_network: string): Promise<void> {
    const configuration = configurationService.getConfiguration();
    const currentRPC = utilsService.getCurrentRPC();
    const rpcs: IRPCsConfig[] = configuration?.rpcs || [];

    const options = rpcs
      .filter((rpc) => rpc.name !== currentRPC.name && rpc.network === _network)
      .map((rpc) => `${rpc.name} (${rpc.network})`);

    if (options.length > 0) {
      const optionsWithoutColors = rpcs
        .filter(
          (rpc) => rpc.name !== currentRPC.name && rpc.network === _network,
        )
        .map((rpc) => `${rpc.name}` + ' (' + rpc.network + ')');
      let rpc = await utilsService.defaultMultipleAsk(
        language.getText('configuration.RPCDelete'),
        options,
        true,
      );
      if (rpc === language.getText('wizard.backOption.goBack')) {
        await this.manageRPCMenu(_network);
      }
      const AskSureRemove = await utilsService.defaultConfirmAsk(
        language.getText('configuration.askSureRemove', { rpc }),
        true,
      );
      if (AskSureRemove) {
        rpc = optionsWithoutColors[options.indexOf(rpc)];
        const name = rpc.split(' (')[0];
        const network = rpc.split(' (')[1].split(')')[0];
        configuration.rpcs = rpcs.filter(
          (rpc) => rpc.name !== name || rpc.network !== network,
        );
        configurationService.setConfiguration(configuration);
        utilsService.showMessage(language.getText('configuration.RPCDeleted'));
      }
    } else {
      utilsService.showMessage(
        colors.yellow(language.getText('configuration.noMoreRPCs')),
      );
    }
  }

  /**
   * Function to get the default rpc by network
   *
   * @param _network Network to configure the rpc
   *
   * @return RPCs configuration
   */
  public getDefaultRPCByNetwork(_network: string): IRPCsConfig {
    return {
      name: HEDERA_RPC_NAME,
      network: _network,
      baseUrl:
        _network === 'testnet'
          ? HASHIO_RPC_TESTNET_URL
          : _network === 'previewnet'
          ? HASHIO_RPC_PREVIEWNET_URL
          : _network === 'mainnet'
          ? HASHIO_RPC_MAINNET_URL
          : HASHIO_RPC_TESTNET_URL,
      apiKey: undefined,
      headerName: undefined,
      selected: true,
    };
  }

  /**
   * Function to configure RPCs
   *
   * @return RPCs configuration
   */
  public async configureRPCs(): Promise<IRPCsConfig[]> {
    const configuration = configurationService.getConfiguration();
    const rpcs: IRPCsConfig[] = [];

    let moreRPCs = true;

    while (moreRPCs) {
      const network = await utilsService.defaultMultipleAsk(
        language.getText('configuration.askRPCNetwork'),
        configuration.networks.map((acc) => acc.name),
      );

      let name = await utilsService.defaultSingleAsk(
        language.getText('configuration.askRPCName'),
        HEDERA_RPC_NAME,
      );
      while (
        rpcs.filter(
          (element) => element.network === network && element.name === name,
        ).length > 0
      ) {
        console.log(language.getText('validations.duplicatedRPCName'));
        name = await utilsService.defaultSingleAsk(
          language.getText('configuration.askRPCName'),
          HEDERA_RPC_NAME,
        );
      }

      let baseUrl = await utilsService.defaultSingleAsk(
        language.getText('configuration.askRPCUrl'),
        network === 'testnet'
          ? HASHIO_RPC_TESTNET_URL
          : network === 'previewnet'
          ? HASHIO_RPC_PREVIEWNET_URL
          : network === 'mainnet'
          ? HASHIO_RPC_MAINNET_URL
          : HASHIO_RPC_TESTNET_URL,
      );

      let rpcValidation: RPCValidation;
      while (
        (rpcValidation = this.isValidRPC(baseUrl, rpcs, network)) &&
        rpcValidation.result == false
      ) {
        console.log(rpcValidation.errorMsg);

        baseUrl = await utilsService.defaultSingleAsk(
          language.getText('configuration.askRPCUrl'),
          network === 'testnet'
            ? HASHIO_RPC_TESTNET_URL
            : network === 'previewnet'
            ? HASHIO_RPC_PREVIEWNET_URL
            : network === 'mainnet'
            ? HASHIO_RPC_MAINNET_URL
            : HASHIO_RPC_TESTNET_URL,
        );
      }

      const rpc = {
        name: name,
        network: network,
        baseUrl: baseUrl.slice(-1) === '/' ? baseUrl : baseUrl + '/',
        apiKey: undefined,
        headerName: undefined,
        selected: false,
      };

      if (
        await utilsService.defaultConfirmAsk(
          language.getText('configuration.askRPCHasApiKey'),
          true,
        )
      ) {
        rpc.apiKey = await utilsService.defaultSingleAsk(
          language.getText('configuration.askRPCApiKey'),
          undefined,
        );

        rpc.headerName = await utilsService.defaultSingleAsk(
          language.getText('configuration.askRPCHeaderName'),
          undefined,
        );
      }

      if (
        await utilsService.defaultConfirmAsk(
          language.getText('configuration.askRPCSelected'),
          true,
        )
      ) {
        rpc.selected = true;
        rpcs
          .filter(
            (element) =>
              element.network === rpc.network && element.selected === true,
          )
          .forEach((found) => {
            found.selected = false;
          });
      }

      rpcs.push(rpc);

      const response = await utilsService.defaultConfirmAsk(
        language.getText('configuration.askMoreRPCs'),
        true,
      );
      if (!response) {
        moreRPCs = false;
      }
    }

    const defaultCfgData = configurationService.getConfiguration();
    defaultCfgData.rpcs = rpcs;
    configurationService.setConfiguration(defaultCfgData);
    return rpcs;
  }

  /**
   * Function to check if a JSON-RPC-Relay service is valid to be included in the config file
   *
   * @param baseUrl JSON-RPC-Relay service url
   * @param rpcs Already existing JSON-RPC-Relay services in config file
   * @param network Network to configure the JSON-RPC-Relay service
   */
  private isValidRPC(
    baseUrl: string,
    rpcs: IRPCsConfig[],
    network: string,
  ): RPCValidation {
    if (!this.URL_REG_EXP.test(baseUrl))
      return {
        result: false,
        errorMsg: language.getText('validations.wrongFormatUrl'),
      };
    const urlNotRepeated =
      rpcs.filter(
        (element) => element.network === network && element.baseUrl === baseUrl,
      ).length == 0;
    if (!urlNotRepeated)
      return {
        result: false,
        errorMsg: language.getText('validations.duplicatedRPCUrl'),
      };
    return { result: true };
  }

  /**
   * Function to manage the rpc menu
   *
   * @param _network Network to configure the rpc
   */
  public async manageRPCMenu(_network: string): Promise<void> {
    const currentAccount = utilsService.getCurrentAccount();
    const currentMirror = utilsService.getCurrentMirror();
    const currentRPC = utilsService.getCurrentRPC();
    const currentBackend = utilsService.getCurrentBackend();
    const manageOptions = language.getArrayFromObject(
      'wizard.manageRPCOptions',
    );
    const defaultCfgData = configurationService.getConfiguration();
    const rpcs = defaultCfgData.rpcs;
    const rpcAction = await utilsService.defaultMultipleAsk(
      language.getText('wizard.rpcOptions'),
      manageOptions,
      false,
      {
        network: currentAccount.network,
        account: `${currentAccount.accountId} - ${currentAccount.alias}`,
        mirrorNode: currentMirror.name,
        rpc: currentRPC.name,
        backend: currentBackend?.endpoint,
      },
    );
    switch (rpcAction) {
      case language.getText('wizard.manageRPCOptions.Change'):
        await utilsService.cleanAndShowBanner();
        if (await networkWizardService.chooseRPCNetwork(_network)) {
          if (currentRPC.network === _network) await utilsService.initSDK();
          await utilsService.cleanAndShowBanner();
          await wizardService.mainMenu();
        }
        break;

      case language.getText('wizard.manageRPCOptions.List'):
        await utilsService.cleanAndShowBanner();
        utilsService.showMessage(language.getText('configuration.RPCList'));
        console.dir(
          utilsService.maskRPCs(rpcs).filter((rpc) => rpc.network === _network),
        ),
          {
            depth: null,
          };
        break;

      case language.getText('wizard.manageRPCOptions.Add'):
        await utilsService.cleanAndShowBanner();
        await this.configureRPC(_network);
        if (_network === currentAccount.network) {
          const operateWithNewAccount = await utilsService.defaultConfirmAsk(
            language.getText('configuration.askOperateWithNewRPCNode'),
            true,
          );
          if (operateWithNewAccount) {
            await networkWizardService.chooseLastRPC(_network);
            await utilsService.initSDK();
            await utilsService.cleanAndShowBanner();
            await wizardService.mainMenu();
          }
        } else {
          const rpcSelected = await utilsService.defaultConfirmAsk(
            language.getText('configuration.askRPCSelected'),
            true,
          );
          if (rpcSelected) {
            networkWizardService.setLastRPCAsSelected(_network);
          }
        }
        break;

      case language.getText('wizard.manageRPCOptions.Delete'):
        await utilsService.cleanAndShowBanner();
        await this.removeRPC(_network);
        break;

      default:
        await utilsService.cleanAndShowBanner();
        await wizardService.configurationMenu();
    }
    await this.manageRPCMenu(_network);
  }
}
