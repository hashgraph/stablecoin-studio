import { ContractExecuteTransaction } from '@hiero-ledger/sdk';
import { ethers } from 'ethers';
import { ExecutionMode } from './ExecutionMode.js';

// ── Tipos de transacciones ──────────────────────────────────────────────
export type HederaTransaction = ContractExecuteTransaction;
export type EVMTransaction = ethers.ContractTransaction;
export type AnyTransaction = HederaTransaction | EVMTransaction;

export type HederaSignedTx = {
  kind: 'hedera';
  transaction: ContractExecuteTransaction;
};
export type EVMSignedTx = {
  kind: 'evm';
  rawTransaction: string;
};
export type SerializedTx = {
  kind: 'serialized';
  transactionBytes: Uint8Array;
  bodyBytes?: Uint8Array;
};
export type AnySignedTransaction = HederaSignedTx | EVMSignedTx | SerializedTx;

export type AnyResponse = any;  // TransactionResponse de Hedera o ethers
export type AnyReceipt = any;   // TransactionReceipt de Hedera o ethers
// Nota: AnyResponse y AnyReceipt usan any temporalmente porque los tipos
// exactos de Hedera SDK y ethers tienen imports pesados. Se refinarán
// cuando se integren los steps concretos.

// ── PipelineContext ─────────────────────────────────────────────────────
export interface PipelineContext {
  readonly command: string;
  readonly params: Record<string, unknown>;
  readonly handler: CommandHandlerLike;

  transaction?: AnyTransaction;
  signedTransaction?: AnySignedTransaction;
  response?: AnyResponse;
  receipt?: AnyReceipt;
  result?: TransactionResultLike;
}

// Interfaces "like" para no depender de las clases concretas de handlers
// (que se crearán después). Esto permite que el pipeline sea independiente.
export interface CommandHandlerLike {
  buildHederaTransaction(params: Record<string, unknown>): HederaTransaction;
  buildEVMTransaction(params: Record<string, unknown>): Promise<EVMTransaction>;
  analyze(receipt: AnyReceipt, params: Record<string, unknown>): TransactionResultLike;
  supportsMode(mode: ExecutionMode): boolean;
  getSupportedModes(): ExecutionMode[];
  validate(params: Record<string, unknown>): void;
}

export interface TransactionResultLike {
  success: boolean;
  transactionId?: string;
  [key: string]: unknown;
}
