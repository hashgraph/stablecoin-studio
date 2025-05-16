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

import { IResolversConfig } from '../../../domain/configuration/interfaces/IResolverConfig';
import Service from '../Service';
import {
  configurationService,
  language,
  utilsService,
} from '../../../index.js';
import { ZERO_ADDRESS } from '../../../core/Constants';
import {
  Network,
  SetConfigurationRequest,
} from '@hashgraph/stablecoin-npm-sdk';
import { IFactoryConfig } from '../../../domain/configuration/interfaces/IFactoryConfig';

/**
 * Set Resolver Service
 */
export default class SetResolverAndFactoryService extends Service {
  readonly URL_REG_EXP =
    /^(http(s)?:\/\/.)[-a-zA-Z0-9@:%._+~#=]{2,256}((\.[a-z]{2,6})?)\b([-a-zA-Z0-9@:%_+.~#?&//=]*)$/;

  constructor() {
    super('Set Resolver and Factory Configuration');
  }

  /**
   * Function to configure the Resolvers and factories
   */
  public async configureResolversAndFactories(): Promise<
    [IFactoryConfig[], IResolversConfig[]]
  > {
    const factories: IFactoryConfig[] = [];
    const resolvers: IResolversConfig[] = [];
    let resolver_testnet: string;
    let factory_testnet: string;
    const HederaAccountFormat = /\d\.\d\.\d/;
    do {
      factory_testnet = await utilsService.defaultSingleAsk(
        `${language.getText('configuration.askFactoryAddress')} | TESTNET`,
        ZERO_ADDRESS,
      );
      if (!HederaAccountFormat.test(factory_testnet)) {
        console.log(language.getText('validations.wrongFormatAddress'));
      }
    } while (!HederaAccountFormat.test(factory_testnet));
    do {
      resolver_testnet = await utilsService.defaultSingleAsk(
        `${language.getText('configuration.askResolverAddress')} | TESTNET`,
        ZERO_ADDRESS,
      );
      if (!HederaAccountFormat.test(resolver_testnet)) {
        console.log(language.getText('validations.wrongFormatAddress'));
      }
    } while (!HederaAccountFormat.test(resolver_testnet));

    let factory_previewnet: string;
    let resolver_previewnet: string;
    do {
      factory_previewnet = await utilsService.defaultSingleAsk(
        `${language.getText('configuration.askFactoryAddress')} | PREVIEWNET`,
        ZERO_ADDRESS,
      );
      if (!HederaAccountFormat.test(factory_previewnet)) {
        console.log(language.getText('validations.wrongFormatAddress'));
      }
    } while (!HederaAccountFormat.test(factory_previewnet));
    do {
      resolver_previewnet = await utilsService.defaultSingleAsk(
        `${language.getText('configuration.askResolverAddress')} | PREVIEWNET`,
        ZERO_ADDRESS,
      );
      if (!HederaAccountFormat.test(resolver_previewnet)) {
        console.log(language.getText('validations.wrongFormatAddress'));
      }
    } while (!HederaAccountFormat.test(resolver_previewnet));

    factories.push({
      id: factory_testnet,
      network: 'testnet',
    });
    factories.push({
      id: factory_previewnet,
      network: 'previewnet',
    });
    resolvers.push({
      id: resolver_testnet,
      network: 'testnet',
    });
    resolvers.push({
      id: resolver_previewnet,
      network: 'previewnet',
    });

    // Set the default factories
    const defaultCfgData = configurationService.getConfiguration();
    defaultCfgData.factories = factories;
    defaultCfgData.resolvers = resolvers;
    configurationService.setConfiguration(defaultCfgData);
    return [factories, resolvers];
  }

  /**
   * Function to set the sdk Resolver and factory address
   */
  public async setSDKResolverAndFactory(
    resolverId: string,
    factoryId: string,
  ): Promise<void> {
    const req = new SetConfigurationRequest({
      resolverAddress: resolverId,
      factoryAddress: factoryId,
    });
    await Network.setConfig(req);
  }

  /**
   * Function to get the sdk resolver address
   */
  public async getSDKResolver(): Promise<string> {
    return Network.getResolverAddress();
  }

  /**
   * Function to get the sdk factory address
   */
  public async getSDKFactory(): Promise<string> {
    return Network.getFactoryAddress();
  }
}
