import { language } from '../../../index.js';
import { utilsService } from '../../../index.js';
import Service from '../Service.js';
import {
  EOAccount,
  PrivateKey,
  StableCoinRole,
  SDK,
  GrantRoleRequest,
  RevokeRoleRequest,
  HasRoleRequest,
  CheckCashInRoleRequest,
  CheckCashInLimitRequest,
  ResetCashInLimitRequest,
  IncreaseCashInLimitRequest,
  DecreaseCashInLimitRequest,
  Roles,
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
    req: GrantRoleRequest,
  ): Promise<void> {
    const sdk: SDK = utilsService.getSDK();
    await utilsService.showSpinner(sdk.grantRole(req), {
      text: language.getText('state.loading'),
      successText: language.getText('state.loadCompleted') + '\n',
    });

    console.log(language.getText('operation.success'));

    utilsService.breakLine();
  }

  public async checkCashInRoleStableCoin(
    req: CheckCashInRoleRequest,
  ): Promise<boolean> {
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
    req: IncreaseCashInLimitRequest,
  ): Promise<void> {
    const sdk: SDK = utilsService.getSDK();
    await utilsService.showSpinner(sdk.increaseSupplierAllowance(req), {
      text: language.getText('state.loading'),
      successText: language.getText('state.loadCompleted') + '\n',
    });
    console.log(language.getText('operation.success'));

    utilsService.breakLine();
  }

  public async decreaseLimitSupplierRoleStableCoin(
    req: DecreaseCashInLimitRequest,
  ): Promise<void> {
    const sdk: SDK = utilsService.getSDK();
    await utilsService.showSpinner(sdk.decreaseSupplierAllowance(req), {
      text: language.getText('state.loading'),
      successText: language.getText('state.loadCompleted') + '\n',
    });
    console.log(language.getText('operation.success'));

    utilsService.breakLine();
  }

  public async resetLimitSupplierRoleStableCoin(
    req: ResetCashInLimitRequest,
  ): Promise<void> {
    const sdk: SDK = utilsService.getSDK();

    await utilsService.showSpinner(sdk.resetSupplierAllowance(req), {
      text: language.getText('state.loading'),
      successText: language.getText('state.loadCompleted') + '\n',
    });
    console.log(language.getText('operation.success'));

    utilsService.breakLine();
  }

  public async grantRoleStableCoin(req: GrantRoleRequest): Promise<void> {
    const sdk: SDK = utilsService.getSDK();

    await utilsService.showSpinner(sdk.grantRole(req), {
      text: language.getText('state.loading'),
      successText: language.getText('state.loadCompleted') + '\n',
    });

    console.log(language.getText('operation.success'));
    utilsService.breakLine();
  }

  public async revokeRoleStableCoin(req: RevokeRoleRequest): Promise<void> {
    const sdk: SDK = utilsService.getSDK();

    await utilsService.showSpinner(sdk.revokeRole(req), {
      text: language.getText('state.loading'),
      successText: language.getText('state.loadCompleted') + '\n',
    });

    console.log(language.getText('operation.success'));
    utilsService.breakLine();
  }

  public async hasRoleStableCoin(req: HasRoleRequest): Promise<void> {
    const sdk: SDK = utilsService.getSDK();

    let hasRole;
    await utilsService.showSpinner(
      sdk.hasRole(req).then((response) => (hasRole = response[0])),
      {
        text: language.getText('state.loading'),
        successText: language.getText('state.loadCompleted') + '\n',
      },
    );
    let response = language.getText('roleManagement.accountNotHasRole');
    if (hasRole) {
      response = language.getText('roleManagement.accountHasRole');
    }

    const indexOfS = Object.values(StableCoinRole).indexOf(
      req.role as unknown as StableCoinRole,
    );
    const roleName = Roles[Object.keys(StableCoinRole)[indexOfS]];
    console.log(
      response
        .replace('${address}', req.targetId)
        .replace('${role}', colors.yellow(roleName)) + '\n',
    );

    utilsService.breakLine();
  }

  public async getSupplierAllowance(
    req: CheckCashInLimitRequest,
  ): Promise<void> {
    const sdk: SDK = utilsService.getSDK();
    let amount;
    await utilsService.showSpinner(
      sdk.supplierAllowance(req).then((response) => {
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
        .replace('${address}', req.targetId)
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
