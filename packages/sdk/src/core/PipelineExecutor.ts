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
