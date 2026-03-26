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
  resolveNetwork,
  HEDERA_NETWORKS,
  NetworkEndpoints,
} from '../../../core/config/HederaNetwork.js';

describe('HederaNetwork', () => {
  describe('HEDERA_NETWORKS', () => {
    it('should have testnet, mainnet, and previewnet presets', () => {
      expect(HEDERA_NETWORKS).toHaveProperty('testnet');
      expect(HEDERA_NETWORKS).toHaveProperty('mainnet');
      expect(HEDERA_NETWORKS).toHaveProperty('previewnet');
    });

    it('should have mirrorNode and jsonRpcRelay for each preset', () => {
      for (const [name, endpoints] of Object.entries(HEDERA_NETWORKS)) {
        expect(endpoints.mirrorNode).toBeTruthy();
        expect(endpoints.jsonRpcRelay).toBeTruthy();
        expect(endpoints.mirrorNode).toContain('http');
        expect(endpoints.jsonRpcRelay).toContain('http');
      }
    });
  });

  describe('resolveNetwork', () => {
    it('should resolve "testnet" to testnet endpoints', () => {
      const result = resolveNetwork('testnet');
      expect(result).toBe(HEDERA_NETWORKS.testnet);
      expect(result.mirrorNode).toContain('testnet');
    });

    it('should resolve "mainnet" to mainnet endpoints', () => {
      const result = resolveNetwork('mainnet');
      expect(result).toBe(HEDERA_NETWORKS.mainnet);
      expect(result.mirrorNode).toContain('mainnet');
    });

    it('should resolve "previewnet" to previewnet endpoints', () => {
      const result = resolveNetwork('previewnet');
      expect(result).toBe(HEDERA_NETWORKS.previewnet);
      expect(result.mirrorNode).toContain('previewnet');
    });

    it('should throw for unknown network name', () => {
      expect(() => resolveNetwork('devnet' as any)).toThrow(
        "Unknown network: 'devnet'. Available: testnet, mainnet, previewnet",
      );
    });

    it('should pass through custom NetworkEndpoints as-is', () => {
      const custom: NetworkEndpoints = {
        mirrorNode: 'https://my-mirror.example.com',
        jsonRpcRelay: 'https://my-rpc.example.com',
      };
      const result = resolveNetwork(custom);
      expect(result).toBe(custom);
    });
  });
});
