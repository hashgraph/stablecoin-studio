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

// Map global para registrar command handlers
const commandRegistry = new Map<string, new () => any>();

export function Command(name: string) {
  return function (target: new () => any) {
    if (commandRegistry.has(name)) {
      throw new Error(`Command '${name}' already registered.`);
    }
    commandRegistry.set(name, target);
    return target;
  };
}

export function getRegisteredCommands(): Map<string, new () => any> {
  return new Map(commandRegistry);
}

export function resetCommandRegistry(): void {
  commandRegistry.clear();
}
