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

import { configurationService, language } from './../../../index.js';
import { Command } from 'commander';
import Service from '../Service.js';
import pkg from '../../../../package.json';
import { utilsService, wizardService } from '../../../index.js';
import colors from 'colors';

/**
 * Commander Service
 */
export default class CommanderService extends Service {
  constructor() {
    super('Commander');
  }

  /**
   * This function starts the commander options
   */
  public start(): void {
    // Start commander
    const program = new Command();
    program.version(
      pkg.version,
      '-v, --version',
      language.getText('commander.version'),
    );

    program.option('-d, --debug', 'Output extra debugging');

    //* GENERAL
    program
      .name(pkg.name)
      .description(language.getText('commander.appDescription'));

    program
      .command('wizard')
      .option(
        '-cp, --config [config]',
        language.getText('commander.options.config'),
      )
      .option(
        '-n, --network [network]',
        language.getText('commander.options.network'),
      )
      .option(
        '-lv, --log-level [logLevel]',
        language.getText('commander.options.logLevel'),
      )
      .option(
        '-lp, --log-path [logPath]',
        language.getText('commander.options.logPath'),
      )
      .description(language.getText('commander.wizardDescription'))
      .action(async (options): Promise<void> => {
        // Check if default configuration exists, if not, start init command
        await configurationService.init(
          {
            defaultNetwork: options.network,
            logs:
              options.logLevel || options.logPath
                ? {
                    level: options.logLevel,
                    path: options.logPath,
                  }
                : undefined,
          },
          options.config,
        );
        let sdkInitializeError = true;
        do {
          await wizardService.chooseAccount(
            false,
            configurationService.getConfiguration().defaultNetwork,
          );
          try {
            await utilsService.initSDK();
            sdkInitializeError = false;
          } catch (error) {
            await utilsService.cleanAndShowBanner();
            console.log(
              colors.yellow(
                language.getText('wizard.mirrorNodeNotRespondedAsExpected'),
              ),
            );
            console.error(error);
          }
        } while (sdkInitializeError);

        await utilsService.cleanAndShowBanner();
        await wizardService.mainMenu();
      });

    const token = program
      .command('token')
      .description(language.getText('commander.tokenDescription'));

    token
      .command('create')
      .option(
        '-pk, --privateKey [privateKey]',
        language.getText('commander.token.options.privateKey'),
      )
      .option(
        '-a, --accountId [accountID]',
        language.getText('commander.token.options.accountId'),
      )
      .requiredOption(
        '-n, --name <name>',
        language.getText('commander.token.options.name'),
      )
      .requiredOption(
        '-s, --symbol <symbol>',
        language.getText('commander.token.options.symbol'),
      )
      .requiredOption(
        '-aracc, --autorenewAccountId <symbol>',
        language.getText('commander.token.options.autorenewAccountId'),
      )
      .option(
        '-d, --decimals [decimals]',
        language.getText('commander.token.options.decimals'),
        '18',
      )
      .description(language.getText('commander.token.createDescription'))
      .action(async function (options) {
        if (isNaN(Number(options.decimals))) {
          utilsService.showError(language.getText('general.incorrectNumber'));
          process.exit();
        }
      });

    token
      .command('info')
      .option(
        '-pk, --privateKey [privateKey]',
        language.getText('commander.token.options.privateKey'),
      )
      .requiredOption(
        '-addr, --address <address>',
        language.getText('commander.token.options.address'),
      )
      .description(language.getText('commander.token.infoDescription'))
      .action(function (token) {
        console.log(`Info about ${token}:`);
      });

    token
      .command('balance')
      .option(
        '-pk, --privateKey [privateKey]',
        language.getText('commander.token.options.privateKey'),
      )
      .option(
        '-a, --accountId [accountID]',
        language.getText('commander.token.options.accountId'),
      )
      .requiredOption(
        '-addr, --address <address>',
        language.getText('commander.token.options.address'),
      )
      .description(language.getText('commander.token.balanceDescription'))
      .action((options) => {
        console.log(`Account balance`, options);
      });

    token
      .command('cashIn')
      .option(
        '-pk, --privateKey [privateKey]',
        language.getText('commander.token.options.privateKey'),
      )
      .requiredOption(
        '-addr, --address <address>',
        language.getText('commander.token.options.address'),
      )
      .requiredOption(
        '-a, --amount <amount>',
        language.getText('commander.token.options.amount'),
      )
      .requiredOption(
        '-acc, --accountId <accountId>',
        language.getText('commander.token.options.accountId'),
      )
      .description(language.getText('commander.token.mintDescription'))
      .action(function (address, amount, to) {
        console.log(`Minting ${amount} of ${address} to ${to}`);
      });

    const admin = program
      .command('admin')
      .description(language.getText('commander.admin.mainDescription'));

    const adminToken = admin
      .command('token')
      .description(language.getText('commander.admin.token.description'));

    admin
      .command('accounts')
      .description(language.getText('commander.admin.accountsDescription'))
      .action(() => {
        console.log(`Account List:`);
      });

    admin
      .command('tokens')
      .description(language.getText('commander.admin.tokensDescription'))
      .action(() => {
        console.log(`Tokens List:`);
      });

    adminToken
      .command('accounts')
      .description(
        language.getText('commander.admin.token.accountsDescription'),
      )
      .action(() => {
        console.log(`Account List:`);
      });

    adminToken
      .command('tokens')
      .description(language.getText('commander.admin.token.tokensDescription'))
      .action(() => {
        console.log(`Account List:`);
      });

    program.parse(process.argv);
  }
}
