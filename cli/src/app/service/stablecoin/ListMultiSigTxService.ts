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

import { language } from '../../../index.js';
import { utilsService } from '../../../index.js';
import { Status } from '../../../domain/stablecoin/MultiSigTransaction.js';
import Service from '../Service.js';
import {
  Account,
  GetPublicKeyRequest,
  GetTransactionsRequest,
  StableCoin,
} from '@hashgraph/stablecoin-npm-sdk';
import ListMultiSigTxResponse from '../../../domain/stablecoin/ListMultiSigTxResponse.js';
import PaginationRequest from '../../../domain/stablecoin/PaginationRequest.js';

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
    const publicKey = await Account.getPublicKey(
      new GetPublicKeyRequest({
        account: { accountId: currentAccount.accountId },
      }),
    );

    const getTransactionsResponse = StableCoin.getTransactions(
      new GetTransactionsRequest({
        publicKey: publicKey,
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
      utilsService.drawTableListPendingMultiSig({
        multiSigTxList: multiSigTxListResponse.multiSigTxList,
      });
    }

    return multiSigTxListResponse;
  }
}
