import { Query } from '../../decorators/Query.js';
import { BaseQueryHandler } from '../BaseQueryHandler.js';
import { QueryParams, QueryResult } from '../types.js';

export interface GetAllowanceParams extends QueryParams {
  targetId: string;
}

export interface GetAllowanceResult extends QueryResult {
  allowance: string;
}

@Query('getAllowance')
export class GetAllowanceHandler extends BaseQueryHandler<GetAllowanceParams, GetAllowanceResult> {
  constructor() {
    super('supplierAllowance', ['function supplierAllowance(address account) view returns (uint256)']);
  }

  protected mapParamsToArgs(params: GetAllowanceParams): unknown[] {
    return [params.targetId];
  }

  protected createResult(data: unknown): GetAllowanceResult {
    return {
      success: true,
      allowance: String(data),
    };
  }
}
