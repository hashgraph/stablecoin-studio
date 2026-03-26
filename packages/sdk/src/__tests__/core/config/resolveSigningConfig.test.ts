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

import { Client, PrivateKey } from '@hiero-ledger/sdk';
import { ethers } from 'ethers';
import { resolveSigningConfig } from '../../../core/config/resolveSigningConfig.js';
import { NetworkEndpoints, HEDERA_NETWORKS } from '../../../core/config/HederaNetwork.js';
import { SigningConfig } from '../../../core/config/SigningConfig.js';

describe('resolveSigningConfig', () => {
  const testnetEndpoints = HEDERA_NETWORKS.testnet;

  describe('client signing', () => {
    it('should pass through a pre-built Client unchanged', () => {
      const client = {} as Client;
      const signing: SigningConfig = { type: 'client', client };

      const resolved = resolveSigningConfig(signing, testnetEndpoints);

      expect(resolved.type).toBe('client');
      expect((resolved as any).client).toBe(client);
    });

    it('should auto-create Client from operatorId + privateKey for testnet', () => {
      const key = PrivateKey.generateED25519();
      const signing: SigningConfig = {
        type: 'client',
        operatorId: '0.0.1234',
        privateKey: key.toStringDer(),
      };

      const resolved = resolveSigningConfig(signing, testnetEndpoints);

      expect(resolved.type).toBe('client');
      expect((resolved as any).client).toBeInstanceOf(Client);
    });

    it('should auto-create Client from operatorId + privateKey for mainnet', () => {
      const key = PrivateKey.generateED25519();
      const signing: SigningConfig = {
        type: 'client',
        operatorId: '0.0.5678',
        privateKey: key.toStringDer(),
      };

      const resolved = resolveSigningConfig(signing, HEDERA_NETWORKS.mainnet);

      expect(resolved.type).toBe('client');
      expect((resolved as any).client).toBeInstanceOf(Client);
    });

    it('should throw for custom network without a Client instance', () => {
      const key = PrivateKey.generateED25519();
      const customNetwork: NetworkEndpoints = {
        mirrorNode: 'https://custom-mirror.example.com',
        jsonRpcRelay: 'https://custom-rpc.example.com',
      };
      const signing: SigningConfig = {
        type: 'client',
        operatorId: '0.0.1234',
        privateKey: key.toStringDer(),
      };

      expect(() => resolveSigningConfig(signing, customNetwork)).toThrow(
        'Cannot auto-create Hedera Client for custom network',
      );
    });
  });

  describe('signer signing', () => {
    it('should pass through pre-built signer + provider unchanged', () => {
      const signer = {} as ethers.Signer;
      const provider = {} as ethers.Provider;
      const signing: SigningConfig = { type: 'signer', signer, provider };

      const resolved = resolveSigningConfig(signing, testnetEndpoints);

      expect(resolved.type).toBe('signer');
      expect((resolved as any).signer).toBe(signer);
      expect((resolved as any).provider).toBe(provider);
    });

    it('should auto-create Provider + Wallet from privateKey', () => {
      const wallet = ethers.Wallet.createRandom();
      const signing: SigningConfig = {
        type: 'signer',
        privateKey: wallet.privateKey,
      };

      const resolved = resolveSigningConfig(signing, testnetEndpoints);

      expect(resolved.type).toBe('signer');
      expect((resolved as any).signer).toBeInstanceOf(ethers.Wallet);
      expect((resolved as any).provider).toBeInstanceOf(ethers.JsonRpcProvider);
    });

    it('should throw when ED25519 key is used with EVM signer', () => {
      const ed25519Key = '302e020100300506032b6570042204204e66fae450c90e3733df22b5bd1542119a4228d7f8c2fcba45e815e42506b061';
      const signing: SigningConfig = {
        type: 'signer',
        privateKey: ed25519Key,
      };

      expect(() => resolveSigningConfig(signing, testnetEndpoints)).toThrow(
        'ED25519 keys are not compatible with EVM signing',
      );
    });

    it('should throw when 0x-prefixed ED25519 key is used with EVM signer', () => {
      const ed25519Key = '0x302e020100300506032b6570042204204e66fae450c90e3733df22b5bd1542119a4228d7f8c2fcba45e815e42506b061';
      const signing: SigningConfig = {
        type: 'signer',
        privateKey: ed25519Key,
      };

      expect(() => resolveSigningConfig(signing, testnetEndpoints)).toThrow(
        'ED25519 keys are not compatible with EVM signing',
      );
    });
  });

  describe('other signing types', () => {
    it('should pass through hedera-external unchanged', () => {
      const signing: SigningConfig = {
        type: 'hedera-external',
        client: {} as Client,
        sign: async () => new Uint8Array(),
      };

      const resolved = resolveSigningConfig(signing, testnetEndpoints);
      expect(resolved).toBe(signing);
    });

    it('should pass through custodial unchanged', () => {
      const signing: SigningConfig = {
        type: 'custodial',
        client: {} as Client,
        custodialSigner: { sign: jest.fn() },
      };

      const resolved = resolveSigningConfig(signing, testnetEndpoints);
      expect(resolved).toBe(signing);
    });

    it('should pass through evm-external unchanged', () => {
      const signing: SigningConfig = {
        type: 'evm-external',
        provider: {} as ethers.Provider,
        sign: async () => new Uint8Array(),
      };

      const resolved = resolveSigningConfig(signing, testnetEndpoints);
      expect(resolved).toBe(signing);
    });
  });
});
