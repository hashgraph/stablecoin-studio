import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { ConnectionState, GetListStableCoinRequest } from 'hedera-stable-coin-sdk';
import SDKService from '../../services/SDKService';
import type { RootState } from '../store';
import type { IExternalToken } from '../../interfaces/IExternalToken';
import type { IAccountToken } from '../../interfaces/IAccountToken';
import type {
	SupportedWallets,
	InitializationData,
	AccountViewModel,
	StableCoinCapabilities,
	StableCoinListViewModel,
	StableCoinViewModel,
} from 'hedera-stable-coin-sdk';

export interface InitialStateProps {
	data?: InitializationData;
	hasWalletExtension: boolean;
	foundWallets: SupportedWallets[];
	isPaired: boolean;
	loading: boolean;
	accountInfo: AccountViewModel;
	selectedStableCoin?: StableCoinViewModel;
	stableCoinList?: StableCoinListViewModel;
	externalTokenList?: IExternalToken[];
	capabilities?: StableCoinCapabilities | undefined;
	lastWallet?: SupportedWallets;
	status: ConnectionState;
	deletedToken?: boolean;
	pausedToken?: boolean;
	roles?: string[];
	network?: string;
}

export const initialState: InitialStateProps = {
	hasWalletExtension: false,
	foundWallets: [],
	isPaired: false,
	loading: false,
	accountInfo: {},
	selectedStableCoin: undefined,
	stableCoinList: undefined,
	externalTokenList: [],
	capabilities: undefined,
	lastWallet: (localStorage?.getItem('lastWallet') as SupportedWallets) ?? undefined,
	status: ConnectionState.Disconnected,
	deletedToken: undefined,
	pausedToken: undefined,
	roles: undefined,
	network: undefined,
};

export const getStableCoinList = createAsyncThunk(
	'wallet/getStableCoinList',
	async (id: string) => {
		try {
			const stableCoins = await SDKService.getStableCoins(
				new GetListStableCoinRequest({
					account: {
						accountId: id,
					},
				}),
			);
			return stableCoins;
		} catch (e) {
			console.error(e);
			throw new Error();
		}
	},
);

export const getExternalTokenList = createAsyncThunk(
	'wallet/getExternalTokenList',
	async (id: string) => {
		try {
			const tokensAccount = localStorage?.tokensAccount;
			if (tokensAccount) {
				const accountTokens = JSON.parse(tokensAccount);
				if (accountTokens) {
					const myAccount = accountTokens.find((acc: IAccountToken) => acc.id === id);
					if (myAccount) {
						return myAccount.externalTokens;
					}
				}
			}
			return [];
		} catch (e) {
			console.error(e);
			throw new Error();
		}
	},
);

const LAST_WALLET_LS = 'lastWallet';
export const walletSlice = createSlice({
	name: 'wallet',
	initialState,
	reducers: {
		setLastWallet: (state, action) => {
			state.lastWallet = action.payload;
			localStorage?.setItem(LAST_WALLET_LS, action.payload);
		},
		setData: (state, action) => {
			state.data = action.payload;
		},
		setAccount: (state, action) => {
			if (state.data?.account) state.data.account = action.payload;
		},
		setSelectedStableCoin: (state, action) => {
			state.selectedStableCoin = action.payload;
		},
		setStableCoinList: (state, action) => {
			state.stableCoinList = action.payload;
		},
		setExternalTokenList: (state, action) => {
			state.externalTokenList = action.payload;
		},
		setHasWalletExtension(state, action) {
			if (!state.foundWallets.includes(action.payload)) state.foundWallets.push(action.payload);
			state.hasWalletExtension = true;
		},
		setCapabilities: (state, action) => {
			state.capabilities = action.payload;
		},
		setAccountInfo: (state, action) => {
			state.accountInfo = action.payload;
		},
		setStatus: (state, action) => {
			state.status = action.payload;
		},
		setPausedToken: (state, action) => {
			state.pausedToken = action.payload;
		},
		setDeletedToken: (state, action) => {
			state.deletedToken = action.payload;
		},
		setNetwork: (state, action) => {
			state.network = action.payload;
		},
		clearData: (state) => {
			state.data = initialState.data;
			state.lastWallet = undefined;
			state.accountInfo = initialState.accountInfo;
			state.capabilities = initialState.capabilities;
			state.status = ConnectionState.Disconnected;
			localStorage?.removeItem(LAST_WALLET_LS);
			state.roles = undefined;
			state.network = initialState.network;
		},
		setRoles: (state, action) => {
			state.roles = action.payload;
		},
		clearSelectedStableCoin: (state) => {
			state.selectedStableCoin = initialState.selectedStableCoin;
		},
		reset: () => initialState,
	},
	extraReducers: (builder) => {
		builder.addCase(getStableCoinList.fulfilled, (state, action) => {
			if (action.payload) {
				state.stableCoinList = action.payload;
				if (state.stableCoinList.coins.length === 0) state.selectedStableCoin = undefined;
			}
		});
		builder.addCase(getStableCoinList.rejected, (state) => {
			state.stableCoinList = { coins: [] };
			state.selectedStableCoin = undefined;
		});
		builder.addCase(getExternalTokenList.fulfilled, (state, action) => {
			if (action.payload) {
				state.externalTokenList = action.payload;
			}
		});
		builder.addCase(getExternalTokenList.rejected, (state) => {
			state.externalTokenList = undefined;
		});
	},
});

export const SELECTED_NETWORK = (state: RootState) => state.wallet.network;
export const SELECTED_WALLET = (state: RootState) => state.wallet;
export const STABLE_COIN_LIST = (state: RootState) => state.wallet.stableCoinList;
export const AVAILABLE_WALLETS = (state: RootState) => state.wallet.foundWallets;
export const EXTERNAL_TOKEN_LIST = (state: RootState) => state.wallet.externalTokenList;
export const SELECTED_WALLET_DATA = (state: RootState) => state.wallet.data;
export const SELECTED_WALLET_COIN = (state: RootState) => state.wallet.selectedStableCoin;
export const SELECTED_WALLET_PAIRED = (state: RootState) => state.wallet.data;
export const SELECTED_WALLET_CAPABILITIES = (state: RootState) => state.wallet.capabilities;
export const SELECTED_WALLET_ACCOUNT_INFO = (state: RootState) => state.wallet.accountInfo;
export const HAS_WALLET_EXTENSION = (state: RootState) => state.wallet.hasWalletExtension;
export const LAST_WALLET_SELECTED = (state: RootState) => state.wallet.lastWallet;
export const SELECTED_WALLET_STATUS = (state: RootState) => state.wallet.status;
export const SELECTED_WALLET_PAIRED_ACCOUNTID = (state: RootState) =>
	state.wallet.data?.account?.id;
export const SELECTED_WALLET_PAIRED_ACCOUNT = (state: RootState) => ({
	accountId: state.wallet.data?.account?.id,
});
export const SELECTED_TOKEN_PAUSED = (state: RootState) => state.wallet.pausedToken;
export const SELECTED_TOKEN_DELETED = (state: RootState) => state.wallet.deletedToken;
export const SELECTED_TOKEN_RESERVE_ADDRESS = (state: RootState) =>
	state.wallet.selectedStableCoin?.reserveAddress;
export const SELECTED_TOKEN_RESERVE_AMOUNT = (state: RootState) =>
	state.wallet.selectedStableCoin?.reserveAmount;

export const SELECTED_TOKEN_ROLES = (state: RootState) => state.wallet.roles;
export const walletActions = walletSlice.actions;
