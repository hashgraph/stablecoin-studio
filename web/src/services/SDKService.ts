/* istanbul ignore file */
// @ts-ignore
import type {
	AcceptFactoryProxyOwnerRequest,
	AcceptProxyOwnerRequest,
	AccountViewModel,
	AddFixedFeeRequest,
	AddFractionalFeeRequest,
	AssociateTokenRequest,
	BurnRequest,
	CashInRequest,
	ChangeFactoryProxyOwnerRequest,
	ChangeProxyOwnerRequest,
	CheckSupplierLimitRequest,
	CreateRequest,
	DecreaseSupplierAllowanceRequest,
	DeleteRequest,
	FreezeAccountRequest,
	GetAccountBalanceRequest,
	GetAccountInfoRequest,
	GetAccountsWithRolesRequest,
	GetFactoryProxyConfigRequest,
	GetListStableCoinRequest,
	GetProxyConfigRequest,
	GetReserveAddressRequest,
	GetReserveAmountRequest,
	GetRolesRequest,
	GetStableCoinDetailsRequest,
	GetSupplierAllowanceRequest,
	GetTokenManagerListRequest,
	GetTransactionsRequest,
	GrantMultiRolesRequest,
	HasRoleRequest,
	IncreaseSupplierAllowanceRequest,
	InitializationData,
	KYCRequest,
	PauseRequest,
	RequestAccount,
	RescueHBARRequest,
	RescueRequest,
	ReserveViewModel,
	ResetSupplierAllowanceRequest,
	RevokeMultiRolesRequest,
	SignTransactionRequest,
	StableCoinCapabilities,
	StableCoinListViewModel,
	StableCoinViewModel,
	SubmitTransactionRequest,
	SupportedWallets,
	UpdateCustomFeesRequest,
	UpdateRequest,
	UpdateReserveAddressRequest,
	UpdateReserveAmountRequest,
	UpgradeFactoryImplementationRequest,
	UpgradeImplementationRequest,
	WalletEvent,
	WipeRequest,
	MultiSigTransactionViewModel,
} from '@hashgraph/stablecoin-npm-sdk';
import {
	Account,
	CapabilitiesRequest,
	ConnectRequest,
	Factory,
	Fees,
	InitializationRequest,
	Network,
	Proxy,
	ReserveDataFeed,
	Role,
	SetConfigurationRequest,
	SetNetworkRequest,
	StableCoin,
} from '@hashgraph/stablecoin-npm-sdk';
import { type IMirrorRPCNode } from '../interfaces/IMirrorRPCNode';

export type StableCoinListRaw = Array<Record<'id' | 'symbol', string>>;

export class SDKService {
	static initData?: InitializationData = undefined;

	public static isInit() {
		// @ts-ignore
		return !!this.initData;
	}

	public static async connectWallet(
		wallet: SupportedWallets,
		connectNetwork: string,
		selectedMirror?: IMirrorRPCNode,
		selectedRPC?: IMirrorRPCNode,
		hederaAccount?: string,
	) {
		const networkConfig = await this.setNetwork(connectNetwork, selectedMirror, selectedRPC);
		const _mirrorNode = networkConfig[0];
		const _rpcNode = networkConfig[1];

		let factories = []; // REACT_APP_FACTORIES load from .env

		if (process.env.REACT_APP_FACTORIES) factories = JSON.parse(process.env.REACT_APP_FACTORIES);
		console.log('factories');
		const _lastFactoryId =
			factories.length !== 0
				? factories.find((i: any) => i.Environment === connectNetwork)
					? factories.find((i: any) => i.Environment === connectNetwork).STABLE_COIN_FACTORY_ADDRESS
					: ''
				: '';
		console.log('factories2');
		if (_lastFactoryId)
			await Network.setConfig(
				new SetConfigurationRequest({
					factoryAddress: _lastFactoryId,
				}),
			);

		this.initData = await Network.connect(
			new ConnectRequest({
				account: hederaAccount ? { accountId: hederaAccount } : undefined,
				network: connectNetwork,
				mirrorNode: _mirrorNode,
				rpcNode: _rpcNode,
				wallet,
			}),
		);

		const returnedSelectedRPC: IMirrorRPCNode = {
			name: 'EnvConf' + String(0),
			BASE_URL: _rpcNode.baseUrl,
			API_KEY: _rpcNode.apiKey,
			Environment: connectNetwork,
			isInConfig: true,
			HEADER: _rpcNode.headerName,
		};

		const returnedSelectedMirror: IMirrorRPCNode = {
			name: 'EnvConf' + String(0),
			BASE_URL: _mirrorNode.baseUrl,
			API_KEY: _mirrorNode.apiKey,
			Environment: connectNetwork,
			isInConfig: true,
			HEADER: _mirrorNode.headerName,
		};

		return [this.initData, returnedSelectedMirror, returnedSelectedRPC];
	}

	public static async setNetwork(
		connectNetwork: string,
		selectedMirror?: IMirrorRPCNode,
		selectedRPC?: IMirrorRPCNode,
	) {
		let mirrorNode = []; // REACT_APP_MIRROR_NODE load from .env
		if (selectedMirror) {
			mirrorNode = [selectedMirror];
		} else if (process.env.REACT_APP_MIRROR_NODE) {
			mirrorNode = JSON.parse(process.env.REACT_APP_MIRROR_NODE);
		}
		const mirrorNodeFiltered = mirrorNode.find((i: any) => i.Environment === connectNetwork);
		const _mirrorNode = mirrorNodeFiltered
			? {
					baseUrl: mirrorNodeFiltered.BASE_URL ?? '',
					apiKey: mirrorNodeFiltered.API_KEY ?? '',
					headerName: mirrorNodeFiltered.HEADER ?? '',
			  }
			: { baseUrl: '', apiKey: '', headerName: '' };

		let rpcNode = []; // REACT_APP_RPC_NODE load from .env
		if (selectedRPC) {
			rpcNode = [selectedRPC];
		} else if (process.env.REACT_APP_RPC_NODE) {
			rpcNode = JSON.parse(process.env.REACT_APP_RPC_NODE);
		}
		const rpcNodeFiltered = rpcNode.find((i: any) => i.Environment === connectNetwork);
		const _rpcNode = rpcNodeFiltered
			? {
					baseUrl: rpcNodeFiltered.BASE_URL ?? '',
					apiKey: rpcNodeFiltered.API_KEY ?? '',
					headerName: rpcNodeFiltered.HEADER ?? '',
			  }
			: { baseUrl: '', apiKey: '', headerName: '' };

		await Network.setNetwork(
			new SetNetworkRequest({
				environment: connectNetwork,
				mirrorNode: _mirrorNode,
				rpcNode: _rpcNode,
			}),
		);

		return [_mirrorNode, _rpcNode];
	}

	// dummy init
	public static async init(events: Partial<WalletEvent>) {
		try {
			const initReq: InitializationRequest = new InitializationRequest({
				network: 'mainnet',
				mirrorNode: {
					baseUrl: 'https://mainnet-public.mirrornode.hedera.com/api/v1/',
					apiKey: '',
					headerName: '',
				},
				rpcNode: {
					baseUrl: 'https://mainnet.hashio.io/api',
					apiKey: '',
					headerName: '',
				},
				events,
			});
			if (process.env.REACT_APP_FACTORIES) {
				try {
					const factories = [];

					const extractedFactories = JSON.parse(process.env.REACT_APP_FACTORIES);

					for (let i = 0; i < extractedFactories.length; i++) {
						const factory = extractedFactories[i].STABLE_COIN_FACTORY_ADDRESS;

						factories.push({
							factory,
							environment: extractedFactories[i].Environment,
						});
					}

					initReq.factories = {
						factories,
					};
				} catch (e) {
					console.error('Factories could not be found in .env');
				}
			}
			if (process.env.REACT_APP_MIRROR_NODE) {
				try {
					const nodes = [];

					const extractedMirrorNodes = JSON.parse(process.env.REACT_APP_MIRROR_NODE);

					for (let i = 0; i < extractedMirrorNodes.length; i++) {
						const mirrorNode = {
							baseUrl: extractedMirrorNodes[i].BASE_URL,
							apiKey: extractedMirrorNodes[i].API_KEY,
							headerName: extractedMirrorNodes[i].HEADER,
						};

						nodes.push({
							mirrorNode,
							environment: extractedMirrorNodes[i].Environment,
						});
					}

					initReq.mirrorNodes = {
						nodes,
					};
				} catch (e) {
					console.error('Mirror Nodes could not be found in .env');
				}
			}
			if (process.env.REACT_APP_RPC_NODE) {
				try {
					const nodes = [];

					const extractedJsonRpcRelays = JSON.parse(process.env.REACT_APP_RPC_NODE);

					for (let i = 0; i < extractedJsonRpcRelays.length; i++) {
						const rpcNode = {
							baseUrl: extractedJsonRpcRelays[i].BASE_URL,
							apiKey: extractedJsonRpcRelays[i].API_KEY,
							headerName: extractedJsonRpcRelays[i].HEADER,
						};

						nodes.push({
							jsonRpcRelay: rpcNode,
							environment: extractedJsonRpcRelays[i].Environment,
						});
					}

					initReq.jsonRpcRelays = {
						nodes,
					};
				} catch (e) {
					console.error('RPC Nodes could not be found in .env');
				}
			}
			const init = await Network.init(initReq);

			return init;
		} catch (e) {
			console.error('Error initializing the Network : ' + e);
			window.alert(
				'There was an error initializing the network, please check your .env file and make sure the configuration is correct',
			);
		}
	}

	public static getWalletData(): InitializationData | undefined {
		return this.initData;
	}

	public static async disconnectWallet(): Promise<boolean> {
		return await Network.disconnect();
	}

	public static async getStableCoins(
		req: GetListStableCoinRequest,
	): Promise<StableCoinListViewModel | null> {
		try {
			return await Account.listStableCoins(req);
		} catch (e) {
			console.error('list of stablecoin could not be retrieved : ' + e);
			return null;
		}
	}

	public static async getStableCoinDetails(req: GetStableCoinDetailsRequest) {
		console.log('getStableCoinDetails', req);
		return await StableCoin.getInfo(req);
	}

	public static async getProxyConfig(req: GetProxyConfigRequest) {
		return await Proxy.getProxyConfig(req);
	}

	public static async getFactoryProxyConfig(req: GetFactoryProxyConfigRequest) {
		return await Proxy.getFactoryProxyConfig(req);
	}

	public static async getAccountInfo(req: GetAccountInfoRequest): Promise<AccountViewModel> {
		try {
			return await Account.getInfo(req);
		} catch (e) {
			console.error('account could not be retrieved : ' + e);
			const NullAcount: AccountViewModel = {
				id: Account.NullHederaAccount.id.toString(),
			};

			return NullAcount;
		}
	}

	public static async cashIn(req: CashInRequest) {
		return await StableCoin.cashIn(req);
	}

	public static async burn(req: BurnRequest) {
		return await StableCoin.burn(req);
	}

	public static async createStableCoin(
		createRequest: CreateRequest,
	): Promise<{ coin: StableCoinViewModel; reserve: ReserveViewModel } | null> {
		return await StableCoin.create(createRequest);
	}

	public static async updateStableCoin(updateRequest: UpdateRequest): Promise<boolean> {
		return await StableCoin.update(updateRequest);
	}

	public static async getBalance(req: GetAccountBalanceRequest) {
		return await StableCoin.getBalanceOf(req);
	}

	public static async rescue(req: RescueRequest) {
		return await StableCoin.rescue(req);
	}

	public static async rescueHBAR(req: RescueHBARRequest) {
		return await StableCoin.rescueHBAR(req);
	}

	public static async wipe(req: WipeRequest) {
		return await StableCoin.wipe(req);
	}

	public static async pause(req: PauseRequest) {
		return await StableCoin.pause(req);
	}

	public static async unpause(req: PauseRequest) {
		return await StableCoin.unPause(req);
	}

	public static async freeze(req: FreezeAccountRequest) {
		return await StableCoin.freeze(req);
	}

	public static async unfreeze(req: FreezeAccountRequest) {
		return await StableCoin.unFreeze(req);
	}

	public static async isAccountFrozen(req: FreezeAccountRequest) {
		return await StableCoin.isAccountFrozen(req);
	}

	public static async delete(req: DeleteRequest) {
		return await StableCoin.delete(req);
	}

	public static async getCapabilities({
		account,
		tokenId,
		tokenIsPaused = undefined,
		tokenIsDeleted = undefined,
	}: {
		account: RequestAccount;
		tokenId: string;
		tokenIsPaused?: boolean;
		tokenIsDeleted?: boolean;
	}): Promise<StableCoinCapabilities | null> {
		return await StableCoin.capabilities(
			new CapabilitiesRequest({
				account,
				tokenId,
				tokenIsPaused,
				tokenIsDeleted,
			}),
		);
	}

	public static async increaseSupplierAllowance(req: IncreaseSupplierAllowanceRequest) {
		return await Role.increaseAllowance(req);
	}

	public static async decreaseSupplierAllowance(req: DecreaseSupplierAllowanceRequest) {
		return await Role.decreaseAllowance(req);
	}

	public static async resetSupplierAllowance(req: ResetSupplierAllowanceRequest) {
		return await Role.resetAllowance(req);
	}

	public static async checkSupplierAllowance(req: GetSupplierAllowanceRequest) {
		return await Role.getAllowance(req);
	}

	public static async grantMultipleRole(req: GrantMultiRolesRequest) {
		return await Role.grantMultiRoles(req);
	}

	public static async revokeMultiRolesRequest(req: RevokeMultiRolesRequest) {
		return await Role.revokeMultiRoles(req);
	}

	public static async hasRole(req: HasRoleRequest) {
		return await Role.hasRole(req);
	}

	public static async isUnlimitedSupplierAllowance(req: CheckSupplierLimitRequest) {
		return await Role.isUnlimited(req);
	}

	public static async getRoles(data: GetRolesRequest) {
		return await Role.getRoles(data);
	}

	public static async getAccountsWithRole(data: GetAccountsWithRolesRequest) {
		return await Role.getAccountsWithRole(data);
	}

	public static async getReserveAddress(data: GetReserveAddressRequest) {
		return await StableCoin.getReserveAddress(data);
	}

	public static async getReserveAmount(data: GetReserveAmountRequest) {
		return await ReserveDataFeed.getReserveAmount(data);
	}

	public static async updateReserveAddress(data: UpdateReserveAddressRequest) {
		return await StableCoin.updateReserveAddress(data);
	}

	public static async updateReserveAmount(data: UpdateReserveAmountRequest) {
		return await ReserveDataFeed.updateReserveAmount(data);
	}

	public static async changeOwner(req: ChangeProxyOwnerRequest) {
		return await Proxy.changeProxyOwner(req);
	}

	public static async acceptOwner(req: AcceptProxyOwnerRequest) {
		return await Proxy.acceptProxyOwner(req);
	}

	public static async acceptFactoryOwner(req: AcceptFactoryProxyOwnerRequest) {
		return await Proxy.acceptFactoryProxyOwner(req);
	}

	public static async upgradeImplementation(req: UpgradeImplementationRequest) {
		return await Proxy.upgradeImplementation(req);
	}

	public static async changeFactoryOwner(req: ChangeFactoryProxyOwnerRequest) {
		return await Proxy.changeFactoryProxyOwner(req);
	}

	public static async upgradeFactoryImplementation(req: UpgradeFactoryImplementationRequest) {
		return await Proxy.upgradeFactoryImplementation(req);
	}

	public static async grantKyc(data: KYCRequest) {
		return await StableCoin.grantKyc(data);
	}

	public static async revokeKyc(data: KYCRequest) {
		return await StableCoin.revokeKyc(data);
	}

	public static async isAccountKYCGranted(data: KYCRequest) {
		return await StableCoin.isAccountKYCGranted(data);
	}

	public static async associate(data: AssociateTokenRequest) {
		return await StableCoin.associate(data);
	}

	public static async addFixedFee(data: AddFixedFeeRequest) {
		return await Fees.addFixedFee(data);
	}

	public static async addFractionalFee(data: AddFractionalFeeRequest) {
		return await Fees.addFractionalFee(data);
	}

	public static async updateCustomFees(data: UpdateCustomFeesRequest) {
		return await Fees.updateCustomFees(data);
	}

	public static async getHederaTokenManagerList(data: GetTokenManagerListRequest) {
		return await Factory.getHederaTokenManagerList(data);
	}

	public static async getMultiSigTransactions(
		data: GetTransactionsRequest,
	): Promise<MultiSigTransactionViewModel[]> {
		return await StableCoin.getTransactions(data);
	}

	public static async submitMultiSigTransaction(data: SubmitTransactionRequest) {
		return await StableCoin.submitTransaction(data);
	}

	public static async signMultiSigTransaction(data: SignTransactionRequest) {
		return StableCoin.signTransaction(data);
	}
}

export default SDKService;
