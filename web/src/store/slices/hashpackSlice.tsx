import { createSlice } from '@reduxjs/toolkit';
import { ConnectionState } from 'hedera-stable-coin-sdk';
import type { RootState } from '../store';

interface InitialState {
	isConnected: boolean;
	isInitialized: boolean;
	loading: boolean;
	status: ConnectionState;
}

export const initialState: InitialState = {
	isConnected: false,
	isInitialized: false,
	loading: false,
	status: ConnectionState.Disconnected,
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
		setStatus(state, action) {
			state.status = action.payload;
		},
	},
});

export const IS_INITIALIZED = (state: RootState) => state.hashpack.isInitialized;
export const IS_CONNECTED = (state: RootState) => state.hashpack.isConnected;
export const HASHPACK_STATUS = (state: RootState) => state.hashpack.status;

export const hashpackActions = hashpackSlice.actions;
