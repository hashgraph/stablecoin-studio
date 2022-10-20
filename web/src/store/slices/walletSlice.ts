import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { HashPackAccount } from 'hedera-stable-coin-sdk';
import type {
	InitializationData,
	IStableCoinDetail,
	IStableCoinList,
	Capabilities,
	IAccountInfo,
} from 'hedera-stable-coin-sdk';
import SDKService from '../../services/SDKService';
import type { RootState } from '../store';

interface InitialStateProps {
	data: InitializationData;
	hasWalletExtension: boolean;
	isPaired: boolean;
	loading: boolean;
	accountInfo: IAccountInfo;
	selectedStableCoin?: IStableCoinDetail;
	stableCoinList?: IStableCoinList[];
	capabilities?: Capabilities[] | undefined;
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
	accountInfo: {},
	selectedStableCoin: undefined,
	stableCoinList: [],
	capabilities: [],
};

export const getStableCoinList = createAsyncThunk(
	'wallet/getStableCoinList',
	async (account: HashPackAccount) => {
		try {
			const stableCoins = await SDKService.getStableCoins({ account });
			return stableCoins;
		} catch (e) {
			console.error(e);
		}
	},
);

export const walletSlice = createSlice({
	name: 'wallet',
	initialState,
	reducers: {
		setData: (state, action) => {
			state.data = action.payload;
		},
		setSavedPairings: (state, action) => {
			state.data.savedPairings = action.payload;
		},
		setSelectedStableCoin: (state, action) => {
			state.selectedStableCoin = action.payload;
		},
		setStableCoinList: (state, action) => {
			state.stableCoinList = action.payload;
		},
		setHasWalletExtension(state) {
			state.hasWalletExtension = true;
		},
		setIsPaired(state) {
			state.isPaired = true;
		},
		setCapabilities: (state, action) => {
			state.capabilities = action.payload;
		},
		setAccountInfo: (state, action) => {
			state.accountInfo = action.payload;
		},
		clearData: (state) => {
			state.data = initialState.data;
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
export const SELECTED_WALLET_CAPABILITIES = (state: RootState) => state.wallet.capabilities;
export const SELECTED_WALLET_ACCOUNT_INFO = (state: RootState) => state.wallet.accountInfo;
export const HAS_WALLET_EXTENSION = (state: RootState) => state.wallet.hasWalletExtension;
export const IS_PAIRED = (state: RootState) => state.wallet.isPaired;
export const SELECTED_WALLET_PAIRED_ACCOUNTID = (state: RootState) =>
	state.wallet.data.savedPairings[0]?.accountIds[0];
export const SELECTED_WALLET_PAIRED_ACCOUNT = (state: RootState) =>
	new HashPackAccount(state.wallet.data.savedPairings[0]?.accountIds[0]);

export const walletActions = walletSlice.actions;
