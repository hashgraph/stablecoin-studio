import Account from '../account/Account.js';

export type SupportedWallets = 'Metamask' | 'HashPack' | 'HTS' | string;

export default interface Wallet {
	type: SupportedWallets;
	account: Account;
	// Events...
}
