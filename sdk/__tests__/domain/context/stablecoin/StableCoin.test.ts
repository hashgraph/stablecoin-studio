import { StableCoin } from '../../../../src/domain/context/stablecoin/StableCoin.js';
import { TokenSupplyType } from '../../../../src/domain/context/stablecoin/TokenSupply.js';
import { TokenType } from '../../../../src/domain/context/stablecoin/TokenType.js';
import { AccountId } from '../../../../src/index.js';
import { baseCoin } from '../../../core/core.js';
import BigDecimal from '../../../../src/domain/context/stablecoin/BigDecimal.js';

describe('🧪 [DOMAIN] StableCoin', () => {
  it('Instantiate the class', () => {
    const coin = new StableCoin({
      name: baseCoin.name,
      symbol: baseCoin.symbol,
      decimals: baseCoin.decimals,
    });
    expect(coin).not.toBeNull();
  });

  it('Create an base instance', () => {
    const coin = new StableCoin({
      name: baseCoin.name,
      symbol: baseCoin.symbol,
      decimals: baseCoin.decimals,
    });
    expect(coin).not.toBeNull();
    expect(coin.name).toBe(baseCoin.name);
    expect(coin.symbol).toBe(baseCoin.symbol);
    expect(coin.decimals).toBe(baseCoin.decimals);
    expect(coin.initialSupply).toBe(BigDecimal.ZERO);
    expect(coin.maxSupply).toBe(undefined);
    expect(coin.memo).toStrictEqual("");
    expect(coin.freezeKey).toStrictEqual(undefined);
    expect(coin.freezeDefault).toBe(false);
    expect(coin.kycKey).toStrictEqual(undefined);
    expect(coin.wipeKey).toStrictEqual(undefined);
    expect(coin.supplyKey).toStrictEqual(undefined);
    expect(coin.treasury).toStrictEqual(AccountId.NULL);
    expect(coin.tokenType).toBe(TokenType.FUNGIBLE_COMMON);
    expect(coin.supplyType).toBe(TokenSupplyType.INFINITE);
  });

  it('Create an instance with all properties', () => {
    const coin = new StableCoin({
      name: baseCoin.name,
      symbol: baseCoin.symbol,
      decimals: baseCoin.decimals,
    });
    expect(coin).not.toBeNull();
    expect(coin.name).toBe(baseCoin.name);
    expect(coin.symbol).toBe(baseCoin.symbol);
    expect(coin.decimals).toBe(baseCoin.decimals);
  });

  it('Create an instance with valid decimals, check against amounts', () => {
    const coin = new StableCoin({
      name: baseCoin.name,
      symbol: baseCoin.symbol,
      decimals: baseCoin.decimals,
    });
    expect(coin).not.toBeNull();
    expect(coin.name).toBe(baseCoin.name);
    expect(coin.symbol).toBe(baseCoin.symbol);
    expect(coin.decimals).toBe(baseCoin.decimals);
    expect(coin.isValidAmount(100.4213214241232)).toBeFalsy();
    expect(coin.isValidAmount(100)).toBeTruthy();
    expect(coin.isValidAmount(100.42)).toBeTruthy();
    expect(coin.isValidAmount(100.1)).toBeTruthy();
  });

  it('Create an instance with valid decimals, convert from integer', () => {
    const coin = new StableCoin({
      name: baseCoin.name,
      symbol: baseCoin.symbol,
      decimals: baseCoin.decimals,
    });
    expect(coin).not.toBeNull();
    expect(coin.name).toBe(baseCoin.name);
    expect(coin.symbol).toBe(baseCoin.symbol);
    expect(coin.decimals).toBe(baseCoin.decimals);
    expect(coin.fromInteger(1004213214241232)).toBe(1004213214241.232);
    expect(coin.fromInteger(100000)).toBe(100.0);
    expect(coin.fromInteger(100420)).toBe(100.42);
    expect(coin.fromInteger(100100)).toBe(100.1);
  });
});
