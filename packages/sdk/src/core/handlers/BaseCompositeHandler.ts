import { CommandHandlerLike, TransactionResultLike } from '../types/PipelineContext.js';
import { ExecutionMode } from '../types/ExecutionMode.js';
import { CommandParams, TransactionResult } from './types.js';

/**
 * Resultado de un sub-comando dentro de un CompositeHandler.
 */
export interface SubCommand {
  command: string;
  params: Record<string, unknown>;
}

/**
 * Clase base para operaciones que requieren múltiples transacciones secuenciales
 * (como create, que necesita: deploy proxy → initialize token → configure reserve).
 *
 * A diferencia de BaseCommandHandler (que mapea 1:1 con un método de contrato),
 * el CompositeHandler orquesta N sub-commands.
 *
 * No implementa CommandHandlerLike directamente porque no tiene un solo
 * buildHederaTransaction. En su lugar, proporciona getSubCommands() que
 * el adapter/orquestador llama para obtener la secuencia de operaciones.
 */
export abstract class BaseCompositeHandler<
  TParams extends CommandParams = CommandParams,
  TResult extends TransactionResult = TransactionResult,
> {

  constructor(
    protected readonly commandName: string,
    protected readonly modes: ExecutionMode[] = ['hedera', 'evm'],
  ) {}

  // ══════════════════════════════════════════════════════════════════════
  // MÉTODOS ABSTRACTOS
  // ══════════════════════════════════════════════════════════════════════

  /**
   * Descompone la operación compleja en sub-commands secuenciales.
   * Cada sub-command será ejecutado por su handler individual a través del pipeline.
   */
  protected abstract getSubCommands(params: TParams): SubCommand[];

  /**
   * Combina los resultados de todos los sub-commands en un resultado final.
   */
  protected abstract createResult(
    subResults: Map<string, TransactionResultLike>,
    params: TParams,
  ): TResult;

  // ══════════════════════════════════════════════════════════════════════
  // MÉTODOS OPCIONALES
  // ══════════════════════════════════════════════════════════════════════

  /** Validaciones previas a la ejecución de cualquier sub-command */
  protected validateParams(_params: TParams): void {}

  // ══════════════════════════════════════════════════════════════════════
  // MÉTODOS CONCRETOS
  // ══════════════════════════════════════════════════════════════════════

  /**
   * Ejecuta la operación compuesta:
   * 1. Valida params
   * 2. Obtiene sub-commands
   * 3. Ejecuta cada sub-command a través del executor proporcionado
   * 4. Combina resultados
   *
   * @param executor - Función que ejecuta un sub-command (proporcionada por el adapter)
   * @param params - Parámetros de la operación
   */
  async execute(
    executor: (command: string, params: Record<string, unknown>) => Promise<TransactionResultLike>,
    params: TParams,
  ): Promise<TResult> {
    this.validateParams(params);

    const subCommands = this.getSubCommands(params);
    const subResults = new Map<string, TransactionResultLike>();

    for (const sub of subCommands) {
      const result = await executor(sub.command, sub.params);
      subResults.set(sub.command, result);
    }

    return this.createResult(subResults, params);
  }

  supportsMode(mode: ExecutionMode): boolean {
    return this.modes.includes(mode);
  }

  getSupportedModes(): ExecutionMode[] {
    return [...this.modes];
  }

  getCommandName(): string {
    return this.commandName;
  }
}
