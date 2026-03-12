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

import {
  CommandHandlerLike,
  HederaTransaction,
  EVMTransaction,
  AnyReceipt,
  TransactionResultLike,
} from '../types/PipelineContext.js';
import { ExecutionMode } from '../types/ExecutionMode.js';
import { CommandParams, TransactionResult } from './types.js';
import { ContractExecuteTransaction, ContractFunctionParameters, ContractId, Long } from '@hiero-ledger/sdk';
import { ethers } from 'ethers';

/**
 * Clase base abstracta para todos los command handlers de smart contract.
 *
 * Cada handler concreto hereda de esta clase y solo implementa:
 * - mapParamsToArgs(): cómo convertir params a argumentos del contrato
 * - buildHederaFunctionParams(): cómo codificar params para Hedera
 * - createResult(): cómo interpretar el receipt
 * - (opcional) validateParams(): validaciones de negocio
 *
 * La clase base implementa CommandHandlerLike, por lo que los pipelines
 * pueden usarla directamente.
 */
export abstract class BaseCommandHandler<
  TParams extends CommandParams = CommandParams,
  TResult extends TransactionResult = TransactionResult,
> implements CommandHandlerLike {

  constructor(
    /** Nombre del método del contrato Solidity (ej: 'burn', 'mint', 'pause') */
    protected readonly methodName: string,
    /** ABI fragment para ethers.Interface (ej: ['function burn(uint256 amount)']) */
    protected readonly abi: string[],
    /** Gas por defecto para esta operación */
    protected readonly defaultGas: number,
    /** Modos de ejecución soportados */
    protected readonly modes: ExecutionMode[] = ['hedera', 'evm'],
  ) {}

  // ══════════════════════════════════════════════════════════════════════
  // MÉTODOS ABSTRACTOS — cada handler concreto los implementa
  // ══════════════════════════════════════════════════════════════════════

  /**
   * Convierte los params tipados a un array de argumentos para la función
   * del contrato. El orden debe coincidir con la firma ABI.
   *
   * Ejemplo para burn: [BigInt(params.amount)]
   * Ejemplo para mint: [params.targetId, BigInt(params.amount)]
   */
  protected abstract mapParamsToArgs(params: TParams): unknown[];

  /**
   * Codifica los params como ContractFunctionParameters de Hedera SDK.
   * Necesario porque Hedera no usa ABI encoding estándar.
   *
   * Ejemplo para burn: new ContractFunctionParameters().addUint256(BigInt(amount))
   */
  protected abstract buildHederaFunctionParams(params: TParams): ContractFunctionParameters;

  /**
   * Interpreta el receipt de la transacción y construye el resultado tipado.
   */
  protected abstract createResult(receipt: AnyReceipt, params: TParams): TResult;

  // ══════════════════════════════════════════════════════════════════════
  // MÉTODOS OPCIONALES — override solo si hace falta
  // ══════════════════════════════════════════════════════════════════════

  /** Validaciones de negocio. Override para añadir validaciones. */
  protected validateParams(_params: TParams): void {
    // No-op por defecto. Los handlers concretos pueden override.
  }

  /** Gas personalizado. Override si el gas depende de los params. */
  protected getGas(_params: TParams): number {
    return this.defaultGas;
  }

  // ══════════════════════════════════════════════════════════════════════
  // IMPLEMENTACIÓN DE CommandHandlerLike — NO override
  // ══════════════════════════════════════════════════════════════════════

  buildHederaTransaction(rawParams: Record<string, unknown>): HederaTransaction {
    const params = rawParams as unknown as TParams;
    this.validateParams(params);
    const funcParams = this.buildHederaFunctionParams(params);
    const tx = new ContractExecuteTransaction()
      .setGas(this.getGas(params))
      .setFunction(this.methodName, funcParams);
    if (params.contractAddress) {
      tx.setContractId(ContractId.fromSolidityAddress(params.contractAddress));
    }
    return tx;
  }

  async buildEVMTransaction(rawParams: Record<string, unknown>): Promise<EVMTransaction> {
    const params = rawParams as unknown as TParams;
    this.validateParams(params);
    const args = this.mapParamsToArgs(params);
    const iface = new ethers.Interface(this.abi);
    const data = iface.encodeFunctionData(this.methodName, args);
    return { data, gasLimit: this.getGas(params) } as unknown as EVMTransaction;
  }

  analyze(receipt: AnyReceipt, rawParams: Record<string, unknown>): TransactionResultLike {
    const params = rawParams as unknown as TParams;
    return this.createResult(receipt, params);
  }

  supportsMode(mode: ExecutionMode): boolean {
    return this.modes.includes(mode);
  }

  getSupportedModes(): ExecutionMode[] {
    return [...this.modes];
  }

  validate(rawParams: Record<string, unknown>): void {
    this.validateParams(rawParams as unknown as TParams);
  }

  /** Nombre del método (útil para debugging/logging) */
  getMethodName(): string {
    return this.methodName;
  }
}
