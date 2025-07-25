import { ConnectionState, GetListStableCoinRequest } from '@hashgraph/stablecoin-npm-sdk';
import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
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
	ConfigInfoViewModel,
} from '@hashgraph/stablecoin-npm-sdk';
import type { IMirrorRPCNode } from '../../interfaces/IMirrorRPCNode';

const LAST_WALLET_LS = 'lastWallet';
export const MIRROR_LIST_LS = 'mirrorList';
export const SELECTED_MIRROR_LS = 'selectedMirrors';
export const RPC_LIST_LS = 'rpcList';
export const SELECTED_RPC_LS = 'selectedRPCs';

export interface InitialStateProps {
	data?: InitializationData;
	hasWalletExtension: boolean;
	foundWallets: SupportedWallets[];
	isPaired: boolean;
	loading: boolean;
	accountInfo: AccountViewModel;
	selectedStableCoin?: StableCoinViewModel;
	selectedStableCoinConfigInfo?: ConfigInfoViewModel;
	isProxyOwner?: boolean;
	isPendingOwner?: boolean;
	isAcceptOwner?: boolean;
	isFactoryProxyOwner?: boolean;
	isFactoryPendingOwner?: boolean;
	isFactoryAcceptOwner?: boolean;
	selectingStableCoin: boolean;
	stableCoinList?: StableCoinListViewModel;
	externalTokenList?: IExternalToken[];
	capabilities?: StableCoinCapabilities | undefined;
	lastWallet?: SupportedWallets;
	status: ConnectionState;
	deletedToken?: boolean;
	pausedToken?: boolean;
	roles?: string[];
	network?: string;
	backendUrl?: string;
	networkRecognized?: boolean;
	accountRecognized?: boolean;
	factoryId?: string;
	resolverId?: string;
	mirrorList?: IMirrorRPCNode[];
	selectedMirrors?: IMirrorRPCNode[];
	rpcList?: IMirrorRPCNode[];
	selectedRPCs?: IMirrorRPCNode[];
}

export const initialState: InitialStateProps = {
	hasWalletExtension: false,
	foundWallets: [],
	isPaired: false,
	loading: false,
	accountInfo: {},
	selectedStableCoin: undefined,
	selectedStableCoinConfigInfo: undefined,
	selectingStableCoin: false,
	stableCoinList: undefined,
	externalTokenList: [],
	capabilities: undefined,
	lastWallet: (localStorage?.getItem(LAST_WALLET_LS) as SupportedWallets) ?? undefined,
	status: ConnectionState.Disconnected,
	deletedToken: undefined,
	pausedToken: undefined,
	roles: undefined,
	network: undefined,
	backendUrl: undefined,
	networkRecognized: true,
	isProxyOwner: false,
	isPendingOwner: false,
	isAcceptOwner: false,
	isFactoryProxyOwner: false,
	isFactoryPendingOwner: false,
	isFactoryAcceptOwner: false,
	accountRecognized: true,
	factoryId: undefined,
	resolverId: undefined,
	mirrorList: [],
	selectedMirrors: [],
	rpcList: [],
	selectedRPCs: [],
};

export const getStableCoinList = createAsyncThunk(
	'wallet/getStableCoinList',
	async (id: string) => {
		try {
			const stableCoins: any = await Promise.race([
				SDKService.getStableCoins(
					new GetListStableCoinRequest({
						account: {
							accountId: id,
						},
					}),
				),
				new Promise((resolve, reject) => {
					setTimeout(() => {
						reject(new Error("Stablecoins list couldn't be obtained in a reasonable time."));
					}, 10000);
				}),
			]).catch((e) => {
				console.log(e.message);
				throw e;
			});

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
		setSelectedStableCoinConfigInfo: (state, action) => {
			state.selectedStableCoinConfigInfo = action.payload;
		},
		setSelectingStableCoin: (state, action) => {
			state.selectingStableCoin = action.payload;
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
		setBackendUrl: (state, action) => {
			state.backendUrl = action.payload;
		},
		setNetworkRecognized: (state, action) => {
			state.networkRecognized = action.payload;
		},
		setIsProxyOwner: (state, action) => {
			state.isProxyOwner = action.payload;
		},
		setIsPendingOwner: (state, action) => {
			state.isPendingOwner = action.payload;
		},
		setIsAcceptOwner: (state, action) => {
			state.isAcceptOwner = action.payload;
		},
		setIsFactoryProxyOwner: (state, action) => {
			state.isFactoryProxyOwner = action.payload;
		},
		setIsFactoryPendingOwner: (state, action) => {
			state.isFactoryPendingOwner = action.payload;
		},
		setIsFactoryAcceptOwner: (state, action) => {
			state.isFactoryAcceptOwner = action.payload;
		},
		setAccountRecognized: (state, action) => {
			state.accountRecognized = action.payload;
		},
		setFactoryId: (state, action) => {
			state.factoryId = action.payload;
		},
		setResolverId: (state, action) => {
			state.resolverId = action.payload;
		},
		setMirrorList: (state, action) => {
			state.mirrorList = action.payload;
			localStorage.setItem(MIRROR_LIST_LS, JSON.stringify(action.payload));
		},
		setSelectedMirrors: (state, action) => {
			state.selectedMirrors = action.payload;
			localStorage.setItem(SELECTED_MIRROR_LS, JSON.stringify(action.payload));
		},
		setRPCList: (state, action) => {
			state.rpcList = action.payload;
			localStorage.setItem(RPC_LIST_LS, JSON.stringify(action.payload));
		},
		setSelectedRPCs: (state, action) => {
			state.selectedRPCs = action.payload;
			localStorage.setItem(SELECTED_RPC_LS, JSON.stringify(action.payload));
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
			state.networkRecognized = initialState.networkRecognized;
			state.accountRecognized = initialState.accountRecognized;
			state.factoryId = initialState.factoryId;
			state.resolverId = initialState.resolverId;
			state.selectingStableCoin = initialState.selectingStableCoin;
		},
		setRoles: (state, action) => {
			state.roles = action.payload;
		},
		clearSelectedStableCoin: (state) => {
			state.selectedStableCoin = initialState.selectedStableCoin;
			state.isProxyOwner = initialState.isProxyOwner;
		},
		clearSelectedStableCoinConfigInfo: (state) => {
			state.selectedStableCoinConfigInfo = initialState.selectedStableCoinConfigInfo;
		},
		reset: () => initialState,
	},
	extraReducers: (builder) => {
		builder.addCase(getStableCoinList.fulfilled, (state, action) => {
			if (action.payload) {
				state.stableCoinList = action.payload;
				if (state.stableCoinList!.coins.length === 0) {
					state.selectedStableCoin = undefined;
					state.selectedStableCoinConfigInfo = undefined;
				}
			}
		});
		builder.addCase(getStableCoinList.rejected, (state) => {
			state.stableCoinList = { coins: [] };
			state.selectedStableCoin = undefined;
			state.selectedStableCoinConfigInfo = undefined;
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

export const SELECTED_FACTORY_ID = (state: RootState) => state.wallet.factoryId;
export const SELECTED_RESOLVER_ID = (state: RootState) => state.wallet.resolverId;
export const SELECTED_NETWORK = (state: RootState) => state.wallet.network;
export const SELECTED_NETWORK_RECOGNIZED = (state: RootState) => state.wallet.networkRecognized;
export const SELECTED_WALLET = (state: RootState) => state.wallet;
export const STABLE_COIN_LIST = (state: RootState) => state.wallet.stableCoinList;
export const AVAILABLE_WALLETS = (state: RootState) => state.wallet.foundWallets;
export const EXTERNAL_TOKEN_LIST = (state: RootState) => state.wallet.externalTokenList;
export const SELECTED_WALLET_DATA = (state: RootState) => state.wallet.data;
export const SELECTED_WALLET_COIN = (state: RootState) => state.wallet.selectedStableCoin;
export const SELECTED_WALLET_COIN_CONFIG_INFO = (state: RootState) =>
	state.wallet.selectedStableCoinConfigInfo;
export const IS_PROXY_OWNER = (state: RootState) => state.wallet.isProxyOwner;
export const IS_PENDING_OWNER = (state: RootState) => state.wallet.isPendingOwner;
export const IS_ACCEPT_OWNER = (state: RootState) => state.wallet.isAcceptOwner;
export const IS_FACTORY_PROXY_OWNER = (state: RootState) => state.wallet.isFactoryProxyOwner;
export const IS_FACTORY_PENDING_OWNER = (state: RootState) => state.wallet.isFactoryPendingOwner;
export const IS_FACTORY_ACCEPT_OWNER = (state: RootState) => state.wallet.isFactoryAcceptOwner;
export const SELECTING_WALLET_COIN = (state: RootState) => state.wallet.selectingStableCoin;
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
export const MIRROR_LIST = (state: RootState) => {
	const list = localStorage?.getItem(MIRROR_LIST_LS);
	if (list) {
		return JSON.parse(list);
	} else return state.wallet.mirrorList;
};
export const SELECTED_MIRRORS = (state: RootState) => {
	const mirrors = localStorage?.getItem(SELECTED_MIRROR_LS);
	if (mirrors) {
		return JSON.parse(mirrors);
	} else return state.wallet.selectedMirrors;
};
export const RPC_LIST = (state: RootState) => {
	const list = localStorage?.getItem(RPC_LIST_LS);
	if (list) {
		return JSON.parse(list);
	} else return state.wallet.rpcList;
};
export const SELECTED_RPCS = (state: RootState) => {
	const rpcs = localStorage?.getItem(SELECTED_RPC_LS);
	if (rpcs) {
		return JSON.parse(rpcs);
	} else return state.wallet.selectedRPCs;
};

export const walletActions = walletSlice.actions;
