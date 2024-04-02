import Service from '../Service.js';
import { wizardService } from '../../../index';
import { language, utilsService } from '../../../index.js';
import MultiSigTransaction, {
  Status,
} from '../../../domain/stablecoin/MultiSigTransaction.js';
import ListMultiSigTxService from './ListMultiSigTxService.js';
import { Account, GetPublicKeyRequest } from '@hashgraph/stablecoin-npm-sdk';
import ListMultiSigTxResponse from '../../../domain/stablecoin/ListMultiSigTxResponse.js';
import PaginationRequest from '../../../domain/stablecoin/PaginationRequest.js';

export default class ManageMultiSigTxService extends Service {
  status?: Status;
  constructor() {
    super('Manage MultiSig Transactions Actions');
  }

  /**
   * Starts the process of managing MultiSig transactions.
   *
   * @param multiSigTxListResponse - The response containing the list of MultiSig transactions.
   * @param status - The status of the MultiSig transactions.
   * @returns A Promise that resolves when the process is complete.
   */
  public async start(
    {
      multiSigTxListResponse,
      status,
    }: {
      multiSigTxListResponse?: ListMultiSigTxResponse;
      status: Status;
    } = { status: this.status || Status.Pending },
  ): Promise<void> {
    this.status = status;
    // Get the list of MultiSig transactions
    if (!multiSigTxListResponse || !multiSigTxListResponse.multiSigTxList) {
      multiSigTxListResponse = await new ListMultiSigTxService().get({
        status,
        pagination: new PaginationRequest(),
      });
    }
    const multiSigTxList = multiSigTxListResponse.multiSigTxList;
    const publicKey = multiSigTxListResponse.publicKey.toString();
    const pagination = multiSigTxListResponse.pagination;
    // Id transaction list
    const txIdListAsOptions = (
      multiSigTxList.map((tx) => tx.id) as string[]
    ).concat(['previous', 'next']);
    // TODO: set in language
    const selectedOption = await utilsService.defaultMultipleAsk(
      language.getText('wizard.multiSig.listMenuTitle'),
      txIdListAsOptions,
      true,
    );

    // If the user selects "Go Back", return to the main menu
    if (selectedOption === language.getText('wizard.backOption')) {
      await wizardService.mainMenu();
    }
    if (selectedOption === 'previous') {
      // Get the previous page of the MultiSig transaction list
      await this.start({
        multiSigTxListResponse: await new ListMultiSigTxService().get({
          status,
          pagination: pagination.previous(),
        }),
        status,
      });
    }
    if (selectedOption === 'next') {
      // Get the next page of the MultiSig transaction list
      await this.start({
        multiSigTxListResponse: await new ListMultiSigTxService().get({
          status,
          pagination: pagination.next(),
        }),
        status,
      });
    }
    // Start the actions menu for the selected MultiSig transaction
    this.multiSigTxActions({
      multiSigTx: multiSigTxList.find((tx) => tx.id === selectedOption),
      publicKey,
    });

    // Get the selected MultiSig transaction
    utilsService.showMessage(language.getText('general.newLine'));
    await this.start();
  }

  public async multiSigTxActions({
    multiSigTx,
    publicKey,
  }: {
    multiSigTx: MultiSigTransaction;
    publicKey?: string;
  }) {
    const currentAccount = utilsService.getCurrentAccount();
    const publicKeyFromHederaAccount = Account.getPublicKey(
      new GetPublicKeyRequest({
        account: { accountId: currentAccount.accountId },
      }),
    );
    publicKey = publicKey || (await publicKeyFromHederaAccount).toString();
    const actions = language.getArrayFromObject('wizard.multiSig.txActions');
    // * Remove actions that are not allowed based on the status of the MultiSig transaction
    // Remove the "Submit" action if the MultiSig transaction is pending
    if (multiSigTx.status === Status.Pending) {
      actions.splice(
        actions.indexOf(language.getText('wizard.multiSig.txActions.submit')),
        1,
      );
    }
    // Remove the "Sign" action if is signed with this account key
    if (multiSigTx.signedKeys.includes(publicKey)) {
      actions.splice(
        actions.indexOf(language.getText('wizard.multiSig.txActions.sign')),
        1,
      );
    }

    const selectedAction = await utilsService.defaultMultipleAsk(
      language.getText('wizard.multiSig.txActions.title'),
      actions,
      true,
    );
    switch (selectedAction) {
      case language.getText('wizard.multiSig.txActions.sign'):
        this.sign(multiSigTx);
        break;
      case language.getText('wizard.multiSig.txActions.submit'):
        this.submit(multiSigTx);
        break;
      case language.getText('wizard.multiSig.txActions.remove'):
        this.remove(multiSigTx);
        break;
      case language.getText('wizard.multiSig.txActions.details'):
        this.details(multiSigTx);
        break;
      default:
        // Go Back
        this.start();
        break;
    }
  }

  private async sign(multiSigTx: MultiSigTransaction) {
    if (multiSigTx.status === Status.Signed) {
      throw new Error('The transaction is already signed.');
    }
    console.info(language.getText('wizard.multiSig.txActions.signing'));
    // TODO: Sign the MultiSig transaction
    console.info(language.getText('wizard.multiSig.txActions.signed'));

    this.multiSigTxActions({ multiSigTx });
  }

  private async submit(multiSigTx: MultiSigTransaction) {
    return multiSigTx;
    // Submit the MultiSig transaction
  }

  private async remove(multiSigTx: MultiSigTransaction) {
    return multiSigTx;
    // Remove the MultiSig transaction
  }

  private async details(multiSigTx: MultiSigTransaction) {
    console.info(JSON.stringify(multiSigTx, undefined, 2));
    let selectedAction: string;
    do {
      selectedAction = await utilsService.defaultMultipleAsk('', [], true);
    } while (selectedAction !== language.getText('wizard.backOption'));
    // When pressing "Go Back", return to the previous menu
    this.multiSigTxActions({ multiSigTx });
  }
}
