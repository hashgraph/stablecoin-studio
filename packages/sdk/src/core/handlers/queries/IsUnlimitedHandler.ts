import { Query } from '../../decorators/Query.js';
import { BaseQueryHandler } from '../BaseQueryHandler.js';
import { QueryParams, QueryResult } from '../types.js';

export interface IsUnlimitedParams extends QueryParams {
  targetId: string;
}

export interface IsUnlimitedResult extends QueryResult {
  isUnlimited: boolean;
}

@Query('isUnlimited')
export class IsUnlimitedHandler extends BaseQueryHandler<IsUnlimitedParams, IsUnlimitedResult> {
  constructor() {
    super('isUnlimitedSupplierAllowance', ['function isUnlimitedSupplierAllowance(address account) view returns (bool)']);
  }

  protected mapParamsToArgs(params: IsUnlimitedParams): unknown[] {
    return [params.targetId];
  }

  protected createResult(data: unknown): IsUnlimitedResult {
    return {
      success: true,
      isUnlimited: Boolean(data),
    };
  }
}
