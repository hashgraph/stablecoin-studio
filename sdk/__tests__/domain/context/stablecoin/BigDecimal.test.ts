import { BigNumber } from '@hashgraph/hethers';
import BigDecimal from '../../../../src/domain/context/stablecoin/BigDecimal.js';

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
    expect(num.toString()).toBe('100');
  });

  it('Create from formatted float string: 100.14', () => {
    const val = getNumber(2, { integer: '100', decimal: '14' }); // 100.14
    const num = BigDecimal.fromString(val, 2);
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
      return num.addUnsafe(BigDecimal.fromString(val, 18)).toString();
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
    expect(subtractUnsafe(getNumber(18, { integer: '10' }))).toBe('90');

    function subtractUnsafe(val: string): string {
      return num.subUnsafe(BigDecimal.fromString(val, 18)).toString();
    }
  });

  it('Test isGreaterOrEqualThan', async () => {
    const a = BigDecimal.fromString('100', 0);
    const b = BigDecimal.fromString('100', 0);
    const c = BigDecimal.fromString('10', 0);
    const d = BigDecimal.fromString('150', 0);
    expect(a.isGreaterOrEqualThan(b)).toBeTruthy();
    expect(a.isGreaterOrEqualThan(c)).toBeTruthy();
    expect(a.isGreaterOrEqualThan(d)).toBeFalsy();
  });

  it('Test isLowerOrEqualThan', async () => {
    const a = BigDecimal.fromString('100', 0);
    const b = BigDecimal.fromString('100', 0);
    const c = BigDecimal.fromString('10', 0);
    const d = BigDecimal.fromString('150', 0);
    expect(a.isLowerOrEqualThan(b)).toBeTruthy();
    expect(a.isLowerOrEqualThan(c)).toBeFalsy();
    expect(a.isLowerOrEqualThan(d)).toBeTruthy();
  });

  it('Test isLowerThan', async () => {
    const a = BigDecimal.fromString('100', 0);
    const b = BigDecimal.fromString('100', 0);
    const c = BigDecimal.fromString('10', 0);
    const d = BigDecimal.fromString('150', 0);
    expect(a.isLowerThan(b)).toBeFalsy();
    expect(a.isLowerThan(c)).toBeFalsy();
    expect(a.isLowerThan(d)).toBeTruthy();
  });

  it('Test isGreaterThan', async () => {
    const a = BigDecimal.fromString('100', 0);
    const b = BigDecimal.fromString('100', 0);
    const c = BigDecimal.fromString('10', 0);
    const d = BigDecimal.fromString('150', 0);
    expect(a.isGreaterThan(b)).toBeFalsy();
    expect(a.isGreaterThan(c)).toBeTruthy();
    expect(a.isGreaterThan(d)).toBeFalsy();
  });

  it('Test isEqualThan', async () => {
    const a = BigDecimal.fromString('100', 0);
    const b = BigDecimal.fromString('100', 0);
    const c = BigDecimal.fromString('10', 0);
    const d = BigDecimal.fromString('150', 0);
    expect(a.isEqualThan(b)).toBeTruthy();
    expect(a.isEqualThan(c)).toBeFalsy();
    expect(a.isEqualThan(d)).toBeFalsy();
  });

  it('Test fromStringHedera', () => {
    const a = BigDecimal.fromStringFixed('1000000', 6);
    const b = BigDecimal.fromStringFixed('1500000', 6);
    expect(a.toString()).toBe('1');
    expect(b.toString()).toBe('1.5');
  });

  it('Test setDecimals', () => {
    let num = BigDecimal.fromStringFixed('10012345678', 8);
    num = num.subUnsafe(BigDecimal.fromString('0.001', 3).setDecimals(8));
    const num2be = num.setDecimals(12);
    expect(num.toString()).toEqual(num2be.toString());
  });

  it('For testing', async () => {
    // 10     6 dec
    // "10"

    //Mirror
    // 10000000 --> 6 dec -> 10.0
    // const val = getNumber(17, { integer: '100', decimal: '1' }); // 100.00000000000000001

    // 100 => 100.0
    const num = BigDecimal.isBigDecimal('100.asd');
    const num2 = BigDecimal.isBigDecimal('100.100.100');
    const num3 = BigDecimal.isBigDecimal('100100.100');
    const num4 = BigDecimal.isBigDecimal('asda100,100.100');
    const num5 = BigDecimal.isBigDecimal('');
    expect(num).toBeFalsy();
    expect(num2).toBeFalsy();
    expect(num3).toBeTruthy();
    expect(num4).toBeFalsy();
    expect(num5).toBeFalsy();
  });
});
