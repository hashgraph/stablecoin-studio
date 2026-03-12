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
