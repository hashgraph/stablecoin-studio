import { ensureBytes32 } from '../../../../core/handlers/types.js';

describe('ensureBytes32', () => {
  it('should pad short hex to 32 bytes', () => {
    const result = ensureBytes32('0x01');
    expect(result.length).toBe(32);
    expect(result[31]).toBe(1);
    expect(result[0]).toBe(0);
  });

  it('should handle full 32-byte hex', () => {
    const fullHex = '0x' + 'ab'.repeat(32);
    const result = ensureBytes32(fullHex);
    expect(result.length).toBe(32);
    expect(result[0]).toBe(0xab);
  });

  it('should handle hex without 0x prefix', () => {
    const result = ensureBytes32('ff');
    expect(result.length).toBe(32);
    expect(result[31]).toBe(0xff);
  });

  it('should throw for hex exceeding 32 bytes', () => {
    const tooLong = '0x' + 'ab'.repeat(33);
    expect(() => ensureBytes32(tooLong)).toThrow('Bytes32 value exceeds 32 bytes');
  });

  it('should handle empty hex (all zeros)', () => {
    const result = ensureBytes32('0x');
    expect(result.length).toBe(32);
    expect(result.every((b: number) => b === 0)).toBe(true);
  });
});
