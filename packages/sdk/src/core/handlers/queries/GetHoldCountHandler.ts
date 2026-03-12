import { Query } from '../../decorators/Query.js';
import { BaseQueryHandler } from '../BaseQueryHandler.js';
import { QueryParams, QueryResult } from '../types.js';

export interface GetHoldCountParams extends QueryParams {
  targetId: string;
}

export interface GetHoldCountResult extends QueryResult {
  count: number;
}

@Query('getHoldCount')
export class GetHoldCountHandler extends BaseQueryHandler<GetHoldCountParams, GetHoldCountResult> {
  constructor() {
    super('getHoldCountFor', ['function getHoldCountFor(address account) view returns (uint256)']);
  }

  protected mapParamsToArgs(params: GetHoldCountParams): unknown[] {
    return [params.targetId];
  }

  protected createResult(data: unknown): GetHoldCountResult {
    return {
      success: true,
      count: Number(data),
    };
  }
}
