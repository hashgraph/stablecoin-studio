import { createSelector } from 'reselect';

const getWalletState = (state: any) => state.wallet;

export const SELECTED_WALLET_PAIRED_ACCOUNT_RECOGNIZED = createSelector(
	[getWalletState],
	(wallet) => wallet.accountRecognized,
);

export const LAST_WALLET_SELECTED = createSelector([getWalletState], (wallet) => wallet.lastWallet);

export const SELECTED_NETWORK_RECOGNIZED = createSelector(
	[getWalletState],
	(wallet) => wallet.networkRecognized,
);

export const SELECTED_NETWORK = createSelector([getWalletState], (wallet) => wallet.network);
