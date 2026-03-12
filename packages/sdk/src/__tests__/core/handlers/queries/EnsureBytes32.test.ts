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
