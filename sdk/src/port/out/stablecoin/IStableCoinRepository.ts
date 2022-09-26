import { StableCoinRole } from '../../../core/enum.js';
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
	cashInHTS(
		privateKey: PrivateKey,
		accountId: AccountId,
		tokenId: string,
		amount: number,
	): Promise<boolean>;
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
	wipeHTS(
		privateKey: PrivateKey,
		accountId: AccountId,
		tokenId: string,
		wipeAccountId: string,
		amount: number,
	): Promise<boolean>;
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
	grantRole(
		treasuryId: string,
		address: string,
		privateKey: PrivateKey,
		accountId: AccountId,
		role: StableCoinRole,
	): Promise<Uint8Array>;
	revokeRole(
		treasuryId: string,
		address: string,
		privateKey: PrivateKey,
		accountId: AccountId,
		role: StableCoinRole,
	): Promise<Uint8Array>;
	hasRole(
		treasuryId: string,
		address: string,
		privateKey: PrivateKey,
		accountId: AccountId,
		role: StableCoinRole,
	): Promise<Uint8Array>;
	transferHTS(
		privateKey: PrivateKey,
		accountId: AccountId,
		tokenId: string,
		amount: number,		
		outAccountId: string,
		inAccountId: string, 
	): Promise<boolean>;
}
