import { StableCoinRole } from '../../../core/enum.js';
import Account from '../../../domain/context/account/Account.js';
import { Capabilities } from '../../../domain/context/stablecoin/Capabilities.js';
import { StableCoin } from '../../../domain/context/stablecoin/StableCoin.js';
import IStableCoinList from '../../in/sdk/response/IStableCoinList.js';
import IAccountInfo from '../../in/sdk/response/IAccountInfo.js';
import BigDecimal from '../../../domain/context/stablecoin/BigDecimal.js';

export default interface IStableCoinRepository {
	saveCoin(coin: StableCoin, account: Account): Promise<StableCoin>;
	getListStableCoins(account: Account): Promise<IStableCoinList[]>;
	getStableCoin(id: string): Promise<StableCoin>;
	getCapabilitiesStableCoin(
		tokenId: string,
		publickey: string,
	): Promise<Capabilities[]>;
	getBalanceOf(
		proxyContractId: string,
		targetId: string,
		tokenId: string,
		account: Account,
	): Promise<string>;
	getNameToken(
		proxyContractId: string,
		account: Account,
	): Promise<Uint8Array>;
	cashIn(
		proxyContractId: string,
		targetId: string,
		amount: BigDecimal,
		account: Account,
	): Promise<Uint8Array>;
	cashInHTS(
		tokenId: string,
		amount: BigDecimal,
		account: Account,
	): Promise<boolean>;
	cashOut(
		proxyContractId: string,
		amount: BigDecimal,
		account: Account,
	): Promise<Uint8Array>;
	cashOutHTS(
		tokenId: string,
		amount: BigDecimal,
		account: Account,
	): Promise<boolean>;
	associateToken(
		proxyContractId: string,
		account: Account,
	): Promise<Uint8Array>;
	wipe(
		proxyContractId: string,
		targetId: string,
		amount: BigDecimal,
		account: Account,
	): Promise<Uint8Array>;
	wipeHTS(
		tokenId: string,
		wipeAccountId: string,
		amount: BigDecimal,
		account: Account,
	): Promise<boolean>;
	grantSupplierRole(
		proxyContractId: string,
		address: string,
		account: Account,
		amount?: BigDecimal,
	): Promise<Uint8Array>;
	isUnlimitedSupplierAllowance(
		proxyContractId: string,
		address: string,
		account: Account,
	): Promise<Uint8Array>;
	supplierAllowance(
		proxyContractId: string,
		address: string,
		account: Account,
	): Promise<Uint8Array>;
	revokeSupplierRole(
		proxyContractId: string,
		address: string,
		account: Account,
	): Promise<Uint8Array>;
	resetSupplierAllowance(
		proxyContractId: string,
		address: string,
		account: Account,
	): Promise<Uint8Array>;
	increaseSupplierAllowance(
		proxyContractId: string,
		address: string,
		account: Account,
		amount?: BigDecimal,
	): Promise<Uint8Array>;
	decreaseSupplierAllowance(
		proxyContractId: string,
		address: string,
		account: Account,
		amount?: BigDecimal,
	): Promise<Uint8Array>;
	isLimitedSupplierAllowance(
		proxyContractId: string,
		address: string,
		account: Account,
	): Promise<Uint8Array>;
	rescue(
		proxyContractId: string,
		amount: BigDecimal,
		account: Account,
	): Promise<Uint8Array>;
	grantRole(
		proxyContractId: string,
		address: string,
		role: StableCoinRole,
		account: Account,
	): Promise<Uint8Array>;
	revokeRole(
		proxyContractId: string,
		address: string,
		role: StableCoinRole,
		account: Account,
	): Promise<Uint8Array>;
	hasRole(
		proxyContractId: string,
		address: string,
		role: StableCoinRole,
		account: Account,
	): Promise<Uint8Array>;
	transferHTS(
		tokenId: string,
		amount: BigDecimal,
		outAccountId: string,
		inAccountId: string,
		account: Account,
		isApproval: boolean
	): Promise<boolean>;
	getAccountInfo(accountId: string): Promise<IAccountInfo>;
	getRoles(
		proxyContractId: string,
		address: string,
		account: Account,
	): Promise<string[]>;
}
