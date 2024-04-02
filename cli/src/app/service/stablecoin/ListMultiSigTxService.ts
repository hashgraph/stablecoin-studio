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
   * Retrieves all MultiSig transactions.
   * @param draw - Whether to draw the table.
   * @returns A promise that resolves to an array of MultiSigTransaction objects.
   */
  public async all(
    {
      pagination = new PaginationRequest(),
      draw = false,
    }: {
      pagination?: PaginationRequest;
      draw?: boolean;
    } = { pagination: new PaginationRequest(), draw: false },
  ): Promise<ListMultiSigTxResponse> {
    const multiSigTxListResponse = await this.get({
      status: undefined,
      pagination,
    });

    // Draw table if draw is true
    if (draw) {
      utilsService.drawTableListPendingMultiSig({
        multiSigTxList: multiSigTxListResponse.multiSigTxList,
        publicKey: multiSigTxListResponse.publicKey.toString(),
      });
    }
    return multiSigTxListResponse;
  }

  /**
   * Retrieves pending MultiSig transactions.
   * @param draw - Whether to draw the table.
   * @returns A promise that resolves to an array of MultiSigTransaction objects.
   */
  public async pending(
    {
      pagination = new PaginationRequest(),
      draw = false,
    }: {
      pagination?: PaginationRequest;
      draw?: boolean;
    } = { pagination: new PaginationRequest(), draw: false },
  ): Promise<ListMultiSigTxResponse> {
    const multiSigTxListResponse = await this.get({
      status: Status.Pending,
      pagination: pagination,
    });

    // Draw table if draw is true
    if (draw) {
      utilsService.drawTableListPendingMultiSig({
        multiSigTxList: multiSigTxListResponse.multiSigTxList,
        publicKey: multiSigTxListResponse.publicKey.toString(),
      });
    }
    return multiSigTxListResponse;
  }

  /**
   * Retrieves MultiSig transactions based on the provided parameters.
   * @param options - The options for retrieving MultiSig transactions.
   * @returns A promise that resolves to an array of MultiSigTransaction objects.
   */
  public async get({
    status,
    pagination,
  }: {
    status?: Status;
    pagination: PaginationRequest;
  }): Promise<ListMultiSigTxResponse> {
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
    return ListMultiSigTxResponse.fromRawMultiSigTxList({
      multiSigTxListRaw: (await getTransactionsResponse).transactions,
      publicKey,
      paginationResRaw: (await getTransactionsResponse).pagination,
    });
  }
}
