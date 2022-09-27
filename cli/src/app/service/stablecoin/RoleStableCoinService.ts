import { language } from '../../../index.js';
import { utilsService } from '../../../index.js';
import Service from '../Service.js';
import { AccountId, ContractId, PrivateKey, SDK, StableCoinRole } from 'hedera-stable-coin-sdk';

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
    targetId: string,
    privateKey: string,
    accountId: string,
    supplierType: string,
    amount?: number,
  ): Promise<void> {
    const sdk: SDK = utilsService.getSDK();
    const role: StableCoinRole = StableCoinRole['SUPPLIER_ROLE'];
    await utilsService.showSpinner(
      sdk.grantRole(
        supplierType === 'unlimited'
          ? {
              proxyContractId: new ContractId(proxyContractId),
              targetId: new AccountId(targetId),
              privateKey: new PrivateKey(privateKey),
              accountId: new AccountId(accountId),
              role,
            }
          : {
              proxyContractId: new ContractId(proxyContractId),
              targetId: new AccountId(targetId),
              privateKey: new PrivateKey(privateKey),
              accountId: new AccountId(accountId),
              amount,
              role,
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

  public async checkSupplierRoleStableCoin(
    proxyContractId: string,
    targetId: string,
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
            proxyContractId: new ContractId(proxyContractId),
            targetId: new AccountId(targetId),
            privateKey: new PrivateKey(privateKey),
            accountId: new AccountId(accountId),
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
            proxyContractId: new ContractId(proxyContractId),
            targetId: new AccountId(targetId),
            privateKey: new PrivateKey(privateKey),
            accountId: new AccountId(accountId),
          })
          .then((response) => (respDetail = response[0])),
        {},
      );
      return respDetail;
    }
  }

  public async increaseLimitSupplierRoleStableCoin(
    proxyContractId: string,
    targetId: string,
    privateKey: string,
    accountId: string,
    amount?: number,
  ): Promise<void> {
    const sdk: SDK = utilsService.getSDK();
    await utilsService.showSpinner(
      sdk.increaseSupplierAllowance({
        proxyContractId: new ContractId(proxyContractId),
        targetId: new AccountId(targetId),
        privateKey: new PrivateKey(privateKey),
        accountId: new AccountId(accountId),
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
    targetId: string,
    privateKey: string,
    accountId: string,
    amount?: number,
  ): Promise<void> {
    const sdk: SDK = utilsService.getSDK();
    await utilsService.showSpinner(
      sdk.decreaseSupplierAllowance({
        proxyContractId: new ContractId(proxyContractId),
        targetId: new AccountId(targetId),
        privateKey: new PrivateKey(privateKey),
        accountId: new AccountId(accountId),
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
    privateKey: string,
    accountId: string,
  ): Promise<void> {
    const sdk: SDK = utilsService.getSDK();

    await utilsService.showSpinner(
      sdk.resetSupplierAllowance({
        proxyContractId: new ContractId(proxyContractId),
        targetId: new AccountId(targetId),
        privateKey: new PrivateKey(privateKey),
        accountId: new AccountId(accountId),
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
    targetId: string,
    privateKey: string,
    accountId: string,
    role: string,
  ): Promise<void> {
    const sdk: SDK = utilsService.getSDK();

    await utilsService.showSpinner(
      sdk.grantRole({
        proxyContractId: new ContractId(proxyContractId),
        targetId: new AccountId(targetId),
        privateKey: new PrivateKey(privateKey),
        accountId: new AccountId(accountId),
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
    targetId: string,
    privateKey: string,
    accountId: string,
    role: string,
  ): Promise<void> {
    const sdk: SDK = utilsService.getSDK();

    await utilsService.showSpinner(
      sdk.revokeRole({
        proxyContractId: new ContractId(proxyContractId),
        targetId: new AccountId(targetId),
        privateKey: new PrivateKey(privateKey),
        accountId: new AccountId(accountId),
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
    targetId: string,
    privateKey: string,
    accountId: string,
    role: string,
  ): Promise<void> {
    const sdk: SDK = utilsService.getSDK();

    let hasRole;
    await utilsService.showSpinner(
      sdk
        .hasRole({
          proxyContractId: new ContractId(proxyContractId),
          targetId: new AccountId(targetId),
          privateKey: new PrivateKey(privateKey),
          accountId: new AccountId(accountId),
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
      response.replace('${address}', targetId).replace('${role}', role) + '\n',
    );

    utilsService.breakLine();
  }

  public async getSupplierAllowance(
    proxyContractId: string,
    targetId: string,
    privateKey: string,
    accountId: string,
  ): Promise<void> {
    const sdk: SDK = utilsService.getSDK();
    let amount;
    await utilsService.showSpinner(
      sdk
        .supplierAllowance({
          proxyContractId: new ContractId(proxyContractId),
          targetId: new AccountId(targetId),
          privateKey: new PrivateKey(privateKey),
          accountId: new AccountId(accountId),
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
      response.replace('${address}', targetId).replace('${amount}', amount) +
        '\n',
    );
  }
}
