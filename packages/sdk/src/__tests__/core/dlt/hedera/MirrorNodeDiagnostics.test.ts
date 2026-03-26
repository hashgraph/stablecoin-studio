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

import { ethers } from 'ethers';
import { MirrorNodeDiagnostics } from '../../../../core/dlt/hedera/MirrorNodeDiagnostics.js';

const MIRROR_URL = 'https://testnet.mirrornode.hedera.com';

// Helper para crear mock fetch responses
function mockFetch(responses: Record<string, any>): typeof fetch {
  return jest.fn(async (url: string | URL | Request) => {
    const urlStr = typeof url === 'string' ? url : url.toString();
    for (const [pattern, data] of Object.entries(responses)) {
      if (urlStr.includes(pattern)) {
        return { ok: true, json: async () => data } as Response;
      }
    }
    return { ok: false } as Response;
  }) as any;
}

describe('MirrorNodeDiagnostics', () => {
  describe('decodeRevertReason', () => {
    let diagnostics: MirrorNodeDiagnostics;

    beforeAll(() => {
      diagnostics = new MirrorNodeDiagnostics(MIRROR_URL);
    });

    it('should decode Error(string) revert', () => {
      // Error("Insufficient balance")
      const encoded = ethers.AbiCoder.defaultAbiCoder().encode(
        ['string'],
        ['Insufficient balance'],
      );
      const hex = '0x08c379a0' + encoded.slice(2);

      const result = diagnostics.decodeRevertReason(hex);

      expect(result).toBe('Insufficient balance');
    });

    it('should decode Panic(uint256) revert', () => {
      // Panic(0x11) = arithmetic overflow
      const encoded = ethers.AbiCoder.defaultAbiCoder().encode(
        ['uint256'],
        [0x11],
      );
      const hex = '0x4e487b71' + encoded.slice(2);

      const result = diagnostics.decodeRevertReason(hex);

      expect(result).toEqual({
        name: 'Panic',
        args: { code: '0x11', message: 'Arithmetic overflow/underflow' },
        selector: '0x4e487b71',
      });
    });

    it('should decode custom error with ABI', () => {
      const abi = ['error InsufficientBalance(uint256 required, uint256 available)'];
      const iface = new ethers.Interface(abi);
      const hex = iface.encodeErrorResult('InsufficientBalance', [1000n, 500n]);

      const result = diagnostics.decodeRevertReason(hex, abi);

      expect(result).toEqual({
        name: 'InsufficientBalance',
        args: { required: '1000', available: '500' },
        selector: expect.stringMatching(/^0x[0-9a-f]{8}$/),
      });
    });

    it('should return UnknownError for unrecognized data', () => {
      const hex = '0xdeadbeef01020304050607';

      const result = diagnostics.decodeRevertReason(hex);

      expect(result).toEqual({
        name: 'UnknownError',
        args: { data: hex },
        selector: '0xdeadbeef',
      });
    });

    it('should return undefined for empty input', () => {
      expect(diagnostics.decodeRevertReason('')).toBeUndefined();
    });

    it('should handle hex without 0x prefix', () => {
      const encoded = ethers.AbiCoder.defaultAbiCoder().encode(
        ['string'],
        ['No prefix'],
      );
      const hex = '08c379a0' + encoded.slice(2);

      const result = diagnostics.decodeRevertReason(hex);
      expect(result).toBe('No prefix');
    });
  });

  describe('diagnose', () => {
    it('should fetch contract result and actions from mirror node', async () => {
      const mockContractResult = {
        result: 'CONTRACT_REVERT_EXECUTED',
        error_message: '0x08c379a0' +
          ethers.AbiCoder.defaultAbiCoder().encode(['string'], ['Paused']).slice(2),
        from: '0x0000000000000000000000000000000000001111',
        to: '0x0000000000000000000000000000000000001234',
        gas_used: 50000,
      };

      const mockActions = {
        actions: [
          {
            caller: '0x1111',
            recipient: '0x1234',
            call_type: 'CALL',
            input: '0x8456cb59',
            result_data: '0x08c379a0...',
            result_data_type: 'ERROR',
            gas_used: 45000,
            call_depth: 0,
          },
          {
            caller: '0x1234',
            recipient: '0x5678',
            call_type: 'DELEGATECALL',
            input: '0xabcd',
            result_data: '0xef01',
            result_data_type: 'OUTPUT',
            gas_used: 20000,
            call_depth: 1,
          },
        ],
      };

      // Order matters: more specific pattern first
      const fetchFn = mockFetch({
        '/actions': mockActions,
        '/contracts/results/': mockContractResult,
      });

      const diagnostics = new MirrorNodeDiagnostics(MIRROR_URL, fetchFn);

      const report = await diagnostics.diagnose(
        '0.0.1234@1234567890.000',
        '0x0000000000000000000000000000000000001234',
      );

      expect(report.transactionId).toBe('0.0.1234@1234567890.000');
      expect(report.revertMessage).toBe('Paused');
      expect(report.gasUsed).toBe(50000);
      expect(report.callTrace).toHaveLength(2);
      expect(report.callTrace[0].callType).toBe('CALL');
      expect(report.callTrace[0].error).toBe('0x08c379a0...');
      expect(report.callTrace[1].callType).toBe('DELEGATECALL');
      expect(report.callTrace[1].output).toBe('0xef01');
      expect(report.callTrace[1].depth).toBe(1);
    });

    it('should handle mirror node unavailable gracefully', async () => {
      const fetchFn = jest.fn(async () => ({ ok: false })) as any;

      const diagnostics = new MirrorNodeDiagnostics(MIRROR_URL, fetchFn);

      const report = await diagnostics.diagnose(
        '0.0.1234@1234567890.000',
        '0x1234',
      );

      expect(report.transactionId).toBe('0.0.1234@1234567890.000');
      expect(report.callTrace).toEqual([]);
      expect(report.revertMessage).toBeUndefined();
    });

    it('should handle fetch throwing errors', async () => {
      const fetchFn = jest.fn(async () => {
        throw new Error('Network error');
      }) as any;

      const diagnostics = new MirrorNodeDiagnostics(MIRROR_URL, fetchFn);

      const report = await diagnostics.diagnose(
        '0.0.1234@1234567890.000',
        '0x1234',
      );

      expect(report.callTrace).toEqual([]);
    });
  });
});
