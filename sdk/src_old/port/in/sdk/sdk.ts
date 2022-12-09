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
import { LogOperation } from '../../../core/decorators/LogOperationDecorator.js';

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
export const HederaERC20AddressTestnet = "0.0.49059747";
export const HederaERC20AddressPreviewnet = "0.0.11111111";

export const FactoryAddressTestnet = "0.0.49059753";
export const FactoryAddressPreviewnet = "0.0.11111111";

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
	@LogOperation
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
	@LogOperation
	public createStableCoin(
		request: CreateStableCoinRequest,
	): Promise<StableCoinDetail> {
		try {
			const req: ICreateStableCoinServiceRequestModel = RequestMapper.map(
				request,
				{
					treasury: AccountId,
					autoRenewAccount: AccountId,
					initialSupply: (val, req) => {
						if(val){
							return BigDecimal.fromString(val, req.decimals);
						}
						return BigDecimal.ZERO;
					},
					maxSupply: (val, req) =>
						BigDecimal.fromString(val, req.decimals),
					stableCoinFactory: ContractId,
					hederaERC20: ContractId
				},
			);
			return this.stableCoinService.createStableCoin(req);
		} catch (error) {
			console.error(error);
			throw error;
		}
	}

	@LogOperation
	public getCapabilitiesStableCoin(
		id: string,
		publicKey: string,
	): Promise<Capabilities[]> | null {
		return this.stableCoinService.getCapabilitiesStableCoin(id, publicKey);
	}

	/**
	 * getListStableCoin
	 */
	@LogOperation
	public getListStableCoin(
		request: GetListStableCoinRequest,
	): Promise<StableCoinList[]> | null {
		const req: IListStableCoinServiceRequestModel =
			RequestMapper.map(request);
		return this.stableCoinService.getListStableCoins(req);
	}

	@LogOperation
	public getStableCoinDetails(
		request: GetStableCoinDetailsRequest,
	): Promise<StableCoinDetail> | null {
		const req: IGetStableCoinServiceRequestModel =
			RequestMapper.map(request);
		return this.stableCoinService.getStableCoinDetails(req);
	}

	/**
	 * getBalanceOf
	 */
	@LogOperation
	public getBalanceOf(
		request: GetAccountBalanceRequest,
	): Promise<string> | null {
		const req: IGetBalanceOfStableCoinServiceRequestModel =
			RequestMapper.map(request);
		return this.stableCoinService.getBalanceOf(req);
	}

	/**
	 * cashIn
	 */
	@LogOperation
	public cashIn(request: CashInStableCoinRequest): Promise<boolean> | null {
		const req: CashInStableCoinServiceRequestModel =
			RequestMapper.map(request);
		return this.stableCoinService.cashIn(req);
	}

	/**
	 * cashOut
	 */
	@LogOperation
	public cashOut(request: CashOutStableCoinRequest): Promise<boolean> | null {
		const req: ICashOutStableCoinServiceRequestModel =
			RequestMapper.map(request);

		return this.stableCoinService.cashOut(req);
	}

	/**
	 * associateToken
	 */
	@LogOperation
	public associateToken(
		request: AssociateTokenRequest,
	): Promise<Uint8Array> | null {
		const req: AssociateTokenStableCoinServiceRequestModel =
			RequestMapper.map(request);
		return this.stableCoinService.associateToken(req);
	}

	/**
	 * wipeToken
	 */
	@LogOperation
	public wipe(request: WipeStableCoinRequest): Promise<boolean> | null {
		const req: IWipeStableCoinServiceRequestModel =
			RequestMapper.map(request);
		return this.stableCoinService.wipe(req);
	}

	/**
	 * check unlimited supplier role
	 */
	@LogOperation
	public isUnlimitedSupplierAllowance(
		request: CheckCashInRoleRequest,
	): Promise<Uint8Array> | null {
		const req: IGetBasicRequestModel = RequestMapper.map(request);
		return this.stableCoinService.isUnlimitedSupplierAllowance(req);
	}
	/**
	 * check limited supplier role
	 */
	@LogOperation
	public supplierAllowance(
		request: CheckCashInLimitRequest,
	): Promise<string> | null {
		const req: IGetSupplierAllowanceModel = RequestMapper.map(request);
		return this.stableCoinService.supplierAllowance(req);
	}

	/**
	 * reset supplier allowance
	 */
	@LogOperation
	public resetSupplierAllowance(
		request: ResetCashInLimitRequest,
	): Promise<Uint8Array> | null {
		const req: IGetBasicRequestModel = RequestMapper.map(request);
		return this.stableCoinService.resetSupplierAllowance(req);
	}
	/**
	 * increase supplier allowance
	 */
	@LogOperation
	public increaseSupplierAllowance(
		request: IncreaseCashInLimitRequest,
	): Promise<Uint8Array> | null {
		const req: ISupplierRoleStableCoinServiceRequestModel =
			RequestMapper.map(request);
		return this.stableCoinService.increaseSupplierAllowance(req);
	}
	/**
	 * decrease supplier allowance
	 */
	@LogOperation
	public decreaseSupplierAllowance(
		request: DecreaseCashInLimitRequest,
	): Promise<Uint8Array> | null {
		const req: ISupplierRoleStableCoinServiceRequestModel =
			RequestMapper.map(request);
		return this.stableCoinService.decreaseSupplierAllowance(req);
	}

	/**
	 * check limited supplier role
	 */
	@LogOperation
	public isLimitedSupplierAllowance(
		request: CheckCashInRoleRequest,
	): Promise<Uint8Array> | null {
		const req: IGetBasicRequestModel = RequestMapper.map(request);
		return this.stableCoinService.isLimitedSupplierAllowance(req);
	}

	/**
	 * rescue
	 */
	@LogOperation
	public rescue(
		request: RescueStableCoinRequest,
	): Promise<Uint8Array> | null {
		const req: IRescueStableCoinServiceRequestModel =
			RequestMapper.map(request);
		return this.stableCoinService.rescue(req);
	}

	@LogOperation
	public checkIsAddress(str?: string): boolean {
		if (!str) return false;

		new AccountId(str);
		return true;
	}

	@LogOperation
	public getPublicKey(privateKey?: string, privateKeyType?: string): string {
		return this.networkAdapter.provider.getPublicKeyString(
			privateKey,
			privateKeyType,
		);
	}

	@LogOperation
	public grantRole(request: GrantRoleRequest): Promise<Uint8Array> | null {
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
	}

	@LogOperation
	public revokeRole(request: RevokeRoleRequest): Promise<Uint8Array> | null {
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
	}

	@LogOperation
	public hasRole(request: HasRoleRequest): Promise<Uint8Array> | null {
		const req: IRoleStableCoinServiceRequestModel =
			RequestMapper.map(request);
		return this.stableCoinService.hasRole(req);
	}

	@LogOperation
	public getAccountInfo(
		request: GetAccountInfoRequest,
	): Promise<AccountInfo> | null {
		const req: IAccountWithKeyRequestModel = RequestMapper.map(request);
		return this.stableCoinService.getAccountInfo(req);
	}

	@LogOperation
	public getRoles(request: GetRolesRequest): Promise<string[]> | null {
		const req: IGetRolesServiceRequestModel = RequestMapper.map(request);
		return this.stableCoinService.getRoles(req);
	}

	@LogOperation
	public deleteStableCoin(
		request: DeleteStableCoinRequest,
	): Promise<boolean> | null {
		const req: IDeleteStableCoinRequestModel = RequestMapper.map(request);
		return this.stableCoinService.deleteStableCoin(req);
	}

	@LogOperation
	public pauseStableCoin(
		request: PauseStableCoinRequest,
	): Promise<boolean> | null {
		const req: IPauseStableCoinRequestModel = RequestMapper.map(request);
		return this.stableCoinService.pauseStableCoin(req);
	}

	@LogOperation
	public unpauseStableCoin(
		request: PauseStableCoinRequest,
	): Promise<boolean> | null {
		const req: IPauseStableCoinRequestModel = RequestMapper.map(request);
		return this.stableCoinService.unpauseStableCoin(req);
	}

	@LogOperation
	public freezeAccount(
		request: FreezeAccountRequest,
	): Promise<boolean> | null {
		const req: IFreezeAccountRequestModel = RequestMapper.map(request);
		return this.stableCoinService.freezeAccount(req);
	}

	@LogOperation
	public unfreezeAccount(
		request: FreezeAccountRequest,
	): Promise<boolean> | null {
		const req: IFreezeAccountRequestModel = RequestMapper.map(request);
		return this.stableCoinService.unfreezeAccount(req);
	}

	// HashPack

	@LogOperation
	public getAvailabilityExtension(): boolean {
		return this.networkAdapter.provider.getAvailabilityExtension();
	}

	@LogOperation
	public gethashConnectConectionStatus(): HashConnectConnectionState {
		return this.networkAdapter.provider.gethashConnectConectionState();
	}

	@LogOperation
	public getInitData(): InitializationData {
		return this.networkAdapter.provider.getInitData();
	}

	@LogOperation
	public disconectHaspack(): void {
		LogService.logTrace('HashPack: Disconnected');
		return this.networkAdapter.provider.disconectHaspack();
	}

	@LogOperation
	public connectWallet(): Promise<IProvider> {
		LogService.logTrace('HashPack: Connected');
		return this.networkAdapter.provider.connectWallet();
	}

	@LogOperation
	public onInit(listener: (data: InitializationData) => void): void {
		LogService.logTrace('HashPack: Initialized');
		this.eventService.on(ProviderEventNames.providerInitEvent, listener);
	}

	@LogOperation
	public onWalletExtensionFound(listener: () => void): void {
		LogService.logTrace('HashPack: Extension found');
		this.eventService.on(
			ProviderEventNames.providerFoundExtensionEvent,
			listener,
		);
	}

	@LogOperation
	public onWalletConnectionChanged(
		listener: (state: HashConnectConnectionState) => void,
	): void {
		LogService.logTrace('HashPack: Wallet connection state changed');
		this.eventService.on(
			ProviderEventNames.providerConnectionStatusChangeEvent,
			listener,
		);
	}

	@LogOperation
	public onWalletPaired(
		listener: (data: HashConnectTypes.SavedPairingData) => void,
	): void {
		LogService.logTrace('HashPack: Wallet paired');
		this.eventService.on(ProviderEventNames.providerPairingEvent, listener);
	}

	@LogOperation
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
