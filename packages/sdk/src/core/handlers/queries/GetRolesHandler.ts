import { Query } from '../../decorators/Query.js';
import { BaseQueryHandler } from '../BaseQueryHandler.js';
import { QueryParams, QueryResult } from '../types.js';

export interface GetRolesParams extends QueryParams {
  targetId: string;
}

export interface GetRolesResult extends QueryResult {
  roles: string[];
}

@Query('getRoles')
export class GetRolesHandler extends BaseQueryHandler<GetRolesParams, GetRolesResult> {
  constructor() {
    super('getRoles', ['function getRoles(address account) view returns (bytes32[])']);
  }

  protected mapParamsToArgs(params: GetRolesParams): unknown[] {
    return [params.targetId];
  }

  protected createResult(data: unknown): GetRolesResult {
    return {
      success: true,
      roles: Array.isArray(data) ? data.map(String) : [],
    };
  }
}
