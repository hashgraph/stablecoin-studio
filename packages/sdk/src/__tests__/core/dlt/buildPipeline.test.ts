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

import { buildPipeline } from '../../../core/dlt/buildPipeline.js';
import { ResolvedSigningConfig } from '../../../core/config/resolveSigningConfig.js';

describe('buildPipeline', () => {
  describe('client signing (Hedera native)', () => {
    it('should build Build → Sign → Submit → Parse → Extract', () => {
      const signing: ResolvedSigningConfig = { type: 'client', client: {} as any };
      const steps = buildPipeline(signing);

      const names = steps.map((s) => s.name);
      expect(names).toEqual([
        'BuildHedera',
        'SignWithClient',
        'SubmitToHedera',
        'ParseHederaReceipt',
        'ExtractResult',
      ]);
    });
  });

  describe('signer signing (EVM)', () => {
    it('should build Build → Sign → Submit → Parse → Extract', () => {
      const signing: ResolvedSigningConfig = {
        type: 'signer',
        signer: {} as any,
        provider: {} as any,
      };
      const steps = buildPipeline(signing);

      const names = steps.map((s) => s.name);
      expect(names).toEqual([
        'BuildEVM',
        'SignWithSigner',
        'SubmitToRPC',
        'ParseEVMReceipt',
        'ExtractResult',
      ]);
    });
  });

  describe('hedera-external signing', () => {
    it('should build Build → Serialize → ReturnSerialized (consumer signs & submits)', () => {
      const signing: ResolvedSigningConfig = {
        type: 'hedera-external',
        client: {} as any,
        sign: async () => new Uint8Array(),
      };
      const steps = buildPipeline(signing);

      const names = steps.map((s) => s.name);
      expect(names).toEqual([
        'BuildHedera',
        'SerializeHedera',
        'ReturnSerialized',
      ]);
    });
  });

  describe('evm-external signing', () => {
    it('should build Build → Serialize → ReturnSerialized (consumer signs & submits)', () => {
      const signing: ResolvedSigningConfig = {
        type: 'evm-external',
        provider: {} as any,
        sign: async () => new Uint8Array(),
      };
      const steps = buildPipeline(signing);

      const names = steps.map((s) => s.name);
      expect(names).toEqual([
        'BuildEVM',
        'SerializeEVM',
        'ReturnSerialized',
      ]);
    });
  });

  describe('custodial signing', () => {
    it('should build Build → SignWithClient → Submit → Parse → Extract (client has setOperatorWith callback)', () => {
      const signing: ResolvedSigningConfig = {
        type: 'custodial',
        client: {} as any,
        custodialSigner: { sign: jest.fn() },
      };
      const steps = buildPipeline(signing);

      const names = steps.map((s) => s.name);
      expect(names).toEqual([
        'BuildHedera',
        'SignWithClient',    // custodial client has setOperatorWith() signing callback
        'SubmitToHedera',
        'ParseHederaReceipt',
        'ExtractResult',
      ]);
    });
  });

  describe('multisig signing', () => {
    it('should build Build → Serialize → ReturnSerialized (backend handles the rest)', () => {
      const signing: ResolvedSigningConfig = {
        type: 'multisig',
        client: {} as any,
        backend: { submitTransaction: jest.fn() },
      };
      const steps = buildPipeline(signing);

      const names = steps.map((s) => s.name);
      expect(names).toEqual([
        'BuildHedera',
        'SerializeHedera',
        'ReturnSerialized',
      ]);
    });
  });

  describe('pipeline step count', () => {
    it('should have 5 steps for direct signing (client, signer)', () => {
      expect(buildPipeline({ type: 'client', client: {} as any })).toHaveLength(5);
      expect(buildPipeline({ type: 'signer', signer: {} as any, provider: {} as any })).toHaveLength(5);
    });

    it('should have 3 steps for external/multisig (build + serialize + return)', () => {
      expect(buildPipeline({
        type: 'hedera-external', client: {} as any, sign: async () => new Uint8Array(),
      })).toHaveLength(3);
      expect(buildPipeline({
        type: 'evm-external', provider: {} as any, sign: async () => new Uint8Array(),
      })).toHaveLength(3);
      expect(buildPipeline({
        type: 'multisig', client: {} as any, backend: { submitTransaction: jest.fn() },
      })).toHaveLength(3);
    });
  });
});
