import { Query } from '../../decorators/Query.js';
import { BaseQueryHandler } from '../BaseQueryHandler.js';
import { QueryParams, QueryResult } from '../types.js';

export interface GetHoldsIdParams extends QueryParams {
  targetId: string;
  start: number;
  end: number;
}

export interface GetHoldsIdResult extends QueryResult {
  holdIds: string[];
}

@Query('getHoldsId')
export class GetHoldsIdHandler extends BaseQueryHandler<GetHoldsIdParams, GetHoldsIdResult> {
  constructor() {
    super('getHoldsIdFor', ['function getHoldsIdFor(address account, uint256 start, uint256 end) view returns (uint256[])']);
  }

  protected mapParamsToArgs(params: GetHoldsIdParams): unknown[] {
    return [params.targetId, params.start, params.end];
  }

  protected createResult(data: unknown): GetHoldsIdResult {
    return {
      success: true,
      holdIds: Array.isArray(data) ? data.map(String) : [],
    };
  }
}
