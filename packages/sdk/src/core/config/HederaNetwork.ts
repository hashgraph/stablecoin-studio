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

// ── Types ────────────────────────────────────────────────────────────────────

export interface NetworkEndpoints {
  readonly mirrorNode: string;
  readonly jsonRpcRelay: string;
}

export type NetworkConfig = 'testnet' | 'mainnet' | 'previewnet' | NetworkEndpoints;

// ── Presets ───────────────────────────────────────────────────────────────────

export const HEDERA_NETWORKS: Readonly<Record<string, NetworkEndpoints>> = {
  testnet: {
    mirrorNode: 'https://testnet.mirrornode.hedera.com',
    jsonRpcRelay: 'https://testnet.hashio.io/api',
  },
  mainnet: {
    mirrorNode: 'https://mainnet-public.mirrornode.hedera.com',
    jsonRpcRelay: 'https://mainnet.hashio.io/api',
  },
  previewnet: {
    mirrorNode: 'https://previewnet.mirrornode.hedera.com',
    jsonRpcRelay: 'https://previewnet.hashio.io/api',
  },
};

// ── Resolver ─────────────────────────────────────────────────────────────────

export function resolveNetwork(config: NetworkConfig): NetworkEndpoints {
  if (typeof config === 'string') {
    const preset = HEDERA_NETWORKS[config];
    if (!preset) {
      const available = Object.keys(HEDERA_NETWORKS).join(', ');
      throw new Error(
        `Unknown network: '${config}'. Available: ${available}`,
      );
    }
    return preset;
  }
  return config;
}
