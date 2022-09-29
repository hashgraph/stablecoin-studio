import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import type { InitializationData } from 'hedera-stable-coin-sdk';
import type IStableCoinDetail from 'hedera-stable-coin-sdk/build/src/port/in/sdk/response/IStableCoinDetail';
import type IStableCoinList from 'hedera-stable-coin-sdk/build/src/port/in/sdk/response/IStableCoinList';
import SDKService from '../../services/SDKService';
import type { RootState } from '../store';

interface InitialStateProps {
	data: InitializationData;
	hasWalletExtension: boolean;
	isPaired: boolean;
	loading: boolean;
	selectedStableCoin?: IStableCoinDetail;
	stableCoinList?: IStableCoinList[];
}

export const initialState: InitialStateProps = {
	data: {
		topic: '',
		pairingString: '',
		encryptionKey: '',
		savedPairings: [],
	},
	hasWalletExtension: false,
	isPaired: false,
	loading: false,
	selectedStableCoin: undefined,
	stableCoinList: [],
};

export const getStableCoinList = createAsyncThunk('wallet/getStableCoinList', async () => {
	try {
		const stableCoins = await SDKService.getStableCoins({
			privateKey: 'pvkey',
		});
		return stableCoins;
	} catch (e) {
		console.error(e);
	}
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
		setHasWalletExtension(state) {
			state.hasWalletExtension = true;
		},
		setIsPaired(state) {
			state.isPaired = true;
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
export const SELECTED_WALLET_COIN = (state: RootState) => state.wallet.selectedStableCoin;
export const SELECTED_WALLET_PAIRED: any = (state: RootState) => state.wallet.data.savedPairings[0];
export const HAS_WALLET_EXTENSION = (state: RootState) => state.wallet.hasWalletExtension;
export const IS_PAIRED = (state: RootState) => state.wallet.isPaired;
export const SELECTED_WALLET_PAIRED_ACCOUNTID: any = (state: RootState) =>
	state.wallet.data.savedPairings[0].accountIds[0];

export const walletActions = walletSlice.actions;
