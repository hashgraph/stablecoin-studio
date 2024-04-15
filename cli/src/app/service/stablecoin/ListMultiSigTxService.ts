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
  GetTransactionsRequest,
  PublicKey,
  StableCoin,
} from '@hashgraph/stablecoin-npm-sdk';
import Service from '../Service.js';
import { language } from '../../../index.js';
import { utilsService } from '../../../index.js';
import { Status } from '../../../domain/stablecoin/MultiSigTransaction.js';
import ListMultiSigTxResponse from '../../../domain/stablecoin/ListMultiSigTxResponse.js';
import PaginationRequest from '../../../domain/stablecoin/PaginationRequest.js';
import { AccountType } from '../../../domain/configuration/interfaces/AccountType.js';

/**
 * Service class for listing MultiSig transactions.
 */
export default class ListMultiSigTxService extends Service {
  constructor() {
    super('List MultiSig Transactions');
  }

  /**
   * Retrieves MultiSig transactions based on the provided parameters.
   * @param options - The options for retrieving MultiSig transactions.
   * @returns A promise that resolves to an array of MultiSigTransaction objects.
   */
  public async get(
    {
      status,
      pagination = new PaginationRequest(),
      draw = false,
    }: {
      status?: Status;
      pagination?: PaginationRequest;
      draw?: boolean;
    } = {
      status: Status.Pending,
      pagination: new PaginationRequest(),
      draw: false,
    },
  ): Promise<ListMultiSigTxResponse> {
    const currentAccount = utilsService.getCurrentAccount();
    const publicKey: PublicKey | undefined =
      currentAccount.type !== AccountType.MultiSignature
        ? await Account.getPublicKey(
            new GetPublicKeyRequest({
              account: { accountId: currentAccount.accountId },
            }),
          )
        : undefined;

    const getTransactionsResponse = StableCoin.getTransactions(
      new GetTransactionsRequest({
        publicKey: publicKey,
        account: publicKey ? undefined : currentAccount.accountId,
        status,
        page: pagination.page,
        limit: pagination.limit,
      }),
    );

    // Show spinner while fetching data
    await utilsService.showSpinner(getTransactionsResponse, {
      text: language.getText('state.searching'),
      successText: `${language.getText('state.searchingSuccess')}\n`,
    });

    // Generate MultiSigTransaction domain objects
    const multiSigTxListResponse = ListMultiSigTxResponse.fromRawMultiSigTxList(
      {
        multiSigTxListRaw: (await getTransactionsResponse).transactions,
        publicKey,
        paginationResRaw: (await getTransactionsResponse).pagination,
      },
    );

    // Draw table if draw is true
    if (draw) {
      await utilsService.drawTableListPendingMultiSig({
        multiSigTxList: multiSigTxListResponse.multiSigTxList,
      });
    }

    return multiSigTxListResponse;
  }
}
