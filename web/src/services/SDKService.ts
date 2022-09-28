import { HederaNetwork, HederaNetworkEnviroment, NetworkMode, SDK } from 'hedera-stable-coin-sdk';
import type { AppMetadata, InitializationData, ICreateStableCoinRequest, StableCoin } from 'hedera-stable-coin-sdk';
import type IStableCoinList from 'hedera-stable-coin-sdk/build/src/port/in/sdk/response/IStableCoinList';
import type IStableCoinDetail from 'hedera-stable-coin-sdk/build/src/port/in/sdk/response/IStableCoinDetail';

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
	privateKey: string;
	accountId: string;
	tokenId: string;
	targetId: string;
	amount: number;
}
interface EventsSetter {
	onInit: () => void;
	onWalletExtensionFound: () => void;
	onWalletPaired: () => void;
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

			const { onInit, onWalletExtensionFound, onWalletPaired } =
				events || {
					onInit: () => {},
					onWalletAcknowledgeMessageEvent: () => {},
					onWalletExtensionFound: () => {},
					onWalletPaired: () => {},
				};

			await SDKService.instance.init({ onInit });
			SDKService.instance.onWalletExtensionFound(onWalletExtensionFound);
			SDKService.instance.onWalletPaired(onWalletPaired);
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
		privateKey,
	}: {
		privateKey: string;
	}): Promise<IStableCoinList[] | null> {
		return (await SDKService.getInstance())?.getListStableCoin({ privateKey });
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
		privateKey,
		accountId,
		tokenId,
		targetId,
		amount,
	}: CashInRequest) {
		return await SDKService.getInstance().then((instance) =>
			instance.cashIn({ proxyContractId, privateKey, accountId, tokenId, targetId, amount }),
		);
	}
	
	public static async createStableCoin(
		createStableCoinRequest: ICreateStableCoinRequest,
	): Promise<StableCoin | null> {
		return (await SDKService.getInstance()).createStableCoin(createStableCoinRequest);
	}
}

export default SDKService;
