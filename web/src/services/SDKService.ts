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
	RequestAccount,
} from 'hedera-stable-coin-sdk';

export type StableCoinListRaw = Array<Record<'id' | 'symbol', string>>;

export class SDKService {
	static initData?: InitializationData = undefined;

	public static isInit() {
		// @ts-ignore
		return !!this.initData;
	}

	public static async connectWallet(wallet: SupportedWallets) {
		this.initData = await Network.connect(
			new ConnectRequest({
				network: 'testnet',
				wallet,
			}),
		);
		return this.initData;
	}

	public static async init(events: Partial<WalletEvent>, lastWallet?: SupportedWallets) {
		const init = await Network.init(
			new InitializationRequest({
				network: 'testnet',
				events,
			}),
		);
		if (lastWallet) await this.connectWallet(lastWallet);
		return init;
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
		return await Role.isUnlimited(req);
	}

	public static async getRoles(data: GetRolesRequest) {
		return await Role.getRoles(data);
	}
}

export default SDKService;
