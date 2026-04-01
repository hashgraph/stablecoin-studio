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

import Service from '../Service.js';
import { IImportedToken } from '../../../domain/configuration/interfaces/IImportedToken';
import { wizardService } from '../../../index';
import {
  language,
  utilsService,
  configurationService,
} from '../../../index.js';
import {
  GetRolesRequest,
  StableCoinViewModel,
} from '@hashgraph/stablecoin-npm-sdk';
import DetailsStableCoinService from './DetailsStableCoinService.js';
import { isUndefined } from 'lodash';

export default class ManageImportedTokenService extends Service {
  constructor() {
    super('Manage Imported Tokens');
  }

  public async start(): Promise<void> {
    await utilsService.cleanAndShowBanner();
    const manageOptions: Array<string> = language.getArrayFromObject(
      'wizard.manageImportedTokens',
    );
    const currentAccount = utilsService.getCurrentAccount();
    let symbol = '';
    switch (
      await utilsService.defaultMultipleAsk(
        language.getText('wizard.importedTokenMenu'),
        manageOptions,
        false,
        {
          network: currentAccount.network,
          account: `${currentAccount.accountId} - ${currentAccount.alias}`,
        },
      )
    ) {
      case language.getText('wizard.manageImportedTokens.Add'):
        await utilsService.cleanAndShowBanner();

        let tokenId = '';
        const getRolesRequestForAdding: GetRolesRequest = new GetRolesRequest({
          targetId: currentAccount.accountId,
          tokenId: '',
        });

        await utilsService.handleValidation(
          () => getRolesRequestForAdding.validate('tokenId'),
          async () => {
            tokenId = await utilsService.defaultSingleAsk(
              language.getText('manageImportedToken.tokenId'),
              '0.0.1234567',
            );
            getRolesRequestForAdding.tokenId = tokenId;
          },
        );

        const importedTokens = currentAccount.importedTokens || [];
        while (
          importedTokens.length > 0 &&
          importedTokens
            .map((x) => x.id)
            .includes(getRolesRequestForAdding.tokenId)
        ) {
          console.log(
            language.getText('manageImportedToken.importedTokenAlreadyAdded'),
          );
          tokenId = await utilsService.defaultSingleAsk(
            language.getText('manageImportedToken.tokenId'),
            '0.0.1234567',
          );
          getRolesRequestForAdding.tokenId = tokenId;
        }
        await new DetailsStableCoinService()
          .getDetailsStableCoins(getRolesRequestForAdding.tokenId, false)
          .then((response: StableCoinViewModel) => {
            symbol = response.symbol;
          });
        importedTokens.push({
          id: getRolesRequestForAdding.tokenId,
          symbol,
        });
        this.updateAccount(importedTokens);
        currentAccount.importedTokens = importedTokens;
        break;
      case language.getText('wizard.manageImportedTokens.Refresh'):
        await utilsService.cleanAndShowBanner();
        if (currentAccount.importedTokens.length === 0) {
          console.log(
            language.getText('manageImportedToken.noImportedTokensRefresh'),
          );
          await this.start();
        }
        //show list to refresh
        const tokenToRefresh = await utilsService.defaultMultipleAsk(
          language.getText('manageImportedToken.tokenToRefresh'),
          currentAccount.importedTokens.map(
            (token) => `${token.id} - ${token.symbol}`,
          ),
          true,
        );
        if (tokenToRefresh === 'Go back') {
          await this.start();
        }

        const importedTokensRefreshed = !currentAccount.importedTokens
          ? []
          : currentAccount.importedTokens.map((token) => {
              if (token.id === tokenToRefresh.split(' - ')[0]) {
                return {
                  id: token.id,
                  symbol: token.symbol,
                };
              }
              return token;
            });
        this.updateAccount(importedTokensRefreshed);
        currentAccount.importedTokens = importedTokensRefreshed;
        break;
      case language.getText('wizard.manageImportedTokens.Remove'):
        await utilsService.cleanAndShowBanner();
        if (
          isUndefined(currentAccount.importedTokens) ||
          currentAccount.importedTokens.length === 0
        ) {
          console.log(
            language.getText('manageImportedToken.noImportedTokensDelete'),
          );
          await this.start();
        }
        //show list to delete
        const tokenToDelete = await utilsService.defaultMultipleAsk(
          language.getText('manageImportedToken.tokenToDelete'),
          !currentAccount.importedTokens
            ? []
            : currentAccount.importedTokens.map(
                (token) => `${token.id} - ${token.symbol}`,
              ),
          true,
        );
        if (tokenToDelete === 'Go back') {
          await this.start();
        }
        const newImportedTokens = !currentAccount.importedTokens
          ? []
          : currentAccount.importedTokens.filter(
              (token) => token.id !== tokenToDelete.split(' - ')[0],
            );
        this.updateAccount(newImportedTokens);
        currentAccount.importedTokens = newImportedTokens;
        break;
      default:
        await utilsService.cleanAndShowBanner();
        await wizardService.mainMenu();
    }
    utilsService.showMessage(language.getText('general.newLine'));
    await this.start();
  }

  public updateAccount(importedTokens: IImportedToken[]): void {
    const defaultCfgData = configurationService.getConfiguration();
    const currentAccount = utilsService.getCurrentAccount();
    const accounts = defaultCfgData.accounts;
    const accsToUpdate = accounts.map((acc) => {
      if (
        acc.alias === currentAccount.alias &&
        acc.accountId === currentAccount.accountId
      ) {
        return {
          accountId: acc.accountId,
          type: acc.type,
          network: acc.network,
          alias: acc.alias,
          selfCustodial: acc.selfCustodial,
          importedTokens: importedTokens,
          custodial: acc.custodial,
        };
      }
      return acc;
    });
    defaultCfgData.accounts = accsToUpdate;

    configurationService.setConfiguration(defaultCfgData);
  }
}
