import { ExecutionMode } from '../types/ExecutionMode.js';

export class UnsupportedModeError extends Error {
  constructor(command: string, mode: ExecutionMode, supported: ExecutionMode[]) {
    super(
      `Handler '${command}' does not support mode '${mode}'. ` +
      `Supported: [${supported.join(', ')}]`
    );
    this.name = 'UnsupportedModeError';
  }
}
