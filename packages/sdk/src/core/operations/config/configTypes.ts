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

/** Supported Solidity parameter types for automatic encoding. */
export type SolidityType = 'address' | 'uint256' | 'int256' | 'int64' | 'bytes32';

/** Supported result transformations for query return values. */
export type ResultTransform = 'string' | 'boolean' | 'number' | 'strings' | 'raw';

/** Maps a param field to a Solidity type for automatic encoding/validation. */
export interface ArgDescriptor {
  /** Field name in the params object (e.g., 'targetId', 'amount'). */
  param: string;
  /** Solidity type — determines EVM/Hedera encoding and validation. */
  type: SolidityType;
  /** For uint256: allow 0 (default: require > 0). */
  allowZero?: boolean;
}

/** Declarative definition of a contract write operation. */
export interface OperationConfig {
  /** Registry key (e.g., 'burn', 'pause'). */
  name: string;
  /** Solidity method name (e.g., 'burn', 'deleteToken'). */
  method: string;
  /** ABI fragment (e.g., 'function burn(uint256 amount)'). */
  abi: string;
  /** Default gas limit. */
  gas: number;
  /** Parameter mapping — empty or omitted for no-arg operations. */
  args?: ArgDescriptor[];
  /** Param fields to echo back in the result (e.g., ['amount']). */
  resultFields?: string[];
  /** Constant fields to merge into the result (e.g., { paused: true }). */
  staticResult?: Record<string, unknown>;
}

/** Declarative definition of a contract view/pure query. */
export interface QueryConfig {
  /** Registry key (e.g., 'getBalance'). */
  name: string;
  /** View method name (e.g., 'balanceOf'). */
  method: string;
  /** ABI fragment with returns clause. */
  abi: string;
  /** Parameter mapping — omitted for no-arg queries. */
  args?: ArgDescriptor[];
  /** How to transform the raw return value into the result object. */
  result: {
    /** Result field name (e.g., 'balance', 'hasRole'). */
    field: string;
    /** Transform function to apply to the raw data. */
    transform: ResultTransform;
  };
}
