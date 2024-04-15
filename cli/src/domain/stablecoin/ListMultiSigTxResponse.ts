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
  PublicKey,
  MultiSigTransactionsViewModel,
} from '@hashgraph/stablecoin-npm-sdk';
import MultiSigTransaction from './MultiSigTransaction';
import PaginationResponse from './PaginationResponse';

export default class ListMultiSigTxResponse {
  public multiSigTxList: MultiSigTransaction[];
  public publicKey?: PublicKey;
  public pagination: PaginationResponse;

  /**
   * Represents a response object for listing multi-signature transactions.
   *
   * @param multiSigTxList - The list of multi-signature transactions.
   * @param publicKey - The public key associated with the transaction list.
   * @param pagination - The pagination response object.
   */
  constructor({
    multiSigTxList,
    publicKey,
    pagination,
  }: {
    multiSigTxList: MultiSigTransaction[];
    publicKey?: PublicKey;
    pagination: PaginationResponse;
  }) {
    this.multiSigTxList = multiSigTxList;
    this.publicKey = publicKey;
    this.pagination = pagination;
  }

  /**
   * Creates a ListMultiSigTxResponse object from raw multiSig transaction list data.
   *
   * @param multiSigTxListRaw - The raw multiSig transaction list data.
   * @param publicKey - The public key associated with the transaction list.
   * @param pagination - The pagination response object.
   * @returns A new instance of ListMultiSigTxResponse.
   */
  public static fromRawMultiSigTxList({
    multiSigTxListRaw,
    publicKey,
    paginationResRaw,
  }: {
    multiSigTxListRaw: MultiSigTransactionsViewModel['transactions'];
    publicKey?: string | PublicKey;
    paginationResRaw: MultiSigTransactionsViewModel['pagination'];
  }): ListMultiSigTxResponse {
    const multiSigTxList = multiSigTxListRaw.map((multiSigTxRaw) => {
      return new MultiSigTransaction({
        id: multiSigTxRaw.id,
        message: multiSigTxRaw.transaction_message,
        description: multiSigTxRaw.description,
        hederaAccountId: multiSigTxRaw.hedera_account_id,
        signatures: multiSigTxRaw.signatures,
        keyList: multiSigTxRaw.key_list,
        signedKeys: multiSigTxRaw.signed_keys,
        status: multiSigTxRaw.status,
        threshold: multiSigTxRaw.threshold,
      });
    });

    return new ListMultiSigTxResponse({
      multiSigTxList,
      publicKey: publicKey ? new PublicKey(publicKey) : undefined,
      pagination: new PaginationResponse({
        totalItems: paginationResRaw.totalItems,
        itemCount: paginationResRaw.itemCount,
        itemsPerPage: paginationResRaw.itemsPerPage,
        totalPages: paginationResRaw.totalPages,
        currentPage: paginationResRaw.currentPage,
      }),
    });
  }
}
