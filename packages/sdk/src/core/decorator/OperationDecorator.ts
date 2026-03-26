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

// Map global para registrar contract operations
const operationRegistry = new Map<string, new () => any>();

export function Operation(name: string) {
  return function (target: new () => any) {
    if (operationRegistry.has(name)) {
      throw new Error(`Operation '${name}' already registered.`);
    }
    operationRegistry.set(name, target);
    return target;
  };
}

export function getRegisteredOperations(): Map<string, new () => any> {
  return new Map(operationRegistry);
}

export function resetOperationRegistry(): void {
  operationRegistry.clear();
}
