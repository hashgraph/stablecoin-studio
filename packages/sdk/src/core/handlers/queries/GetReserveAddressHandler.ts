import { Query } from '../../decorators/Query.js';
import { BaseQueryHandler } from '../BaseQueryHandler.js';
import { QueryParams, QueryResult } from '../types.js';

export interface GetReserveAddressResult extends QueryResult {
  reserveAddress: string;
}

@Query('getReserveAddress')
export class GetReserveAddressHandler extends BaseQueryHandler<QueryParams, GetReserveAddressResult> {
  constructor() {
    super('getReserveAddress', ['function getReserveAddress() view returns (address)']);
  }

  protected mapParamsToArgs(): unknown[] {
    return [];
  }

  protected createResult(data: unknown): GetReserveAddressResult {
    return {
      success: true,
      reserveAddress: String(data),
    };
  }
}
