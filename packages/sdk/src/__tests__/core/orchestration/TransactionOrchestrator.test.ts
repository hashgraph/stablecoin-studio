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

// Undo the global mock from jest-setup-file so we test the real implementation
jest.unmock('../../../core/orchestration/TransactionOrchestrator');

import { TransactionOrchestrator } from '../../../core/orchestration/TransactionOrchestrator.js';
import type { OrchestratorConfig } from '../../../core/orchestration/TransactionOrchestrator.js';

describe('TransactionOrchestrator', () => {
  const mockClient = { operatorAccountId: '0.0.1234' } as any;
  const mockSigner = {} as any;
  const mockProvider = {} as any;

  function makeConfig(
    overrides: Partial<OrchestratorConfig> = {},
  ): OrchestratorConfig {
    return {
      network: 'testnet',
      signing: { type: 'client', client: mockClient },
      diagnostics: false, // avoid real diagnostics in unit tests
      ...overrides,
    };
  }

  describe('constructor', () => {
    it('should resolve a preset network', () => {
      const orchestrator = new TransactionOrchestrator(makeConfig());
      const network = (orchestrator as any).network;
      expect(network.mirrorNode).toContain('testnet');
      expect(network.jsonRpcRelay).toContain('testnet');
    });

    it('should accept custom network endpoints', () => {
      const orchestrator = new TransactionOrchestrator(
        makeConfig({
          network: {
            mirrorNode: 'https://custom-mirror.example.com',
            jsonRpcRelay: 'https://custom-rpc.example.com',
          },
        }),
      );
      const network = (orchestrator as any).network;
      expect(network.mirrorNode).toBe('https://custom-mirror.example.com');
      expect(network.jsonRpcRelay).toBe('https://custom-rpc.example.com');
    });

    it('should throw for unknown network name', () => {
      expect(
        () => new TransactionOrchestrator(makeConfig({ network: 'devnet' as any })),
      ).toThrow("Unknown network: 'devnet'");
    });
  });

  describe('resolveBuilder', () => {
    it('should resolve a registered operation', () => {
      const orchestrator = new TransactionOrchestrator(makeConfig());
      const builder = (orchestrator as any).resolveBuilder('burn');
      expect(builder).toBeDefined();
      expect(builder.getMethodName()).toBe('burn');
    });

    it('should throw for unregistered operation', () => {
      const orchestrator = new TransactionOrchestrator(makeConfig());
      expect(() => (orchestrator as any).resolveBuilder('nonexistent')).toThrow(
        "No entry registered for 'nonexistent'",
      );
    });
  });

  describe('createExecutor', () => {
    it('should create executor with Hedera steps for client signing', () => {
      const orchestrator = new TransactionOrchestrator(makeConfig());
      const executor = (orchestrator as any).createExecutor();
      const steps = executor.getSteps();
      expect(steps).toHaveLength(5);
      expect(steps[0].name).toBe('BuildHedera');
      expect(steps[1].name).toBe('SignWithClient');
    });

    it('should create executor with EVM steps for signer signing', () => {
      const orchestrator = new TransactionOrchestrator(
        makeConfig({
          signing: { type: 'signer', signer: mockSigner, provider: mockProvider },
        }),
      );
      const executor = (orchestrator as any).createExecutor();
      const steps = executor.getSteps();
      expect(steps).toHaveLength(5);
      expect(steps[0].name).toBe('BuildEVM');
      expect(steps[1].name).toBe('SignWithSigner');
    });

    it('should create executor with external steps for hedera-external signing', () => {
      const orchestrator = new TransactionOrchestrator(
        makeConfig({
          signing: {
            type: 'hedera-external',
            client: mockClient,
            sign: async () => new Uint8Array(),
          },
        }),
      );
      const executor = (orchestrator as any).createExecutor();
      const steps = executor.getSteps();
      expect(steps).toHaveLength(3);
      expect(steps[0].name).toBe('BuildHedera');
      expect(steps[1].name).toBe('SerializeHedera');
      expect(steps[2].name).toBe('ReturnSerialized');
    });
  });

  describe('execute validation', () => {
    it('should validate params before pipeline execution', async () => {
      const orchestrator = new TransactionOrchestrator(makeConfig());
      await expect(
        orchestrator.execute('burn', { amount: '0' }),
      ).rejects.toThrow('Amount must be positive');
    });

    it('should throw for unregistered operations', async () => {
      const orchestrator = new TransactionOrchestrator(makeConfig());
      await expect(
        orchestrator.execute('nonexistent', {}),
      ).rejects.toThrow("No entry registered for 'nonexistent'");
    });
  });

  describe('serialize', () => {
    it('should only run Build + Serialize steps (not Sign/Submit)', async () => {
      const orchestrator = new TransactionOrchestrator(
        makeConfig({
          signing: {
            type: 'hedera-external',
            client: mockClient,
            sign: async () => new Uint8Array(),
          },
        }),
      );
      // Mock the builder to track which steps actually execute
      const buildCalled = jest.fn();
      const mockBuilder = {
        buildHederaTransaction: buildCalled.mockReturnValue({
          freezeWith: () => ({
            toBytes: () => new Uint8Array([1, 2, 3]),
            _signedTransactions: undefined,
          }),
        }),
        buildEVMTransaction: jest.fn(),
        extractResult: jest.fn(),
        validate: jest.fn(),
        supportsMode: () => true,
        getSupportedModes: () => ['hedera'],
      };
      // Inject the mock builder via the registry
      const registry = (orchestrator as any).operationRegistry;
      registry.items.set('testOp', mockBuilder);

      const result = await orchestrator.serialize('testOp', {});
      expect(buildCalled).toHaveBeenCalled();
      expect(result.signedTransaction).toBeDefined();
      expect(result.signedTransaction?.kind).toBe('serialized');
      // Should NOT have result (no ExtractResult step ran)
      expect(result.result).toBeUndefined();
    });
  });

  describe('diagnostics wiring', () => {
    it('should use DefaultExecutionErrorHandler when diagnostics: false', () => {
      const orchestrator = new TransactionOrchestrator(
        makeConfig({ diagnostics: false }),
      );
      const handler = (orchestrator as any).createErrorHandler();
      expect(handler.constructor.name).toBe('DefaultExecutionErrorHandler');
    });

    it('should use DiagnosticErrorHandler with MirrorNodeDiagnostics for Hedera signing', () => {
      const orchestrator = new TransactionOrchestrator(
        makeConfig({ diagnostics: true }),
      );
      const handler = (orchestrator as any).createErrorHandler();
      expect(handler.constructor.name).toBe('DiagnosticErrorHandler');
    });

    it('should use DiagnosticErrorHandler with EVMDiagnostics for EVM signing', () => {
      const orchestrator = new TransactionOrchestrator(
        makeConfig({
          signing: { type: 'signer', signer: mockSigner, provider: mockProvider },
          diagnostics: true,
        }),
      );
      const handler = (orchestrator as any).createErrorHandler();
      expect(handler.constructor.name).toBe('DiagnosticErrorHandler');
    });
  });
});
