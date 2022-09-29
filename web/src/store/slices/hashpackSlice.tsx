import { createSlice } from '@reduxjs/toolkit';
import type { RootState } from '../store';

interface InitialState {
	isConnected: boolean;
	isInitialized: boolean;
	loading: boolean;
}

const initialState: InitialState = {
	isConnected: false,
	isInitialized: false,
	loading: false,
};

export const hashpackSlice = createSlice({
	name: 'hashpack',
	initialState,
	reducers: {
		setInitialized(state) {
			state.isInitialized = true;
		},
		setIsConnected(state, action) {
			state.isConnected = action.payload;
		},
	},
});

export const IS_INITIALIZED = (state: RootState) => state.hashpack.isInitialized;
export const IS_CONNECTED = (state: RootState) => state.hashpack.isConnected;

export const hashpackActions = hashpackSlice.actions;
