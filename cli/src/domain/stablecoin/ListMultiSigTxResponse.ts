import {
  PublicKey,
  MultiSigTransactionsViewModel,
} from '@hashgraph/stablecoin-npm-sdk';
import MultiSigTransaction from './MultiSigTransaction';
import PaginationResponse from './PaginationResponse';

export default class ListMultiSigTxResponse {
  public multiSigTxList: MultiSigTransaction[];
  public publicKey: PublicKey;
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
    publicKey: PublicKey;
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
    publicKey: string | PublicKey;
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
      publicKey: new PublicKey(publicKey),
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
