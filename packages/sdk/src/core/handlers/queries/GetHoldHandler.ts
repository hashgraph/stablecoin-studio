import { Query } from '../../decorators/Query.js';
import { BaseQueryHandler } from '../BaseQueryHandler.js';
import { QueryParams, QueryResult } from '../types.js';

export interface GetHoldParams extends QueryParams {
  targetId: string;
  holdId: number;
}

export interface GetHoldResult extends QueryResult {
  hold: any;
}

@Query('getHold')
export class GetHoldHandler extends BaseQueryHandler<GetHoldParams, GetHoldResult> {
  constructor() {
    super('getHoldFor', ['function getHoldFor(address account, uint256 holdId) view returns (tuple)']);
  }

  protected mapParamsToArgs(params: GetHoldParams): unknown[] {
    return [params.targetId, params.holdId];
  }

  protected createResult(data: unknown): GetHoldResult {
    return {
      success: true,
      hold: data,
    };
  }
}
