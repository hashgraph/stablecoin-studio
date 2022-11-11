import type {
	AppMetadata,
	InitializationData,
	IStableCoinDetail,
	IStableCoinList,
	HashPackAccount,
	IAccountInfo,
	Capabilities,
	CreateStableCoinRequest,
	CashOutStableCoinRequest,
	GetAccountBalanceRequest,
	IncreaseCashInLimitRequest,
	RescueStableCoinRequest,
	WipeStableCoinRequest,
	CheckCashInLimitRequest,
	CheckCashInRoleRequest,
	DecreaseCashInLimitRequest,
	GrantRoleRequest,
	HasRoleRequest,
	ResetCashInLimitRequest,
	RevokeRoleRequest,
	CashInStableCoinRequest,
} from 'hedera-stable-coin-sdk';
import {
	GetListStableCoinRequest,
	GetStableCoinDetailsRequest,
	HederaNetwork,
	NetworkMode,
	SDK,
	HederaNetworkEnviroment,
} from 'hedera-stable-coin-sdk';

export enum HashConnectConnectionState {
	Connected = 'Connected',
	Disconnected = 'Disconnected',
	Paired = 'Paired',
	Connecting = 'Connecting',
}

export type StableCoinListRaw = Array<Record<'id' | 'symbol', string>>;

const appMetadata: AppMetadata = {
	name: 'Hedera Stable Coin',
	description: 'An hedera dApp',
	icon: 'https://dashboard-assets.dappradar.com/document/15402/hashpack-dapp-defi-hedera-logo-166x166_696a701b42fd20aaa41f2591ef2339c7.png',
	url: '',
};

interface EventsSetter {
	onInit: () => void;
	onWalletExtensionFound: () => void;
	onWalletPaired: (data: any) => void;
	onWalletConnectionChanged: (data: any) => void;
}

export class SDKService {
	private static instance: SDK | undefined;

	constructor() {}
	public static async getInstance(events?: EventsSetter) {
		if (!SDKService.instance) {
			SDKService.instance = new SDK({
				network: new HederaNetwork(HederaNetworkEnviroment.TEST), // TODO: dynamic data
				mode: NetworkMode.HASHPACK,
				options: {
					appMetadata,
				},
			});

			const { onInit, onWalletExtensionFound, onWalletPaired, onWalletConnectionChanged } =
				events || {
					onInit: () => {},
					onWalletAcknowledgeMessageEvent: () => {},
					onWalletExtensionFound: () => {},
					onWalletPaired: () => {},
					onWalletConnectionChanged: () => {},
				};

			await SDKService.instance.init({ onInit });
			SDKService.instance.onWalletExtensionFound(onWalletExtensionFound);
			SDKService.instance.onWalletPaired(onWalletPaired);
			SDKService.instance.onWalletConnectionChanged(onWalletConnectionChanged);
		}

		return SDKService.instance;
	}

	public static isInit() {
		// @ts-ignore
		return !!this.instance?.networkAdapter?._provider;
	}

	public static connectWallet() {
		SDKService.getInstance().then((instance) => instance?.connectWallet());
	}

	public static async getAvailabilityExtension(): Promise<boolean> {
		return (await SDKService.getInstance())?.getAvailabilityExtension();
	}

	public static async getStatus(): Promise<HashConnectConnectionState | undefined> {
		return (await SDKService.getInstance())?.gethashConnectConectionStatus();
	}

	public static async getWalletData(): Promise<InitializationData> {
		return (await SDKService.getInstance()).getInitData();
	}

	public static async disconnectWallet(): Promise<void> {
		return (await SDKService.getInstance()).disconectHaspack();
	}

	public static async getStableCoins({
		account,
	}: {
		account: HashPackAccount;
	}): Promise<IStableCoinList[] | null> {
		return (await SDKService.getInstance())?.getListStableCoin(
			new GetListStableCoinRequest({
				account: {
					accountId: account.accountId.id,
				},
			}),
		);
	}

	public static async getStableCoinDetails({
		id,
	}: {
		id: string;
	}): Promise<IStableCoinDetail | null> {
		return (await SDKService.getInstance())?.getStableCoinDetails(
			new GetStableCoinDetailsRequest({ id }),
		);
	}

	public static async getAccountInfo({
		account,
	}: {
		account: HashPackAccount;
	}): Promise<IAccountInfo | null> {
		return (await SDKService.getInstance())?.getAccountInfo({ account });
	}

	public static async cashIn(req: CashInStableCoinRequest) {
		return await SDKService.getInstance().then((instance) => instance.cashIn(req));
	}

	public static async cashOut(req: CashOutStableCoinRequest) {
		return await SDKService.getInstance().then((instance) => instance.cashOut(req));
	}

	public static async createStableCoin(
		createStableCoinRequest: CreateStableCoinRequest,
	): Promise<IStableCoinDetail | null> {
		return (await SDKService.getInstance()).createStableCoin(createStableCoinRequest);
	}

	public static async getBalance(req: GetAccountBalanceRequest) {
		return SDKService.getInstance().then((instance) => instance.getBalanceOf(req));
	}

	public static async rescue(req: RescueStableCoinRequest) {
		return SDKService.getInstance().then((instance) => instance.rescue(req));
	}

	public static async wipe(req: WipeStableCoinRequest) {
		return SDKService.getInstance().then((instance) => instance.wipe(req));
	}

	public static async getCapabilities({
		id,
		publicKey,
	}: {
		id: string;
		publicKey: string;
	}): Promise<Capabilities[] | null> {
		return (await SDKService.getInstance())?.getCapabilitiesStableCoin(id, publicKey);
	}

	public static async increaseSupplierAllowance(req: IncreaseCashInLimitRequest) {
		return SDKService.getInstance().then((instance) => instance.increaseSupplierAllowance(req));
	}

	public static async decreaseSupplierAllowance(req: DecreaseCashInLimitRequest) {
		return SDKService.getInstance().then((instance) => instance.decreaseSupplierAllowance(req));
	}

	public static async resetSupplierAllowance(req: ResetCashInLimitRequest) {
		return SDKService.getInstance().then((instance) => instance.resetSupplierAllowance(req));
	}

	public static async checkSupplierAllowance(req: CheckCashInLimitRequest) {
		return SDKService.getInstance().then((instance) => instance.supplierAllowance(req));
	}

	public static async grantRole(req: GrantRoleRequest) {
		return SDKService.getInstance().then((instance) => instance.grantRole(req));
	}

	public static async revokeRole(req: RevokeRoleRequest) {
		return SDKService.getInstance().then((instance) => instance.revokeRole(req));
	}

	public static async hasRole(req: HasRoleRequest) {
		return SDKService.getInstance().then((instance) => instance.hasRole(req));
	}

	public static async isUnlimitedSupplierAllowance(req: CheckCashInRoleRequest) {
		return SDKService.getInstance().then((instance) => instance.isUnlimitedSupplierAllowance(req));
	}
}

export default SDKService;
