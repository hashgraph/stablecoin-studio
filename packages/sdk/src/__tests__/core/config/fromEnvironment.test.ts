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

import { fromEnvironment } from '../../../core/config/fromEnvironment.js';

describe('fromEnvironment', () => {
  describe('Hedera Client signing', () => {
    it('should resolve client signing from HEDERA_OPERATOR_ID + HEDERA_PRIVATE_KEY', () => {
      const env = {
        HEDERA_NETWORK: 'testnet',
        HEDERA_OPERATOR_ID: '0.0.1234',
        HEDERA_PRIVATE_KEY: '302e020100300506032b6570042204205a...',
      };

      const config = fromEnvironment(env);

      expect(config.network).toBe('testnet');
      expect(config.signing).toEqual({
        type: 'client',
        operatorId: '0.0.1234',
        privateKey: '302e020100300506032b6570042204205a...',
      });
    });

    it('should work with mainnet', () => {
      const env = {
        HEDERA_NETWORK: 'mainnet',
        HEDERA_OPERATOR_ID: '0.0.5678',
        HEDERA_PRIVATE_KEY: '302e...',
      };

      const config = fromEnvironment(env);

      expect(config.network).toBe('mainnet');
      expect(config.signing.type).toBe('client');
    });
  });

  describe('EVM Signer signing', () => {
    it('should resolve signer signing from EVM_PRIVATE_KEY', () => {
      const env = {
        HEDERA_NETWORK: 'testnet',
        EVM_PRIVATE_KEY: '0xabc123def456...',
      };

      const config = fromEnvironment(env);

      expect(config.network).toBe('testnet');
      expect(config.signing).toEqual({
        type: 'signer',
        privateKey: '0xabc123def456...',
      });
    });
  });

  describe('priority', () => {
    it('should prefer Hedera Client when both HEDERA and EVM keys are set', () => {
      const env = {
        HEDERA_NETWORK: 'testnet',
        HEDERA_OPERATOR_ID: '0.0.1234',
        HEDERA_PRIVATE_KEY: '302e...',
        EVM_PRIVATE_KEY: '0xabc...',
      };

      const config = fromEnvironment(env);

      expect(config.signing.type).toBe('client');
    });
  });

  describe('error cases', () => {
    it('should throw when HEDERA_NETWORK is missing', () => {
      const env = {
        HEDERA_OPERATOR_ID: '0.0.1234',
        HEDERA_PRIVATE_KEY: '302e...',
      };

      expect(() => fromEnvironment(env)).toThrow(
        'Missing required environment variable: HEDERA_NETWORK',
      );
    });

    it('should throw when no signing keys are set', () => {
      const env = {
        HEDERA_NETWORK: 'testnet',
      };

      expect(() => fromEnvironment(env)).toThrow(
        'Cannot resolve signing from environment',
      );
    });

    it('should throw when only HEDERA_OPERATOR_ID is set without key', () => {
      const env = {
        HEDERA_NETWORK: 'testnet',
        HEDERA_OPERATOR_ID: '0.0.1234',
      };

      expect(() => fromEnvironment(env)).toThrow(
        'Cannot resolve signing from environment',
      );
    });

    it('should throw when only HEDERA_PRIVATE_KEY is set without operator', () => {
      const env = {
        HEDERA_NETWORK: 'testnet',
        HEDERA_PRIVATE_KEY: '302e...',
      };

      expect(() => fromEnvironment(env)).toThrow(
        'Cannot resolve signing from environment',
      );
    });

    it('should throw when EVM_PRIVATE_KEY is an ED25519 key', () => {
      const env = {
        HEDERA_NETWORK: 'testnet',
        EVM_PRIVATE_KEY: '302e020100300506032b6570042204204e66fae450c90e3733df22b5bd1542119a4228d7f8c2fcba45e815e42506b061',
      };

      expect(() => fromEnvironment(env)).toThrow(
        'ED25519 key, which is not compatible with the EVM path',
      );
    });
  });
});
