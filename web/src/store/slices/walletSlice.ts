import { createSlice } from '@reduxjs/toolkit';
import type { InitializationData } from 'hedera-stable-coin-sdk';

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

// TODO: Add const for selector

export const walletActions = walletSlice.actions;
