import IStableCoinList from './response/IStableCoinList.js';
import IStableCoinDetail from './response/IStableCoinDetail.js';
import StableCoinService from '../../../app/service/stablecoin/StableCoinService.js';
import { StableCoin } from '../../../domain/context/stablecoin/StableCoin.js';
import StableCoinRepository from '../../out/stablecoin/StableCoinRepository.js';
import IStableCoinRepository from '../../out/stablecoin/IStableCoinRepository.js';
import NetworkAdapter from '../../out/network/NetworkAdapter.js';

import {
	HederaNetwork,
	StableCoinRole,
	PrivateKeyType,
} from '../../../core/enum.js';
import { HederaNetworkEnviroment } from '../../../core/enum.js';
import { getHederaNetwork } from '../../../core/enum.js';

import IWipeStableCoinServiceRequestModel from '../../../app/service/stablecoin/model/IWipeStableCoinServiceRequestModel.js';
import ICreateStableCoinServiceRequestModel from '../../../app/service/stablecoin/model/ICreateStableCoinServiceRequestModel.js';
import { IListStableCoinServiceRequestModel } from '../../../app/service/stablecoin/model/IListStableCoinServiceRequestModel.js';
import ICashInStableCoinServiceRequestModel from '../../../app/service/stablecoin/model/ICashInStableCoinServiceRequestModel.js';
import ICashOutStableCoinServiceRequestModel from '../../../app/service/stablecoin/model/ICashOutStableCoinServiceRequestModel.js';
import IGetNameOfStableCoinServiceRequestModel from '../../../app/service/stablecoin/model/IGetNameOfStableCoinServiceRequestModel.js';
import IGetBalanceOfStableCoinServiceRequestModel from '../../../app/service/stablecoin/model/IGetBalanceOfStableCoinServiceRequestModel.js';
import IGetStableCoinServiceRequestModel from '../../../app/service/stablecoin/model/IGetStableCoinServiceRequestModel.js';
import IAssociateTokenStableCoinServiceRequestModel from '../../../app/service/stablecoin/model/IAssociateTokenStableCoinServiceRequestModel.js';
import ISupplierRoleStableCoinServiceRequestModel from '../../../app/service/stablecoin/model/ISupplierRoleStableCoinServiceRequestModel';
import IRescueStableCoinServiceRequestModel from '../../../app/service/stablecoin/model/IRescueStableCoinServiceRequestModel.js';
import IRoleStableCoinServiceRequestModel from '../../../app/service/stablecoin/model/IRoleStableCoinServiceRequestModel.js';
import IGetBasicRequestModel from '../../../app/service/stablecoin/model/IGetBasicRequest.js';
import { IAccountWithKeyRequestModel } from '../../../app/service/stablecoin/model/CoreRequestModel.js';

/* Public requests */
import { IAssociateStableCoinRequest } from './request/IAssociateStableCoinRequest.js';
import { ICashInStableCoinRequest } from './request/ICashInStableCoinRequest.js';
import { ICashOutStableCoinRequest } from './request/ICashOutStableCoinRequest.js';
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
import { StableCoinMemo } from '../../../domain/context/stablecoin/StableCoinMemo.js';
import { IAllowanceRequest } from './request/IRequestContracts.js';
import { AppMetadata } from '../../out/hedera/hashpack/types/types.js';
import {
	AcknowledgeMessage,
	AdditionalAccountRequestMessage,
	AdditionalAccountResponseMessage,
	ApprovePairingMessage,
	AuthenticationRequestMessage,
	AuthenticationResponseMessage,
	InitializationData,
} from '../../out/hedera/types.js';
import { ProviderEventNames } from '../../out/hedera/ProviderEvent.js';
import EventService from '../../../app/service/event/EventService.js';
import { IProvider } from '../../out/hedera/Provider.js';
import { SavedPairingData } from '../../out/hedera/types.js';
import { Capabilities } from '../../../domain/context/stablecoin/Capabilities.js';
import {
	HashConnectConnectionState,
	HashConnectTypes,
} from 'hashconnect/types';
import { IGetSupplierAllowance } from './request/IGetSupplierAllowance.js';
import IGetSupplierAllowanceModel from '../../../app/service/stablecoin/model/IGetSupplierAllowanceModel.js';
import { XOR } from 'ts-xor';
import { ISupplierRoleStableCoinRequest } from './request/ISupplierRoleStableCoinRequest.js';
import Account from '../../../domain/context/account/Account.js';
import HashPackAccount from '../../../domain/context/account/HashPackAccount.js';
import IAccountInfo from './response/IAccountInfo.js';

export {
	IAssociateStableCoinRequest,
	ICashInStableCoinRequest,
	ICashOutStableCoinRequest,
	ICreateStableCoinRequest,
	IGetBalanceStableCoinRequest,
	IGetListStableCoinRequest,
	IGetNameStableCoinRequest,
	IGetStableCoinRequest,
	IRescueStableCoinRequest,
	IRoleStableCoinRequest,
	IWipeStableCoinRequest,
	IBasicRequest,
	IStableCoinDetail,
	IStableCoinList,
	IAccountInfo
};

/* Export basic types*/
export {
	AppMetadata,
	HederaNetwork,
	StableCoin,
	Account,
	EOAccount,
	HashPackAccount,
	AccountId,
	PrivateKey,
	PublicKey,
	ContractId,
	TokenType,
	TokenSupplyType,
	HederaNetworkEnviroment,
	getHederaNetwork,
	StableCoinRole,
	PrivateKeyType,
	InitializationData,
	SavedPairingData,
	AcknowledgeMessage,
	AdditionalAccountRequestMessage,
	AdditionalAccountResponseMessage,
	ApprovePairingMessage,
	AuthenticationRequestMessage,
	AuthenticationResponseMessage,
	Capabilities,
	StableCoinMemo,
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

export interface SDKInitOptions {
	onInit: (data: InitializationData) => void;
}

export class SDK {
	private config: Configuration;

	private networkAdapter: NetworkAdapter;
	private stableCoinRepository: IStableCoinRepository;
	private stableCoinService: StableCoinService;
	private eventService: EventService;

	constructor(config: Configuration) {
		this.config = config;
		// console.log('SDK Initialised');
	}

	// Initializes the SDK,
	// TODO should probably be decoupled from the dependency injection
	public async init(options?: SDKInitOptions): Promise<SDK> {
		const providerEvents = this.getEventNames();
		this.eventService = new EventService({ ...providerEvents });
		if (options && options?.onInit) {
			this.eventService.on(
				ProviderEventNames.providerInitEvent,
				options.onInit,
			);
		}
		this.networkAdapter = await new NetworkAdapter(
			this.eventService,
			this.config.mode,
			this.config.network,
			{
				appMetadata: this.config.options?.appMetadata,
			},
		).init();
		this.stableCoinRepository = new StableCoinRepository(
			this.networkAdapter,
		);
		this.stableCoinService = new StableCoinService(
			this.stableCoinRepository,
		);
		return this;
	}

	// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
	private getEventNames() {
		return Object.keys(ProviderEventNames).reduce(
			(p, c) => ({ ...p, [c]: ProviderEventNames }),
			{},
		);
	}

	/**
	 * createStableCoin
	 */
	public createStableCoin(
		request: ICreateStableCoinRequest,
	): Promise<IStableCoinDetail> | null {
		try {
			const req: ICreateStableCoinServiceRequestModel = {
				...request,
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

	public getCapabilitiesStableCoin(
		id: string,
		publicKey: string,
	): Promise<Capabilities[]> | null {
		return this.stableCoinService.getCapabilitiesStableCoin(id, publicKey);
	}

	/**
	 * getListStableCoin
	 */
	public getListStableCoin(
		request: IGetListStableCoinRequest,
	): Promise<IStableCoinList[]> | null {
		const req: IListStableCoinServiceRequestModel = {
			...request,
		};
		return this.stableCoinService.getListStableCoins(req);
	}

	public getStableCoinDetails(
		request: IGetStableCoinRequest,
	): Promise<IStableCoinDetail> | null {
		const req: IGetStableCoinServiceRequestModel = {
			...request,
		};
		return this.stableCoinService.getStableCoinDetails(req);
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
	public cashIn(request: ICashInStableCoinRequest): Promise<boolean> | null {
		try {
			const req: ICashInStableCoinServiceRequestModel = {
				...request,
			};
			return this.stableCoinService.cashIn(req);
		} catch (error) {
			console.error(error);
			return null;
		}
	}

	/**
	 * cashOut
	 */
	public cashOut(
		request: ICashOutStableCoinRequest,
	): Promise<boolean> | null {
		try {
			const req: ICashOutStableCoinServiceRequestModel = {
				...request,
			};
			return this.stableCoinService.cashOut(req);
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
	public wipe(request: IWipeStableCoinRequest): Promise<boolean> | null {
		try {
			const req: IWipeStableCoinServiceRequestModel = {
				...request,
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
		request: IGetSupplierAllowance,
	): Promise<Uint8Array> | null {
		try {
			const req: IGetSupplierAllowanceModel = {
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
		request: IBasicRequest,
	): Promise<Uint8Array> | null {
		try {
			const req: IGetBasicRequestModel = {
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
		request: IAllowanceRequest,
	): Promise<Uint8Array> | null {
		try {
			const req: ISupplierRoleStableCoinServiceRequestModel = {
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
		request: IAllowanceRequest,
	): Promise<Uint8Array> | null {
		try {
			const req: ISupplierRoleStableCoinServiceRequestModel = {
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
		request: IBasicRequest,
	): Promise<Uint8Array> | null {
		try {
			const req: IGetBasicRequestModel = {
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
			const req: IRescueStableCoinServiceRequestModel = {
				...request,
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

	public getPublicKey(privateKey?: string, privateKeyType?: string): string {
		return this.networkAdapter.provider.getPublicKeyString(privateKey, privateKeyType);
	}

	public grantRole(
		request: XOR<IRoleStableCoinRequest, ISupplierRoleStableCoinRequest>,
	): Promise<Uint8Array> | null {
		try {
			const req = {
				...request,
			};
			if (req.role === StableCoinRole.CASHIN_ROLE) {
				return this.stableCoinService.grantSupplierRole(req);
			}
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
			};
			if (request.role === StableCoinRole.CASHIN_ROLE) {
				this.stableCoinService.revokeSupplierRole(req);
			}
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
				role: request.role,
			};
			return this.stableCoinService.hasRole(req);
		} catch (error) {
			console.error(error);
			return null;
		}
	}

	public getAccountInfo(
		request: IAccountWithKeyRequestModel,
	): Promise<IAccountInfo> | null {
		try {
			return this.stableCoinService.getAccountInfo(request);
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

	getInitData(): InitializationData {
		console.log('=====getInitData=====');
		return this.networkAdapter.provider.getInitData();
	}

	disconectHaspack(): void {
		console.log('=====disconect Haspack=====');
		return this.networkAdapter.provider.disconectHaspack();
	}

	connectWallet(): Promise<IProvider> {
		console.log('=====connectWallet Haspack=====');
		return this.networkAdapter.provider.connectWallet();
	}

	public onInit(listener: (data: InitializationData) => void): void {
		this.eventService.on(ProviderEventNames.providerInitEvent, listener);
	}

	public onWalletExtensionFound(listener: () => void): void {
		this.eventService.on(
			ProviderEventNames.providerFoundExtensionEvent,
			listener,
		);
	}

	public onWalletConnectionChanged(
		listener: (state: HashConnectConnectionState) => void,
	): void {
		this.eventService.on(
			ProviderEventNames.providerConnectionStatusChangeEvent,
			listener,
		);
	}

	public onWalletPaired(
		listener: (data: HashConnectTypes.SavedPairingData) => void,
	): void {
		this.eventService.on(ProviderEventNames.providerPairingEvent, listener);
	}

	public onWalletAcknowledgeMessageEvent(
		listener: (state: AcknowledgeMessage) => void,
	): void {
		this.eventService.on(
			ProviderEventNames.providerAcknowledgeMessageEvent,
			listener,
		);
	}
}
