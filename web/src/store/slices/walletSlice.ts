import { createSlice } from '@reduxjs/toolkit';
import type { InitializationData } from 'hedera-stable-coin-sdk';
import type { RootState } from '../store';

interface InitialStateProps {
	data: InitializationData;
	hasWalletExtension: boolean;
	isPaired: boolean;
	loading: boolean;
}

const initialState: InitialStateProps = {
	data: {
		topic: '',
		pairingString: '',
		encryptionKey: '',
		savedPairings: [],
	},
	hasWalletExtension: false,
	isPaired: false,
	loading: false,
};

export const walletSlice = createSlice({
	name: 'wallet',
	initialState,
	reducers: {
		setData: (state, action) => {
			state.data = action.payload;
		},
		setHasWalletExtension(state) {
			state.hasWalletExtension = true;
		},
		setIsPaired(state) {
			state.isPaired = true;
		},
		reset: () => initialState,
	},
});

export const SELECTED_WALLET = (state: RootState) => state.wallet;
export const SELECTED_WALLET_DATA: any = (state: RootState) => state.wallet.data;
export const SELECTED_WALLET_PAIRED: any = (state: RootState) => state.wallet.data.savedPairings[0];
export const SELECTED_WALLET_PAIRED_ACCOUNTID: any = (state: RootState) =>
	state.wallet.data.savedPairings[0].accountIds[0];
export const HAS_WALLET_EXTENSION = (state: RootState) => state.wallet.hasWalletExtension;
export const IS_PAIRED = (state: RootState) => state.wallet.isPaired;

export const walletActions = walletSlice.actions;
