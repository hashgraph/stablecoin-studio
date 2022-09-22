import IStableCoinList from './response/IStableCoinList.js';
import ContractsService from '../../../app/service/contract/ContractsService.js';
import StableCoinService from '../../../app/service/stablecoin/StableCoinService.js';
import { StableCoin } from '../../../domain/context/stablecoin/StableCoin.js';
import StableCoinRepository from '../../out/stablecoin/StableCoinRepository.js';
import IStableCoinRepository from '../../out/stablecoin/IStableCoinRepository.js';
import NetworkAdapter from '../../out/network/NetworkAdapter.js';

import Web3 from 'web3';

import { HederaNetwork, StableCoinRole } from '../../../core/enum.js';
import { HederaNetworkEnviroment } from '../../../core/enum.js';
import { getHederaNetwork } from '../../../core/enum.js';

import IWipeStableCoinServiceRequestModel from '../../../app/service/stablecoin/model/IWipeStableCoinServiceRequestModel.js';
import ICreateStableCoinServiceRequestModel from '../../../app/service/stablecoin/model/ICreateStableCoinServiceRequestModel.js';
import { IListStableCoinServiceRequestModel } from '../../../app/service/stablecoin/model/IListStableCoinServiceRequestModel.js';
import ICashInStableCoinServiceRequestModel from '../../../app/service/stablecoin/model/ICashInStableCoinServiceRequestModel.js';
import IGetNameOfStableCoinServiceRequestModel from '../../../app/service/stablecoin/model/IGetNameOfStableCoinServiceRequestModel.js';
import IGetBalanceOfStableCoinServiceRequestModel from '../../../app/service/stablecoin/model/IGetBalanceOfStableCoinServiceRequestModel.js';
import IGetStableCoinServiceRequestModel from '../../../app/service/stablecoin/model/IGetStableCoinServiceRequestModel.js';
import IAssociateTokenStableCoinServiceRequestModel from '../../../app/service/stablecoin/model/IAssociateTokenStableCoinServiceRequestModel.js';
import ISupplierRoleStableCoinServiceRequestModel from '../../../app/service/stablecoin/model/ISupplierRoleStableCoinServiceRequestModel';
import IRescueStableCoinServiceRequestModel from '../../../app/service/stablecoin/model/IRescueStableCoinServiceRequestModel.js';
import IRoleStableCoinServiceRequestModel from '../../../app/service/stablecoin/model/IRoleStableCoinServiceRequestModel.js';
import IGetBasicRequestModel from '../../../app/service/stablecoin/model/IGetBasicRequest.js';

/* Public requests */
import { IAssociateStableCoinRequest } from './request/IAssociateStableCoinRequest.js';
import { ICashInStableCoinRequest } from './request/ICashInStableCoinRequest.js';
import { ICreateStableCoinRequest } from './request/ICreateStableCoinRequest.js';
import { IGetBalanceStableCoinRequest } from './request/IGetBalanceStableCoinRequest.js';
import { IGetListStableCoinRequest } from './request/IGetListStableCoinRequest.js';
import { IGetNameStableCoinRequest } from './request/IGetNameStableCoinRequest.js';
import { IGetStableCoinRequest } from './request/IGetStableCoinRequest.js';
import { IRescueStableCoinRequest } from './request/IRescueStableCoinRequest.js';
import { IRoleStableCoinRequest } from './request/IRoleStableCoinRequest.js';
import { IWipeStableCoinRequest } from './request/IWipeStableCoinRequest.js';
import { IBasicRequest } from './request/IBasicRequest.js';
import AccountId from '../../../domain/context/account/AccountId.js';
import EOAccount from '../../../domain/context/account/EOAccount.js';
import PrivateKey from '../../../domain/context/account/PrivateKey.js';
import PublicKey from '../../../domain/context/account/PublicKey.js';
import ContractId from '../../../domain/context/contract/ContractId.js';
import { TokenType } from '../../../domain/context/stablecoin/TokenType.js';
import { TokenSupplyType } from '../../../domain/context/stablecoin/TokenSupply.js';
import { IAllowanceRequest } from './request/IRequestContracts.js';
import { HashConnectConnectionState } from 'hashconnect/dist/cjs/types/hashconnect.js';
import HashPackProvider from '../../out/hedera/hashpack/HashPackProvider.js';
import { AppMetadata } from '../../out/hedera/hashpack/types/types.js';

export {
	IAssociateStableCoinRequest,
	ICashInStableCoinRequest,
	ICreateStableCoinRequest,
	IGetBalanceStableCoinRequest,
	IGetListStableCoinRequest,
	IGetNameStableCoinRequest,
	IGetStableCoinRequest,
	IRescueStableCoinRequest,
	IRoleStableCoinRequest,
	IWipeStableCoinRequest,
	IBasicRequest,
};

/* Export basic types*/
export {
	AppMetadata,
	HederaNetwork,
	StableCoin,
	AccountId,
	EOAccount,
	PrivateKey,
	PublicKey,
	ContractId,
	TokenType,
	TokenSupplyType,
	HederaNetworkEnviroment,
	getHederaNetwork,
	StableCoinRole,
};

export interface ConfigurationOptions {
	appMetadata?: AppMetadata;
	account?: EOAccount;
}

export interface Configuration {
	network: HederaNetwork;
	mode: NetworkMode;
	options?: ConfigurationOptions; // TODO
}

export enum NetworkMode {
	'EOA' = 'EOA',
	'HASHPACK' = 'HASHPACK',
}

export class SDK {
	private config: Configuration;

	private web3: Web3;
	private networkAdapter: NetworkAdapter;
	private contractService: ContractsService;
	private stableCoinRepository: IStableCoinRepository;
	private stableCoinService: StableCoinService;

	constructor(config: Configuration) {
		this.config = config;
		// console.log('SDK Initialised');
	}

	// Initializes the SDK,
	// TODO should probably be decoupled from the dependency injection
	public async init(): Promise<SDK> {
		this.networkAdapter = await new NetworkAdapter(
			this.config.mode,
			this.config.network,
			{
				appMetadata: this.config.options?.appMetadata,
			},
		).init();
		this.web3 = new Web3();
		this.contractService = new ContractsService(this.networkAdapter);
		this.stableCoinRepository = new StableCoinRepository(
			this.networkAdapter,
		);
		this.stableCoinService = new StableCoinService(
			this.stableCoinRepository,
		);
		return this;
	}

	/**
	 * createStableCoin
	 */
	public createStableCoin(
		request: ICreateStableCoinRequest,
	): Promise<StableCoin> | null {
		try {
			const req: ICreateStableCoinServiceRequestModel = {
				...request,
				accountId: new AccountId(request.accountId),
				privateKey: new PrivateKey(request.privateKey),
				autoRenewAccount: request.autoRenewAccount
					? new AccountId(request.autoRenewAccount)
					: undefined,
			};
			return this.stableCoinService.createStableCoin(req);
		} catch (error) {
			console.error(error);
			return null;
		}
	}

	/**
	 * getListStableCoin
	 */
	public getListStableCoin(
		request: IGetListStableCoinRequest,
	): Promise<IStableCoinList[]> | null {
		const req: IListStableCoinServiceRequestModel = {
			...request,
			privateKey: new PrivateKey(request.privateKey),
		};
		return this.stableCoinService.getListStableCoins(req);
	}

	/**
	 * getStableCoin
	 */
	public getStableCoin(
		request: IGetStableCoinRequest,
	): Promise<StableCoin> | null {
		const req: IGetStableCoinServiceRequestModel = {
			...request,
		};
		return this.stableCoinService.getStableCoin(req);
	}

	/**
	 * getBalanceOf
	 */
	public getBalanceOf(
		request: IGetBalanceStableCoinRequest,
	): Promise<Uint8Array> | null {
		try {
			const req: IGetBalanceOfStableCoinServiceRequestModel = {
				...request,
				accountId: new AccountId(request.accountId),
				privateKey: new PrivateKey(request.privateKey),
				targetId: request.targetId,
			};
			return this.stableCoinService.getBalanceOf(req);
		} catch (error) {
			console.error(error);
			return null;
		}
	}

	/**
	 * getName
	 */
	public getNameToken(
		request: IGetNameStableCoinRequest,
	): Promise<Uint8Array> | null {
		try {
			const req: IGetNameOfStableCoinServiceRequestModel = {
				...request,
				accountId: new AccountId(request.accountId),
				privateKey: new PrivateKey(request.privateKey),
			};
			return this.stableCoinService.getNameToken(req);
		} catch (error) {
			console.error(error);
			return null;
		}
	}

	/**
	 * cashIn
	 */
	public cashIn(
		request: ICashInStableCoinRequest,
	): Promise<Uint8Array> | null {
		try {
			const req: ICashInStableCoinServiceRequestModel = {
				...request,
				accountId: new AccountId(request.accountId),
				privateKey: new PrivateKey(request.privateKey),
			};
			return this.stableCoinService.cashIn(req);
		} catch (error) {
			console.error(error);
			return null;
		}
	}

	/**
	 * associateToken
	 */
	public associateToken(
		request: IAssociateStableCoinRequest,
	): Promise<Uint8Array> | null {
		try {
			const req: IAssociateTokenStableCoinServiceRequestModel = {
				...request,
				accountId: new AccountId(request.accountId),
				privateKey: new PrivateKey(request.privateKey),
			};
			return this.stableCoinService.associateToken(req);
		} catch (error) {
			console.error(error);
			return null;
		}
	}

	/**
	 * wipeToken
	 */
	public wipe(request: IWipeStableCoinRequest): Promise<Uint8Array> | null {
		try {
			const req: IWipeStableCoinServiceRequestModel = {
				...request,
				accountId: new AccountId(request.accountId),
				privateKey: new PrivateKey(request.privateKey),
			};
			return this.stableCoinService.wipe(req);
		} catch (error) {
			console.error(error);
			return null;
		}
	}

	/**
	 * check unlimited supplier role
	 */
	public isUnlimitedSupplierAllowance(
		request: IBasicRequest,
	): Promise<Uint8Array> | null {
		try {
			const req: IGetBasicRequestModel = {
				...request,
				accountId: new AccountId(request.accountId),
				privateKey: new PrivateKey(request.privateKey),
			};
			return this.stableCoinService.isUnlimitedSupplierAllowance(req);
		} catch (error) {
			console.error(error);
			return null;
		}
	}
	/**
	 * check limited supplier role
	 */
	public supplierAllowance(
		request: IBasicRequest,
	): Promise<Uint8Array> | null {
		try {
			const req: IGetBasicRequestModel = {
				...request,
				accountId: new AccountId(request.accountId),
				privateKey: new PrivateKey(request.privateKey),
			};
			return this.stableCoinService.supplierAllowance(req);
		} catch (error) {
			console.error(error);
			return null;
		}
	}

	/**
	 * reset supplier allowance
	 */
	public resetSupplierAllowance(
		request: IBasicRequest,
	): Promise<Uint8Array> | null {
		try {
			const req: IGetBasicRequestModel = {
				...request,
				accountId: new AccountId(request.accountId),
				privateKey: new PrivateKey(request.privateKey),
			};
			return this.stableCoinService.resetSupplierAllowance(req);
		} catch (error) {
			console.error(error);
			return null;
		}
	}
	/**
	 * increase supplier allowance
	 */
	public increaseSupplierAllowance(
		request: IAllowanceRequest,
	): Promise<Uint8Array> | null {
		try {
			const req: ISupplierRoleStableCoinServiceRequestModel = {
				...request,
				accountId: new AccountId(request.accountId),
				privateKey: new PrivateKey(request.privateKey),
			};
			return this.stableCoinService.increaseSupplierAllowance(req);
		} catch (error) {
			console.error(error);
			return null;
		}
	}
	/**
	 * decrease supplier allowance
	 */
	public decreaseSupplierAllowance(
		request: IAllowanceRequest,
	): Promise<Uint8Array> | null {
		try {
			const req: ISupplierRoleStableCoinServiceRequestModel = {
				...request,
				accountId: new AccountId(request.accountId),
				privateKey: new PrivateKey(request.privateKey),
			};
			return this.stableCoinService.decreaseSupplierAllowance(req);
		} catch (error) {
			console.error(error);
			return null;
		}
	}

	/**
	 * check limited supplier role
	 */
	public isLimitedSupplierAllowance(
		request: IBasicRequest,
	): Promise<Uint8Array> | null {
		try {
			const req: IGetBasicRequestModel = {
				...request,
				accountId: new AccountId(request.accountId),
				privateKey: new PrivateKey(request.privateKey),
			};
			return this.stableCoinService.isLimitedSupplierAllowance(req);
		} catch (error) {
			console.error(error);
			return null;
		}
	}

	/**
	 * rescue
	 */
	public rescue(
		request: IRescueStableCoinRequest,
	): Promise<Uint8Array> | null {
		try {
			const req: IRescueStableCoinServiceRequestModel = {
				...request,
				accountId: new AccountId(request.accountId),
				privateKey: new PrivateKey(request.privateKey),
			};
			return this.stableCoinService.rescue(req);
		} catch (error) {
			console.error(error);
			return null;
		}
	}

	public checkIsAddress(str?: string): boolean {
		if (!str) return false;
		try {
			new AccountId(str);
		} catch (error) {
			return false;
		}
		return true;
	}

	public getPublicKey(str?: string): string {
		return this.networkAdapter.provider.getPublicKey(str);
	}

	public grantRole(
		request: IRoleStableCoinRequest,
	): Promise<Uint8Array> | null {
		try {
			const req: IRoleStableCoinServiceRequestModel = {
				...request,
				accountId: new AccountId(request.accountId),
				privateKey: new PrivateKey(request.privateKey),
			};

			return this.stableCoinService.grantRole(req);
		} catch (error) {
			console.error(error);
			return null;
		}
	}

	public revokeRole(
		request: IRoleStableCoinRequest,
	): Promise<Uint8Array> | null {
		try {
			const req: IRoleStableCoinServiceRequestModel = {
				...request,
				accountId: new AccountId(request.accountId),
				privateKey: new PrivateKey(request.privateKey),
				role: request.role,
			};
			return this.stableCoinService.revokeRole(req);
		} catch (error) {
			console.error(error);
			return null;
		}
	}

	public hasRole(
		request: IRoleStableCoinRequest,
	): Promise<Uint8Array> | null {
		try {
			const req: IRoleStableCoinServiceRequestModel = {
				...request,
				accountId: new AccountId(request.accountId),
				privateKey: new PrivateKey(request.privateKey),
				role: request.role,
			};
			return this.stableCoinService.hasRole(req);
		} catch (error) {
			console.error(error);
			return null;
		}
	}

	public getAvailabilityExtension(): boolean {
		console.log('=====getAvailabilityExtension=====');

		return this.networkAdapter.provider.getAvailabilityExtension();
	}
  
	gethashConnectConectionStatus(): HashConnectConnectionState {
		console.log('=====getAvailabilityExtension=====');
		return this.networkAdapter.provider.gethashConnectConectionState();
	}
  
	disconectHaspack(): void {
		console.log('=====disconect Haspack=====');
		return this.networkAdapter.provider.disconectHaspack();
	}

	connectWallet():Promise<HashPackProvider>{
		console.log('=====connectWallet Haspack=====');
		return this.networkAdapter.provider.connectWallet();
	}
}
