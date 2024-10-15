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
  configurationService,
  language,
  utilsService,
} from '../../../index.js';
import Service from '../Service.js';
import colors from 'colors';

export default class NetworkWizardService extends Service {
  constructor() {
    super('Network Wizard Service');
  }

  /**
   * Function to choose a mirror node network
   *
   * @param _network
   */
  public async chooseMirrorNodeNetwork(_network: string): Promise<boolean> {
    const configuration = configurationService.getConfiguration();
    const { mirrors } = configuration;
    const currentMirror = utilsService.getCurrentMirror();

    const selectedMirrors = mirrors.filter(
      (mirror) => _network === mirror.network && !mirror.selected,
    );

    if (selectedMirrors.length > 0) {
      const name = await utilsService.defaultMultipleAsk(
        language.getText('configuration.selectMirrorNode'),
        selectedMirrors.map((mirror) => mirror.name),
        true,
      );
      const selectedMirror = selectedMirrors.find(
        (mirror) => name === mirror.name,
      );
      selectedMirror.selected = true;

      mirrors
        .filter(
          (mirror) =>
            _network === mirror.network && mirror.name !== selectedMirror.name,
        )
        .forEach((found) => (found.selected = false));

      configuration.mirrors = mirrors;
      configurationService.setConfiguration(configuration);

      if (currentMirror.network === _network) {
        utilsService.setCurrentMirror(selectedMirror);
      }

      return true;
    }
    utilsService.showMessage(
      language.getText('configuration.mirrorNodeNotToChange'),
    );
    return false;
  }

  /**
   * Function to choose a rpc network
   *
   * @param _network
   */
  public async chooseRPCNetwork(_network: string): Promise<boolean> {
    const configuration = configurationService.getConfiguration();
    const { rpcs } = configuration;
    const currentRPC = utilsService.getCurrentRPC();
    const selectedRPCs = rpcs.filter(
      (rpc) => _network === rpc.network && !rpc.selected,
    );

    if (selectedRPCs.length > 0) {
      const name = await utilsService.defaultMultipleAsk(
        language.getText('configuration.selectRPC'),
        selectedRPCs.map((rpc) => rpc.name),
        true,
      );
      const selectedRPC = selectedRPCs.find((rpc) => name === rpc.name);
      selectedRPC.selected = true;

      rpcs
        .filter((rpc) => _network === rpc.network && rpc.name !== name)
        .forEach((found) => {
          found.selected = false;
        });

      configuration.rpcs = rpcs;
      configurationService.setConfiguration(configuration);

      if (currentRPC.network === _network)
        utilsService.setCurrentRPC(selectedRPC);

      return true;
    }
    utilsService.showMessage(
      colors.yellow(language.getText('configuration.RPCNotToChange')),
    );
    return false;
  }

  /**
   * Function to choose last mirror node network
   *
   * @param _network
   */
  public async chooseLastMirrorNode(_network: string): Promise<void> {
    const configuration = configurationService.getConfiguration();
    const { mirrors } = configuration;
    const lastMirror = mirrors[mirrors.length - 1];
    utilsService.setCurrentMirror(lastMirror);
    await this.setLastMirrorNodeAsSelected(_network);
  }

  /**
   * Function to choose last mirror node network as selected
   *
   * @param _network
   */
  public async setLastMirrorNodeAsSelected(_network: string): Promise<void> {
    const configuration = configurationService.getConfiguration();
    const { mirrors } = configuration;
    const lastMirror = mirrors[mirrors.length - 1];
    mirrors
      .filter(
        (mirror) => mirror.network === _network && mirror.selected === true,
      )
      .forEach((found) => {
        found.selected = false;
      });
    lastMirror.selected = true;

    configuration.mirrors = mirrors;
    configurationService.setConfiguration(configuration);
  }

  /**
   * Function to choose last rpc network
   *
   * @param _network
   */
  public async chooseLastRPC(_network: string): Promise<void> {
    const configuration = configurationService.getConfiguration();
    const { rpcs } = configuration;
    const lastRPC = rpcs[rpcs.length - 1];
    utilsService.setCurrentRPC(lastRPC);
    await this.setLastRPCAsSelected(_network);
  }

  /**
   * Function to choose last rpc network as selected
   *
   * @param _network
   */
  public async setLastRPCAsSelected(_network: string): Promise<void> {
    const configuration = configurationService.getConfiguration();
    const { rpcs } = configuration;
    const lastRPC = rpcs[rpcs.length - 1];
    rpcs
      .filter((rpc) => rpc.network === _network && rpc.selected === true)
      .forEach((found) => {
        found.selected = false;
      });
    lastRPC.selected = true;

    configuration.rpcs = rpcs;
    configurationService.setConfiguration(configuration);
  }
}
