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
import { EVMDiagnostics } from '../../../../core/dlt/evm/EVMDiagnostics.js';

describe('EVMDiagnostics', () => {
  describe('decodeRevertReason', () => {
    let diagnostics: EVMDiagnostics;

    beforeAll(() => {
      diagnostics = new EVMDiagnostics({} as any);
    });

    it('should decode Error(string) revert', () => {
      const encoded = ethers.AbiCoder.defaultAbiCoder().encode(
        ['string'],
        ['Transfer failed'],
      );
      const hex = '0x08c379a0' + encoded.slice(2);

      const result = diagnostics.decodeRevertReason(hex);
      expect(result).toBe('Transfer failed');
    });

    it('should decode Panic(uint256) for division by zero', () => {
      const encoded = ethers.AbiCoder.defaultAbiCoder().encode(
        ['uint256'],
        [0x12],
      );
      const hex = '0x4e487b71' + encoded.slice(2);

      const result = diagnostics.decodeRevertReason(hex);
      expect(result).toEqual({
        name: 'Panic',
        args: { code: '0x12', message: 'Division by zero' },
        selector: '0x4e487b71',
      });
    });

    it('should decode custom error with ABI', () => {
      const abi = ['error Unauthorized(address caller, bytes32 role)'];
      const iface = new ethers.Interface(abi);
      const hex = iface.encodeErrorResult('Unauthorized', [
        '0x0000000000000000000000000000000000001234',
        ethers.zeroPadValue('0x01', 32),
      ]);

      const result = diagnostics.decodeRevertReason(hex, abi);

      expect(result).toEqual(expect.objectContaining({
        name: 'Unauthorized',
        args: expect.objectContaining({
          caller: '0x0000000000000000000000000000000000001234',
        }),
      }));
    });

    it('should return UnknownError for unrecognized selector', () => {
      const hex = '0xaabbccdd11223344556677';

      const result = diagnostics.decodeRevertReason(hex);
      expect(result).toEqual({
        name: 'UnknownError',
        args: { data: hex },
        selector: '0xaabbccdd',
      });
    });
  });

  describe('diagnose', () => {
    it('should simulate transaction with eth_call to get revert reason', async () => {
      const revertData = '0x08c379a0' +
        ethers.AbiCoder.defaultAbiCoder().encode(['string'], ['Paused']).slice(2);

      const mockProvider = {
        getTransactionReceipt: jest.fn().mockResolvedValue({
          gasUsed: 50000n,
          status: 0,
        }),
        getTransaction: jest.fn().mockResolvedValue({
          to: '0x1234',
          from: '0x5678',
          data: '0x8456cb59',
          value: 0n,
          blockNumber: 100,
        }),
        call: jest.fn().mockRejectedValue({ data: revertData }),
      } as any;

      const diagnostics = new EVMDiagnostics(mockProvider);

      const report = await diagnostics.diagnose('0xabc123', '0x1234');

      expect(report.transactionId).toBe('0xabc123');
      expect(report.revertMessage).toBe('Paused');
      expect(report.gasUsed).toBe(50000);
      expect(mockProvider.call).toHaveBeenCalledWith(
        expect.objectContaining({
          to: '0x1234',
          from: '0x5678',
          data: '0x8456cb59',
          blockTag: 99,
        }),
      );
    });

    it('should handle provider errors gracefully', async () => {
      const mockProvider = {
        getTransactionReceipt: jest.fn().mockResolvedValue(null),
        getTransaction: jest.fn().mockResolvedValue(null),
      } as any;

      const diagnostics = new EVMDiagnostics(mockProvider);

      const report = await diagnostics.diagnose('0xabc123', '0x1234');

      expect(report.transactionId).toBe('0xabc123');
      expect(report.callTrace).toEqual([]);
      expect(report.rawRevertReason).toBeUndefined();
    });

    it('should extract revert reason from error message when data field missing', async () => {
      const mockProvider = {
        getTransactionReceipt: jest.fn().mockResolvedValue({ gasUsed: 30000n }),
        getTransaction: jest.fn().mockResolvedValue({
          to: '0x1234',
          from: '0x5678',
          data: '0x',
          value: 0n,
          blockNumber: 50,
        }),
        call: jest.fn().mockRejectedValue(
          new Error('execution reverted: 0x08c379a0abcdef'),
        ),
      } as any;

      const diagnostics = new EVMDiagnostics(mockProvider);
      const report = await diagnostics.diagnose('0xdef', '0x1234');

      expect(report.rawRevertReason).toBe('0x08c379a0abcdef');
    });

    it('should try debug_traceTransaction if provider supports it', async () => {
      const mockTrace = {
        from: '0x5678',
        to: '0x1234',
        type: 'CALL',
        input: '0x8456cb59',
        output: '0x',
        error: 'execution reverted',
        gasUsed: '0xc350',
        calls: [
          {
            from: '0x1234',
            to: '0x9999',
            type: 'DELEGATECALL',
            input: '0xabcd',
            output: '0xef01',
            gasUsed: '0x4e20',
          },
        ],
      };

      const mockProvider = {
        getTransactionReceipt: jest.fn().mockResolvedValue({ gasUsed: 50000n }),
        getTransaction: jest.fn().mockResolvedValue(null),
        send: jest.fn().mockResolvedValue(mockTrace),
      } as any;

      const diagnostics = new EVMDiagnostics(mockProvider);
      const report = await diagnostics.diagnose('0xabc', '0x1234');

      expect(report.callTrace).toHaveLength(2);
      expect(report.callTrace[0]).toEqual({
        from: '0x5678',
        to: '0x1234',
        callType: 'CALL',
        input: '0x8456cb59',
        output: '0x',
        error: 'execution reverted',
        depth: 0,
        gasUsed: 50000,
      });
      expect(report.callTrace[1]).toEqual({
        from: '0x1234',
        to: '0x9999',
        callType: 'DELEGATECALL',
        input: '0xabcd',
        output: '0xef01',
        error: undefined,
        depth: 1,
        gasUsed: 20000,
      });
    });
  });
});
