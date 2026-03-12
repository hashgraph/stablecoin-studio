/*
 *
 * Hedera Stablecoin SDK
 *
 * Copyright (C) 2023 Hedera Hashgraph, LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 *
 */

import { BaseQueryHandler } from '../../../core/handlers/BaseQueryHandler.js';
import { QueryParams, QueryResult } from '../../../core/handlers/types.js';

// Handler concreto de prueba
interface TestQueryParams extends QueryParams {
  targetId: string;
}

interface TestQueryResult extends QueryResult {
  balance: string;
}

class TestQueryHandler extends BaseQueryHandler<TestQueryParams, TestQueryResult> {
  constructor() {
    super('balanceOf', ['function balanceOf(address account) view returns (uint256)']);
  }

  protected mapParamsToArgs(params: TestQueryParams): unknown[] {
    return [params.targetId];
  }

  protected createResult(data: unknown, _params: TestQueryParams): TestQueryResult {
    return {
      success: true,
      balance: String(data),
    };
  }
}

// Handler sin params extra (como getBurnableAmount)
class NoExtraParamsHandler extends BaseQueryHandler<QueryParams, TestQueryResult> {
  constructor() {
    super('getBurnableAmount', ['function getBurnableAmount() view returns (uint256)']);
  }

  protected mapParamsToArgs(): unknown[] {
    return [];
  }

  protected createResult(data: unknown): TestQueryResult {
    return { success: true, balance: String(data) };
  }
}

describe('BaseQueryHandler', () => {
  let handler: TestQueryHandler;

  beforeEach(() => {
    handler = new TestQueryHandler();
  });

  describe('getMethodName', () => {
    it('should return the method name', () => {
      expect(handler.getMethodName()).toBe('balanceOf');
    });
  });

  describe('mapParamsToArgs (via internal access)', () => {
    it('should correctly map params for query with target', () => {
      const args = (handler as any).mapParamsToArgs({
        contractAddress: '0x123',
        targetId: '0xabc',
      });
      expect(args).toEqual(['0xabc']);
    });

    it('should return empty array for no-params query', () => {
      const noParamsHandler = new NoExtraParamsHandler();
      const args = (noParamsHandler as any).mapParamsToArgs({
        contractAddress: '0x123',
      });
      expect(args).toEqual([]);
    });
  });

  describe('createResult (via internal access)', () => {
    it('should format result correctly', () => {
      const result = (handler as any).createResult(BigInt('999'), {
        contractAddress: '0x123',
        targetId: '0xabc',
      });
      expect(result.success).toBe(true);
      expect(result.balance).toBe('999');
    });
  });

  describe('NoExtraParamsHandler', () => {
    it('should handle queries without extra params', () => {
      const noParamsHandler = new NoExtraParamsHandler();
      expect(noParamsHandler.getMethodName()).toBe('getBurnableAmount');
      const args = (noParamsHandler as any).mapParamsToArgs({ contractAddress: '0x123' });
      expect(args).toEqual([]);
    });
  });
});
