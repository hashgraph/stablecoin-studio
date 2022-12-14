import {
	StableCoin,
	Network,
	Account,
	Role,
	CapabilitiesRequest,
	ConnectRequest,
	InitializationRequest,
} from 'hedera-stable-coin-sdk';
import type {
	WalletEvent,
	SupportedWallets,
	WipeRequest,
	CashInRequest,
	CreateRequest,
	DeleteRequest,
	FreezeAccountRequest,
	GetAccountBalanceRequest,
	GetAccountInfoRequest,
	GetListStableCoinRequest,
	GetRolesRequest,
	GetStableCoinDetailsRequest,
	GrantRoleRequest,
	HasRoleRequest,
	InitializationData,
	PauseRequest,
	RescueRequest,
	RevokeRoleRequest,
	StableCoinListViewModel,
	StableCoinViewModel,
	StableCoinCapabilities,
	BurnRequest,
	IncreaseSupplierAllowanceRequest,
	DecreaseSupplierAllowanceRequest,
	ResetSupplierAllowanceRequest,
	GetSupplierAllowanceRequest,
	CheckSupplierLimitRequest,
} from 'hedera-stable-coin-sdk';

export type StableCoinListRaw = Array<Record<'id' | 'symbol', string>>;

export class SDKService {
	static initData?: InitializationData = undefined;

	public static isInit() {
		// @ts-ignore
		return !!this.initData;
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

	public static async init(events: Partial<WalletEvent>) {
		try {
			return await Network.init(
				new InitializationRequest({
					network: 'testnet',
					events,
				}),
			);
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
	): Promise<StableCoinListViewModel | null> {
		return await Account.listStableCoins(req);
	}

	public static async getStableCoinDetails(req: GetStableCoinDetailsRequest) {
		return await StableCoin.getInfo(req);
	}

	public static async getAccountInfo(req: GetAccountInfoRequest) {
		return await Account.getInfo(req);
	}

	public static async cashIn(req: CashInRequest) {
		return await StableCoin.cashIn(req);
	}

	public static async burn(req: BurnRequest) {
		return await StableCoin.burn(req);
	}

	public static async createStableCoin(
		CreateRequest: CreateRequest,
	): Promise<StableCoinViewModel | null> {
		return await StableCoin.create(CreateRequest);
	}

	public static async getBalance(req: GetAccountBalanceRequest) {
		return await StableCoin.getBalanceOf(req);
	}

	public static async rescue(req: RescueRequest) {
		return await StableCoin.rescue(req);
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

	public static async delete(req: DeleteRequest) {
		return await StableCoin.delete(req);
	}

	public static async getCapabilities({
		id,
	}: {
		id: string;
	}): Promise<StableCoinCapabilities | null> {
		if (this.initData?.account)
			return await StableCoin.capabilities(
				new CapabilitiesRequest({
					account: { ...this.initData?.account, accountId: this.initData.account.id.toString() },
					tokenId: id,
				}),
			);
		return null;
	}

	public static async increaseSupplierAllowance(req: IncreaseSupplierAllowanceRequest) {
		return await Role.Supplier.increaseAllowance(req);
	}

	public static async decreaseSupplierAllowance(req: DecreaseSupplierAllowanceRequest) {
		return await Role.Supplier.decreaseAllowance(req);
	}

	public static async resetSupplierAllowance(req: ResetSupplierAllowanceRequest) {
		return await Role.Supplier.resetAllowance(req);
	}

	public static async checkSupplierAllowance(req: GetSupplierAllowanceRequest) {
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

	public static async isUnlimitedSupplierAllowance(req: CheckSupplierLimitRequest) {
		return await Role.Supplier.isUnlimited(req);
	}

	public static async getRoles(data: GetRolesRequest) {
		return await Role.getRoles(data);
	}
}

export default SDKService;
