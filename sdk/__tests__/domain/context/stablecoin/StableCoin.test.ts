import { StableCoin } from '../../../../src/domain/context/stablecoin/StableCoin.js';
import { TokenSupplyType } from '../../../../src/domain/context/stablecoin/TokenSupply.js';
import { TokenType } from '../../../../src/domain/context/stablecoin/TokenType.js';
import DomainError from '../../../../src/domain/error/DomainError.js';
import { AccountId, PublicKey } from '../../../../src/index.js';
import { baseCoin } from '../../../core.js';

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
		expect(coin.initialSupply).toBe(0n);
		expect(coin.maxSupply).toBe(0n);
		expect(coin.memo).toBe('');
		expect(coin.freezeKey).toStrictEqual(PublicKey.NULL);
		expect(coin.freezeDefault).toBe(false);
		expect(coin.kycKey).toStrictEqual(PublicKey.NULL);
		expect(coin.wipeKey).toStrictEqual(PublicKey.NULL);
		expect(coin.supplyKey).toStrictEqual(PublicKey.NULL);
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

	it('Create an instance with valid decimals, convert to integer', () => {
		const coin = new StableCoin({
			name: baseCoin.name,
			symbol: baseCoin.symbol,
			decimals: baseCoin.decimals,
		});
		expect(coin).not.toBeNull();
		expect(coin.name).toBe(baseCoin.name);
		expect(coin.symbol).toBe(baseCoin.symbol);
		expect(coin.decimals).toBe(baseCoin.decimals);
		expect(() => coin.toInteger(100.4213214241232)).toThrow(DomainError);
		expect(coin.toInteger(100)).toBe(100000);
		expect(coin.toInteger(100.42)).toBe(100420);
		expect(coin.toInteger(100.1)).toBe(100100);
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
		expect(coin.fromInteger(100000)).toBe(100.000);
		expect(coin.fromInteger(100420)).toBe(100.420);
		expect(coin.fromInteger(100100)).toBe(100.100);
	});
});
