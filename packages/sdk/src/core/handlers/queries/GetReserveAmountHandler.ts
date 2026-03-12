import { Query } from '../../decorators/Query.js';
import { BaseQueryHandler } from '../BaseQueryHandler.js';
import { QueryParams, QueryResult } from '../types.js';

export interface GetReserveAmountResult extends QueryResult {
  amount: string;
}

@Query('getReserveAmount')
export class GetReserveAmountHandler extends BaseQueryHandler<QueryParams, GetReserveAmountResult> {
  constructor() {
    super('getReserveAmount', ['function getReserveAmount() view returns (uint256)']);
  }

  protected mapParamsToArgs(): unknown[] {
    return [];
  }

  protected createResult(data: unknown): GetReserveAmountResult {
    return {
      success: true,
      amount: String(data),
    };
  }
}
