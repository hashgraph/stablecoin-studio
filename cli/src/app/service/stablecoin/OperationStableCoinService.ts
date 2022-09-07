/* eslint-disable no-case-declarations */
import {
  StableCoinDetail,
  StableCoinList,
} from '../../../domain/stablecoin/StableCoinList.js';
import {
  language,
  utilsService,
  wizardService,
  configurationService,
} from '../../../index.js';
import Service from '../Service.js';
import DetailsStableCoinsService from './DetailsStableCoinService.js';
import { SDK } from 'hedera-stable-coin-sdk';
import BalanceOfStableCoinsService from './BalanceOfStableCoinService.js';
import CashInStableCoinsService from './CashInStableCoinService.js';
import WipeStableCoinsService from './WipeStableCoinService.js';
import SupplierRoleStableCoinsService from './SupplierRoleStableCoinService.js';
import RescueStableCoinsService from './RescueStableCoinService.js';
import { StableCoin } from '../../../domain/stablecoin/StableCoin.js';

/**
 * Operation Stable Coin Service
 */
export default class OperationStableCoinService extends Service {
  private stableCoinId;
  private treasuryStableCoinId;

  constructor(stableCoin?: StableCoin) {
    super('Operation Stable Coin');
    if (stableCoin) {
      this.stableCoinId = stableCoin.name; //TODO Cambiar name por el id que llegue en la creación del token
    }
  }

  /**
   * Start the wizard for operation a stable coin
   */
  public async start(): Promise<void> {
    const sdk: SDK = utilsService.getSDK();
    let resp: StableCoinList[];
    if (this.stableCoinId === undefined) {
      //Get list of stable coins to display
      await utilsService.showSpinner(
        sdk
          .getListStableCoin({
            privateKey:
              configurationService.getConfiguration().accounts[0].privateKey,
          })
          .then((response: StableCoinList[]) => (resp = response)),
        {
          text: language.getText('state.searching'),
          successText: language.getText('state.searchingSuccess') + '\n',
        },
      );

      this.stableCoinId = await utilsService.defaultMultipleAsk(
        language.getText('stablecoin.askToken'),
        resp
          .map((item) => {
            return `${item.id} - ${item.symbol}`;
          })
          .concat('Exit to main menu'),
      );
      this.stableCoinId = this.stableCoinId.split(' - ')[0];

      if (this.stableCoinId === 'Exit to main menu') {
        await wizardService.mainMenu();
      } else {
        // Get details to obtain treasury
        await new DetailsStableCoinsService()
          .getDetailsStableCoins(this.stableCoinId, false)
          .then((response: StableCoinDetail) => {
            this.treasuryStableCoinId = response.memo;
          });

        await this.operationsStableCoin();
      }
    } else {
      await this.operationsStableCoin();
    }
  }

  private async operationsStableCoin(): Promise<void> {
    const wizardOperationsStableCoinOptions = language.getArray(
      'wizard.stableCoinOptions',
    );

    switch (
      await utilsService.defaultMultipleAsk(
        language.getText('stablecoin.askDoSomething') +
          ` (${this.stableCoinId})`,
        wizardOperationsStableCoinOptions,
      )
    ) {
      case wizardOperationsStableCoinOptions[0]:
        // Call to mint
        const amount2Mint = await utilsService.defaultSingleAsk(
          language.getText('stablecoin.askCashInAmount'),
          '1',
        );

        await new CashInStableCoinsService().cashInStableCoin(
          this.treasuryStableCoinId,
          configurationService.getConfiguration().accounts[0].privateKey,
          configurationService.getConfiguration().accounts[0].accountId,
          parseFloat(amount2Mint),
        );

        break;
      case wizardOperationsStableCoinOptions[1]:
        // Call to details
        await new DetailsStableCoinsService().getDetailsStableCoins(
          this.stableCoinId,
        );
        break;
      case wizardOperationsStableCoinOptions[2]:
        // Call to balance
        await utilsService.defaultSingleAsk(
          language.getText('stablecoin.askAccountToBalance'),
          configurationService.getConfiguration().accounts[0].accountId,
        );
        await new BalanceOfStableCoinsService().getBalanceOfStableCoin(
          this.treasuryStableCoinId,
          configurationService.getConfiguration().accounts[0].privateKey,
          configurationService.getConfiguration().accounts[0].accountId,
        );

        break;
      case wizardOperationsStableCoinOptions[3]:
        // Call to burn
        break;
      case wizardOperationsStableCoinOptions[4]:
        // Call to Wipe
        const amount2Wipe = await utilsService.defaultSingleAsk(
          language.getText('stablecoin.askWipeAmount'),
          '1',
        );

        await new WipeStableCoinsService().wipeStableCoin(
          this.treasuryStableCoinId,
          configurationService.getConfiguration().accounts[0].privateKey,
          configurationService.getConfiguration().accounts[0].accountId,
          parseInt(amount2Wipe),
        );

        break;
      case wizardOperationsStableCoinOptions[5]:
        // Call to Rescue
        const amount2Rescue = await utilsService.defaultSingleAsk(
          language.getText('stablecoin.askRescueAmount'),
          '1',
        );
        // TODO validation
        await new RescueStableCoinsService().rescueStableCoin(
          this.treasuryStableCoinId,
          configurationService.getConfiguration().accounts[0].privateKey,
          configurationService.getConfiguration().accounts[0].accountId,
          parseInt(amount2Rescue),
        );

        console.log(
          language
            .getText('rescue.success')
            .replace('${tokens}', amount2Rescue),
        );

        utilsService.breakLine();

        // Call to balance
        await new BalanceOfStableCoinsService().getBalanceOfStableCoin(
          this.treasuryStableCoinId,
          configurationService.getConfiguration().accounts[0].privateKey,
          configurationService.getConfiguration().accounts[0].accountId,
        );

        break;
      case wizardOperationsStableCoinOptions[6]:
        // Call to Supplier Role
        await this.supplierFlow();
        break;
      case wizardOperationsStableCoinOptions[
        wizardOperationsStableCoinOptions.length - 1
      ]:
      default:
        await wizardService.mainMenu();
    }

    await this.operationsStableCoin();
  }

  /**
   * Supplier Flow
   */
  private async supplierFlow(): Promise<void> {
    const supplierOptions = language.getArray('wizard.supplierOptions');
    const editSupplierOptions = language.getArray(
      'wizard.editSupplierRoleOptions',
    );
    let accountTarget = '0.0.0';
    let limit = '';
    const supplierService = new SupplierRoleStableCoinsService();
    const supplierRoleType = language.getArray('wizard.supplierRoleType');

    switch (
      await utilsService.defaultMultipleAsk(
        language.getText('stablecoin.askEditSupplierRole'),
        supplierOptions,
      )
    ) {
      case supplierOptions[0]:
        //Call to give role
        accountTarget = await utilsService.defaultSingleAsk(
          language.getText('stablecoin.accountTarget'),
          accountTarget,
        );
        const roleType = await utilsService.defaultMultipleAsk(
          language.getText('stablecoin.askSupplierRoleType'),
          supplierRoleType,
        );
        if (roleType === supplierRoleType[supplierRoleType.length - 1])
          await this.supplierFlow();
        if (roleType === supplierRoleType[0]) {
          //Give unlimited
          //Call to SDK
          const alreadyUnlimitedSupplierRole =
            await supplierService.checkSupplierRoleStableCoin(
              this.treasuryStableCoinId,
              accountTarget,
              configurationService.getConfiguration().accounts[0].privateKey,
              configurationService.getConfiguration().accounts[0].accountId,
              'unlimited',
            );
          if (!alreadyUnlimitedSupplierRole) {
            await supplierService.giveSupplierRoleStableCoin(
              this.treasuryStableCoinId,
              accountTarget,
              configurationService.getConfiguration().accounts[0].privateKey,
              configurationService.getConfiguration().accounts[0].accountId,
              'unlimited',
            );
          } else {
            console.log(language.getText('supplier.alreadyUnlimitedRole'));
          }
        }
        if (roleType === supplierRoleType[1]) {
          //Give limited
          limit = await utilsService.defaultSingleAsk(
            language.getText('stablecoin.supplierRoleLimit'),
            '1',
          );
          //Call to SDK
          const alreadySupplierRole =
            await supplierService.checkSupplierRoleStableCoin(
              this.treasuryStableCoinId,
              accountTarget,
              configurationService.getConfiguration().accounts[0].privateKey,
              configurationService.getConfiguration().accounts[0].accountId,
              'limited',
            );
          if (!alreadySupplierRole) {
            await supplierService.giveSupplierRoleStableCoin(
              this.treasuryStableCoinId,
              accountTarget,
              configurationService.getConfiguration().accounts[0].privateKey,
              configurationService.getConfiguration().accounts[0].accountId,
              'limited',
              parseInt(limit),
            );
          } else {
            console.log(language.getText('supplier.alreadyRole'));
          }
        }

        break;
      case supplierOptions[1]:
        //Call to revoke role
        accountTarget = await utilsService.defaultSingleAsk(
          language.getText('stablecoin.accountTarget'),
          accountTarget,
        );
        //Call to SDK
        await supplierService.revokeSupplierRoleStableCoin(
          this.treasuryStableCoinId,
          accountTarget,
          configurationService.getConfiguration().accounts[0].privateKey,
          configurationService.getConfiguration().accounts[0].accountId,
        );
        break;
      case supplierOptions[2]:
        //Call to edit role
        const editOption = await utilsService.defaultMultipleAsk(
          language.getText('stablecoin.askEditSupplierRole'),
          editSupplierOptions,
        );
        console.log(editOption);
        if (editOption === editSupplierOptions[editSupplierOptions.length - 1])
          await this.supplierFlow();
        if (editOption === editSupplierOptions[0]) {
          //Increase limit
          accountTarget = await utilsService.defaultSingleAsk(
            language.getText('stablecoin.accountTarget'),
            accountTarget,
          );
          limit = await utilsService.defaultSingleAsk(
            language.getText('stablecoin.amountIncrease'),
            '1',
          );
          //Call to SDK
          const alreadySupplierRole =
            await supplierService.checkSupplierRoleStableCoin(
              this.treasuryStableCoinId,
              accountTarget,
              configurationService.getConfiguration().accounts[0].privateKey,
              configurationService.getConfiguration().accounts[0].accountId,
              'limited',
            );
          if (alreadySupplierRole) {
            await supplierService.editSupplierRoleStableCoin(
              this.treasuryStableCoinId,
              accountTarget,
              configurationService.getConfiguration().accounts[0].privateKey,
              configurationService.getConfiguration().accounts[0].accountId,
              editOption,
              parseInt(limit),
            );
          } else {
            console.log(language.getText('supplier.notRole'));
          }
        }
        if (editOption === editSupplierOptions[1]) {
          //Decrease limit
          accountTarget = await utilsService.defaultSingleAsk(
            language.getText('stablecoin.accountTarget'),
            accountTarget,
          );
          limit = await utilsService.defaultSingleAsk(
            language.getText('stablecoin.amountDecrease'),
            '1',
          );
          //Call to SDK
          const alreadySupplierRole =
            await supplierService.checkSupplierRoleStableCoin(
              this.treasuryStableCoinId,
              accountTarget,
              configurationService.getConfiguration().accounts[0].privateKey,
              configurationService.getConfiguration().accounts[0].accountId,
              'limited',
            );
          if (alreadySupplierRole) {
            await supplierService.editSupplierRoleStableCoin(
              this.treasuryStableCoinId,
              accountTarget,
              configurationService.getConfiguration().accounts[0].privateKey,
              configurationService.getConfiguration().accounts[0].accountId,
              editOption,
              parseInt(limit),
            );
          } else {
            console.log(language.getText('supplier.notRole'));
          }
        }
        if (editOption === editSupplierOptions[2]) {
          //Reset
          accountTarget = await utilsService.defaultSingleAsk(
            language.getText('stablecoin.accountTarget'),
            accountTarget,
          );
          //Call to SDK
          const alreadySupplierRole =
            await supplierService.checkSupplierRoleStableCoin(
              this.treasuryStableCoinId,
              accountTarget,
              configurationService.getConfiguration().accounts[0].privateKey,
              configurationService.getConfiguration().accounts[0].accountId,
              'limited',
            );
          if (alreadySupplierRole) {
            await supplierService.editSupplierRoleStableCoin(
              this.treasuryStableCoinId,
              accountTarget,
              configurationService.getConfiguration().accounts[0].privateKey,
              configurationService.getConfiguration().accounts[0].accountId,
              editOption,
              0,
            );
          } else {
            console.log(language.getText('supplier.notRole'));
          }
        }

        break;
      case supplierOptions[supplierOptions.length - 1]:
      default:
        await this.operationsStableCoin();
    }
    await this.supplierFlow();
  }
}
