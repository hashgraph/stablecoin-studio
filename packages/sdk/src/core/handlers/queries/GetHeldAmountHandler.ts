import { Query } from '../../decorators/Query.js';
import { BaseQueryHandler } from '../BaseQueryHandler.js';
import { QueryParams, QueryResult } from '../types.js';

export interface GetHeldAmountParams extends QueryParams {
  targetId: string;
}

export interface GetHeldAmountResult extends QueryResult {
  amount: string;
}

@Query('getHeldAmount')
export class GetHeldAmountHandler extends BaseQueryHandler<GetHeldAmountParams, GetHeldAmountResult> {
  constructor() {
    super('getHeldAmountFor', ['function getHeldAmountFor(address account) view returns (uint256)']);
  }

  protected mapParamsToArgs(params: GetHeldAmountParams): unknown[] {
    return [params.targetId];
  }

  protected createResult(data: unknown): GetHeldAmountResult {
    return {
      success: true,
      amount: String(data),
    };
  }
}
