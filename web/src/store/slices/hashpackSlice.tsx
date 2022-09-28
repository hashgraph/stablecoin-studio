import { createSlice } from '@reduxjs/toolkit';
import type { AcknowledgeMessage } from 'hedera-stable-coin-sdk';
import type { RootState } from '../store';

interface InitialState {
	isConnected: boolean;
	isInitialized: boolean;
	loading: boolean;
	ackMessages: AcknowledgeMessage[];
}

const initialState: InitialState = {
	isConnected: false,
	isInitialized: false,
	loading: false,
	ackMessages: [],
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
		setAckMessage(state, action) {
			state.ackMessages = [...state.ackMessages, action.payload];
		},
	},
});

export const GET_ACK_MESSAGES = (state: RootState) => state.hashpack.ackMessages;
export const IS_INITIALIZED = (state: RootState) => state.hashpack.isInitialized;
export const IS_CONNECTED = (state: RootState) => state.hashpack.isConnected;

export const hashpackActions = hashpackSlice.actions;
