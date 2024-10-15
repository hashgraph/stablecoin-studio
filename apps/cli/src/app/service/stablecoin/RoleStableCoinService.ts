/*
 *
 * Hedera Stablecoin CLI
 *
 * Copyright (C) 2023 Hedera Hashgraph, LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 *
 */

import { language } from '../../../index.js';
import { utilsService } from '../../../index.js';
import Service from '../Service.js';
import {
  GrantRoleRequest,
  RevokeRoleRequest,
  GrantMultiRolesRequest,
  RevokeMultiRolesRequest,
  HasRoleRequest,
  GetRolesRequest,
  Role,
  StableCoinRole,
  StableCoinRoleLabel,
  CheckSupplierLimitRequest,
  IncreaseSupplierAllowanceRequest,
  DecreaseSupplierAllowanceRequest,
  ResetSupplierAllowanceRequest,
  GetSupplierAllowanceRequest,
  GetAccountsWithRolesRequest,
} from '@hashgraph/stablecoin-npm-sdk';
import colors from 'colors';

/**
 * Create Role Stablecoin Service
 */
export default class RoleStableCoinService extends Service {
  constructor() {
    super('Role Stablecoin');
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
      await utilsService.showSpinner(
        Role.isUnlimited(req).then((response) => (respDetail = response)),
        {
          text: language.getText('state.loading'),
          successText: language.getText('state.loadCompleted') + '\n',
        },
      );
      return respDetail;
    } else {
      await utilsService.showSpinner(
        Role.isLimited(req).then((response) => (respDetail = response)),
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

  public async grantMultiRolesStableCoin(
    req: GrantMultiRolesRequest,
  ): Promise<void> {
    await utilsService.showSpinner(Role.grantMultiRoles(req), {
      text: language.getText('state.loading'),
      successText: language.getText('state.loadCompleted') + '\n',
    });

    console.log(language.getText('operation.success'));
    utilsService.breakLine();
  }

  public async revokeMultiRolesStableCoin(
    req: RevokeMultiRolesRequest,
  ): Promise<void> {
    await utilsService.showSpinner(Role.revokeMultiRoles(req), {
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
        .replace('${role}', colors.yellow(StableCoinRoleLabel.get(req.role))) +
        '\n',
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
        .replace('${amount}', colors.yellow(amount.value.toString())) + '\n',
    );
  }

  public async getRolesWithoutPrinting(
    req: GetRolesRequest,
  ): Promise<string[]> {
    const roles: string[] = await Role.getRoles(req);
    return roles.filter((role) => role !== StableCoinRole.WITHOUT_ROLE);
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
    const filteredRoles = roles.filter(
      (role) => role !== StableCoinRole.WITHOUT_ROLE,
    );
    filteredRoles.length > 0
      ? filteredRoles.forEach((role: StableCoinRole) => {
          console.log(colors.yellow(StableCoinRoleLabel.get(role)));
        })
      : console.log(colors.red(language.getText('roleManagement.noRoles')));
    utilsService.breakLine();

    return roles;
  }
  public async getAccountsWithRole(
    req: GetAccountsWithRolesRequest,
  ): Promise<string[]> {
    let accounts;
    await utilsService.showSpinner(
      Role.getAccountsWithRole(req).then((response) => {
        accounts = response;
      }),
      {
        text: language.getText('state.loading'),
        successText: language.getText('state.loadCompleted') + '\n',
      },
    );
    console.log(language.getText('operation.success'));

    accounts.length > 0
      ? accounts.forEach((account: string) => {
          console.log(colors.yellow(account));
        })
      : console.log(colors.red(language.getText('roleManagement.noRoles')));
    utilsService.breakLine();

    return accounts;
  }
}
