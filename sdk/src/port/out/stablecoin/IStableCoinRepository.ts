import { StableCoinRole } from '../../../core/enum.js';
import Account from '../../../domain/context/account/Account.js';
import { Capabilities } from '../../../domain/context/stablecoin/Capabilities.js';
import { StableCoin } from '../../../domain/context/stablecoin/StableCoin.js';
import IStableCoinList from '../../in/sdk/response/IStableCoinList.js';

export default interface IStableCoinRepository {
	saveCoin(coin: StableCoin, account: Account): Promise<StableCoin>;
	getListStableCoins(account: Account): Promise<IStableCoinList[]>;
	getStableCoin(id: string): Promise<StableCoin>;
	getCapabilitiesStableCoin(
		id: string,
		publickey: string,
	): Promise<Capabilities[]>;
	getBalanceOf(
		treasuryId: string,
		targetId: string,
		tokenId: string,
		account: Account,
	): Promise<Uint8Array>;
	getNameToken(treasuryId: string, account: Account): Promise<Uint8Array>;
	cashIn(
		treasuryId: string,
		targetId: string,
		amount: number,
		account: Account,
	): Promise<Uint8Array>;
	cashInHTS(
		tokenId: string,
		amount: number,
		account: Account,
	): Promise<boolean>;
	cashOut(
		treasuryId: string,
		amount: number,
		account: Account,
	): Promise<Uint8Array>;
	cashOutHTS(
		tokenId: string,
		amount: number,
		account: Account,
	): Promise<boolean>;
	associateToken(treasuryId: string, account: Account): Promise<Uint8Array>;
	wipe(
		treasuryId: string,
		targetId: string,
		amount: number,
		account: Account,
	): Promise<Uint8Array>;
	wipeHTS(
		tokenId: string,
		wipeAccountId: string,
		amount: number,
		account: Account,
	): Promise<boolean>;
	grantSupplierRole(
		treasuryId: string,
		address: string,
		account: Account,
		amount?: number,
	): Promise<Uint8Array>;
	isUnlimitedSupplierAllowance(
		treasuryId: string,
		address: string,
		account: Account,
	): Promise<Uint8Array>;
	supplierAllowance(
		treasuryId: string,
		address: string,
		account: Account,
	): Promise<Uint8Array>;
	revokeSupplierRole(
		treasuryId: string,
		address: string,
		account: Account,
	): Promise<Uint8Array>;
	resetSupplierAllowance(
		treasuryId: string,
		address: string,
		account: Account,
	): Promise<Uint8Array>;
	increaseSupplierAllowance(
		treasuryId: string,
		address: string,
		account: Account,
		amount?: number,
	): Promise<Uint8Array>;
	decreaseSupplierAllowance(
		treasuryId: string,
		address: string,
		account: Account,
		amount?: number,
	): Promise<Uint8Array>;
	isLimitedSupplierAllowance(
		treasuryId: string,
		address: string,
		account: Account,
	): Promise<Uint8Array>;
	rescue(
		treasuryId: string,
		amount: number,
		account: Account,
	): Promise<Uint8Array>;
	grantRole(
		treasuryId: string,
		address: string,
		role: StableCoinRole,
		account: Account,
	): Promise<Uint8Array>;
	revokeRole(
		treasuryId: string,
		address: string,
		role: StableCoinRole,
		account: Account,
	): Promise<Uint8Array>;
	hasRole(
		treasuryId: string,
		address: string,
		role: StableCoinRole,
		account: Account,
	): Promise<Uint8Array>;
	transferHTS(
		tokenId: string,
		amount: number,
		outAccountId: string,
		inAccountId: string,
		account: Account,
	): Promise<boolean>;
}
