import { language } from '../../../index.js';
import { utilsService } from '../../../index.js';
import Service from '../Service.js';
import { SDK } from 'hedera-stable-coin-sdk';

/**
 * Create Stable Coin Service
 */
export default class SupplierRoleStableCoinsService extends Service {
  constructor() {
    super('Supplier Role Stable Coin');
  }

  /**
   * give supplier role
   */
  public async giveSupplierRoleStableCoin(
    treasuryId: string,
    address: string,
    privateKey: string,
    accountId: string,
    supplierType: string,
    amount?: number,
  ): Promise<void> {
    const sdk: SDK = utilsService.getSDK();

    await utilsService.showSpinner(
      sdk.grantSupplierRole(
        supplierType === 'unlimited'
          ? { treasuryId, address, privateKey, accountId }
          : { treasuryId, address, privateKey, accountId, amount },
      ),
      {
        text: language.getText('state.loading'),
        successText: language.getText('state.loadCompleted') + '\n',
      },
    );

    console.log(language.getText('operation.success'));

    utilsService.breakLine();
  }

  public async revokeSupplierRoleStableCoin(
    treasuryId: string,
    address: string,
    privateKey: string,
    accountId: string,
    supplierType: string,
  ): Promise<void> {
    const sdk: SDK = utilsService.getSDK();

    if (supplierType === 'unlimited') {
      await utilsService.showSpinner(
        sdk.revokeUnlimitedSupplierRole({
          treasuryId,
          address,
          privateKey,
          accountId,
        }),
        {
          text: language.getText('state.loading'),
          successText: language.getText('state.loadCompleted') + '\n',
        },
      );
    } else {
      await utilsService.showSpinner(
        sdk.revokeSupplierRole({ treasuryId, address, privateKey, accountId }),
        {
          text: language.getText('state.loading'),
          successText: language.getText('state.loadCompleted') + '\n',
        },
      );
    }

    console.log(language.getText('operation.success'));
    utilsService.breakLine();
  }

  public async checkSupplierRoleStableCoin(
    treasuryId: string,
    address: string,
    privateKey: string,
    accountId: string,
    supplierType: string,
  ): Promise<boolean> {
    const sdk: SDK = utilsService.getSDK();

    let respDetail;

    if (supplierType === 'unlimited') {
      await utilsService.showSpinner(
        sdk
          .isUnlimitedSupplierAllowance({
            treasuryId,
            address,
            privateKey,
            accountId,
          })
          .then((response) => (respDetail = response)),
        {
          text: language.getText('state.loading'),
          successText: language.getText('state.loadCompleted') + '\n',
        },
      );
      return respDetail[0];
    } else {
      await utilsService.showSpinner(
        sdk
          .isLimitedSupplierAllowance({
            treasuryId,
            address,
            privateKey,
            accountId,
          })
          .then((response) => (respDetail = response)),
        {
          text: language.getText('state.loading'),
          successText: language.getText('state.loadCompleted') + '\n',
        },
      );
      return respDetail[0];
    }
  }

  public async editSupplierRoleStableCoin(
    treasuryId: string,
    address: string,
    privateKey: string,
    accountId: string,
    supplierAction: string,
    amount?: number,
  ): Promise<void> {
    const sdk: SDK = utilsService.getSDK();

    if (supplierAction === 'Reset limit') {
      await utilsService.showSpinner(
        sdk.resetSupplierAllowance({
          treasuryId,
          address,
          privateKey,
          accountId,
        }),
        {
          text: language.getText('state.loading'),
          successText: language.getText('state.loadCompleted') + '\n',
        },
      );
    } else if (supplierAction === 'Increase limit') {
      await utilsService.showSpinner(
        sdk.increaseSupplierAllowance({
          treasuryId,
          address,
          privateKey,
          accountId,
          amount,
        }),
        {
          text: language.getText('state.loading'),
          successText: language.getText('state.loadCompleted') + '\n',
        },
      );
    } else if (supplierAction === 'Decrease limit') {
      await utilsService.showSpinner(
        sdk.decreaseSupplierAllowance({
          treasuryId,
          address,
          privateKey,
          accountId,
          amount,
        }),
        {
          text: language.getText('state.loading'),
          successText: language.getText('state.loadCompleted') + '\n',
        },
      );
    }

    console.log(language.getText('operation.success'));

    utilsService.breakLine();
  }
}
