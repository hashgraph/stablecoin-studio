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

import { ConfigDrivenQuery } from '../../../core/operations/ConfigDrivenQuery.js';
import { QueryConfig } from '../../../core/operations/config/configTypes.js';

describe('ConfigDrivenQuery', () => {
  // ── String transform (like getBalance) ──────────────────────────
  describe('string transform', () => {
    const config: QueryConfig = {
      name: 'getBalance', method: 'balanceOf',
      abi: 'function balanceOf(address account) view returns (uint256)',
      args: [{ param: 'targetId', type: 'address' }],
      result: { field: 'balance', transform: 'string' },
    };
    let query: ConfigDrivenQuery;

    beforeEach(() => { query = new ConfigDrivenQuery(config); });

    it('should return method name', () => {
      expect(query.getMethodName()).toBe('balanceOf');
    });

    it('should map params to args', () => {
      const args = (query as any).mapParamsToArgs({
        contractAddress: '0x123', targetId: '0xabc',
      });
      expect(args).toEqual(['0xabc']);
    });

    it('should transform result as string', () => {
      const result = (query as any).createResult(BigInt('999'));
      expect(result).toEqual({ success: true, balance: '999' });
    });
  });

  // ── Boolean transform (like hasRole) ────────────────────────────
  describe('boolean transform', () => {
    const config: QueryConfig = {
      name: 'hasRole', method: 'hasRole',
      abi: 'function hasRole(bytes32 role, address account) view returns (bool)',
      args: [
        { param: 'role', type: 'bytes32' },
        { param: 'targetId', type: 'address' },
      ],
      result: { field: 'hasRole', transform: 'boolean' },
    };
    let query: ConfigDrivenQuery;

    beforeEach(() => { query = new ConfigDrivenQuery(config); });

    it('should map multiple args', () => {
      const args = (query as any).mapParamsToArgs({
        contractAddress: '0x123', role: '0xROLE', targetId: '0xabc',
      });
      expect(args).toEqual(['0xROLE', '0xabc']);
    });

    it('should transform result as boolean (true)', () => {
      const result = (query as any).createResult(true);
      expect(result).toEqual({ success: true, hasRole: true });
    });

    it('should transform result as boolean (false)', () => {
      const result = (query as any).createResult(false);
      expect(result).toEqual({ success: true, hasRole: false });
    });
  });

  // ── Number transform (like getHoldCount) ────────────────────────
  describe('number transform', () => {
    const config: QueryConfig = {
      name: 'getHoldCount', method: 'getHoldCountFor',
      abi: 'function getHoldCountFor(address account) view returns (uint256)',
      args: [{ param: 'targetId', type: 'address' }],
      result: { field: 'count', transform: 'number' },
    };

    it('should transform result as number', () => {
      const query = new ConfigDrivenQuery(config);
      const result = (query as any).createResult(BigInt(42));
      expect(result).toEqual({ success: true, count: 42 });
    });
  });

  // ── Strings transform (like getRoles) ───────────────────────────
  describe('strings transform', () => {
    const config: QueryConfig = {
      name: 'getRoles', method: 'getRoles',
      abi: 'function getRoles(address account) view returns (bytes32[])',
      args: [{ param: 'targetId', type: 'address' }],
      result: { field: 'roles', transform: 'strings' },
    };

    it('should transform array result as strings', () => {
      const query = new ConfigDrivenQuery(config);
      const result = (query as any).createResult(['0xROLE1', '0xROLE2']);
      expect(result).toEqual({ success: true, roles: ['0xROLE1', '0xROLE2'] });
    });

    it('should handle non-array as empty array', () => {
      const query = new ConfigDrivenQuery(config);
      const result = (query as any).createResult(null);
      expect(result).toEqual({ success: true, roles: [] });
    });
  });

  // ── Raw transform (like getHold) ────────────────────────────────
  describe('raw transform', () => {
    const config: QueryConfig = {
      name: 'getHold', method: 'getHoldFor',
      abi: 'function getHoldFor(address account, uint256 holdId) view returns (tuple(bytes32 holdId, address recipient, address notary, uint256 amount, uint256 expiration, uint256 releaseTime))',
      args: [
        { param: 'targetId', type: 'address' },
        { param: 'holdId', type: 'uint256' },
      ],
      result: { field: 'hold', transform: 'raw' },
    };

    it('should pass raw data through', () => {
      const query = new ConfigDrivenQuery(config);
      const holdData = { holdId: '0x1', recipient: '0x2', amount: '100' };
      const result = (query as any).createResult(holdData);
      expect(result).toEqual({ success: true, hold: holdData });
    });

    it('should map multiple args including uint256', () => {
      const query = new ConfigDrivenQuery(config);
      const args = (query as any).mapParamsToArgs({
        contractAddress: '0x123', targetId: '0xabc', holdId: 5,
      });
      expect(args).toEqual(['0xabc', 5]);
    });
  });

  // ── No-arg query (like getBurnableAmount) ───────────────────────
  describe('no-arg query', () => {
    const config: QueryConfig = {
      name: 'getBurnableAmount', method: 'getBurnableAmount',
      abi: 'function getBurnableAmount() view returns (uint256)',
      result: { field: 'amount', transform: 'string' },
    };

    it('should return empty args array', () => {
      const query = new ConfigDrivenQuery(config);
      const args = (query as any).mapParamsToArgs({ contractAddress: '0x123' });
      expect(args).toEqual([]);
    });

    it('should transform result', () => {
      const query = new ConfigDrivenQuery(config);
      const result = (query as any).createResult(BigInt('1000'));
      expect(result).toEqual({ success: true, amount: '1000' });
    });
  });

  // ── 3-arg query (like getHoldsId) ──────────────────────────────
  describe('multi-arg query', () => {
    const config: QueryConfig = {
      name: 'getHoldsId', method: 'getHoldsIdFor',
      abi: 'function getHoldsIdFor(address account, uint256 start, uint256 end) view returns (uint256[])',
      args: [
        { param: 'targetId', type: 'address' },
        { param: 'start', type: 'uint256' },
        { param: 'end', type: 'uint256' },
      ],
      result: { field: 'holdIds', transform: 'strings' },
    };

    it('should map 3 args correctly', () => {
      const query = new ConfigDrivenQuery(config);
      const args = (query as any).mapParamsToArgs({
        contractAddress: '0x123', targetId: '0xabc', start: 0, end: 10,
      });
      expect(args).toEqual(['0xabc', 0, 10]);
    });
  });

  // ── Config array integration ────────────────────────────────────
  describe('QUERY_CONFIGS integration', () => {
    it('should instantiate all 12 config-driven queries', async () => {
      const { QUERY_CONFIGS } = await import('../../../core/operations/config/queries.js');
      expect(QUERY_CONFIGS.length).toBe(12);

      for (const config of QUERY_CONFIGS) {
        const query = new ConfigDrivenQuery(config);
        expect(query.getMethodName()).toBe(config.method);
      }
    });
  });
});
