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

export class BaseRegistry<T> {
  protected readonly items = new Map<string, T>();

  get(name: string): T {
    const item = this.items.get(name);
    if (!item) {
      throw new Error(`No entry registered for '${name}' in ${this.constructor.name}`);
    }
    return item;
  }

  has(name: string): boolean {
    return this.items.has(name);
  }

  getAll(): Map<string, T> {
    return new Map(this.items);
  }
}
