import Service from '../Service.js';
import ICreateStableCoinServiceRequestModel from './model/ICreateStableCoinServiceRequestModel.js';
import { IListStableCoinServiceRequestModel } from './model/IListStableCoinServiceRequestModel.js';
import { StableCoin } from '../../../domain/context/stablecoin/StableCoin.js';
import IStableCoinList from '../../../port/in/sdk/response/IStableCoinList.js';
import IGetStableCoinServiceRequestModel from './model/IGetStableCoinServiceRequestModel.js';
import IGetBalanceOfStableCoinServiceRequestModel from './model/IGetBalanceOfStableCoinServiceRequestModel.js';
import IGetNameOfStableCoinServiceRequestModel from './model/IGetNameOfStableCoinServiceRequestModel.js';
import ICashInStableCoinServiceRequestModel from './model/ICashInStableCoinServiceRequestModel.js';
import IAssociateTokenStableCoinServiceRequestModel from './model/IAssociateTokenStableCoinServiceRequestModel.js';
import IWipeStableCoinServiceRequestModel from './model/IWipeStableCoinServiceRequestModel.js';
import IStableCoinRepository from '../../../port/out/stablecoin/IStableCoinRepository.js';
import ISupplierRoleStableCoinServiceRequestModel from './model/ISupplierRoleStableCoinServiceRequestModel';
import IRescueStableCoinServiceRequestModel from './model/IRescueStableCoinServiceRequestModel.js';
import Account from '../../../domain/context/account/Account.js';
import { AccountId } from '../../../domain/context/account/AccountId.js';
import IStableCoinDetail from './model/stablecoindetail/IStableCoinDetail.js';

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
		req: ICreateStableCoinServiceRequestModel,
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
		req: IListStableCoinServiceRequestModel,
	): Promise<IStableCoinList[]> {
		return this.repository.getListStableCoins(req.privateKey);
	}

	/**
	 * getListStableCoins
	 */
	public async getStableCoin(
		req: IGetStableCoinServiceRequestModel,
	): Promise<IStableCoinDetail> {
		return this.repository.getStableCoin(req.id);
	}

	public async getBalanceOf(
		req: IGetBalanceOfStableCoinServiceRequestModel,
	): Promise<Uint8Array> {
		return this.repository.getBalanceOf(
			req.treasuryId,
			req.privateKey,
			req.accountId,
			req.targetId,
		);
	}

	public async getNameToken(
		req: IGetNameOfStableCoinServiceRequestModel,
	): Promise<Uint8Array> {
		return this.repository.getNameToken(
			req.treasuryId,
			req.privateKey,
			req.accountId,
		);
	}

	public async cashIn(
		req: ICashInStableCoinServiceRequestModel,
	): Promise<Uint8Array> {
		return this.repository.cashIn(
			req.treasuryId,
			req.privateKey,
			req.accountId,
			req.amount,
		);
	}

	public async associateToken(
		req: IAssociateTokenStableCoinServiceRequestModel,
	): Promise<Uint8Array> {
		return this.repository.associateToken(
			req.treasuryId,
			req.privateKey,
			req.accountId,
		);
	}

	public async wipe(
		req: IWipeStableCoinServiceRequestModel,
	): Promise<Uint8Array> {
		return this.repository.wipe(
			req.treasuryId,
			req.privateKey,
			req.accountId,
			req.amount,
		);
	}

	public async rescue(
		req: IRescueStableCoinServiceRequestModel,
	): Promise<Uint8Array> {
		return this.repository.rescue(
			req.treasuryId,
			req.privateKey,
			req.accountId,
			req.amount,
		);
	}

	public async grantSupplierRole(
		req: ISupplierRoleStableCoinServiceRequestModel,
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
		req: ISupplierRoleStableCoinServiceRequestModel,
	): Promise<Uint8Array> {
		return this.repository.isUnlimitedSupplierAllowance(
			req.treasuryId,
			req.address,
			req.privateKey,
			req.accountId,
		);
	}
	public async supplierAllowance(
		req: ISupplierRoleStableCoinServiceRequestModel,
	): Promise<Uint8Array> {
		return this.repository.supplierAllowance(
			req.treasuryId,
			req.address,
			req.privateKey,
			req.accountId,
		);
	}
	public async revokeSupplierRole(
		req: ISupplierRoleStableCoinServiceRequestModel,
	): Promise<Uint8Array> {
		return this.repository.revokeSupplierRole(
			req.treasuryId,
			req.address,
			req.privateKey,
			req.accountId,
		);
	}
	public async resetSupplierAllowance(
		req: ISupplierRoleStableCoinServiceRequestModel,
	): Promise<Uint8Array> {
		return this.repository.resetSupplierAllowance(
			req.treasuryId,
			req.address,
			req.privateKey,
			req.accountId,
		);
	}
	public async increaseSupplierAllowance(
		req: ISupplierRoleStableCoinServiceRequestModel,
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
		req: ISupplierRoleStableCoinServiceRequestModel,
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
		req: ISupplierRoleStableCoinServiceRequestModel,
	): Promise<Uint8Array> {
		return this.repository.isLimitedSupplierAllowance(
			req.treasuryId,
			req.address,
			req.privateKey,
			req.accountId,
		);
	}
}
