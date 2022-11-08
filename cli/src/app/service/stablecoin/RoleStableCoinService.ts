import { language } from '../../../index.js';
import { utilsService } from '../../../index.js';
import Service from '../Service.js';
import {
  AllowanceRequest,
  EOAccount,
  PrivateKey,
  SDK,
  GrantRoleRequest,
  RevokeRoleRequest,
  HasRoleRequest,
  CheckCashInRoleRequest
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
  public async giveSupplierRoleStableCoin(req: GrantRoleRequest
    /*proxyContractId: string,
    tokenId: string,
    targetId: string,
    privateKey: PrivateKey,
    accountId: string,
    supplierType: string,
    amount?: string,*/
  ): Promise<void> {
    const sdk: SDK = utilsService.getSDK();
    //const role: StableCoinRole = StableCoinRole['CASHIN_ROLE'];
    await utilsService.showSpinner(
      sdk.grantRole(
        req.supplierType === 'unlimited'
          ? req
            /*{
              /*proxyContractId,
              targetId,
              account: new EOAccount(accountId, privateKey),
              role,
              tokenId,
            }*/
          : 
          req
          /*{
              proxyContractId,
              targetId,
              account: new EOAccount(accountId, privateKey),
              amount,
              role,
              tokenId,
          },*/
      ),
      {
        text: language.getText('state.loading'),
        successText: language.getText('state.loadCompleted') + '\n',
      },
    );

    console.log(language.getText('operation.success'));

    utilsService.breakLine();
  }

  public async checkCashInRoleStableCoin(req: CheckCashInRoleRequest): Promise<boolean> {
    const sdk: SDK = utilsService.getSDK();

    let respDetail;

    if (req.supplierType === 'unlimited') {
      await utilsService.showSpinner(
        sdk
          .isUnlimitedSupplierAllowance(req)
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
          .isLimitedSupplierAllowance(req)
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
    amount?: string,
  ): Promise<void> {
    const sdk: SDK = utilsService.getSDK();
    await utilsService.showSpinner(
      sdk.increaseSupplierAllowance(
        new AllowanceRequest({
          proxyContractId,
          tokenId,
          targetId,
          account: {
            accountId,
            privateKey,
          },
          amount,
        }),
      ),
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
    amount?: string,
  ): Promise<void> {
    const sdk: SDK = utilsService.getSDK();
    await utilsService.showSpinner(
      sdk.decreaseSupplierAllowance(
        new AllowanceRequest({
          proxyContractId,
          tokenId,
          targetId,
          account: {
            accountId,
            privateKey,
          },
          amount,
        }),
      ),
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

  public async grantRoleStableCoin(req: GrantRoleRequest
  ): Promise<void> {
    const sdk: SDK = utilsService.getSDK();

    await utilsService.showSpinner(
      sdk.grantRole(req),
      {
        text: language.getText('state.loading'),
        successText: language.getText('state.loadCompleted') + '\n',
      },
    );

    console.log(language.getText('operation.success'));
    utilsService.breakLine();
  }

  public async revokeRoleStableCoin(req: RevokeRoleRequest
  ): Promise<void> {
    const sdk: SDK = utilsService.getSDK();

    await utilsService.showSpinner(
      sdk.revokeRole(req),
      {
        text: language.getText('state.loading'),
        successText: language.getText('state.loadCompleted') + '\n',
      },
    );

    console.log(language.getText('operation.success'));
    utilsService.breakLine();
  }

  public async hasRoleStableCoin(req: HasRoleRequest
  ): Promise<void> {
    const sdk: SDK = utilsService.getSDK();

    let hasRole;
    await utilsService.showSpinner(
      sdk
        .hasRole(req)
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
        .replace('${address}', req.targetId)
        .replace('${role}', colors.yellow(req.role)) + '\n',
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
          amount = response;
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

  public async getRoles(
    proxyContractId: string,
    targetId: string,
    privateKey: PrivateKey,
    accountId: string,
  ): Promise<string[]> {
    const sdk: SDK = utilsService.getSDK();
    let roles;
    await utilsService.showSpinner(
      sdk
        .getRoles({
          account: new EOAccount(accountId, privateKey),
          proxyContractId,
          targetId,
        })
        .then((response) => {
          roles = response;
        }),
      {
        text: language.getText('state.loading'),
        successText: language.getText('state.loadCompleted') + '\n',
      },
    );

    console.log(language.getText('operation.success'));
    roles.length > 0
      ? console.log(colors.yellow(roles.join(' | ')))
      : console.log(colors.red(language.getText('roleManagement.noRoles')));
    utilsService.breakLine();

    return roles;
  }
}
