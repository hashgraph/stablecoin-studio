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

import { Client } from '@hiero-ledger/sdk';
import { ethers } from 'ethers';
import { ExecutionMode } from './types/ExecutionMode.js';
import { PipelineContext, TransactionResultLike, CommandHandlerLike } from './types/PipelineContext.js';
import { HederaExecutePipeline } from './pipelines/HederaExecutePipeline.js';
import { EVMExecutePipeline } from './pipelines/EVMExecutePipeline.js';
import { getRegisteredCommands } from './decorators/Command.js';

/**
 * PipelineExecutor — puente entre el sistema viejo y el nuevo.
 *
 * Dado un nombre de comando y sus parámetros, resuelve el handler
 * del registry, construye el PipelineContext y ejecuta el pipeline
 * correspondiente (Hedera o EVM).
 *
 * Uso desde los viejos CommandHandlers:
 * ```ts
 * const result = await pipelineExecutor.execute('burn', { amount: '100', contractAddress: '0x...' }, 'hedera');
 * ```
 */
export class PipelineExecutor {
  constructor(
    private readonly clientProvider: () => Client,
    private readonly signerProvider: () => ethers.Signer,
    private readonly providerProvider: () => ethers.Provider,
  ) {}

  async execute(
    commandName: string,
    params: Record<string, unknown>,
    mode: ExecutionMode,
  ): Promise<TransactionResultLike> {
    const handler = this.resolveHandler(commandName);

    if (!handler.supportsMode(mode)) {
      throw new Error(
        `Command '${commandName}' does not support mode '${mode}'. ` +
        `Supported: ${handler.getSupportedModes().join(', ')}`,
      );
    }

    handler.validate(params);

    const context: PipelineContext = {
      command: commandName,
      params,
      handler,
    };

    const pipeline = this.createPipeline(mode);
    return pipeline.execute(context);
  }

  private resolveHandler(commandName: string): CommandHandlerLike {
    const registry = getRegisteredCommands();
    const HandlerClass = registry.get(commandName);
    if (!HandlerClass) {
      throw new Error(
        `No handler registered for command '${commandName}'. ` +
        `Available: ${[...registry.keys()].join(', ')}`,
      );
    }
    return new HandlerClass() as CommandHandlerLike;
  }

  private createPipeline(mode: ExecutionMode) {
    if (mode === 'hedera') {
      return new HederaExecutePipeline(this.clientProvider());
    }
    return new EVMExecutePipeline(this.providerProvider(), this.signerProvider());
  }
}
