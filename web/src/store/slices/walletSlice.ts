import { createSlice } from '@reduxjs/toolkit';
import type { InitializationData } from 'hedera-stable-coin-sdk';
import type { RootState } from '../store';

interface InitialStateProps {
	data: InitializationData;
	loading: boolean;
}

const initialState: InitialStateProps = {
	data: {
		topic: '',
		pairingString: '',
		encryptionKey: '',
		savedPairings: [],
	},
	loading: false,
};

export const walletSlice = createSlice({
	name: 'wallet',
	initialState,
	reducers: {
		setData: (state, action) => {
			state.data = action.payload;
		},
		reset: () => initialState,
	},
});

export const SELECT_WALLET = (state: RootState) => state.wallet;
export const SELECT_WALLET_DATA: any = (state: RootState) => state.wallet.data;
export const SELECT_WALLET_PAIRED: any = (state: RootState) => state.wallet.data.savedPairings[0];

export const walletActions = walletSlice.actions;
