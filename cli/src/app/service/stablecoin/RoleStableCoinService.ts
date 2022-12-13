import { language } from '../../../index.js';
import { utilsService } from '../../../index.js';
import Service from '../Service.js';
import {
  GrantRoleRequest,
  RevokeRoleRequest,
  HasRoleRequest,
  CheckCashInRoleRequest,
  CheckCashInLimitRequest,
  ResetCashInLimitRequest,
  IncreaseCashInLimitRequest,
  DecreaseCashInLimitRequest,
  GetRolesRequest,
  Role,
  StableCoinRole
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
    await utilsService.showSpinner(Role.grantRole(req), {
      text: language.getText('state.loading'),
      successText: language.getText('state.loadCompleted') + '\n',
    });

    console.log(language.getText('operation.success'));

    utilsService.breakLine();
  }

  public async checkCashInRoleStableCoin(
    req: CheckCashInRoleRequest,
  ): Promise<boolean> {
    let respDetail;

    if (req.supplierType === 'unlimited') {
      await utilsService.showSpinner(
        Role.Supplier.isUnlimited(req).then(
          (response) => (respDetail = response[0]),
        ),
        {
          text: language.getText('state.loading'),
          successText: language.getText('state.loadCompleted') + '\n',
        },
      );
      return respDetail;
    } else {
      await utilsService.showSpinner(
        Role.Supplier.isLimited(req).then(
          (response) => (respDetail = response[0]),
        ),
        {},
      );
      return respDetail;
    }
  }

  public async increaseLimitSupplierRoleStableCoin(
    req: IncreaseCashInLimitRequest,
  ): Promise<void> {
    await utilsService.showSpinner(Role.Supplier.increaseAllowance(req), {
      text: language.getText('state.loading'),
      successText: language.getText('state.loadCompleted') + '\n',
    });
    console.log(language.getText('operation.success'));

    utilsService.breakLine();
  }

  public async decreaseLimitSupplierRoleStableCoin(
    req: DecreaseCashInLimitRequest,
  ): Promise<void> {
    await utilsService.showSpinner(Role.Supplier.decreaseAllowance(req), {
      text: language.getText('state.loading'),
      successText: language.getText('state.loadCompleted') + '\n',
    });
    console.log(language.getText('operation.success'));

    utilsService.breakLine();
  }

  public async resetLimitSupplierRoleStableCoin(
    req: ResetCashInLimitRequest,
  ): Promise<void> {
    await utilsService.showSpinner(Role.Supplier.resetAllowance(req), {
      text: language.getText('state.loading'),
      successText: language.getText('state.loadCompleted') + '\n',
    });
    console.log(language.getText('operation.success'));

    utilsService.breakLine();
  }

  public async grantRoleStableCoin(req: GrantRoleRequest): Promise<void> {
    await utilsService.showSpinner(Role.grantRole(req), {
      text: language.getText('state.loading'),
      successText: language.getText('state.loadCompleted') + '\n',
    });

    console.log(language.getText('operation.success'));
    utilsService.breakLine();
  }

  public async revokeRoleStableCoin(req: RevokeRoleRequest): Promise<void> {
    await utilsService.showSpinner(Role.revokeRole(req), {
      text: language.getText('state.loading'),
      successText: language.getText('state.loadCompleted') + '\n',
    });

    console.log(language.getText('operation.success'));
    utilsService.breakLine();
  }

  public async hasRoleStableCoin(req: HasRoleRequest): Promise<void> {
    let hasRole;
    await utilsService.showSpinner(
      Role.hasRole(req).then((response) => (hasRole = response[0])),
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
    const roleName = Role[Object.keys(StableCoinRole)[indexOfS]];
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
    let amount;
    await utilsService.showSpinner(
      Role.Supplier.getAllowance(req).then((response) => {
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

  public async getRoles(req: GetRolesRequest): Promise<string[]> {
    let roles;
    await utilsService.showSpinner(
      Role.getRoles(req).then((response) => {
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
