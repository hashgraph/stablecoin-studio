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

import { getRegisteredCommands } from '../decorators/Command.js';

export class CommandHandlerRegistry {
  private handlers = new Map<string, any>();

  constructor() {
    for (const [name, HandlerClass] of getRegisteredCommands()) {
      this.handlers.set(name, new HandlerClass());
    }
  }

  get(command: string): any {
    const handler = this.handlers.get(command);
    if (!handler) {
      throw new Error(`No handler registered for command '${command}'`);
    }
    return handler;
  }

  has(command: string): boolean {
    return this.handlers.has(command);
  }

  getAll(): Map<string, any> {
    return new Map(this.handlers);
  }
}
