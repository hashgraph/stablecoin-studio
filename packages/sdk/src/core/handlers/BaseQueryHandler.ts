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

import { ethers } from 'ethers';
import { QueryParams, QueryResult } from './types.js';

/**
 * Clase base abstracta para todos los query handlers.
 *
 * Las queries son llamadas view/pure al contrato — no producen transacciones,
 * no se firman, no pasan por el pipeline. Son directas al nodo RPC.
 *
 * Cada handler concreto hereda de esta clase y solo implementa:
 * - mapParamsToArgs(): cómo convertir params a argumentos del contrato
 * - createResult(): cómo interpretar la respuesta del contrato
 */
export abstract class BaseQueryHandler<
  TParams extends QueryParams = QueryParams,
  TResult extends QueryResult = QueryResult,
> {

  constructor(
    /** Nombre del método view del contrato (ej: 'balanceOf') */
    protected readonly methodName: string,
    /** ABI fragments para ethers.Interface (ej: ['function balanceOf(address) view returns (uint256)']) */
    protected readonly abi: string[],
  ) {}

  // ══════════════════════════════════════════════════════════════════════
  // MÉTODOS ABSTRACTOS
  // ══════════════════════════════════════════════════════════════════════

  /** Convierte params tipados a argumentos para la función view del contrato */
  protected abstract mapParamsToArgs(params: TParams): unknown[];

  /** Interpreta la respuesta del contrato y construye el resultado tipado */
  protected abstract createResult(data: unknown, params: TParams): TResult | Promise<TResult>;

  // ══════════════════════════════════════════════════════════════════════
  // MÉTODO PRINCIPAL
  // ══════════════════════════════════════════════════════════════════════

  /**
   * Ejecuta la query contra el contrato.
   *
   * @param provider - Provider de ethers (conectado al nodo RPC)
   * @param params - Parámetros de la query
   * @returns Resultado tipado
   */
  async execute(provider: ethers.Provider, params: TParams): Promise<TResult> {
    const contract = new ethers.Contract(params.contractAddress, this.abi, provider);
    const args = this.mapParamsToArgs(params);
    const data = await contract[this.methodName](...args);
    return this.createResult(data, params);
  }

  /** Nombre del método (útil para debugging/logging) */
  getMethodName(): string {
    return this.methodName;
  }
}
