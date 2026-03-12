import { Query } from '../../decorators/Query.js';
import { BaseQueryHandler } from '../BaseQueryHandler.js';
import { QueryParams, QueryResult } from '../types.js';

export interface GetAccountsWithRolesParams extends QueryParams {
  role: string;
}

export interface GetAccountsWithRolesResult extends QueryResult {
  accounts: string[];
}

@Query('getAccountsWithRoles')
export class GetAccountsWithRolesHandler extends BaseQueryHandler<GetAccountsWithRolesParams, GetAccountsWithRolesResult> {
  constructor() {
    super('getAccountsWithRole', ['function getAccountsWithRole(bytes32 role) view returns (address[])']);
  }

  protected mapParamsToArgs(params: GetAccountsWithRolesParams): unknown[] {
    return [params.role];
  }

  protected createResult(data: unknown): GetAccountsWithRolesResult {
    return {
      success: true,
      accounts: Array.isArray(data) ? data.map(String) : [],
    };
  }
}
