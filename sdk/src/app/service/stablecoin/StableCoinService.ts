import Service from '../Service.js';
import ICreateStableCoinServiceRequestModel from './model/ICreateStableCoinServiceRequestModel.js';
import { IListStableCoinServiceRequestModel } from './model/IListStableCoinServiceRequestModel.js';
import { StableCoin } from '../../../domain/context/stablecoin/StableCoin.js';
import IStableCoinList from '../../../port/in/sdk/response/IStableCoinList.js';
import IGetStableCoinServiceRequestModel from './model/IGetStableCoinServiceRequestModel.js';
import IGetBalanceOfStableCoinServiceRequestModel from './model/IGetBalanceOfStableCoinServiceRequestModel.js';
import IGetBalanceOfTokenOwnerStableCoinServiceRequestModel from './model/IGetBalanceOfTokenOwnerStableCoinServiceRequestModel.js';
import IGetNameOfStableCoinServiceRequestModel from './model/IGetNameOfStableCoinServiceRequestModel.js';
import ICashInStableCoinServiceRequestModel from './model/ICashInStableCoinServiceRequestModel.js';
import ICashOutStableCoinServiceRequestModel from './model/ICashOutStableCoinServiceRequestModel.js';
import IAssociateTokenStableCoinServiceRequestModel from './model/IAssociateTokenStableCoinServiceRequestModel.js';
import IWipeStableCoinServiceRequestModel from './model/IWipeStableCoinServiceRequestModel.js';
import IStableCoinRepository from '../../../port/out/stablecoin/IStableCoinRepository.js';
import IRescueStableCoinServiceRequestModel from './model/IRescueStableCoinServiceRequestModel.js';
import IRoleStableCoinServiceRequestModel from './model/IRoleStableCoinServiceRequestModel';
import IGetBasicRequestModel from './model/IGetBasicRequest.js';
import ISupplierRoleStableCoinServiceRequestModel from './model/ISupplierRoleStableCoinServiceRequestModel.js';
import { StableCoinRole } from '../../../index.js';

export default class StableCoinService extends Service {
	private repository: IStableCoinRepository;

	constructor(repository: IStableCoinRepository) {
		super();
		this.repository = repository;
	}

	/**
	 * createStableCoin
	 */
	public async createStableCoin(
		req: ICreateStableCoinServiceRequestModel,
	): Promise<StableCoin> {
		let coin: StableCoin = new StableCoin({
			name: req.name,
			symbol: req.symbol,
			decimals: req.decimals,
			adminKey: req.adminKey,
			initialSupply: req.initialSupply,
			maxSupply: req.maxSupply,
			memo: req.memo,
			freezeKey: req.freezeKey,
			freezeDefault: req.freezeDefault,
			kycKey: req.KYCKey,
			wipeKey: req.wipeKey,
			pauseKey: req.pauseKey,
			supplyKey: req.supplyKey,
			treasury: req.treasury,
			tokenType: req.tokenType,
			supplyType: req.supplyType,
			id: req.id,
			autoRenewAccount: req.autoRenewAccount,
		});
		coin = await this.repository.saveCoin(
			req.accountId,
			req.privateKey,
			coin,
		);
		return this.repository.getStableCoin(coin.id);
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
	): Promise<StableCoin> {
		return this.repository.getStableCoin(req.id);
	}

	public async getBalanceOf(
		req: IGetBalanceOfStableCoinServiceRequestModel,
	): Promise<Uint8Array> {
		return this.repository.getBalanceOf(
			req.proxyContractId,
			req.privateKey,
			req.accountId,
			req.targetId,
			req.tokenId,
		);
	}

	public async getTokenOwnerBalance(
		req: IGetBalanceOfTokenOwnerStableCoinServiceRequestModel,
	): Promise<Uint8Array> {
		return this.repository.getTokenOwnerBalance(
			req.proxyContractId,
			req.privateKey,
			req.accountId,
		);
	}

	public async getNameToken(
		req: IGetNameOfStableCoinServiceRequestModel,
	): Promise<Uint8Array> {
		return this.repository.getNameToken(
			req.proxyContractId,
			req.privateKey,
			req.accountId,
		);
	}

	public async cashIn(
		req: ICashInStableCoinServiceRequestModel,
	): Promise<Uint8Array> {
		// TODO validation
		const coin: StableCoin = await this.getStableCoin({
			id: req.tokenId,
		});
		const amount = coin.toInteger(req.amount);
		if (coin.maxSupply > 0n && amount > coin.maxSupply - coin.totalSupply) {
			throw new Error('Amount is bigger than allowed supply');
		}
		return this.repository.cashIn(
			req.proxyContractId,
			req.privateKey,
			req.accountId,
			req.targetId,
			amount,
		);
	}

	public async cashOut(
		req: ICashOutStableCoinServiceRequestModel,
	): Promise<Uint8Array> {
		// TODO validate
		const coin: StableCoin = await this.getStableCoin({
			id: req.tokenId,
		});
		const amount = coin.toInteger(req.amount);
		const tokenOwnerBalance = await this.getTokenOwnerBalance({
			accountId: req.accountId,
			privateKey: req.privateKey,
			proxyContractId: req.proxyContractId,
		});
		if (amount > tokenOwnerBalance[0]) {
			throw new Error('Amount is bigger than token owner balance');
		}
		return this.repository.cashOut(
			req.proxyContractId,
			req.privateKey,
			req.accountId,
			amount,
		);
	}

	public async associateToken(
		req: IAssociateTokenStableCoinServiceRequestModel,
	): Promise<Uint8Array> {
		return this.repository.associateToken(
			req.proxyContractId,
			req.privateKey,
			req.accountId,
		);
	}

	public async wipe(
		req: IWipeStableCoinServiceRequestModel,
	): Promise<Uint8Array> {
		const coin: StableCoin = await this.getStableCoin({
			id: req.tokenId,
		});
		// Balances
		if (
			coin.totalSupply < 0n ||
			coin.totalSupply - BigInt(coin.toInteger(req.amount)) < 0n
		) {
			throw new Error('Amount is bigger than allowed supply');
		}

		const balance = await this.getBalanceOf({
			accountId: req.accountId,
			privateKey: req.privateKey,
			proxyContractId: req.proxyContractId,
			targetId: req.targetId,
			tokenId: req.tokenId,
		});

		if (balance[0] < req.amount) {
			throw new Error(`Insufficient funds on account ${req.targetId}`);
		}

		return this.repository.wipe(
			req.proxyContractId,
			req.privateKey,
			req.accountId,
			req.targetId,
			coin.toInteger(req.amount),
		);
	}

	public async rescue(
		req: IRescueStableCoinServiceRequestModel,
	): Promise<Uint8Array> {
		const coin: StableCoin = await this.getStableCoin({
			id: req.tokenId,
		});
		const amount = coin.toInteger(req.amount);

		const tokenOwnerBalance = await this.getTokenOwnerBalance({
			accountId: req.accountId,
			privateKey: req.privateKey,
			proxyContractId: req.proxyContractId,
		});

		if (amount > tokenOwnerBalance[0]) {
			throw new Error('Amount is bigger than token owner balance');
		}
		return this.repository.rescue(
			req.proxyContractId,
			req.privateKey,
			req.accountId,
			amount,
		);
	}

	public async grantSupplierRole(
		req: ISupplierRoleStableCoinServiceRequestModel,
	): Promise<Uint8Array> {
		return this.repository.grantSupplierRole(
			req.proxyContractId,
			req.targetId,
			req.privateKey,
			req.accountId,
			req.amount,
		);
	}

	public async isUnlimitedSupplierAllowance(
		req: IGetBasicRequestModel,
	): Promise<Uint8Array> {
		return this.repository.isUnlimitedSupplierAllowance(
			req.proxyContractId,
			req.targetId,
			req.privateKey,
			req.accountId,
		);
	}
	public async supplierAllowance(
		req: IGetBasicRequestModel,
	): Promise<Uint8Array> {
		return this.repository.supplierAllowance(
			req.proxyContractId,
			req.targetId,
			req.privateKey,
			req.accountId,
		);
	}
	public async revokeSupplierRole(
		req: IGetBasicRequestModel,
	): Promise<Uint8Array> {
		return this.repository.revokeSupplierRole(
			req.proxyContractId,
			req.targetId,
			req.privateKey,
			req.accountId,
		);
	}
	public async resetSupplierAllowance(
		req: IGetBasicRequestModel,
	): Promise<Uint8Array> {
		return this.repository.resetSupplierAllowance(
			req.proxyContractId,
			req.targetId,
			req.privateKey,
			req.accountId,
		);
	}
	public async increaseSupplierAllowance(
		req: ISupplierRoleStableCoinServiceRequestModel,
	): Promise<Uint8Array> {
		return this.repository.increaseSupplierAllowance(
			req.proxyContractId,
			req.targetId,
			req.privateKey,
			req.accountId,
			req.amount,
		);
	}
	public async decreaseSupplierAllowance(
		req: ISupplierRoleStableCoinServiceRequestModel,
	): Promise<Uint8Array> {
		return this.repository.decreaseSupplierAllowance(
			req.proxyContractId,
			req.targetId,
			req.privateKey,
			req.accountId,
			req.amount,
		);
	}

	public async isLimitedSupplierAllowance(
		req: IGetBasicRequestModel,
	): Promise<Uint8Array> {
		return this.repository.isLimitedSupplierAllowance(
			req.proxyContractId,
			req.targetId,
			req.privateKey,
			req.accountId,
		);
	}

	public async grantRole(
		req: IRoleStableCoinServiceRequestModel,
	): Promise<Uint8Array> {
		if (req.role != StableCoinRole.SUPPLIER_ROLE) {
			return this.repository.grantRole(
				req.proxyContractId,
				req.targetId,
				req.privateKey,
				req.accountId,
				req.role,
			);
		}

		return this.grantSupplierRole(req);
	}

	public async revokeRole(
		req: IRoleStableCoinServiceRequestModel,
	): Promise<Uint8Array> {
		if (req.role != StableCoinRole.SUPPLIER_ROLE) {
			return this.repository.revokeRole(
				req.proxyContractId,
				req.targetId,
				req.privateKey,
				req.accountId,
				req.role,
			);
		}
		return this.revokeSupplierRole(req);
	}

	public async hasRole(
		req: IRoleStableCoinServiceRequestModel,
	): Promise<Uint8Array> {
		return this.repository.hasRole(
			req.proxyContractId,
			req.targetId,
			req.privateKey,
			req.accountId,
			req.role,
		);
	}
}
