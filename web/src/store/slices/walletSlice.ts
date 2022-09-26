import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import type { InitializationData, StableCoin } from 'hedera-stable-coin-sdk';
import type IStableCoinList from 'hedera-stable-coin-sdk/build/src/port/in/sdk/response/IStableCoinList';
import SDKService from '../../services/SDKService';
import type { RootState } from '../store';

interface InitialStateProps {
	data: InitializationData;
	loading: boolean;
	selectedStableCoin?: StableCoin;
	stableCoinList?: IStableCoinList[];
}

export const initialState: InitialStateProps = {
	data: {
		topic: '',
		pairingString: '',
		encryptionKey: '',
		savedPairings: [],
	},
	loading: false,
	selectedStableCoin: undefined,
	stableCoinList: [],
};

export const getStableCoinList = createAsyncThunk('wallet/getStableCoinList', async () => {
	const stableCoins = await SDKService.getStableCoins({
		privateKey:
			'302e020100300506032b6570042204201713ea5a2dc0287b11a6f25a1137c0cad65fb5af52706076de9a9ec5a4b7f625',
	});
	return stableCoins;
});

export const walletSlice = createSlice({
	name: 'wallet',
	initialState,
	reducers: {
		setData: (state, action) => {
			state.data = action.payload;
		},
		setSelectedStableCoin: (state, action) => {
			state.selectedStableCoin = action.payload;
		},
		reset: () => initialState,
	},
	extraReducers: (builder) => {
		builder.addCase(getStableCoinList.fulfilled, (state, action) => {
			if (action.payload) {
				state.stableCoinList = action.payload;
			}
		});
	},
});

export const SELECTED_WALLET = (state: RootState) => state.wallet;
export const STABLE_COIN_LIST = (state: RootState) => state.wallet.stableCoinList;
export const SELECTED_WALLET_DATA: any = (state: RootState) => state.wallet.data;
export const SELECTED_WALLET_PAIRED = (state: RootState) => state.wallet.data.savedPairings[0];
export const SELECTED_WALLET_COIN = (state: RootState) => state.wallet.selectedStableCoin;

export const walletActions = walletSlice.actions;
