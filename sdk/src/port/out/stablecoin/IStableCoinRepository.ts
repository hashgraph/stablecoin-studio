import AccountId from '../../../domain/context/account/AccountId.js';
import PrivateKey from '../../../domain/context/account/PrivateKey.js';
import { StableCoin } from '../../../domain/context/stablecoin/StableCoin.js';
import IStableCoinList from '../../in/sdk/response/IStableCoinList.js';

export default interface IStableCoinRepository {
	saveCoin(
		accountId: AccountId,
		privateKey: PrivateKey,
		coin: StableCoin,
	): Promise<StableCoin>;
	getListStableCoins(privateKey: PrivateKey): Promise<IStableCoinList[]>;
	getStableCoin(id: string): Promise<StableCoin>;
	getBalanceOf(
		treasuryId: string,
		privateKey: PrivateKey,
		accountId: AccountId,
		targetId: string,
		tokenId: string,
	): Promise<Uint8Array>;
	getNameToken(
		treasuryId: string,
		privateKey: PrivateKey,
		accountId: AccountId,
	): Promise<Uint8Array>;
	cashIn(
		treasuryId: string,
		privateKey: PrivateKey,
		accountId: AccountId,
		targetId: string,
		amount: number,
	): Promise<Uint8Array>;
	cashOut(
		treasuryId: string,
		privateKey: PrivateKey,
		accountId: AccountId,
		amount: number,
	): Promise<Uint8Array>;
	associateToken(
		treasuryId: string,
		privateKey: PrivateKey,
		accountId: AccountId,
	): Promise<Uint8Array>;
	wipe(
		treasuryId: string,
		privateKey: PrivateKey,
		accountId: AccountId,
		targetId: string,
		amount: number,
	): Promise<Uint8Array>;
	grantSupplierRole(
		treasuryId: string,
		address: string,
		privateKey: PrivateKey,
		accountId: AccountId,
		amount?: number,
	): Promise<Uint8Array>;
	isUnlimitedSupplierAllowance(
		treasuryId: string,
		address: string,
		privateKey: PrivateKey,
		accountId: AccountId,
	): Promise<Uint8Array>;
	supplierAllowance(
		treasuryId: string,
		address: string,
		privateKey: PrivateKey,
		accountId: AccountId,
	): Promise<Uint8Array>;
	revokeSupplierRole(
		treasuryId: string,
		address: string,
		privateKey: PrivateKey,
		accountId: AccountId,
	): Promise<Uint8Array>;
	resetSupplierAllowance(
		treasuryId: string,
		address: string,
		privateKey: PrivateKey,
		accountId: AccountId,
	): Promise<Uint8Array>;
	increaseSupplierAllowance(
		treasuryId: string,
		address: string,
		privateKey: PrivateKey,
		accountId: AccountId,
		amount?: number,
	): Promise<Uint8Array>;
	decreaseSupplierAllowance(
		treasuryId: string,
		address: string,
		privateKey: PrivateKey,
		accountId: AccountId,
		amount?: number,
	): Promise<Uint8Array>;
	isLimitedSupplierAllowance(
		treasuryId: string,
		address: string,
		privateKey: PrivateKey,
		accountId: AccountId,
	): Promise<Uint8Array>;
	rescue(
		treasuryId: string,
		privateKey: PrivateKey,
		accountId: AccountId,
		amount: number,
	): Promise<Uint8Array>;
}
