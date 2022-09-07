import IStableCoinList from './port/in/sdk/response/IStableCoinList.js';
import ContractsService from './app/service/contract/ContractsService.js';
import StableCoinService from './app/service/stablecoin/StableCoinService.js';
import { StableCoin } from './domain/context/stablecoin/StableCoin.js';
import StableCoinRepository from './port/out/stablecoin/StableCoinRepository.js';
import IStableCoinDetail from './domain/context/stablecoin/IStableCoinDetail.js';
import IStableCoinRepository from './port/out/stablecoin/IStableCoinRepository.js';
import NetworkAdapter from './port/out/network/NetworkAdapter.js';

import Web3 from 'web3';

import { HederaNetwork } from './core/enum.js';
import { AppMetadata } from './port/out/hedera/hashconnect/types/types.js';

import WipeStableCoinServiceRequestModel from './app/service/stablecoin/model/WipeStableCoinServiceRequestModel.js';
import CreateStableCoinServiceRequestModel from './app/service/stablecoin/model/CreateStableCoinServiceRequestModel.js';
import ListStableCoinServiceRequestModel from './app/service/stablecoin/model/ListStableCoinServiceRequestModel.js';
import CashInStableCoinServiceRequestModel from './app/service/stablecoin/model/CashInStableCoinServiceRequestModel.js';
import GetNameOfStableCoinServiceRequestModel from './app/service/stablecoin/model/GetNameOfStableCoinServiceRequestModel.js';
import GetBalanceOfStableCoinServiceRequestModel from './app/service/stablecoin/model/GetBalanceOfStableCoinServiceRequestModel.js';
import GetStableCoinServiceRequestModel from './app/service/stablecoin/model/GetStableCoinServiceRequestModel.js';
import AssociateTokenStableCoinServiceRequestModel from './app/service/stablecoin/model/AssociateTokenStableCoinServiceRequestModel.js';
import SupplierRoleStableCoinServiceRequestModel from './app/service/stablecoin/model/SupplierRoleStableCoinServiceRequestModel';
import RescueStableCoinServiceRequestModel from './app/service/stablecoin/model/RescueStableCoinServiceRequestModel.js';

/* Public requests */
import { IAssociateStableCoinRequest } from './port/in/sdk/request/IAssociateStableCoinRequest.js';
import { ICashInStableCoinRequest } from './port/in/sdk/request/ICashInStableCoinRequest.js';
import { ICreateStableCoinRequest } from './port/in/sdk/request/ICreateStableCoinRequest.js';
import { IGetBalanceStableCoinRequest } from './port/in/sdk/request/IGetBalanceStableCoinRequest.js';
import { IGetListStableCoinRequest } from './port/in/sdk/request/IGetListStableCoinRequest.js';
import { IGetNameStableCoinRequest } from './port/in/sdk/request/IGetNameStableCoinRequest.js';
import { IGetStableCoinRequest } from './port/in/sdk/request/IGetStableCoinRequest.js';
import { IRescueStableCoinRequest } from './port/in/sdk/request/IRescueStableCoinRequest.js';
import { ISupplierStableCoinRequest } from './port/in/sdk/request/ISupplierStableCoinRequest.js';
import { IWipeStableCoinRequest } from './port/in/sdk/request/IWipeStableCoinRequest.js';
import { AccountId } from './domain/context/account/AccountId.js';

export {
	IAssociateStableCoinRequest,
	ICashInStableCoinRequest,
	ICreateStableCoinRequest,
	IGetBalanceStableCoinRequest,
	IGetListStableCoinRequest,
	IGetNameStableCoinRequest,
	IGetStableCoinRequest,
	IRescueStableCoinRequest,
	ISupplierStableCoinRequest,
	IWipeStableCoinRequest,
};

/* Export basic types*/
export { AppMetadata, HederaNetwork };

export interface ConfigurationOptions {
	appMetadata?: AppMetadata;
	account?: {
		accountId: AccountId;
		privateKey: string;
	};
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
			const req: CreateStableCoinServiceRequestModel = { ...request };
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
		const req: ListStableCoinServiceRequestModel = { ...request };
		return this.stableCoinService.getListStableCoins(req);
	}

	/**
	 * getStableCoin
	 */
	public getStableCoin(
		request: IGetStableCoinRequest,
	): Promise<IStableCoinDetail> | null {
		const req: GetStableCoinServiceRequestModel = { ...request };
		return this.stableCoinService.getStableCoin(req);
	}

	/**
	 * getBalanceOf
	 */
	public getBalanceOf(
		request: IGetBalanceStableCoinRequest,
	): Promise<Uint8Array> | null {
		try {
			const req: GetBalanceOfStableCoinServiceRequestModel = {
				...request,
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
			const req: GetNameOfStableCoinServiceRequestModel = { ...request };
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
			const req: CashInStableCoinServiceRequestModel = { ...request };
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
			const req: AssociateTokenStableCoinServiceRequestModel = {
				...request,
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
			const req: WipeStableCoinServiceRequestModel = { ...request };
			return this.stableCoinService.wipe(req);
		} catch (error) {
			console.error(error);
			return null;
		}
	}

	/**
	 * grant supplier role
	 */
	public grantSupplierRole(
		request: ISupplierStableCoinRequest,
	): Promise<Uint8Array> | null {
		try {
			const req: SupplierRoleStableCoinServiceRequestModel = {
				...request,
			};
			return this.stableCoinService.grantSupplierRole(req);
		} catch (error) {
			console.error(error);
			return null;
		}
	}

	/**
	 * revoke limited supplier role
	 */
	public revokeSupplierRole(
		request: ISupplierStableCoinRequest,
	): Promise<Uint8Array> | null {
		try {
			const req: SupplierRoleStableCoinServiceRequestModel = {
				...request,
			};
			return this.stableCoinService.revokeSupplierRole(req);
		} catch (error) {
			console.error(error);
			return null;
		}
	}

	/**
	 * check unlimited supplier role
	 */
	public isUnlimitedSupplierAllowance(
		request: ISupplierStableCoinRequest,
	): Promise<Uint8Array> | null {
		try {
			const req: SupplierRoleStableCoinServiceRequestModel = {
				...request,
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
		request: ISupplierStableCoinRequest,
	): Promise<Uint8Array> | null {
		try {
			const req: SupplierRoleStableCoinServiceRequestModel = {
				...request,
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
		request: ISupplierStableCoinRequest,
	): Promise<Uint8Array> | null {
		try {
			const req: SupplierRoleStableCoinServiceRequestModel = {
				...request,
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
		request: ISupplierStableCoinRequest,
	): Promise<Uint8Array> | null {
		try {
			const req: SupplierRoleStableCoinServiceRequestModel = {
				...request,
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
		request: ISupplierStableCoinRequest,
	): Promise<Uint8Array> | null {
		try {
			const req: SupplierRoleStableCoinServiceRequestModel = {
				...request,
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
		request: ISupplierStableCoinRequest,
	): Promise<Uint8Array> | null {
		try {
			const req: SupplierRoleStableCoinServiceRequestModel = {
				...request,
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
			const req: RescueStableCoinServiceRequestModel = { ...request };
			return this.stableCoinService.rescue(req);
		} catch (error) {
			console.error(error);
			return null;
		}
	}

	public checkIsAddress(str?: string): boolean {
		if (!str) return false;
		new AccountId(str);
		return true;
	}
}
