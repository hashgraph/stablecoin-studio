import { Query } from '../../decorators/Query.js';
import { BaseQueryHandler } from '../BaseQueryHandler.js';
import { QueryParams, QueryResult, HoldData } from '../types.js';

export interface GetHoldParams extends QueryParams {
  targetId: string;
  holdId: number;
}

export interface GetHoldResult extends QueryResult {
  hold: HoldData;
}

@Query('getHold')
export class GetHoldHandler extends BaseQueryHandler<GetHoldParams, GetHoldResult> {
  constructor() {
    super('getHoldFor', ['function getHoldFor(address account, uint256 holdId) view returns (tuple(bytes32 holdId, address recipient, address notary, uint256 amount, uint256 expiration, uint256 releaseTime))']);
  }

  protected mapParamsToArgs(params: GetHoldParams): unknown[] {
    return [params.targetId, params.holdId];
  }

  protected createResult(data: unknown): GetHoldResult {
    return {
      success: true,
      hold: data as HoldData,
    };
  }
}
