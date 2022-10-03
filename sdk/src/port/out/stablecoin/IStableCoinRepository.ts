import { StableCoinRole } from '../../../core/enum.js';
import Account from '../../../domain/context/account/Account.js';
import AccountId from '../../../domain/context/account/AccountId.js';
import PrivateKey from '../../../domain/context/account/PrivateKey.js';
import { Capabilities } from '../../../domain/context/stablecoin/Capabilities.js';
import { StableCoin } from '../../../domain/context/stablecoin/StableCoin.js';
import IStableCoinList from '../../in/sdk/response/IStableCoinList.js';

export default interface IStableCoinRepository {
	saveCoin(
		account: Account,
		coin: StableCoin,
	): Promise<StableCoin>;
	getListStableCoins(account: Account): Promise<IStableCoinList[]>;
	getStableCoin(id: string): Promise<StableCoin>;
	getCapabilitiesStableCoin(id: string, publickey:string): Promise <Capabilities[]> ;
	getBalanceOf(
		account: Account,
		treasuryId: string,
		targetId: string,
		tokenId: string,
	): Promise<Uint8Array>;
	getNameToken(
		account: Account,
		treasuryId: string,
	): Promise<Uint8Array>;
	cashIn(
		account: Account,
		treasuryId: string,
		targetId: string,
		amount: number,
	): Promise<Uint8Array>;
	cashInHTS(
		account: Account,
		tokenId: string,
		amount: number,
	): Promise<boolean>;	
	cashOut(
		account: Account,
		treasuryId: string,
		amount: number,
	): Promise<Uint8Array>;
	cashOutHTS(
		account: Account,
		tokenId: string,
		amount: number,
	): Promise<boolean>;	
	associateToken(
		account: Account,
		treasuryId: string,
	): Promise<Uint8Array>;
	wipe(
		account: Account,
		treasuryId: string,
		targetId: string,
		amount: number,
	): Promise<Uint8Array>;
	wipeHTS(
		account: Account,
		tokenId: string,
		wipeAccountId: string,
		amount: number,
	): Promise<boolean>;
	grantSupplierRole(
		account: Account,
		treasuryId: string,
		address: string,
		amount?: number,
	): Promise<Uint8Array>;
	isUnlimitedSupplierAllowance(
		account: Account,
		treasuryId: string,
		address: string,
	): Promise<Uint8Array>;
	supplierAllowance(
		account: Account,
		treasuryId: string,
		address: string,
	): Promise<Uint8Array>;
	revokeSupplierRole(
		account: Account,
		treasuryId: string,
		address: string,
	): Promise<Uint8Array>;
	resetSupplierAllowance(
		account: Account,
		treasuryId: string,
		address: string,
	): Promise<Uint8Array>;
	increaseSupplierAllowance(
		account: Account,
		treasuryId: string,
		address: string,
		amount?: number,
	): Promise<Uint8Array>;
	decreaseSupplierAllowance(
		account: Account,
		treasuryId: string,
		address: string,
		amount?: number,
	): Promise<Uint8Array>;
	isLimitedSupplierAllowance(
		account: Account,
		treasuryId: string,
		address: string,
	): Promise<Uint8Array>;
	rescue(
		account: Account,
		treasuryId: string,
		amount: number,
	): Promise<Uint8Array>;
	grantRole(
		account: Account,
		treasuryId: string,
		address: string,
		role: StableCoinRole,
	): Promise<Uint8Array>;
	revokeRole(
		account: Account,
		treasuryId: string,
		address: string,
		role: StableCoinRole,
	): Promise<Uint8Array>;
	hasRole(
		account: Account,
		treasuryId: string,
		address: string,
		role: StableCoinRole,
	): Promise<Uint8Array>;
	transferHTS(
		account: Account,
		tokenId: string,
		amount: number,		
		outAccountId: string,
		inAccountId: string, 
	): Promise<boolean>;
}
