import { ExecutionMode } from '../types/ExecutionMode.js';
import { TransactionResultLike } from '../types/PipelineContext.js';

// ── Params base para todos los command handlers ────────────────────────
export interface CommandParams {
  /** Dirección EVM del proxy del stablecoin (0x...) */
  contractAddress?: string;
  /** Gas personalizado (opcional, override del default del handler) */
  gas?: number;
}

// ── Resultado base para commands ───────────────────────────────────────
export interface TransactionResult extends TransactionResultLike {
  success: boolean;
  transactionId?: string;
}

// ── Params y resultado base para queries ───────────────────────────────
export interface QueryParams {
  /** Dirección EVM del proxy del stablecoin */
  contractAddress: string;
}

export interface QueryResult {
  success: boolean;
}

// ── Params específicos reutilizables ───────────────────────────────────

/** Operaciones que solo necesitan un amount (burn, rescue, rescueHBAR) */
export interface AmountParams extends CommandParams {
  amount: string;
}

/** Operaciones que necesitan un targetId (freeze, unfreeze, grantKyc, revokeKyc) */
export interface TargetParams extends CommandParams {
  targetId: string;
}

/** Operaciones que necesitan targetId + amount (cashIn, wipe, transfer parcial) */
export interface TargetAmountParams extends CommandParams {
  targetId: string;
  amount: string;
}

/** Operaciones de roles (grantRole, revokeRole) */
export interface RoleParams extends CommandParams {
  targetId: string;
  role: string;  // bytes32 del rol
}

/** Resultado con amount (burn, cashIn, wipe, etc.) */
export interface AmountResult extends TransactionResult {
  amount: string;
}

/** Resultado con targetId + amount */
export interface TargetAmountResult extends TransactionResult {
  targetId: string;
  amount: string;
}
