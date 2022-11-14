/* eslint-disable @typescript-eslint/no-non-null-assertion */
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
import CashInStableCoinServiceRequestModel from '../../../app/service/stablecoin/model/ICashInStableCoinServiceRequestModel.js';
import ICashOutStableCoinServiceRequestModel from '../../../app/service/stablecoin/model/ICashOutStableCoinServiceRequestModel.js';
import IGetBalanceOfStableCoinServiceRequestModel from '../../../app/service/stablecoin/model/IGetBalanceOfStableCoinServiceRequestModel.js';
import IGetStableCoinServiceRequestModel from '../../../app/service/stablecoin/model/IGetStableCoinServiceRequestModel.js';
import AssociateTokenStableCoinServiceRequestModel from '../../../app/service/stablecoin/model/IAssociateTokenStableCoinServiceRequestModel.js';
import ISupplierRoleStableCoinServiceRequestModel from '../../../app/service/stablecoin/model/ISupplierRoleStableCoinServiceRequestModel';
import IRescueStableCoinServiceRequestModel from '../../../app/service/stablecoin/model/IRescueStableCoinServiceRequestModel.js';
import IRoleStableCoinServiceRequestModel from '../../../app/service/stablecoin/model/IRoleStableCoinServiceRequestModel.js';
import IGetBasicRequestModel from '../../../app/service/stablecoin/model/IGetBasicRequest.js';
import { IAccountWithKeyRequestModel } from '../../../app/service/stablecoin/model/CoreRequestModel.js';

/* Public requests */
import { IAssociateStableCoinRequest } from './request/IAssociateStableCoinRequest.js';
import { IGetNameStableCoinRequest } from './request/IGetNameStableCoinRequest.js';
import { IBasicRequest } from './request/IBasicRequest.js';
import AccountId from '../../../domain/context/account/AccountId.js';
import EOAccount from '../../../domain/context/account/EOAccount.js';
import PrivateKey from '../../../domain/context/account/PrivateKey.js';
import PublicKey from '../../../domain/context/account/PublicKey.js';
import ContractId from '../../../domain/context/contract/ContractId.js';
import { TokenType } from '../../../domain/context/stablecoin/TokenType.js';
import { TokenSupplyType } from '../../../domain/context/stablecoin/TokenSupply.js';
import { StableCoinMemo } from '../../../domain/context/stablecoin/StableCoinMemo.js';
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
import IGetSupplierAllowanceModel from '../../../app/service/stablecoin/model/IGetSupplierAllowanceModel.js';
import Account from '../../../domain/context/account/Account.js';
import HashPackAccount from '../../../domain/context/account/HashPackAccount.js';
import IAccountInfo from './response/IAccountInfo.js';
import BigDecimal from '../../../domain/context/stablecoin/BigDecimal.js';
import IGetRolesServiceRequestModel from '../../../app/service/stablecoin/model/IGetRolesServiceRequest';
import {
	CreateStableCoinRequest,
	CashInStableCoinRequest,
	CashOutStableCoinRequest,
	WipeStableCoinRequest,
	GetListStableCoinRequest,
	GetStableCoinDetailsRequest,
	RescueStableCoinRequest,
	GrantRoleRequest,
	RevokeRoleRequest,
	HasRoleRequest,
	CheckCashInRoleRequest,
	CheckCashInLimitRequest,
	ResetCashInLimitRequest,
	IncreaseCashInLimitRequest,
	DecreaseCashInLimitRequest,
	GetAccountBalanceRequest,
	AssociateTokenRequest,
	GetRolesRequest,
} from './request';
import ValidatedRequest from './request/validation/ValidatedRequest.js';
import RequestMapper from './request/mapping/RequestMapper.js';
import { RequestAccount } from './request/BaseRequest.js';
import { Roles } from '../../../domain/context/stablecoin/Roles.js';

export {
	ValidatedRequest,
	IAssociateStableCoinRequest,
	IGetNameStableCoinRequest,
	IBasicRequest,
	IStableCoinDetail,
	IStableCoinList,
	IAccountInfo,
};

export * from './request';

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
	Roles,
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
	BigDecimal,
};

export interface ConfigurationOptions {
	appMetadata?: AppMetadata;
	account?: RequestAccount;
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
		request: CreateStableCoinRequest,
	): Promise<IStableCoinDetail> {
		try {
			const req: ICreateStableCoinServiceRequestModel = RequestMapper.map(
				request,
				{
					treasury: AccountId,
					autoRenewAccount: AccountId,
					initialSupply: (val, req) => {
						return BigDecimal.fromString(val, req.decimals);
					},
					maxSupply: (val, req) =>
						BigDecimal.fromString(val, req.decimals),
				},
			);
			return this.stableCoinService.createStableCoin(req);
		} catch (error) {
			console.error(error);
			throw error;
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
		request: GetListStableCoinRequest,
	): Promise<IStableCoinList[]> | null {
		const req: IListStableCoinServiceRequestModel =
			RequestMapper.map(request);
		return this.stableCoinService.getListStableCoins(req);
	}

	public getStableCoinDetails(
		request: GetStableCoinDetailsRequest,
	): Promise<IStableCoinDetail> | null {
		const req: IGetStableCoinServiceRequestModel =
			RequestMapper.map(request);
		return this.stableCoinService.getStableCoinDetails(req);
	}

	/**
	 * getBalanceOf
	 */
	public getBalanceOf(
		request: GetAccountBalanceRequest,
	): Promise<string> | null {
		try {
			const req: IGetBalanceOfStableCoinServiceRequestModel =
				RequestMapper.map(request);
			return this.stableCoinService.getBalanceOf(req);
		} catch (error) {
			console.error(error);
			return null;
		}
	}

	/**
	 * cashIn
	 */
	public cashIn(request: CashInStableCoinRequest): Promise<boolean> | null {
		try {
			// const req: ICashInStableCoinServiceRequestModel = {
			// 	...request,
			// };
			const req: CashInStableCoinServiceRequestModel =
				RequestMapper.map(request);
			return this.stableCoinService.cashIn(req);
		} catch (error) {
			console.error(error);
			return null;
		}
	}

	/**
	 * cashOut
	 */
	public cashOut(request: CashOutStableCoinRequest): Promise<boolean> | null {
		try {
			const req: ICashOutStableCoinServiceRequestModel =
				RequestMapper.map(request);

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
		request: AssociateTokenRequest,
	): Promise<Uint8Array> | null {
		try {
			const req: AssociateTokenStableCoinServiceRequestModel =
				RequestMapper.map(request);
			return this.stableCoinService.associateToken(req);
		} catch (error) {
			console.error(error);
			return null;
		}
	}

	/**
	 * wipeToken
	 */
	public wipe(request: WipeStableCoinRequest): Promise<boolean> | null {
		try {
			const req: IWipeStableCoinServiceRequestModel =
				RequestMapper.map(request);
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
		request: CheckCashInRoleRequest,
	): Promise<Uint8Array> | null {
		try {
			const req: IGetBasicRequestModel = RequestMapper.map(request);
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
		request: CheckCashInLimitRequest,
	): Promise<string> | null {
		try {
			const req: IGetSupplierAllowanceModel = RequestMapper.map(request);
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
		request: ResetCashInLimitRequest,
	): Promise<Uint8Array> | null {
		try {
			const req: IGetBasicRequestModel = RequestMapper.map(request);
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
		request: IncreaseCashInLimitRequest,
	): Promise<Uint8Array> | null {
		try {
			const req: ISupplierRoleStableCoinServiceRequestModel =
				RequestMapper.map(request);
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
		request: DecreaseCashInLimitRequest,
	): Promise<Uint8Array> | null {
		try {
			const req: ISupplierRoleStableCoinServiceRequestModel =
				RequestMapper.map(request);
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
		request: CheckCashInRoleRequest,
	): Promise<Uint8Array> | null {
		try {
			const req: IGetBasicRequestModel = RequestMapper.map(request);
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
		request: RescueStableCoinRequest,
	): Promise<Uint8Array> | null {
		try {
			const req: IRescueStableCoinServiceRequestModel =
				RequestMapper.map(request);
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
		return this.networkAdapter.provider.getPublicKeyString(
			privateKey,
			privateKeyType,
		);
	}

	public grantRole(request: GrantRoleRequest): Promise<Uint8Array> | null {
		try {
			if (request.role === StableCoinRole.CASHIN_ROLE) {
				const grantSupplierRoleReq: ISupplierRoleStableCoinServiceRequestModel =
					RequestMapper.map(request);
				return this.stableCoinService.grantSupplierRole(
					grantSupplierRoleReq,
				);
			}
			const grantRoleReq: IRoleStableCoinServiceRequestModel =
				RequestMapper.map(request);
			return this.stableCoinService.grantRole(grantRoleReq);
		} catch (error) {
			console.error(error);
			return null;
		}
	}

	public revokeRole(request: RevokeRoleRequest): Promise<Uint8Array> | null {
		try {
			if (request.role === StableCoinRole.CASHIN_ROLE) {
				const revokeSupplierRoleReq: ISupplierRoleStableCoinServiceRequestModel =
					RequestMapper.map(request);
				return this.stableCoinService.revokeSupplierRole(
					revokeSupplierRoleReq,
				);
			} else {
				const revokeRoleReq: IRoleStableCoinServiceRequestModel =
					RequestMapper.map(request);
				return this.stableCoinService.revokeRole(revokeRoleReq);
			}
		} catch (error) {
			console.error(error);
			return null;
		}
	}

	public hasRole(request: HasRoleRequest): Promise<Uint8Array> | null {
		try {
			const req: IRoleStableCoinServiceRequestModel =
				RequestMapper.map(request);
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

	public getRoles(request: GetRolesRequest): Promise<string[]> | null {
		try {
			const req: IGetRolesServiceRequestModel =
				RequestMapper.map(request);
			return this.stableCoinService.getRoles(req);
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
