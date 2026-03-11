import { PipelineError } from '../../../core/errors/PipelineError.js';
import { UnsupportedModeError } from '../../../core/errors/UnsupportedModeError.js';
import { CapabilityError } from '../../../core/errors/CapabilityError.js';

describe('PipelineError', () => {
  it('should create a PipelineError with step, command, and context', () => {
    const error = new PipelineError({
      message: 'Something went wrong',
      step: 'BuildHederaStep',
      command: 'CreateToken',
      context: { hasTransaction: true },
    });

    expect(error).toBeInstanceOf(Error);
    expect(error).toBeInstanceOf(PipelineError);
    expect(error.message).toBe('Something went wrong');
    expect(error.name).toBe('PipelineError');
    expect(error.step).toBe('BuildHederaStep');
    expect(error.command).toBe('CreateToken');
    expect(error.context).toEqual({ hasTransaction: true });
  });

  it('should default context to empty object when not provided', () => {
    const error = new PipelineError({
      message: 'Error without context',
      step: 'SubmitToHedera',
      command: 'TransferToken',
    });

    expect(error.context).toEqual({});
  });

  it('should propagate cause correctly', () => {
    const originalError = new Error('Original cause');
    const error = new PipelineError({
      message: 'Wrapper error',
      cause: originalError,
      step: 'SignWithClientStep',
      command: 'MintToken',
    });

    expect(error.cause).toBe(originalError);
  });

  it('should have correct prototype chain for instanceof checks', () => {
    const error = new PipelineError({
      message: 'Test',
      step: 'TestStep',
      command: 'TestCommand',
    });

    expect(error instanceof PipelineError).toBe(true);
    expect(error instanceof Error).toBe(true);
  });
});

describe('UnsupportedModeError', () => {
  it('should create an UnsupportedModeError with correct message', () => {
    const error = new UnsupportedModeError('CreateToken', 'evm', ['hedera']);

    expect(error).toBeInstanceOf(Error);
    expect(error).toBeInstanceOf(UnsupportedModeError);
    expect(error.name).toBe('UnsupportedModeError');
    expect(error.message).toContain("Handler 'CreateToken'");
    expect(error.message).toContain("mode 'evm'");
    expect(error.message).toContain('[hedera]');
  });

  it('should show all supported modes in error message', () => {
    const error = new UnsupportedModeError('MintToken', 'hedera', ['evm', 'hedera']);

    expect(error.message).toContain('evm, hedera');
  });

  it('should have empty supported list message when no modes supported', () => {
    const error = new UnsupportedModeError('BurnToken', 'evm', []);

    expect(error.message).toContain('[]');
  });
});

describe('CapabilityError', () => {
  it('should create a CapabilityError with the provided message', () => {
    const error = new CapabilityError('Handler does not support this capability');

    expect(error).toBeInstanceOf(Error);
    expect(error).toBeInstanceOf(CapabilityError);
    expect(error.name).toBe('CapabilityError');
    expect(error.message).toBe('Handler does not support this capability');
  });

  it('should have correct prototype chain for instanceof checks', () => {
    const error = new CapabilityError('Test capability error');

    expect(error instanceof CapabilityError).toBe(true);
    expect(error instanceof Error).toBe(true);
  });
});
