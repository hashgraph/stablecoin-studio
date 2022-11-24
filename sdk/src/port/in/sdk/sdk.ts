/* eslint-disable @typescript-eslint/no-non-null-assertion */

// Logging
import { LoggerOptions, transports, format } from 'winston';
import DailyRotateFile from 'winston-daily-rotate-file';

// Responses
import StableCoinList from './response/StableCoinList.js';
import StableCoinDetail from './response/StableCoinDetail.js';
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
import IDeleteStableCoinRequestModel from '../../../app/service/stablecoin/model/IDeleteStableCoinRequestModel.js';

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
import AccountInfo from './response/AccountInfo.js';
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
	GetAccountInfoRequest,
	DeleteStableCoinRequest,
	PauseStableCoinRequest,
	FreezeAccountRequest,
} from './request';
import ValidatedRequest from './request/validation/ValidatedRequest.js';
import RequestMapper from './request/mapping/RequestMapper.js';
import { RequestAccount } from './request/BaseRequest.js';
import { Roles } from '../../../domain/context/stablecoin/Roles.js';
import IPauseStableCoinRequestModel from '../../../app/service/stablecoin/model/IPauseStableCoinRequestModel.js';
import IFreezeAccountRequestModel from '../../../app/service/stablecoin/model/IFreezeAccountRequestModel.js';
import LogService from '../../../app/service/log/LogService.js';

const DefaultLoggerFormat = LogService.defaultFormat;

export {
	ValidatedRequest,
	IAssociateStableCoinRequest,
	IGetNameStableCoinRequest,
	IBasicRequest,
	StableCoinDetail as IStableCoinDetail,
	StableCoinList as IStableCoinList,
	AccountInfo as IAccountInfo,
	LoggerOptions,
	transports as LoggerTransports,
	format as LoggerFormat,
	DailyRotateFile,
	DefaultLoggerFormat,
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
	logOptions?: LoggerOptions;
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
	private logService: LogService;

	constructor(config: Configuration) {
		this.config = config;
		this.logService = new LogService(this.config.options?.logOptions);
	}

	// Initializes the SDK,
	// TODO should probably be decoupled from the dependency injection
	public async init(options?: SDKInitOptions): Promise<SDK> {
		const providerEvents = this.getEventNames();
		LogService.logTrace('Event names found: ', providerEvents);
		this.eventService = new EventService({ ...providerEvents });
		if (options && options?.onInit) {
			LogService.logTrace('Invoking onInit listeners...');
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
		LogService.logTrace('Network adapter initialized');
		this.stableCoinRepository = new StableCoinRepository(
			this.networkAdapter,
		);
		LogService.logTrace('Stable coin repository initialized');
		this.stableCoinService = new StableCoinService(
			this.stableCoinRepository,
		);
		LogService.logTrace('Stable coin service initialized');
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
	): Promise<StableCoinDetail> {
		try {
			LogService.logTrace(request);
			const req: ICreateStableCoinServiceRequestModel = RequestMapper.map(
				request,
				{
					treasury: AccountId,
					autoRenewAccount: AccountId,
					initialSupply: (val, req) => {
						if (val) {
							return BigDecimal.fromString(val, req.decimals);
						}
						return BigDecimal.ZERO;
					},
					maxSupply: (val, req) => {
						if (val) {
							return BigDecimal.fromString(val, req.decimals);
						}
						return BigDecimal.ZERO;
					},
				},
			);
			return this.stableCoinService.createStableCoin(req);
		} catch (error) {
			LogService.logError(error);
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
	): Promise<StableCoinList[]> | null {
		LogService.logTrace(request);
		const req: IListStableCoinServiceRequestModel =
			RequestMapper.map(request);
		return this.stableCoinService.getListStableCoins(req);
	}

	public getStableCoinDetails(
		request: GetStableCoinDetailsRequest,
	): Promise<StableCoinDetail> | null {
		try {
			LogService.logTrace(request);
			const req: IGetStableCoinServiceRequestModel =
				RequestMapper.map(request);
			return this.stableCoinService.getStableCoinDetails(req);
		} catch (error) {
			LogService.logError(error);
			return null;
		}
	}

	/**
	 * getBalanceOf
	 */
	public getBalanceOf(
		request: GetAccountBalanceRequest,
	): Promise<string> | null {
		try {
			LogService.logTrace(request);
			const req: IGetBalanceOfStableCoinServiceRequestModel =
				RequestMapper.map(request);
			return this.stableCoinService.getBalanceOf(req);
		} catch (error) {
			LogService.logError(error);
			return null;
		}
	}

	/**
	 * cashIn
	 */
	public cashIn(request: CashInStableCoinRequest): Promise<boolean> | null {
		try {
			LogService.logTrace(request);
			const req: CashInStableCoinServiceRequestModel =
				RequestMapper.map(request);
			return this.stableCoinService.cashIn(req);
		} catch (error) {
			LogService.logError(error);
			return null;
		}
	}

	/**
	 * cashOut
	 */
	public cashOut(request: CashOutStableCoinRequest): Promise<boolean> | null {
		try {
			LogService.logTrace(request);
			const req: ICashOutStableCoinServiceRequestModel =
				RequestMapper.map(request);

			return this.stableCoinService.cashOut(req);
		} catch (error) {
			LogService.logError(error);
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
			LogService.logTrace(request);
			const req: AssociateTokenStableCoinServiceRequestModel =
				RequestMapper.map(request);
			return this.stableCoinService.associateToken(req);
		} catch (error) {
			LogService.logError(error);
			return null;
		}
	}

	/**
	 * wipeToken
	 */
	public wipe(request: WipeStableCoinRequest): Promise<boolean> | null {
		try {
			LogService.logTrace(request);
			const req: IWipeStableCoinServiceRequestModel =
				RequestMapper.map(request);
			return this.stableCoinService.wipe(req);
		} catch (error) {
			LogService.logError(error);
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
			LogService.logTrace(request);
			const req: IGetBasicRequestModel = RequestMapper.map(request);
			return this.stableCoinService.isUnlimitedSupplierAllowance(req);
		} catch (error) {
			LogService.logError(error);
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
			LogService.logTrace(request);
			const req: IGetSupplierAllowanceModel = RequestMapper.map(request);
			return this.stableCoinService.supplierAllowance(req);
		} catch (error) {
			LogService.logError(error);
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
			LogService.logTrace(request);
			const req: IGetBasicRequestModel = RequestMapper.map(request);
			return this.stableCoinService.resetSupplierAllowance(req);
		} catch (error) {
			LogService.logError(error);
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
			LogService.logTrace(request);
			const req: ISupplierRoleStableCoinServiceRequestModel =
				RequestMapper.map(request);
			return this.stableCoinService.increaseSupplierAllowance(req);
		} catch (error) {
			LogService.logError(error);
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
			LogService.logTrace(request);
			const req: ISupplierRoleStableCoinServiceRequestModel =
				RequestMapper.map(request);
			return this.stableCoinService.decreaseSupplierAllowance(req);
		} catch (error) {
			LogService.logError(error);
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
			LogService.logTrace(request);
			const req: IGetBasicRequestModel = RequestMapper.map(request);
			return this.stableCoinService.isLimitedSupplierAllowance(req);
		} catch (error) {
			LogService.logError(error);
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
			LogService.logTrace(request);
			const req: IRescueStableCoinServiceRequestModel =
				RequestMapper.map(request);
			return this.stableCoinService.rescue(req);
		} catch (error) {
			LogService.logError(error);
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
			LogService.logError(error);
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
			LogService.logError(error);
			return null;
		}
	}

	public hasRole(request: HasRoleRequest): Promise<Uint8Array> | null {
		try {
			LogService.logTrace(request);
			const req: IRoleStableCoinServiceRequestModel =
				RequestMapper.map(request);
			return this.stableCoinService.hasRole(req);
		} catch (error) {
			LogService.logError(error);
			return null;
		}
	}

	public getAccountInfo(
		request: GetAccountInfoRequest,
	): Promise<AccountInfo> | null {
		try {
			LogService.logTrace(request);
			const req: IAccountWithKeyRequestModel = RequestMapper.map(request);
			return this.stableCoinService.getAccountInfo(req);
		} catch (error) {
			LogService.logError(error);
			return null;
		}
	}

	public getRoles(request: GetRolesRequest): Promise<string[]> | null {
		try {
			LogService.logTrace(request);
			const req: IGetRolesServiceRequestModel =
				RequestMapper.map(request);
			return this.stableCoinService.getRoles(req);
		} catch (error) {
			LogService.logError(error);
			return null;
		}
	}

	public deleteStableCoin(
		request: DeleteStableCoinRequest,
	): Promise<boolean> | null {
		try {
			LogService.logTrace(request);
			const req: IDeleteStableCoinRequestModel =
				RequestMapper.map(request);
			return this.stableCoinService.deleteStableCoin(req);
		} catch (error) {
			LogService.logError(error);
			return null;
		}
	}

	public pauseStableCoin(
		request: PauseStableCoinRequest,
	): Promise<boolean> | null {
		try {
			LogService.logTrace(request);
			const req: IPauseStableCoinRequestModel =
				RequestMapper.map(request);
			return this.stableCoinService.pauseStableCoin(req);
		} catch (error) {
			LogService.logError(error);
			return null;
		}
	}

	public unpauseStableCoin(
		request: PauseStableCoinRequest,
	): Promise<boolean> | null {
		try {
			LogService.logTrace(request);
			const req: IPauseStableCoinRequestModel =
				RequestMapper.map(request);
			return this.stableCoinService.unpauseStableCoin(req);
		} catch (error) {
			LogService.logError(error);
			return null;
		}
	}

	public freezeAccount(
		request: FreezeAccountRequest,
	): Promise<boolean> | null {
		try {
			LogService.logTrace(request);
			const req: IFreezeAccountRequestModel = RequestMapper.map(request);
			return this.stableCoinService.freezeAccount(req);
		} catch (error) {
			LogService.logError(error);
			return null;
		}
	}

	public unfreezeAccount(
		request: FreezeAccountRequest,
	): Promise<boolean> | null {
		try {
			LogService.logTrace(request);
			const req: IFreezeAccountRequestModel = RequestMapper.map(request);
			return this.stableCoinService.unfreezeAccount(req);
		} catch (error) {
			LogService.logError(error);
			return null;
		}
	}

	// HashPack

	public getAvailabilityExtension(): boolean {
		return this.networkAdapter.provider.getAvailabilityExtension();
	}

	gethashConnectConectionStatus(): HashConnectConnectionState {
		return this.networkAdapter.provider.gethashConnectConectionState();
	}

	getInitData(): InitializationData {
		return this.networkAdapter.provider.getInitData();
	}

	disconectHaspack(): void {
		LogService.logTrace('HashPack: Disconnected');
		return this.networkAdapter.provider.disconectHaspack();
	}

	connectWallet(): Promise<IProvider> {
		LogService.logTrace('HashPack: Connected');
		return this.networkAdapter.provider.connectWallet();
	}

	public onInit(listener: (data: InitializationData) => void): void {
		LogService.logTrace('HashPack: Initialized');
		this.eventService.on(ProviderEventNames.providerInitEvent, listener);
	}

	public onWalletExtensionFound(listener: () => void): void {
		LogService.logTrace('HashPack: Extension found');
		this.eventService.on(
			ProviderEventNames.providerFoundExtensionEvent,
			listener,
		);
	}

	public onWalletConnectionChanged(
		listener: (state: HashConnectConnectionState) => void,
	): void {
		LogService.logTrace('HashPack: Wallet connection state changed');
		this.eventService.on(
			ProviderEventNames.providerConnectionStatusChangeEvent,
			listener,
		);
	}

	public onWalletPaired(
		listener: (data: HashConnectTypes.SavedPairingData) => void,
	): void {
		LogService.logTrace('HashPack: Wallet paired');
		this.eventService.on(ProviderEventNames.providerPairingEvent, listener);
	}

	public onWalletAcknowledgeMessageEvent(
		listener: (state: AcknowledgeMessage) => void,
	): void {
		LogService.logTrace('HashPack: Wallet acknowledged message');
		this.eventService.on(
			ProviderEventNames.providerAcknowledgeMessageEvent,
			listener,
		);
	}
}
