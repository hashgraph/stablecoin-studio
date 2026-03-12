import { Command } from '../../decorators/Command.js';
import { BaseCompositeHandler, SubCommand } from '../BaseCompositeHandler.js';
import { CommandParams, TransactionResult } from '../types.js';
import { TransactionResultLike } from '../../types/PipelineContext.js';

export interface CreateStableCoinParams extends CommandParams {
  name: string;
  symbol: string;
  decimals: number;
  initialSupply?: string;
  maxSupply?: string;
  factoryAddress: string;
  resolverAddress: string;
  createReserve: boolean;
  reserveAddress?: string;
  reserveInitialAmount?: string;
}

export interface CreateStableCoinResult extends TransactionResult {
  proxyAddress: string;
  tokenId: string;
}

@Command('create')
export class CreateStableCoinHandler extends BaseCompositeHandler<
  CreateStableCoinParams,
  CreateStableCoinResult
> {
  constructor() {
    super('create', ['hedera', 'evm']);
  }

  protected getSubCommands(params: CreateStableCoinParams): SubCommand[] {
    const commands: SubCommand[] = [
      {
        command: 'deployProxy',
        params: {
          factoryAddress: params.factoryAddress,
          name: params.name,
          symbol: params.symbol,
          decimals: params.decimals,
        },
      },
      {
        command: 'initializeToken',
        params: {
          initialSupply: params.initialSupply ?? '0',
          maxSupply: params.maxSupply ?? '0',
        },
      },
    ];

    if (params.createReserve && params.reserveAddress) {
      commands.push({
        command: 'configureReserve',
        params: {
          reserveAddress: params.reserveAddress,
          reserveInitialAmount: params.reserveInitialAmount ?? '0',
        },
      });
    }

    return commands;
  }

  protected createResult(
    subResults: Map<string, TransactionResultLike>,
    _params: CreateStableCoinParams,
  ): CreateStableCoinResult {
    const deployResult = subResults.get('deployProxy');
    const initResult = subResults.get('initializeToken');

    return {
      success: true,
      transactionId: deployResult?.transactionId ?? '',
      proxyAddress: (deployResult as any)?.proxyAddress ?? '',
      tokenId: (initResult as any)?.tokenId ?? '',
    };
  }

  protected validateParams(params: CreateStableCoinParams): void {
    if (!params.name) throw new Error('Token name is required');
    if (!params.symbol) throw new Error('Token symbol is required');
    if (!params.factoryAddress) throw new Error('Factory address is required');
    if (params.decimals < 0 || params.decimals > 18) {
      throw new Error('Decimals must be between 0 and 18');
    }
  }
}
