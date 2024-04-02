import { PublicKey } from '@hashgraph/stablecoin-npm-sdk';
import MultiSigTransaction from './MultiSigTransaction';

export default class ListMultiSigTxResponse {
  public multiSigTxList: MultiSigTransaction[];
  public publicKey: PublicKey;
  public pagination: {
    page: number;
    limit: number;
  };

  constructor(
    multiSigTxList: MultiSigTransaction[],
    publicKey: PublicKey,
    pagination?: { page: number; limit: number },
  ) {
    this.multiSigTxList = multiSigTxList;
    this.publicKey = publicKey;
    this.pagination = pagination;
  }

  public static fromRawMultiSigTxList({
    multiSigTxListRaw,
    publicKey,
    pagination,
  }: {
    multiSigTxListRaw: any[];
    publicKey: string | PublicKey;
    pagination?: { page: number; limit: number };
  }): ListMultiSigTxResponse {
    const multiSigTxList = multiSigTxListRaw.map((multiSigTxRaw) => {
      return new MultiSigTransaction(
        multiSigTxRaw.id,
        multiSigTxRaw.message,
        multiSigTxRaw.description,
        multiSigTxRaw.hederaAccountId,
        multiSigTxRaw.signatures,
        multiSigTxRaw.keyList,
        multiSigTxRaw.signedKeys,
        multiSigTxRaw.status,
        multiSigTxRaw.threshold,
      );
    });

    return new ListMultiSigTxResponse(
      multiSigTxList,
      new PublicKey(publicKey),
      pagination,
    );
  }
}
