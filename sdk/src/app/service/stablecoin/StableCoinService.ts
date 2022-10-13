import Service from '../Service.js';
import ICreateStableCoinServiceRequestModel from './model/ICreateStableCoinServiceRequestModel.js';
import { IListStableCoinServiceRequestModel } from './model/IListStableCoinServiceRequestModel.js';
import { StableCoin } from '../../../domain/context/stablecoin/StableCoin.js';
import IStableCoinList from '../../../port/in/sdk/response/IStableCoinList.js';
import IGetStableCoinServiceRequestModel from './model/IGetStableCoinServiceRequestModel.js';
import IGetBalanceOfStableCoinServiceRequestModel from './model/IGetBalanceOfStableCoinServiceRequestModel.js';
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
import IStableCoinDetail from '../../../port/in/sdk/response/IStableCoinDetail.js';
import { Capabilities } from '../../../domain/context/stablecoin/Capabilities.js';
import IGetSupplierAllowanceModel from './model/IGetSupplierAllowanceModel.js';

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
	): Promise<IStableCoinDetail> {
		let coin: StableCoin = new StableCoin({
			name: req.name,
			symbol: req.symbol,
			decimals: req.decimals,
			adminKey: req.adminKey,
			initialSupply: req.initialSupply
				? req.initialSupply * 10n ** BigInt(req.decimals)
				: undefined,
			maxSupply: req.maxSupply
				? req.maxSupply * 10n ** BigInt(req.decimals)
				: undefined,
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
		coin = await this.repository.saveCoin(coin, req.account);
		return this.getStableCoinDetails({ id: coin.id });
	}

	/**
	 * getListStableCoins
	 */
	public async getListStableCoins(
		req: IListStableCoinServiceRequestModel,
	): Promise<IStableCoinList[]> {
		return this.repository.getListStableCoins(req.account);
	}

	public async getStableCoinDetails(
		req: IGetStableCoinServiceRequestModel,
	): Promise<IStableCoinDetail> {
		const stableCoin: StableCoin = await this.getStableCoin(req);
		const stableCoinDetails: IStableCoinDetail = {
			tokenId: stableCoin.id,
			name: stableCoin.name,
			symbol: stableCoin.symbol,
			decimals: stableCoin.decimals,
			totalSupply: stableCoin.totalSupply,
			maxSupply: stableCoin.maxSupply,
			// customFee:stableCoin.,
			treasuryId: stableCoin.treasury.id,
			freezeDefault: stableCoin.freezeDefault,
			paused: stableCoin.paused,
			memo: stableCoin.memo,
			// kycStatus: string;
			deleted:stableCoin.deleted,
			autoRenewAccount: stableCoin.autoRenewAccount,
			autoRenewAccountPeriod: stableCoin.autoRenewAccountPeriod,
			adminKey: stableCoin.adminKey,
			kycKey: stableCoin.kycKey,
			freezeKey: stableCoin.freezeKey,
			wipeKey: stableCoin.wipeKey,
			supplyKey: stableCoin.supplyKey,
			pauseKey: stableCoin.pauseKey
			
		};
		return stableCoinDetails;
		// cast
	}

	/**
	 * getListStableCoins
	 */
	public async getStableCoin(
		req: IGetStableCoinServiceRequestModel,
	): Promise<StableCoin> {
		return this.repository.getStableCoin(req.id);
	}

	public async getCapabilitiesStableCoin(
		id: string,
		publicKey: string,
	): Promise<Capabilities[]> {
		return this.repository.getCapabilitiesStableCoin(id, publicKey);
	}

	public async getBalanceOf(
		req: IGetBalanceOfStableCoinServiceRequestModel,
	): Promise<Uint8Array> {
		return this.repository.getBalanceOf(
			req.proxyContractId,
			req.targetId,
			req.tokenId,
			req.account,
		);
	}

	public async getNameToken(
		req: IGetNameOfStableCoinServiceRequestModel,
	): Promise<Uint8Array> {
		return this.repository.getNameToken(req.proxyContractId, req.account);
	}

	public async cashIn(
		req: ICashInStableCoinServiceRequestModel,
	): Promise<boolean> {
		// TODO validation
		const coin: StableCoin = await this.getStableCoin({
			id: req.tokenId,
		});

		const amount = coin.toInteger(req.amount);
		if (coin.maxSupply > 0n && amount > coin.maxSupply - coin.totalSupply) {
			throw new Error('Amount is bigger than allowed supply');
		}
		let resultCashIn = false;

		const capabilities: Capabilities[] =
			await this.getCapabilitiesStableCoin(
				req.tokenId,
				req.account?.privateKey?.publicKey?.key ?? '',
			);
		if (capabilities.includes(Capabilities.CASH_IN)) {
			const result = await this.repository.cashIn(
				req.proxyContractId,
				req.targetId,
				amount,
				req.account,
			);
			resultCashIn = Boolean(result[0]);
		} else if (capabilities.includes(Capabilities.CASH_IN_HTS)) {
			resultCashIn = await this.repository.cashInHTS(
				req.tokenId,
				amount,
				req.account,
			);
			if (
				resultCashIn &&
				req?.account?.accountId.id &&
				req?.account?.accountId.id != req.targetId
			) {
				resultCashIn = await this.repository.transferHTS(
					req.tokenId,
					amount,
					req.account.accountId.id,
					req.targetId,
					req.account,
				);
			}
		} else {
			throw new Error('Cash in not allowed');
		}
		return resultCashIn;
	}

	public async cashOut(
		req: ICashOutStableCoinServiceRequestModel,
	): Promise<boolean> {
		// TODO validate
		const coin: StableCoin = await this.getStableCoin({
			id: req.tokenId,
		});
		const treasruyAccount: string = coin.treasury.id;
		const amount = coin.toInteger(req.amount);

		const treasuryAccountBalance = await this.getBalanceOf({
			account: req.account,
			proxyContractId: req.proxyContractId,
			targetId: treasruyAccount,
			tokenId: req.tokenId,
		});
		if (amount > coin.toInteger(treasuryAccountBalance[0])) {
			throw new Error('Amount is bigger than treasury account balance');
		}

		let resultCashOut = false;
		const capabilities: Capabilities[] =
			await this.getCapabilitiesStableCoin(
				req.tokenId,
				req.account?.privateKey?.publicKey.key ?? '',
			);
		if (capabilities.includes(Capabilities.BURN)) {
			const result = await this.repository.cashOut(
				req.proxyContractId,
				amount,
				req.account,
			);
			resultCashOut = Boolean(result[0]);
		} else if (capabilities.includes(Capabilities.BURN_HTS)) {
			resultCashOut = await this.repository.cashOutHTS(
				req.tokenId,
				amount,
				req.account,
			);
		} else {
			throw new Error('Cash out not allowed');
		}
		return resultCashOut;
	}

	public async associateToken(
		req: IAssociateTokenStableCoinServiceRequestModel,
	): Promise<Uint8Array> {
		return this.repository.associateToken(req.proxyContractId, req.account);
	}

	public async wipe(
		req: IWipeStableCoinServiceRequestModel,
	): Promise<boolean> {
		const coin: StableCoin = await this.getStableCoin({
			id: req.tokenId,
		});

		if (coin.treasury.id == req.targetId) {
			throw new Error('You cannot wipe tokens from the treasury account');
		}

		// Balances
		if (
			coin.totalSupply < 0n ||
			coin.totalSupply - BigInt(coin.toInteger(req.amount)) < 0n
		) {
			throw new Error('Amount is bigger than allowed supply');
		}

		const balance = await this.getBalanceOf({
			account: req.account,
			proxyContractId: req.proxyContractId,
			targetId: req.targetId,
			tokenId: req.tokenId,
		});

		if (balance[0] < req.amount) {
			throw new Error(`Insufficient funds on account ${req.targetId}`);
		}

		let resultWipe = false;
		const capabilities: Capabilities[] =
			await this.getCapabilitiesStableCoin(
				req.tokenId,
				req.account?.privateKey?.publicKey?.key ?? '',
			);
		if (capabilities.includes(Capabilities.WIPE)) {
			const result = await this.repository.wipe(
				req.proxyContractId,
				req.targetId,
				coin.toInteger(req.amount),
				req.account,
			);
			resultWipe = Boolean(result[0]);
		} else if (capabilities.includes(Capabilities.WIPE_HTS)) {
			resultWipe = await this.repository.wipeHTS(
				req.tokenId,
				req.targetId,
				coin.toInteger(req.amount),
				req.account,
			);
		} else {
			throw new Error('Wipe not allowed');
		}

		return resultWipe;
	}

	public async rescue(
		req: IRescueStableCoinServiceRequestModel,
	): Promise<Uint8Array> {
		const coin: StableCoin = await this.getStableCoin({
			id: req.tokenId,
		});

		const treasruyAccount: string = coin.treasury.id;
		const amount = coin.toInteger(req.amount);

		const treasuryAccountBalance = await this.getBalanceOf({
			account: req.account,
			proxyContractId: req.proxyContractId,
			targetId: treasruyAccount,
			tokenId: req.tokenId,
		});
		if (amount > coin.toInteger(treasuryAccountBalance[0])) {
			throw new Error('Amount is bigger than token owner balance');
		}
		return this.repository.rescue(req.proxyContractId, amount, req.account);
	}

	public async grantSupplierRole(
		req: ISupplierRoleStableCoinServiceRequestModel,
	): Promise<Uint8Array> {
		const coin: StableCoin = await this.getStableCoin({
			id: req.tokenId,
		});
		return this.repository.grantSupplierRole(
			req.proxyContractId,
			req.targetId,
			req.account,
			req.amount ? coin.toInteger(req.amount) : undefined,
		);
	}

	public async isUnlimitedSupplierAllowance(
		req: IGetBasicRequestModel,
	): Promise<Uint8Array> {
		return this.repository.isUnlimitedSupplierAllowance(
			req.proxyContractId,
			req.targetId,
			req.account,
		);
	}

	public async supplierAllowance(
		req: IGetSupplierAllowanceModel,
	): Promise<Uint8Array> {
		const response = await this.repository.supplierAllowance(
			req.proxyContractId,
			req.targetId,
			req.account,
		);
		const coin: StableCoin = await this.getStableCoin({
			id: req.tokenId,
		});
		const amount = coin.fromInteger(response[0]);
		response[0] = amount;
		return response;
	}

	public async revokeSupplierRole(
		req: IGetBasicRequestModel,
	): Promise<Uint8Array> {
		return this.repository.revokeSupplierRole(
			req.proxyContractId,
			req.targetId,
			req.account,
		);
	}

	public async resetSupplierAllowance(
		req: IGetBasicRequestModel,
	): Promise<Uint8Array> {
		return this.repository.resetSupplierAllowance(
			req.proxyContractId,
			req.targetId,
			req.account,
		);
	}

	public async increaseSupplierAllowance(
		req: ISupplierRoleStableCoinServiceRequestModel,
	): Promise<Uint8Array> {
		const coin: StableCoin = await this.getStableCoin({
			id: req.tokenId,
		});

		return this.repository.increaseSupplierAllowance(
			req.proxyContractId,
			req.targetId,
			req.account,
			req.amount ? coin.toInteger(req.amount) : 0,
		);
	}

	public async decreaseSupplierAllowance(
		req: ISupplierRoleStableCoinServiceRequestModel,
	): Promise<Uint8Array> {
		const limit = await this.supplierAllowance({
			proxyContractId: req.proxyContractId,
			targetId: req.targetId,
			account: req.account,
			tokenId: req.tokenId,
		});

		if (req.amount && limit[0] < req.amount) {
			throw new Error(
				'It is not possible to decrease the limit because the indicated amount is higher than the current limit. To be able to decrease the limit, at most the amount must be equal to the current limit.',
			);
		}

		const coin: StableCoin = await this.getStableCoin({
			id: req.tokenId,
		});

		return this.repository.decreaseSupplierAllowance(
			req.proxyContractId,
			req.targetId,
			req.account,
			req.amount ? coin.toInteger(req.amount) : 0,
		);
	}

	public async isLimitedSupplierAllowance(
		req: IGetBasicRequestModel,
	): Promise<Uint8Array> {
		return this.repository.isLimitedSupplierAllowance(
			req.proxyContractId,
			req.targetId,
			req.account,
		);
	}

	public async grantRole(
		req: IRoleStableCoinServiceRequestModel,
	): Promise<Uint8Array> {
		return this.repository.grantRole(
			req.proxyContractId,
			req.targetId,
			req.role,
			req.account,
		);
	}

	public async revokeRole(
		req: IRoleStableCoinServiceRequestModel,
	): Promise<Uint8Array> {
		return this.repository.revokeRole(
			req.proxyContractId,
			req.targetId,
			req.role,
			req.account,
		);
	}

	public async hasRole(
		req: IRoleStableCoinServiceRequestModel,
	): Promise<Uint8Array> {
		return this.repository.hasRole(
			req.proxyContractId,
			req.targetId,
			req.role,
			req.account,
		);
	}
}
