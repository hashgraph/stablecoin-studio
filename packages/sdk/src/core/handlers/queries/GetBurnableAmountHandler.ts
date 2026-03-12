import { Query } from '../../decorators/Query.js';
import { BaseQueryHandler } from '../BaseQueryHandler.js';
import { QueryParams, QueryResult } from '../types.js';

export interface GetBurnableAmountResult extends QueryResult {
  amount: string;
}

@Query('getBurnableAmount')
export class GetBurnableAmountHandler extends BaseQueryHandler<QueryParams, GetBurnableAmountResult> {
  constructor() {
    super('getBurnableAmount', ['function getBurnableAmount() view returns (uint256)']);
  }

  protected mapParamsToArgs(): unknown[] {
    return [];
  }

  protected createResult(data: unknown): GetBurnableAmountResult {
    return {
      success: true,
      amount: String(data),
    };
  }
}
