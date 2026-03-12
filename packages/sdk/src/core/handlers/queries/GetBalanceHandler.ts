import { Query } from '../../decorators/Query.js';
import { BaseQueryHandler } from '../BaseQueryHandler.js';
import { QueryParams, QueryResult } from '../types.js';

export interface GetBalanceParams extends QueryParams {
  targetId: string;
}

export interface GetBalanceResult extends QueryResult {
  balance: string;
}

@Query('getBalance')
export class GetBalanceHandler extends BaseQueryHandler<GetBalanceParams, GetBalanceResult> {
  constructor() {
    super('balanceOf', ['function balanceOf(address account) view returns (uint256)']);
  }

  protected mapParamsToArgs(params: GetBalanceParams): unknown[] {
    return [params.targetId];
  }

  protected createResult(data: unknown): GetBalanceResult {
    return {
      success: true,
      balance: String(data),
    };
  }
}
