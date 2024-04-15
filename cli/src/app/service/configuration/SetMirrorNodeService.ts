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
  HEDERA_MIRROR_NODE_MAINNET_URL,
  HEDERA_MIRROR_NODE_NAME,
  HEDERA_MIRROR_NODE_PREVIEWNET_URL,
  HEDERA_MIRROR_NODE_TESTNET_URL,
} from '../../../core/Constants.js';
import {
  configurationService,
  language,
  utilsService,
  wizardService,
  networkWizardService,
} from '../../../index.js';
import Service from '../Service.js';
import { IMirrorsConfig } from 'domain/configuration/interfaces/IMirrorsConfig.js';
const colors = require('colors');

interface MirrorValidation {
  result: boolean;
  errorMsg?: string;
}

/**
 * Set Mirror Node Service
 */
export default class SetMirrorNodeService extends Service {
  readonly URL_REG_EXP =
    /^(http(s)?:\/\/.)[-a-zA-Z0-9@:%._+~#=]{2,256}((\.[a-z]{2,6})?)\b([-a-zA-Z0-9@:%_+.~#?&//=]*)$/;

  constructor() {
    super('Set Mirror Node Configuration');
  }

  /**
   * Function to configure a new mirror node
   *
   * @param _network Network to configure the mirror node
   *
   * @return Mirrors configuration
   */
  public async configureMirrorNode(
    _network?: string,
  ): Promise<IMirrorsConfig[]> {
    const configuration = configurationService.getConfiguration();
    const mirrors: IMirrorsConfig[] = configuration?.mirrors || [];
    let moreAccounts = true;

    while (moreAccounts) {
      utilsService.showMessage(
        language.getText('configuration.mirrorNodeConfigurationMessage'),
      );

      let name = await utilsService.defaultSingleAsk(
        language.getText('configuration.askName'),
        'Mirror Node',
      );
      while (
        mirrors.some(
          (mirror) => mirror.name === name && mirror.network === _network,
        )
      ) {
        utilsService.showError(
          language.getText('configuration.nameAlreadyInUse', {
            name,
          }),
        );
        name = await utilsService.defaultSingleAsk(
          language.getText('configuration.askName'),
          'Mirror Node',
        );
      }

      let baseUrl = await utilsService.defaultSingleAsk(
        language.getText('configuration.askBaseUrl'),
        'Base Url',
      );

      let mirrorValidation: MirrorValidation;
      while (
        (mirrorValidation = this.isValidMirrorNode(
          baseUrl,
          mirrors,
          _network,
        )) &&
        mirrorValidation.result == false
      ) {
        console.log(mirrorValidation.errorMsg);

        baseUrl = await utilsService.defaultSingleAsk(
          language.getText('configuration.askBaseUrl'),
          'Base Url',
        );
      }

      while (mirrors.some((mirror) => mirror.baseUrl === baseUrl)) {
        utilsService.showError(
          language.getText('configuration.baseUrlAlreadyInUse', {
            baseUrl,
          }),
        );
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

      const newMirror = {
        name: name,
        network: _network,
        baseUrl: baseUrl,
        selected: false,
        apiKey: apiKey,
        headerName: headerName,
      };
      mirrors.push(newMirror);

      utilsService.showMessage(
        language.getText('configuration.mirrorNodeAdded'),
      );
      console.dir(newMirror),
        {
          depth: null,
        };

      moreAccounts = await utilsService.defaultConfirmAsk(
        language.getText('configuration.askMoreMirrorNodes'),
        false,
      );
    }

    // Set mirrors
    configuration.mirrors = mirrors;
    configurationService.setConfiguration(configuration);
    return mirrors;
  }

  /**
   * Function to remove a mirror node
   *
   * @param _network Network to remove the mirror node
   */
  public async removeMirrorNode(_network: string): Promise<void> {
    const configuration = configurationService.getConfiguration();
    const currentMirrorNode = utilsService.getCurrentMirror();
    const mirrors: IMirrorsConfig[] = configuration?.mirrors || [];

    const options = mirrors
      .filter(
        (mirror) =>
          mirror.name !== currentMirrorNode.name && mirror.network === _network,
      )
      .map((mirror) => `${mirror.name} (${mirror.network})`);

    if (options.length > 0) {
      const optionsWithoutColors = mirrors
        .filter(
          (mirror) =>
            mirror.name !== currentMirrorNode.name &&
            mirror.network === _network,
        )
        .map((mirror) => `${mirror.name}` + ' (' + mirror.network + ')');
      let mirrorNode = await utilsService.defaultMultipleAsk(
        language.getText('configuration.mirrorNodeDelete'),
        options,
        true,
      );
      if (mirrorNode === language.getText('wizard.backOption.goBack')) {
        await this.manageMirrorNodeMenu(_network);
      }
      const AskSureRemove = await utilsService.defaultConfirmAsk(
        language.getText('configuration.askSureRemove', { mirrorNode }),
        true,
      );
      if (AskSureRemove) {
        mirrorNode = optionsWithoutColors[options.indexOf(mirrorNode)];
        const name = mirrorNode.split(' (')[0];
        const network = mirrorNode.split(' (')[1].split(')')[0];
        configuration.mirrors = mirrors.filter(
          (mirror) => mirror.name !== name || mirror.network !== network,
        );
        configurationService.setConfiguration(configuration);
        utilsService.showMessage(
          language.getText('configuration.mirrorNodeDeleted'),
        );
      }
    } else {
      utilsService.showMessage(
        colors.yellow(language.getText('configuration.noMoreMirrorNodes')),
      );
    }
  }

  /**
   * Function to get the default mirror node by network
   *
   * @param _network Network to configure the mirror node
   *
   * @return Mirrors configuration
   */
  public getDefaultMirrorByNetwork(_network: string): IMirrorsConfig {
    return {
      name: HEDERA_MIRROR_NODE_NAME,
      network: _network,
      baseUrl:
        _network === 'testnet'
          ? HEDERA_MIRROR_NODE_TESTNET_URL
          : _network === 'previewnet'
          ? HEDERA_MIRROR_NODE_PREVIEWNET_URL
          : _network === 'mainnet'
          ? HEDERA_MIRROR_NODE_MAINNET_URL
          : HEDERA_MIRROR_NODE_TESTNET_URL,
      apiKey: undefined,
      headerName: undefined,
      selected: true,
    };
  }

  /**
   * Function to configure mirror nodes
   *
   * @return Mirrors configuration
   */
  public async configureMirrors(): Promise<IMirrorsConfig[]> {
    const configuration = configurationService.getConfiguration();
    const mirrors: IMirrorsConfig[] = [];

    let moreMirrors = true;

    while (moreMirrors) {
      const network = await utilsService.defaultMultipleAsk(
        language.getText('configuration.askMirrorNetwork'),
        configuration.networks.map((acc) => acc.name),
      );

      let name = await utilsService.defaultSingleAsk(
        language.getText('configuration.askMirrorName'),
        HEDERA_MIRROR_NODE_NAME,
      );
      while (
        mirrors.filter(
          (element) => element.network === network && element.name === name,
        ).length > 0
      ) {
        console.log(language.getText('validations.duplicatedMirrorName'));
        name = await utilsService.defaultSingleAsk(
          language.getText('configuration.askMirrorName'),
          HEDERA_MIRROR_NODE_NAME,
        );
      }

      let baseUrl = await utilsService.defaultSingleAsk(
        language.getText('configuration.askMirrorUrl'),
        network === 'testnet'
          ? HEDERA_MIRROR_NODE_TESTNET_URL
          : network === 'previewnet'
          ? HEDERA_MIRROR_NODE_PREVIEWNET_URL
          : network === 'mainnet'
          ? HEDERA_MIRROR_NODE_MAINNET_URL
          : HEDERA_MIRROR_NODE_TESTNET_URL,
      );

      let mirrorValidation: MirrorValidation;
      while (
        (mirrorValidation = this.isValidMirrorNode(
          baseUrl,
          mirrors,
          network,
        )) &&
        mirrorValidation.result == false
      ) {
        console.log(mirrorValidation.errorMsg);

        baseUrl = await utilsService.defaultSingleAsk(
          language.getText('configuration.askMirrorUrl'),
          network === 'testnet'
            ? HEDERA_MIRROR_NODE_TESTNET_URL
            : network === 'previewnet'
            ? HEDERA_MIRROR_NODE_PREVIEWNET_URL
            : network === 'mainnet'
            ? HEDERA_MIRROR_NODE_MAINNET_URL
            : HEDERA_MIRROR_NODE_TESTNET_URL,
        );
      }

      const mirror = {
        name: name,
        network: network,
        baseUrl: baseUrl.slice(-1) === '/' ? baseUrl : baseUrl + '/',
        apiKey: undefined,
        headerName: undefined,
        selected: false,
      };

      if (
        await utilsService.defaultConfirmAsk(
          language.getText('configuration.askMirrorHasApiKey'),
          true,
        )
      ) {
        mirror.apiKey = await utilsService.defaultSingleAsk(
          language.getText('configuration.askMirrorApiKey'),
          undefined,
        );

        mirror.headerName = await utilsService.defaultSingleAsk(
          language.getText('configuration.askMirrorHeaderName'),
          undefined,
        );
      }

      if (
        await utilsService.defaultConfirmAsk(
          language.getText('configuration.askMirrorSelected'),
          true,
        )
      ) {
        mirror.selected = true;
        mirrors
          .filter(
            (element) =>
              element.network === mirror.network && element.selected === true,
          )
          .forEach((found) => {
            found.selected = false;
          });
      }

      mirrors.push(mirror);

      const response = await utilsService.defaultConfirmAsk(
        language.getText('configuration.askMoreMirrors'),
        true,
      );
      if (!response) {
        moreMirrors = false;
      }
    }

    const defaultCfgData = configurationService.getConfiguration();
    defaultCfgData.mirrors = mirrors;
    configurationService.setConfiguration(defaultCfgData);
    return mirrors;
  }

  /**
   * Function to check if a mirror node is valid to be included in the config file
   *
   * @param baseUrl Mirror node url
   * @param mirrors Already existing mirror nodes in config file
   * @param network Network to configure the mirror node
   */
  private isValidMirrorNode(
    baseUrl: string,
    mirrors: IMirrorsConfig[],
    network: string,
  ): MirrorValidation {
    if (!this.URL_REG_EXP.test(baseUrl))
      return {
        result: false,
        errorMsg: language.getText('validations.wrongFormatUrl'),
      };
    const urlNotRepeated =
      mirrors.filter(
        (element) => element.network === network && element.baseUrl === baseUrl,
      ).length == 0;
    if (!urlNotRepeated)
      return {
        result: false,
        errorMsg: language.getText('validations.duplicatedMirrorUrl'),
      };
    return { result: true };
  }

  /**
   * Function to manage the mirror node menu
   *
   * @param _network Network to configure the mirror node
   */
  public async manageMirrorNodeMenu(_network: string): Promise<void> {
    const currentAccount = utilsService.getCurrentAccount();
    const currentMirror = utilsService.getCurrentMirror();
    const currentRPC = utilsService.getCurrentRPC();
    const currentBackend = utilsService.getCurrentBackend();

    const manageOptions = language.getArrayFromObject(
      'wizard.manageMirrorNodeOptions',
    );
    const defaultCfgData = configurationService.getConfiguration();
    const mirrors = defaultCfgData.mirrors;
    const mirrorNodeAction = await utilsService.defaultMultipleAsk(
      language.getText('wizard.mirrorNodeOptions'),
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
    switch (mirrorNodeAction) {
      case language.getText('wizard.manageMirrorNodeOptions.Change'):
        await utilsService.cleanAndShowBanner();

        if (await networkWizardService.chooseMirrorNodeNetwork(_network)) {
          if (utilsService.getCurrentMirror().network === _network)
            await utilsService.initSDK();
          await utilsService.cleanAndShowBanner();
          await wizardService.mainMenu();
        }
        break;
      case language.getText('wizard.manageMirrorNodeOptions.List'):
        await utilsService.cleanAndShowBanner();

        utilsService.showMessage(
          language.getText('configuration.mirrorNodeList'),
        );
        console.dir(
          utilsService
            .maskMirrorNodes(mirrors)
            .filter((mirror) => mirror.network === _network),
        ),
          {
            depth: null,
          };
        break;
      case language.getText('wizard.manageMirrorNodeOptions.Add'):
        await utilsService.cleanAndShowBanner();

        await this.configureMirrorNode(_network);
        if (_network === currentAccount.network) {
          const operateWithNewAccount = await utilsService.defaultConfirmAsk(
            language.getText('configuration.askOperateWithNewMirrorNode'),
            true,
          );
          if (operateWithNewAccount) {
            await networkWizardService.chooseLastMirrorNode(_network);
            await utilsService.initSDK();
            await utilsService.cleanAndShowBanner();
            await wizardService.mainMenu();
          }
        } else {
          const mirrorSelected = await utilsService.defaultConfirmAsk(
            language.getText('configuration.askMirrorSelected'),
            true,
          );
          if (mirrorSelected) {
            networkWizardService.setLastMirrorNodeAsSelected(_network);
          }
        }
        break;
      case language.getText('wizard.manageMirrorNodeOptions.Delete'):
        await utilsService.cleanAndShowBanner();

        await this.removeMirrorNode(_network);
        break;
      default:
        await utilsService.cleanAndShowBanner();
        await wizardService.configurationMenu();
    }
    await this.manageMirrorNodeMenu(_network);
  }
}
