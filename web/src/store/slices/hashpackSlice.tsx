import { createSlice } from '@reduxjs/toolkit';

interface InitialState {
	hasWalletExtension: boolean;
	isConnected: boolean;
	isInitialized: boolean;
	isPaired: boolean;
	loading: boolean;
}

const initialState: InitialState = {
	hasWalletExtension: false,
	isConnected: false,
	isInitialized: false,
	isPaired: false,
	loading: false,
};

export const hashpackSlice = createSlice({
	name: 'hashpack',
	initialState,
	reducers: {
		setInitialized(state) {
			state.isInitialized = true;
		},
		setHasWalletExtension(state) {
			state.hasWalletExtension = true;
		},
		setIsConnected(state, action) {
			state.isConnected = action.payload;
		},
		setIsPaired(state) {
			state.isPaired = true;
		},
	},
});

export const IS_INITIALIZED = (state: any) => state.hashpack.isInitialized;
export const HAS_WALLET_EXTENSION = (state: any) => state.hashpack.hasWalletExtension;
export const IS_CONNECTED = (state: any) => state.hashpack.isConnected;
export const IS_PAIRED = (state: any) => state.hashpack.isPaired;

export const hashpackActions = hashpackSlice.actions;
