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
  Account,
  GetPublicKeyRequest,
  RemoveTransactionRequest,
  SignTransactionRequest,
  StableCoin,
} from '@hashgraph/stablecoin-npm-sdk';
import Service from '../Service.js';
import { wizardService } from '../../../index';
import { language, utilsService } from '../../../index.js';
import ListMultiSigTxService from './ListMultiSigTxService.js';
import MultiSigTransaction, {
  Status,
} from '../../../domain/stablecoin/MultiSigTransaction.js';
import PaginationRequest from '../../../domain/stablecoin/PaginationRequest.js';
import { AccountType } from '../../../domain/configuration/interfaces/AccountType.js';

export default class ManageMultiSigTxService extends Service {
  status?: Status;
  constructor() {
    super('Manage MultiSig Transactions Actions');
  }

  /**
   * Starts the process of managing MultiSig transactions.
   *
   * @param status - The status of the MultiSig transactions.
   * @param paginationReq - The pagination request for fetching the MultiSig transactions.
   * @param drawTable - A boolean indicating whether to draw the table of MultiSig transactions.
   * @param options - Additional options for the start method.
   */
  public async start({
    status,
    paginationReq = new PaginationRequest(),
    drawTable = true,
    options,
  }: {
    status?: Status;
    paginationReq?: PaginationRequest;
    drawTable?: boolean;
    options?: {
      clear: boolean;
    };
  } = {}): Promise<void> {
    // Clear the screen and show the banner
    if (options?.clear) {
      await utilsService.cleanAndShowBanner();
    }
    this.status = status;
    // Get and draw the list of MultiSig transactions
    const multiSigTxListResponse = await new ListMultiSigTxService().get({
      status,
      draw: drawTable,
      pagination: paginationReq,
    });
    const multiSigTxList = multiSigTxListResponse.multiSigTxList;
    const publicKey = multiSigTxListResponse.publicKey?.toString();
    const paginationRes = multiSigTxListResponse.pagination;
    // Create a list of transaction IDs as options for the user to select
    const txIdListAsOptions: string[] = multiSigTxList.map((tx) => tx.id);
    // Add 'previous' option if not on the first page
    if (paginationRes.currentPage != 1) {
      txIdListAsOptions.push(language.getText('general.previous'));
    }
    // Add 'next' option if not on the last page
    if (paginationRes.currentPage != paginationRes.totalPages) {
      txIdListAsOptions.push(language.getText('general.next'));
    }
    const selectedOption = await utilsService.defaultMultipleAsk(
      language.getText('wizard.multiSig.listMenuTitle'),
      txIdListAsOptions,
      true,
    );

    switch (selectedOption) {
      case language.getText('general.backOption'):
        await wizardService.mainMenu();
        return;
      case language.getText('general.previous'):
        await this.start({
          status,
          paginationReq: paginationRes.previous(),
        });
        return;
      case language.getText('general.next'):
        await this.start({
          status,
          paginationReq: paginationRes.next(),
        });
        return;
      default:
        await utilsService.cleanAndShowBanner();
        // Start the actions menu for the selected MultiSig transaction
        await this.multiSigTxActions({
          multiSigTx: multiSigTxList.find((tx) => tx.id === selectedOption),
          publicKey,
        });
    }
  }

  /**
   * Executes various actions related to a MultiSig transaction.
   *
   * @param multiSigTx - The MultiSig transaction object.
   * @param publicKey - The public key associated with the account. Optional, if not provided, it will be fetched from the Hedera account.
   * @returns A Promise that resolves when the action is completed.
   */
  public async multiSigTxActions({
    multiSigTx,
    publicKey,
  }: {
    multiSigTx: MultiSigTransaction;
    publicKey?: string;
  }): Promise<void> {
    const currentAccount = utilsService.getCurrentAccount();
    const publicKeyFromHederaAccount =
      currentAccount.type !== AccountType.MultiSignature
        ? await Account.getPublicKey(
            new GetPublicKeyRequest({
              account: { accountId: currentAccount.accountId },
            }),
          )
        : undefined;
    publicKey = publicKey || publicKeyFromHederaAccount?.toString();
    const signAction = language.getText(
      'wizard.multiSig.txActions.actions.sign',
    );
    const submitAction = language.getText(
      'wizard.multiSig.txActions.actions.submit',
    );
    const removeAction = language.getText(
      'wizard.multiSig.txActions.actions.remove',
    );
    const detailsAction = language.getText(
      'wizard.multiSig.txActions.actions.details',
    );
    const actions = [signAction, submitAction, removeAction, detailsAction];
    // * Remove actions that are not allowed based on the status of the MultiSig transaction
    // Remove the "Submit" action if the MultiSig transaction is pending
    if (multiSigTx.status === Status.Pending) {
      actions.splice(actions.indexOf(submitAction), 1);
    } else if (
      multiSigTx.status === Status.Expired ||
      multiSigTx.status === Status.Error
    ) {
      actions.splice(actions.indexOf(submitAction), 1);
      actions.splice(actions.indexOf(signAction), 1);
    }
    // Remove the "Sign" action if is signed with this account key
    if (multiSigTx.signedKeys.includes(publicKey)) {
      actions.splice(actions.indexOf(signAction), 1);
    }
    // Remove the "Submit" action if start date has not been reached yet
    if (new Date(multiSigTx.startDate) > new Date()) {
      actions.splice(actions.indexOf(submitAction), 1);
    }
    //* Remove actions that are not allowed based on the type of Account
    // Remove the "Sign" action if the account is multisig
    if (
      currentAccount.type === AccountType.MultiSignature &&
      actions.includes(signAction)
    ) {
      actions.splice(
        actions.indexOf(
          language.getText('wizard.multiSig.txActions.actions.sign'),
        ),
        1,
      );
    }

    const selectedAction = await utilsService.defaultMultipleAsk(
      language.getText('wizard.multiSig.txActions.title'),
      actions,
      true,
    );
    switch (selectedAction) {
      case language.getText('wizard.multiSig.txActions.actions.sign'):
        await this._sign({ multiSigTx });
        break;
      case language.getText('wizard.multiSig.txActions.actions.submit'):
        await this._submit({ multiSigTx });
        break;
      case language.getText('wizard.multiSig.txActions.actions.remove'):
        await this._remove({ multiSigTx });
        break;
      case language.getText('wizard.multiSig.txActions.actions.details'):
        await this._details({ multiSigTx });
        break;
      default:
        // Go Back
        await this.start({ options: { clear: true } });
        break;
    }
  }

  /**
   * Signs a multi-signature transaction.
   * @param multiSigTx - The multi-signature transaction to sign.
   * @returns A Promise that resolves when the signing process is complete.
   */
  private async _sign({
    multiSigTx,
  }: {
    multiSigTx: MultiSigTransaction;
  }): Promise<void> {
    try {
      console.info(language.getText('wizard.multiSig.txActions.signingTx'));
      await StableCoin.signTransaction(
        new SignTransactionRequest({
          transactionId: multiSigTx.id,
        }),
      );
      console.info(language.getText('wizard.multiSig.txActions.signedTx'));
    } catch (error) {
      console.error(
        `${language.getText('wizard.multiSig.txActions.errorSigningTx')}: ${
          error.message
        }`,
      );
    }
    console.info(language.getText('wizard.multiSig.txActions.signReturn'));
    await utilsService.confirmContinue();
    await this.start({ options: { clear: true } });
  }

  /**
   * Submits a multi-signature transaction.
   * @param multiSigTx - The multi-signature transaction to submit.
   * @throws Error if the transaction is pending.
   */
  private async _submit({
    multiSigTx,
  }: {
    multiSigTx: MultiSigTransaction;
  }): Promise<void> {
    if (multiSigTx.status === Status.Pending) {
      throw new Error('❌ The transaction is Pending.');
    }
    try {
      console.info(language.getText('wizard.multiSig.txActions.submittingTx'));
      await StableCoin.submitTransaction(
        new SignTransactionRequest({
          transactionId: multiSigTx.id,
        }),
      );
      console.info(language.getText('wizard.multiSig.txActions.submittedTx'));
    } catch (error) {
      console.error(
        `${language.getText('wizard.multiSig.txActions.errorSubmittingTx')}: ${
          error.message
        }`,
      );
    }
    console.info(language.getText('wizard.multiSig.txActions.submitReturn'));
    await utilsService.confirmContinue();
    await this.start({ options: { clear: true } });
  }

  /**
   * Removes a multi-signature transaction.
   *
   * @param multiSigTx - The multi-signature transaction to be removed.
   * @returns A Promise that resolves when the transaction is successfully removed.
   */
  private async _remove({
    multiSigTx,
  }: {
    multiSigTx: MultiSigTransaction;
  }): Promise<void> {
    console.info(language.getText('wizard.multiSig.txActions.removingTx'));
    try {
      await StableCoin.removeTransaction(
        new RemoveTransactionRequest({ transactionId: multiSigTx.id }),
      );
      console.info(language.getText('wizard.multiSig.txActions.removedTx'));
    } catch (error) {
      console.error(
        `${language.getText('wizard.multiSig.txActions.errorRemovingTx')}: ${
          error.message
        }`,
      );
    }
    console.info(language.getText('wizard.multiSig.txActions.removeReturn'));
    await utilsService.confirmContinue();
    await this.start({ options: { clear: true } });
  }

  /**
   * Displays the details of a multiSigTx and prompts for confirmation to continue.
   * When pressing "Go Back", returns to the previous menu.
   *
   * @param multiSigTx - The multiSigTx object to display details for.
   */
  private async _details({
    multiSigTx,
  }: {
    multiSigTx: MultiSigTransaction;
  }): Promise<void> {
    console.info(JSON.stringify(multiSigTx, undefined, 2));
    await utilsService.confirmContinue(
      language.getText('wizard.multiSig.txActions.detailsContinue'),
    );
    // When pressing "Go Back", return to the previous menu
    await this.multiSigTxActions({ multiSigTx });
  }
}
