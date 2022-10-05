import { language } from '../../../index.js';
import { utilsService } from '../../../index.js';
import Service from '../Service.js';
import {
  EOAccount,
  PrivateKey,
  SDK,
  StableCoinRole,
} from 'hedera-stable-coin-sdk';
import colors from 'colors';

/**
 * Create Role Stable Coin Service
 */
export default class RoleStableCoinsService extends Service {
  constructor() {
    super('Role Stable Coin');
  }

  /**
   * give supplier role
   */
  public async giveSupplierRoleStableCoin(
    proxyContractId: string,
    tokenId: string,
    targetId: string,
    privateKey: PrivateKey,
    accountId: string,
    supplierType: string,
    amount?: number,
  ): Promise<void> {
    const sdk: SDK = utilsService.getSDK();
    const role: StableCoinRole = StableCoinRole['CASHIN_ROLE'];
    await utilsService.showSpinner(
      sdk.grantRole(
        supplierType === 'unlimited'
          ? {
              proxyContractId,
              targetId,
              account: new EOAccount(accountId, privateKey),
              role,
              tokenId,
            }
          : {
              proxyContractId,
              targetId,
              account: new EOAccount(accountId, privateKey),
              amount,
              role,
              tokenId,
            },
      ),
      {
        text: language.getText('state.loading'),
        successText: language.getText('state.loadCompleted') + '\n',
      },
    );

    console.log(language.getText('operation.success'));

    utilsService.breakLine();
  }

  public async checkCashInRoleStableCoin(
    proxyContractId: string,
    targetId: string,
    privateKey: PrivateKey,
    accountId: string,
    supplierType: string,
  ): Promise<boolean> {
    const sdk: SDK = utilsService.getSDK();

    let respDetail;

    if (supplierType === 'unlimited') {
      await utilsService.showSpinner(
        sdk
          .isUnlimitedSupplierAllowance({
            proxyContractId,
            targetId,
            account: new EOAccount(accountId, privateKey),
          })
          .then((response) => (respDetail = response[0])),
        {
          text: language.getText('state.loading'),
          successText: language.getText('state.loadCompleted') + '\n',
        },
      );
      return respDetail;
    } else {
      await utilsService.showSpinner(
        sdk
          .isLimitedSupplierAllowance({
            proxyContractId,
            targetId,
            account: new EOAccount(accountId, privateKey),
          })
          .then((response) => (respDetail = response[0])),
        {},
      );
      return respDetail;
    }
  }

  public async increaseLimitSupplierRoleStableCoin(
    proxyContractId: string,
    tokenId: string,
    targetId: string,
    privateKey: PrivateKey,
    accountId: string,
    amount?: number,
  ): Promise<void> {
    const sdk: SDK = utilsService.getSDK();
    await utilsService.showSpinner(
      sdk.increaseSupplierAllowance({
        proxyContractId,
        tokenId,
        targetId,
        account: new EOAccount(accountId, privateKey),
        amount,
      }),
      {
        text: language.getText('state.loading'),
        successText: language.getText('state.loadCompleted') + '\n',
      },
    );
    console.log(language.getText('operation.success'));

    utilsService.breakLine();
  }

  public async decreaseLimitSupplierRoleStableCoin(
    proxyContractId: string,
    tokenId: string,
    targetId: string,
    privateKey: PrivateKey,
    accountId: string,
    amount?: number,
  ): Promise<void> {
    const sdk: SDK = utilsService.getSDK();
    await utilsService.showSpinner(
      sdk.decreaseSupplierAllowance({
        proxyContractId,
        tokenId,
        targetId,
        account: new EOAccount(accountId, privateKey),
        amount,
      }),
      {
        text: language.getText('state.loading'),
        successText: language.getText('state.loadCompleted') + '\n',
      },
    );
    console.log(language.getText('operation.success'));

    utilsService.breakLine();
  }

  public async resetLimitSupplierRoleStableCoin(
    proxyContractId: string,
    targetId: string,
    privateKey: PrivateKey,
    accountId: string,
  ): Promise<void> {
    const sdk: SDK = utilsService.getSDK();

    await utilsService.showSpinner(
      sdk.resetSupplierAllowance({
        proxyContractId,
        targetId,
        account: new EOAccount(accountId, privateKey),
      }),
      {
        text: language.getText('state.loading'),
        successText: language.getText('state.loadCompleted') + '\n',
      },
    );
    console.log(language.getText('operation.success'));

    utilsService.breakLine();
  }

  public async grantRoleStableCoin(
    proxyContractId: string,
    tokenId: string,
    targetId: string,
    privateKey: PrivateKey,
    accountId: string,
    role: string,
  ): Promise<void> {
    const sdk: SDK = utilsService.getSDK();

    await utilsService.showSpinner(
      sdk.grantRole({
        proxyContractId,
        tokenId,
        targetId,
        account: new EOAccount(accountId, privateKey),
        role: StableCoinRole[role],
      }),
      {
        text: language.getText('state.loading'),
        successText: language.getText('state.loadCompleted') + '\n',
      },
    );

    console.log(language.getText('operation.success'));
    utilsService.breakLine();
  }

  public async revokeRoleStableCoin(
    proxyContractId: string,
    tokenId: string,
    targetId: string,
    privateKey: PrivateKey,
    accountId: string,
    role: string,
  ): Promise<void> {
    const sdk: SDK = utilsService.getSDK();

    await utilsService.showSpinner(
      sdk.revokeRole({
        proxyContractId,
        tokenId,
        targetId,
        account: new EOAccount(accountId, privateKey),
        role: StableCoinRole[role],
      }),
      {
        text: language.getText('state.loading'),
        successText: language.getText('state.loadCompleted') + '\n',
      },
    );

    console.log(language.getText('operation.success'));
    utilsService.breakLine();
  }

  public async hasRoleStableCoin(
    proxyContractId: string,
    tokenId: string,
    targetId: string,
    privateKey: PrivateKey,
    accountId: string,
    role: string,
  ): Promise<void> {
    const sdk: SDK = utilsService.getSDK();

    let hasRole;
    await utilsService.showSpinner(
      sdk
        .hasRole({
          proxyContractId,
          tokenId,
          targetId,
          account: new EOAccount(accountId, privateKey),
          role: StableCoinRole[role],
        })
        .then((response) => (hasRole = response[0])),
      {
        text: language.getText('state.loading'),
        successText: language.getText('state.loadCompleted') + '\n',
      },
    );
    let response = language.getText('roleManagement.accountNotHasRole');
    if (hasRole) {
      response = language.getText('roleManagement.accountHasRole');
    }

    console.log(
      response
        .replace('${address}', targetId)
        .replace('${role}', colors.yellow(role)) + '\n',
    );

    utilsService.breakLine();
  }

  public async getSupplierAllowance(
    proxyContractId: string,
    tokenId: string,
    targetId: string,
    privateKey: PrivateKey,
    accountId: string,
  ): Promise<void> {
    const sdk: SDK = utilsService.getSDK();
    let amount;
    await utilsService.showSpinner(
      sdk
        .supplierAllowance({
          account: new EOAccount(accountId, privateKey),
          proxyContractId,
          targetId,
          tokenId,
        })
        .then((response) => {
          amount = response[0];
        }),
      {
        text: language.getText('state.loading'),
        successText: language.getText('state.loadCompleted') + '\n',
      },
    );

    const response = language.getText('roleManagement.getAmountAllowance');
    console.log(
      response
        .replace('${address}', targetId)
        .replace('${amount}', colors.yellow(amount)) + '\n',
    );
  }
}
