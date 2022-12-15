import { language } from '../../../index.js';
import { utilsService } from '../../../index.js';
import Service from '../Service.js';
import {
  GrantRoleRequest,
  RevokeRoleRequest,
  HasRoleRequest,
  GetRolesRequest,
  Role,
  StableCoinRole,
  StableCoinRoleLabel,
  CheckSupplierLimitRequest,
  IncreaseSupplierAllowanceRequest,
  DecreaseSupplierAllowanceRequest,
  ResetSupplierAllowanceRequest,
  GetSupplierAllowanceRequest
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
    req: CheckSupplierLimitRequest,
  ): Promise<boolean> {
    let respDetail;

    if (req.supplierType === 'unlimited') {
      await utilsService.showSpinner(Role.isUnlimited(req).then(
          (response) => (respDetail = response)
        ),
        {
          text: language.getText('state.loading'),
          successText: language.getText('state.loadCompleted') + '\n',
        }
      );
      return respDetail;
    } else {
      await utilsService.showSpinner(
        Role.isLimited(req).then(
          (response) => (respDetail = response),
        ),
        {
          text: language.getText('state.loading'),
          successText: language.getText('state.loadCompleted') + '\n',
        },
      );
      return respDetail;
    }
  }

  public async increaseLimitSupplierRoleStableCoin(
    req: IncreaseSupplierAllowanceRequest,
  ): Promise<void> {
    await utilsService.showSpinner(Role.increaseAllowance(req), {
      text: language.getText('state.loading'),
      successText: language.getText('state.loadCompleted') + '\n',
    });
    console.log(language.getText('operation.success'));

    utilsService.breakLine();
  }

  public async decreaseLimitSupplierRoleStableCoin(
    req: DecreaseSupplierAllowanceRequest,
  ): Promise<void> {
    await utilsService.showSpinner(Role.decreaseAllowance(req), {
      text: language.getText('state.loading'),
      successText: language.getText('state.loadCompleted') + '\n',
    });
    console.log(language.getText('operation.success'));

    utilsService.breakLine();
  }

  public async resetLimitSupplierRoleStableCoin(
    req: ResetSupplierAllowanceRequest,
  ): Promise<void> {
    await utilsService.showSpinner(Role.resetAllowance(req), {
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

  public async hasRole(req: HasRoleRequest): Promise<boolean> {
    let hasRole;
    await utilsService.showSpinner(
      Role.hasRole(req).then((response) => (hasRole = response)),
      {
        text: language.getText('state.loading'),
        successText: language.getText('state.loadCompleted') + '\n',
      },
    );    
    return hasRole;
  }  

  public async hasRoleStableCoin(req: HasRoleRequest): Promise<void> {
    const hasRole = await this.hasRole(req);
    let response = language.getText('roleManagement.accountNotHasRole');
    if (hasRole) {
      response = language.getText('roleManagement.accountHasRole');
    }

    console.log(
      response
        .replace('${address}', req.targetId)
        .replace('${role}', colors.yellow(StableCoinRoleLabel.get(req.role))) + '\n',
    );

    utilsService.breakLine();
  }

  public async getSupplierAllowance(
    req: GetSupplierAllowanceRequest,
  ): Promise<void> {
    let amount;
    await utilsService.showSpinner(
      Role.getAllowance(req).then((response) => {
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
      ? roles.forEach((role: StableCoinRole) => { 
        console.log(colors.yellow(StableCoinRoleLabel.get(role)))
      })
      : console.log(colors.red(language.getText('roleManagement.noRoles')));
    utilsService.breakLine();

    return roles;
  }
}
