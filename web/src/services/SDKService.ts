import {
	Account,
	CashInStableCoinRequest,
	CashOutStableCoinRequest,
	CheckCashInLimitRequest,
	CheckCashInRoleRequest,
	CreateStableCoinRequest,
	DecreaseCashInLimitRequest,
	DeleteStableCoinRequest,
	FreezeAccountRequest,
	GetAccountBalanceRequest,
	GetAccountInfoRequest,
	GetListStableCoinRequest,
	GetRolesRequest,
	GetStableCoinDetailsRequest,
	GrantRoleRequest,
	HasRoleRequest,
	IncreaseCashInLimitRequest,
	InitializationData,
	PauseStableCoinRequest,
	RescueStableCoinRequest,
	ResetCashInLimitRequest,
	RevokeRoleRequest,
	Role,
	WalletEvent,
	WipeStableCoinRequest} from 'hedera-stable-coin-sdk';
import {
	StableCoin
 Event, LoggerTransports, Network, SDK } from 'hedera-stable-coin-sdk';
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

	public static async registerEvents(events: Partial<WalletEvent>) {
		try {
			Event.register(events);
		} catch (error) {
			console.error(error);
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
	): Promise<IStableCoinList[] | null> {
		return await StableCoin.getListStableCoin(req);
	}

	public static async getStableCoinDetails(req: GetStableCoinDetailsRequest) {
		return await StableCoin.getInfo(req);
	}

	public static async getAccountInfo(req: GetAccountInfoRequest){
		return await Account.getInfo(req);
	}

	public static async cashIn(req: CashInStableCoinRequest) {
		return await StableCoin.cashIn(req);
	}

	public static async cashOut(req: CashOutStableCoinRequest) {
		return await StableCoin.cashOut(req)
	}

	public static async createStableCoin(
		createStableCoinRequest: CreateStableCoinRequest,
	): Promise<IStableCoinDetail | null> {
		// return (StableCoin.).createStableCoin(createStableCoinRequest);
	}

	public static async getBalance(req: GetAccountBalanceRequest) {
		return await Account.getBalanceOf(req)
	}

	public static async rescue(req: RescueStableCoinRequest) {
		return await StableCoin.rescue(req);
	}

	public static async wipe(req: WipeStableCoinRequest) {
		return await StableCoin.wipe(req);
	}

	public static async pause(req: PauseStableCoinRequest) {
		return await StableCoin.pause(req);
	}

	public static async unpause(req: PauseStableCoinRequest) {
		return await StableCoin.unpause(req);
	}

	public static async freeze(req: FreezeAccountRequest) {
		return await StableCoin.freeze(req);
	}

	public static async unfreeze(req: FreezeAccountRequest) {
		return await StableCoin.unfreeze(req);
	}

	public static async delete(req: DeleteStableCoinRequest) {
		return await StableCoin.delete(req);
	}

	public static async getCapabilities({
		id,
		publicKey,
	}: {
		id: string;
		publicKey: string;
	}): Promise<Capabilities[] | null> {
		return await StableCoin.getCapabilitiesStableCoin(id, publicKey);
	}

	public static async increaseSupplierAllowance(req: IncreaseCashInLimitRequest) {
		return await Role.Supplier.increaseAllowance(req);
	}

	public static async decreaseSupplierAllowance(req: DecreaseCashInLimitRequest) {
		return await Role.Supplier.decreaseAllowance(req);
	}

	public static async resetSupplierAllowance(req: ResetCashInLimitRequest) {
		return await Role.Supplier.resetAllowance(req);
	}

	public static async checkSupplierAllowance(req: CheckCashInLimitRequest) {
		return await Role.Supplier.getAllowance(req);
	}

	public static async grantRole(req: GrantRoleRequest) {
		return await Role.grantRole(req);
	}

	public static async revokeRole(req: RevokeRoleRequest) {
		return await Role.revokeRole(req);
	}

	public static async hasRole(req: HasRoleRequest) {
		return await Role.hasRole(req);
	}

	public static async isUnlimitedSupplierAllowance(req: CheckCashInRoleRequest) {
		return await Role.Supplier.isUnlimited(req);
	}

	public static async getRoles(data: GetRolesRequest) {
		return await Role.getRoles(data);
	}
}

export default SDKService;
