import { HederaNetwork, HederaNetworkEnviroment, NetworkMode, SDK } from 'hedera-stable-coin-sdk';
import type {
	AppMetadata,
	InitializationData,
	ICreateStableCoinRequest,
	IStableCoinDetail,
	IStableCoinList,
	IRescueStableCoinRequest,
	HashPackAccount,
	IGetBalanceStableCoinRequest,
	IWipeStableCoinRequest,
} from 'hedera-stable-coin-sdk';

export enum HashConnectConnectionState {
	Connected = 'Connected',
	Disconnected = 'Disconnected',
	Paired = 'Paired',
	Connecting = 'Connecting',
}

export type StableCoinListRaw = Array<Record<'id' | 'symbol', string>>;

const appMetadata: AppMetadata = {
	name: 'dApp Example',
	description: 'An example hedera dApp',
	icon: 'https://absolute.url/to/icon.png',
	url: '',
};

interface CashInRequest {
	proxyContractId: string;
	account: HashPackAccount;
	tokenId: string;
	targetId: string;
	amount: number;
}

interface CashOutRequest {
	proxyContractId: string;
	account: HashPackAccount;
	tokenId: string;
	amount: number;
}

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
		return (await SDKService.getInstance())?.getListStableCoin({ account });
	}

	public static async getStableCoinDetails({
		id,
	}: {
		id: string;
	}): Promise<IStableCoinDetail | null> {
		return (await SDKService.getInstance())?.getStableCoinDetails({ id });
	}

	public static async cashIn({
		proxyContractId,
		tokenId,
		targetId,
		amount,
		account,
	}: CashInRequest) {
		return await SDKService.getInstance().then((instance) =>
			instance.cashIn({ proxyContractId, account, tokenId, targetId, amount }),
		);
	}

	public static async burn({ proxyContractId, tokenId, amount, account }: CashOutRequest) {
		return await SDKService.getInstance().then((instance) =>
			instance.cashOut({ proxyContractId, account, tokenId, amount }),
		);
	}

	public static async createStableCoin(
		createStableCoinRequest: ICreateStableCoinRequest,
	): Promise<IStableCoinDetail | null> {
		return (await SDKService.getInstance()).createStableCoin(createStableCoinRequest);
	}

	public static async getBalance(data: IGetBalanceStableCoinRequest) {
		return SDKService.getInstance().then((instance) => instance.getBalanceOf(data));
	}

	public static async rescue(data: IRescueStableCoinRequest) {
		return SDKService.getInstance().then((instance) => instance.rescue(data));
	}

	public static async wipe(data: IWipeStableCoinRequest) {
		return SDKService.getInstance().then((instance) => instance.wipe(data));
	}
}

export default SDKService;
