import { BigNumber, FixedNumber } from '@hashgraph/hethers';
import BigDecimal from '../../../../src/domain/context/stablecoin/BigDecimal.js';
import { parseFixed } from '@ethersproject/bignumber';

const getNumber = (
  decimals: number,
  values?: {
    integer?: string;
    decimal?: string;
    separated?: boolean;
  },
): string => {
  const { integer = '100', decimal = '1', separated = true } = values ?? {};
  let res = integer;
  if (decimals < decimal.length && decimal !== '1') {
    throw new Error('Decimal value longer than decimals specified.');
  }
  if (decimals > 0) {
    res += separated ? '.' : '';
    res += decimal.padStart(decimals, '0');
  }
  return res;
};

describe('🧪 [DOMAIN] BigDecimal', () => {
  it('Gets a number correctly', () => {
    const numInt = getNumber(0);
    const num4Dec = getNumber(4, {
      integer: '100',
      decimal: '14',
    });
    const num18Dec = getNumber(18);
    const num18DecInt1 = getNumber(18, {
      integer: '1',
      decimal: '18',
      separated: false,
    });
    expect(numInt).toBe('100');
    expect(num4Dec).toBe('100.0014');
    expect(num18Dec).toBe('100.000000000000000001');
    expect(num18DecInt1).toBe('1000000000000000018');
  });

  it('Create from formatted float string: 100', () => {
    const val = getNumber(0);
    const num = BigDecimal.fromValue(BigNumber.from(val));
    expect(num).not.toBeNull();
    expect(num.toString()).toBe('100.0');
  });

  it('Create from formatted float string: 100.14', () => {
    const val = getNumber(2, { integer: '100', decimal: '14' });
    const num = BigDecimal.fromString(val, 'fixed');
    expect(num).not.toBeNull();
    expect(num.toString()).toBe(val);
  });

  it('Create from formatted float string: 100.0014', () => {
    const val = getNumber(4, { integer: '100', decimal: '14' });
    const num = BigDecimal.fromString(val);
    expect(num).not.toBeNull();
    expect(num.toString()).toBe(val);
  });

  it('Create from formatted float string: 100.00000000000000001', () => {
    const val = getNumber(17, { integer: '100', decimal: '1' });
    const num = BigDecimal.fromString(val);
    expect(num).not.toBeNull();
    expect(num.toString()).toBe(val);
  });

  it('Create from big integer string: 10000000000000000001 with 17 decimals', () => {
    const val = getNumber(17, { integer: '100', decimal: '1' });
    const num = BigDecimal.fromValue(
      BigNumber.from('10000000000000000001'),
      17,
    );
    expect(num).not.toBeNull();
    expect(num.toString()).toBe(val);
  });

  it('Create from big integer string: 10000000000000000001 with 4 decimals', () => {
    const format = {
      integer: '1000000000000000',
      separated: false,
    };
    const num = BigDecimal.fromValue(BigNumber.from(getNumber(4, format)), 4);
    expect(num).not.toBeNull();
    expect(num.toString()).toBe(getNumber(4, { ...format, separated: true }));
  });

  it('Adds to number with 18 decimals', () => {
    const format = {
      integer: '100',
      separated: false,
    };
    const val = getNumber(18, format);
    const num = BigDecimal.fromValue(BigNumber.from(val), 18);
    expect(num).not.toBeNull();
    expect(num.toString()).toBe(getNumber(18, { ...format, separated: true }));
    expect(addUnsafe('1')).toBe(getNumber(18, { integer: '101' }));
    expect(addUnsafe('100')).toBe(getNumber(18, { integer: '200' }));
    expect(addUnsafe(getNumber(18, { integer: '200', decimal: '1' }))).toBe(
      getNumber(18, { integer: '300', decimal: '2' }),
    );

    function addUnsafe(val: string): string {
      return num.addUnsafe(BigDecimal.fromString(val)).toString();
    }
  });

  it('Subtracts to number with 18 decimals', () => {
    const format = {
      integer: '100',
      separated: false,
    };
    const val = getNumber(18, format);
    const num = BigDecimal.fromValue(BigNumber.from(val), 18);
    expect(num).not.toBeNull();
    expect(num.toString()).toBe(getNumber(18, { ...format, separated: true }));
    expect(subtractUnsafe('1')).toBe(getNumber(18, { integer: '99' }));
    expect(subtractUnsafe('10')).toBe(getNumber(18, { integer: '90' }));
    expect(subtractUnsafe(getNumber(18, { integer: '10' }))).toBe('90.0');

    function subtractUnsafe(val: string): string {
      return num.subUnsafe(BigDecimal.fromString(val)).toString();
    }
  });

  it('BigDecimal to bigint', () => {
    const bigDecimal: BigDecimal = BigDecimal.fromString('1000');
    console.log(bigDecimal);

    console.log((bigDecimal as BigDecimal).toBigInt());

    console.log(bigDecimal.format.decimals);

    console.log(
      parseFixed(bigDecimal._value, bigDecimal.format.decimals).toBigInt(),
    );
    expect(BigInt(bigDecimal.toBigInt())).toBe(10000n);
  });
});
