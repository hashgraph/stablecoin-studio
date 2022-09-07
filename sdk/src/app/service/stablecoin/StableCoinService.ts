import Service from '../Service.js';
import CreateStableCoinServiceRequestModel from './model/CreateStableCoinServiceRequestModel.js';
import ListStableCoinServiceRequestModel from './model/ListStableCoinServiceRequestModel.js';
import IStableCoinDetail from '../../../domain/context/stablecoin/IStableCoinDetail.js';
import { StableCoin } from '../../../domain/context/stablecoin/StableCoin.js';
import IStableCoinList from '../../../port/in/sdk/response/IStableCoinList.js';
import GetStableCoinServiceRequestModel from './model/GetStableCoinServiceRequestModel.js';
import GetBalanceOfStableCoinServiceRequestModel from './model/GetBalanceOfStableCoinServiceRequestModel.js';
import GetNameOfStableCoinServiceRequestModel from './model/GetNameOfStableCoinServiceRequestModel.js';
import CashInStableCoinServiceRequestModel from './model/CashInStableCoinServiceRequestModel.js';
import AssociateTokenStableCoinServiceRequestModel from './model/AssociateTokenStableCoinServiceRequestModel.js';
import WipeStableCoinServiceRequestModel from './model/WipeStableCoinServiceRequestModel.js';
import IStableCoinRepository from '../../../port/out/stablecoin/IStableCoinRepository.js';
import SupplierRoleStableCoinServiceRequestModel from './model/SupplierRoleStableCoinServiceRequestModel';
import RescueStableCoinServiceRequestModel from './model/RescueStableCoinServiceRequestModel.js';
import Account from '../../../domain/context/account/Account.js';
import { AccountId } from '../../../domain/context/account/AccountId.js';

export default class StableCoinService extends Service {
	private repository: IStableCoinRepository;

	constructor(repository: IStableCoinRepository) {
		super();
		this.repository = repository;
	}

	/**
	 * createStableCoin
	 */
	public createStableCoin(
		req: CreateStableCoinServiceRequestModel,
	): Promise<StableCoin> {
		const coin: StableCoin = new StableCoin(
			new Account(new AccountId(req.accountId), req.privateKey),
			req.name,
			req.symbol,
			req.decimals,
			req.initialSupply,
			req.maxSupply,
			req.memo,
			req.freeze,
			req.freezeDefault,
			req.kycKey,
			req.wipeKey,
			req.supplyKey,
			req.treasury,
			req.expiry,
			req.tokenType,
			req.supplyType,
			req.id,
		);
		return this.repository.saveCoin(req.accountId, req.privateKey, coin);
	}

	/**
	 * getListStableCoins
	 */
	public async getListStableCoins(
		req: ListStableCoinServiceRequestModel,
	): Promise<IStableCoinList[]> {
		return this.repository.getListStableCoins(req.privateKey);
	}

	/**
	 * getListStableCoins
	 */
	public async getStableCoin(
		req: GetStableCoinServiceRequestModel,
	): Promise<IStableCoinDetail> {
		return this.repository.getStableCoin(req.id);
	}

	public async getBalanceOf(
		req: GetBalanceOfStableCoinServiceRequestModel,
	): Promise<Uint8Array> {
		return this.repository.getBalanceOf(
			req.treasuryId,
			req.privateKey,
			req.accountId,
		);
	}

	public async getNameToken(
		req: GetNameOfStableCoinServiceRequestModel,
	): Promise<Uint8Array> {
		return this.repository.getNameToken(
			req.treasuryId,
			req.privateKey,
			req.accountId,
		);
	}

	public async cashIn(
		req: CashInStableCoinServiceRequestModel,
	): Promise<Uint8Array> {
		return this.repository.cashIn(
			req.treasuryId,
			req.privateKey,
			req.accountId,
			req.amount,
		);
	}

	public async associateToken(
		req: AssociateTokenStableCoinServiceRequestModel,
	): Promise<Uint8Array> {
		return this.repository.associateToken(
			req.treasuryId,
			req.privateKey,
			req.accountId,
		);
	}

	public async wipe(
		req: WipeStableCoinServiceRequestModel,
	): Promise<Uint8Array> {
		return this.repository.wipe(
			req.treasuryId,
			req.privateKey,
			req.accountId,
			req.amount,
		);
	}

	public async rescue(
		req: RescueStableCoinServiceRequestModel,
	): Promise<Uint8Array> {
		return this.repository.rescue(
			req.treasuryId,
			req.privateKey,
			req.accountId,
			req.amount,
		);
	}

	public async grantSupplierRole(
		req: SupplierRoleStableCoinServiceRequestModel,
	): Promise<Uint8Array> {
		return this.repository.grantSupplierRole(
			req.treasuryId,
			req.address,
			req.privateKey,
			req.accountId,
			req.amount,
		);
	}

	public async isUnlimitedSupplierAllowance(
		req: SupplierRoleStableCoinServiceRequestModel,
	): Promise<Uint8Array> {
		return this.repository.isUnlimitedSupplierAllowance(
			req.treasuryId,
			req.address,
			req.privateKey,
			req.accountId,
		);
	}
	public async supplierAllowance(
		req: SupplierRoleStableCoinServiceRequestModel,
	): Promise<Uint8Array> {
		return this.repository.supplierAllowance(
			req.treasuryId,
			req.address,
			req.privateKey,
			req.accountId,
		);
	}
	public async revokeSupplierRole(
		req: SupplierRoleStableCoinServiceRequestModel,
	): Promise<Uint8Array> {
		return this.repository.revokeSupplierRole(
			req.treasuryId,
			req.address,
			req.privateKey,
			req.accountId,
		);
	}
	public async resetSupplierAllowance(
		req: SupplierRoleStableCoinServiceRequestModel,
	): Promise<Uint8Array> {
		return this.repository.resetSupplierAllowance(
			req.treasuryId,
			req.address,
			req.privateKey,
			req.accountId,
		);
	}
	public async increaseSupplierAllowance(
		req: SupplierRoleStableCoinServiceRequestModel,
	): Promise<Uint8Array> {
		return this.repository.increaseSupplierAllowance(
			req.treasuryId,
			req.address,
			req.privateKey,
			req.accountId,
			req.amount,
		);
	}
	public async decreaseSupplierAllowance(
		req: SupplierRoleStableCoinServiceRequestModel,
	): Promise<Uint8Array> {
		return this.repository.decreaseSupplierAllowance(
			req.treasuryId,
			req.address,
			req.privateKey,
			req.accountId,
			req.amount,
		);
	}

	public async isLimitedSupplierAllowance(
		req: SupplierRoleStableCoinServiceRequestModel,
	): Promise<Uint8Array> {
		return this.repository.isLimitedSupplierAllowance(
			req.treasuryId,
			req.address,
			req.privateKey,
			req.accountId,
		);
	}
}
