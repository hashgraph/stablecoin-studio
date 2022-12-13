import type { InitializationData } from 'hedera-stable-coin-sdk';
import { LoggerTransports, Network, SDK } from 'hedera-stable-coin-sdk';
import type { SupportedWallets } from 'hedera-stable-coin-sdk/build/esm/src/domain/context/network/Wallet.js';
import ConnectRequest from 'hedera-stable-coin-sdk/build/esm/src/port/in/request/ConnectRequest.js';

export type StableCoinListRaw = Array<Record<'id' | 'symbol', string>>;

SDK.appMetadata = {
	name: 'Hedera Stable Coin',
	description: 'An hedera dApp',
	icon: 'https://dashboard-assets.dappradar.com/document/15402/hashpack-dapp-defi-hedera-logo-166x166_696a701b42fd20aaa41f2591ef2339c7.png',
	url: '',
};

SDK.log = {
	level: process.env.REACT_APP_LOG_LEVEL ?? 'ERROR',
	transport: new LoggerTransports.Console(),
};

interface EventsSetter {
	onInit: () => void;
	onWalletExtensionFound: () => void;
	onWalletPaired: (data: any) => void;
	onWalletConnectionChanged: (data: any) => void;
}

export class SDKService {
	static initData?: InitializationData = undefined;

	public static isInit() {
		// @ts-ignore
		return !!this.instance?.networkAdapter?._provider;
	}

	public static async connectWallet(wallet: SupportedWallets) {
		try {
			this.initData = await Network.connect(
				new ConnectRequest({
					network: 'testnet',
					wallet,
				}),
			);
			return this.initData;
		} catch (error) {
			console.error(error);
		}
	}

	public static async getAvailabilityExtension(): Promise<boolean> {
		return (await SDKService.getInstance())?.getAvailabilityExtension();
	}

	public static async getStatus(): Promise<HashConnectConnectionState | undefined> {
		return (await SDKService.getInstance())?.gethashConnectConectionStatus();
	}

	public static getWalletData(): InitializationData | undefined {
		return this.initData;
	}

	public static async disconnectWallet(): Promise<void> {
		return (await SDKService.getInstance()).disconectHaspack();
	}

	public static async getStableCoins(
		req: GetListStableCoinRequest,
	): Promise<IStableCoinList[] | null> {
		return (await SDKService.getInstance())?.getListStableCoin(req);
	}

	public static async getStableCoinDetails(
		req: GetStableCoinDetailsRequest,
	): Promise<IStableCoinDetail | null> {
		return (await SDKService.getInstance())?.getStableCoinDetails(req);
	}

	public static async getAccountInfo(req: GetAccountInfoRequest): Promise<IAccountInfo | null> {
		return (await SDKService.getInstance())?.getAccountInfo(req);
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

	public static async pause(req: PauseStableCoinRequest) {
		return SDKService.getInstance().then((instance) => instance.pauseStableCoin(req));
	}

	public static async unpause(req: PauseStableCoinRequest) {
		return SDKService.getInstance().then((instance) => instance.unpauseStableCoin(req));
	}

	public static async freeze(req: FreezeAccountRequest) {
		return SDKService.getInstance().then((instance) => instance.freezeAccount(req));
	}

	public static async unfreeze(req: FreezeAccountRequest) {
		return SDKService.getInstance().then((instance) => instance.unfreezeAccount(req));
	}

	public static async delete(req: DeleteStableCoinRequest) {
		return SDKService.getInstance().then((instance) => instance.deleteStableCoin(req));
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

	public static async getRoles(data: GetRolesRequest) {
		return SDKService.getInstance().then((instance) => instance.getRoles(data));
	}
}

export default SDKService;
