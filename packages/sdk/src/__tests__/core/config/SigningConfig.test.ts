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

import {
  isHederaSigning,
  isEVMSigning,
  SigningConfig,
} from '../../../core/config/SigningConfig.js';

describe('SigningConfig', () => {
  describe('isHederaSigning', () => {
    it('should return true for "client"', () => {
      const config: SigningConfig = { type: 'client', client: {} as any };
      expect(isHederaSigning(config)).toBe(true);
    });

    it('should return true for "hedera-external"', () => {
      const config: SigningConfig = {
        type: 'hedera-external',
        client: {} as any,
        sign: async () => new Uint8Array(),
      };
      expect(isHederaSigning(config)).toBe(true);
    });

    it('should return true for "custodial"', () => {
      const config: SigningConfig = {
        type: 'custodial',
        client: {} as any,
        custodialSigner: { sign: jest.fn() },
      };
      expect(isHederaSigning(config)).toBe(true);
    });

    it('should return true for "multisig"', () => {
      const config: SigningConfig = {
        type: 'multisig',
        client: {} as any,
        backend: { submitTransaction: jest.fn() },
      };
      expect(isHederaSigning(config)).toBe(true);
    });

    it('should return false for "signer"', () => {
      const config: SigningConfig = {
        type: 'signer',
        signer: {} as any,
        provider: {} as any,
      };
      expect(isHederaSigning(config)).toBe(false);
    });

    it('should return false for "evm-external"', () => {
      const config: SigningConfig = {
        type: 'evm-external',
        provider: {} as any,
        sign: async () => new Uint8Array(),
      };
      expect(isHederaSigning(config)).toBe(false);
    });
  });

  describe('isEVMSigning', () => {
    it('should return true for "signer"', () => {
      const config: SigningConfig = {
        type: 'signer',
        signer: {} as any,
        provider: {} as any,
      };
      expect(isEVMSigning(config)).toBe(true);
    });

    it('should return true for "evm-external"', () => {
      const config: SigningConfig = {
        type: 'evm-external',
        provider: {} as any,
        sign: async () => new Uint8Array(),
      };
      expect(isEVMSigning(config)).toBe(true);
    });

    it('should return false for "client"', () => {
      const config: SigningConfig = { type: 'client', client: {} as any };
      expect(isEVMSigning(config)).toBe(false);
    });
  });
});
