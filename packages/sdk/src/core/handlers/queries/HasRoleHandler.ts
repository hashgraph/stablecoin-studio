import { Query } from '../../decorators/Query.js';
import { BaseQueryHandler } from '../BaseQueryHandler.js';
import { QueryParams, QueryResult } from '../types.js';

export interface HasRoleParams extends QueryParams {
  role: string;
  targetId: string;
}

export interface HasRoleResult extends QueryResult {
  hasRole: boolean;
}

@Query('hasRole')
export class HasRoleHandler extends BaseQueryHandler<HasRoleParams, HasRoleResult> {
  constructor() {
    super('hasRole', ['function hasRole(bytes32 role, address account) view returns (bool)']);
  }

  protected mapParamsToArgs(params: HasRoleParams): unknown[] {
    return [params.role, params.targetId];
  }

  protected createResult(data: unknown): HasRoleResult {
    return {
      success: true,
      hasRole: Boolean(data),
    };
  }
}
