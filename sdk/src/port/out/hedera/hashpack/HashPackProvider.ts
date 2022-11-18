/* eslint-disable @typescript-eslint/no-explicit-any */
import { IniConfig, IProvider } from '../Provider.js';
import {
	HederaNetwork,
	getHederaNetwork,
	AppMetadata,
	PublicKey,
	PrivateKey,
	AccountId,
	ContractId,
	StableCoinMemo,
	PrivateKeyType,
	Account,
	TokenSupplyType
} from '../../../in/sdk/sdk.js';
import {
	AccountId as HAccountId,
	ContractFunctionParameters,
	ContractId as HContractId,
	PrivateKey as HPrivateKey,
	TokenId,
	Transaction,
	Status,
	Signer,
	TransactionResponse,
} from '@hashgraph/sdk';
import { StableCoin } from '../../../../domain/context/stablecoin/StableCoin.js';
import {
	ICallContractRequest,
	ICallContractWithAccountRequest,
	ICreateTokenResponse,
	IHTSTokenRequest,
	IWipeTokenRequest,
	ITransferTokenRequest,
	InitializationData,
} from '../types.js';
import { HashPackSigner } from './HashPackSigner.js';
import { TransactionProvider } from '../transaction/TransactionProvider.js';
import { HTSResponse, TransactionType } from '../sign/ISigner.js';
import { TransactionResposeHandler } from '../transaction/TransactionResponseHandler.js';
import ProviderError from '../error/HederaError.js';
import Web3 from 'web3';
import { log } from '../../../../core/log.js';
import {
	HederaERC20__factory,
	StableCoinFactory__factory
} from 'hedera-stable-coin-contracts/typechain-types/index.js';
import { HashConnectProvider } from 'hashconnect/provider/provider';
import ProviderEvent, { ProviderEventNames } from '../ProviderEvent.js';
import EventService from '../../../../app/service/event/EventService.js';
import { HashConnect } from 'hashconnect';
import { HashConnectTypes } from 'hashconnect';
import { HashConnectConnectionState, NetworkType } from 'hashconnect/types';
import HashPackAccount from '../../../../domain/context/account/HashPackAccount.js';
import { PublicKey as HPublicKey } from '@hashgraph/sdk';
import { safeCast } from '../../../../core/cast.js';
import axios from 'axios';
import IAccount from '../account/types/IAccount.js';
import BigDecimal from '../../../../domain/context/stablecoin/BigDecimal.js';
import Long from 'long';
import { EmptyMetadata } from './error/EmptyMetadata.js';
import { InitializationError } from '../error/InitializationError.js';
import { PairingError } from '../error/PairingError.js';
import { DeploymentError } from '../error/DeploymentError.js';
import { FactoryKey } from '../../../../domain/context/factory/FactoryKey.js';
import { FactoryStableCoin } from '../../../../domain/context/factory/FactoryStableCoin.js';


const logOpts = { newLine: true, clear: true };

export default class HashPackProvider implements IProvider {
	private hc: HashConnect;
	private _initData: InitializationData;
	private network: HederaNetwork;
	private extensionMetadata: AppMetadata;
	private availableExtension = false;
	private hashPackSigner: HashPackSigner;
	private transactionResposeHandler: TransactionResposeHandler =
		new TransactionResposeHandler();
	private web3 = new Web3();
	private provider: HashConnectProvider;
	private hashConnectConectionState: HashConnectConnectionState;
	private pairingData: HashConnectTypes.SavedPairingData | null = null;

	public eventService: EventService;
	public static events: ProviderEvent;

	public get initData(): InitializationData {
		return this._initData;
	}
	public set initData(value: InitializationData) {
		this._initData = value;
	}

	constructor(eventService: EventService) {
		this.eventService = eventService;
	}

	public async init({
		network,
		options,
	}: IniConfig): Promise<HashPackProvider> {
		try {
			this.hc = new HashConnect(options?.appMetadata?.debugMode);

			this.setUpHashConnectEvents();
			this.network = network;
			if (options && options?.appMetadata) {
				this.initData = await this.hc.init(
					options.appMetadata,
					getHederaNetwork(network)?.name as Partial<
						'mainnet' | 'testnet' | 'previewnet'
					>,
				);
				this.eventService.emit(
					ProviderEventNames.providerInitEvent,
					this.initData,
				);
			} else {
				throw new EmptyMetadata(this.initData);
			}
			return this;
		} catch (error) {
			throw new InitializationError(error);
		}
	}

	public async connectWallet(): Promise<HashPackProvider> {
		console.log('=====CONNECT WALLET HASPACKPROVIDER=====');
		this.hc.connectToLocalWallet();
		return this;
	}

	public setUpHashConnectEvents(): void {
		//This is fired when a extension is found
		this.hc.foundExtensionEvent.on((data) => {
			console.log('Found extension', data);
			if (data) {
				this.availableExtension = true;
				console.log(
					'Emitted found',
					this.eventService.emit(
						ProviderEventNames.providerFoundExtensionEvent,
					),
				);
			}
		});

		//This is fired when a wallet approves a pairing
		this.hc.pairingEvent.on(async (data) => {
			try {
				if (data.pairingData) {
					this.pairingData = data.pairingData;
					console.log('Paired with wallet', data);
					this.eventService.emit(
						ProviderEventNames.providerPairingEvent,
						this.pairingData,
					);
				} else {
					throw new PairingError(data);
				}
			} catch (error) {
				throw new PairingError(error);
			}
		});

		//This is fired when HashConnect loses connection, pairs successfully, or is starting connection
		this.hc.connectionStatusChangeEvent.on((state) => {
			this.hashConnectConectionState = state;
			console.log('hashconnect state change event', state);
			this.eventService.emit(
				ProviderEventNames.providerConnectionStatusChangeEvent,
				this.hashConnectConectionState,
			);
			// this.state = state;
		});

		this.hc.acknowledgeMessageEvent.on((msg) => {
			this.eventService.emit(
				ProviderEventNames.providerAcknowledgeMessageEvent,
				msg,
			);
		});
	}

	private getSigner(): Signer {
		return this.hashPackSigner.signer;
	}

	public async callContract(
		name: string,
		params: ICallContractRequest | ICallContractWithAccountRequest,
	): Promise<Uint8Array> {
		const { contractId, parameters, gas, abi } = params;
		if ('account' in params) {
			this.hashPackSigner = new HashPackSigner(
				this.hc,
				params.account,
				this.network,
				this.initData.topic,
			);
		} else {
			throw new ProviderError(
				'You must specify an accountId for operate with HashConnect.',
			);
		}
		const functionCallParameters = this.encodeFunctionCall(
			name,
			parameters,
			abi,
		);
		const transaction: Transaction =
			TransactionProvider.buildContractExecuteTransaction(
				contractId,
				functionCallParameters,
				gas,
			);

		const transactionResponse =
			await this.hashPackSigner.signAndSendTransaction(transaction);
		const htsResponse: HTSResponse =
			await this.transactionResposeHandler.manageResponse(
				transactionResponse,
				TransactionType.RECORD,
				this.getSigner(),
				name,
				abi,
			);
		return htsResponse.reponseParam;
	}

	public encodeFunctionCall(
		functionName: string,
		parameters: any[],
		abi: any[],
	): Uint8Array {
		const functionAbi = abi.find(
			(func: { name: any; type: string }) =>
				func.name === functionName && func.type === 'function',
		);
		if (!functionAbi)
			throw new ProviderError(
				'Contract function not found in ABI, are you using the right version?',
			);
		const encodedParametersHex = this.web3.eth.abi
			.encodeFunctionCall(functionAbi, parameters)
			.slice(2);

		return Buffer.from(encodedParametersHex, 'hex');
	}

	public async accountToEvmAddress(account: Account): Promise<string> {
		if (account.privateKey) {
			return this.getAccountEvmAddressFromPrivateKeyType(
				account.privateKey?.type,
				account.privateKey.publicKey.key,
				account.accountId.id,
			);
		} else {
			return await this.getAccountEvmAddress(account.accountId.id);
		}
	}

	private async getAccountEvmAddress(accountId: string): Promise<string> {
		try {
			const URI_BASE = `${
				getHederaNetwork(this.network)?.mirrorNodeUrl
			}/api/v1/`;
			const res = await axios.get<IAccount>(
				URI_BASE + 'accounts/' + accountId,
			);

			if (res.data.evm_address) {
				return res.data.evm_address;
			} else {
				return this.getAccountEvmAddressFromPrivateKeyType(
					res.data.key._type,
					res.data.key.key,
					accountId,
				);
			}
		} catch (error) {
			return Promise.reject<string>(error);
		}
	}

	private getAccountEvmAddressFromPrivateKeyType(
		privateKeyType: string,
		publicKey: string,
		accountId: string,
	): string {
		switch (privateKeyType) {
			case PrivateKeyType.ECDSA:
				return HPublicKey.fromString(publicKey).toEthereumAddress();

			default:
				return HAccountId.fromString(accountId).toSolidityAddress();
		}
	}

	public async deployStableCoin(
		stableCoin: StableCoin,
		account: HashPackAccount,
		stableCoinFactory: ContractId
	): Promise<StableCoin> {
		try{
			if (account) {
				this.provider = this.hc.getProvider(
					this.network.hederaNetworkEnviroment as NetworkType,
					this.initData.topic,
					account.accountId.id,
				);
			} else {
				throw new DeploymentError(
					'You must specify an accountId for operate with HashConnect.',
				);
			}
			
			log(
				`Using the Factory contract at ${stableCoinFactory.id} to create a new stable coin... please wait.`,
				logOpts,
			);
	
			const keys:FactoryKey[]  = [];
	
			const providedKeys = [stableCoin.adminKey,
				stableCoin.kycKey,
				stableCoin.freezeKey,
				stableCoin.wipeKey,
				stableCoin.supplyKey,
				stableCoin.pauseKey
			]
	
			providedKeys.forEach(
				(providedKey, index) => {
					if(providedKey){
						const key = new FactoryKey();
						switch(index){
							case 0: {
								key.keyType = 1; // admin
								break;
							}
							case 1: {
								key.keyType = 2; // kyc
								break;
							}
							case 2: {
								key.keyType = 4; // freeze
								break;
							}
							case 3: {
								key.keyType = 8; // wipe
								break;
							}
							case 4: {
								key.keyType = 16; // supply
								break;
							}
							case 5: {
								key.keyType = 64; // pause
								break;
							}
						}
						const providedKeyCasted = providedKey as PublicKey;
						key.PublicKey = (providedKeyCasted.key == PublicKey.NULL.key)? "0x" : HPublicKey.fromString(providedKeyCasted.key).toBytes();
						keys.push(key);
					}
				});
	
	
			const stableCoinToCreate = new FactoryStableCoin(
				stableCoin.name,
				stableCoin.symbol,
				stableCoin.freezeDefault,
				(stableCoin.supplyType == TokenSupplyType.FINITE),
				(stableCoin.maxSupply) ? stableCoin.maxSupply.toLong().toString(): "0",
				(stableCoin.initialSupply) ? stableCoin.initialSupply.toLong().toString(): "0",
				stableCoin.decimals,
				HAccountId.fromString(stableCoin.autoRenewAccount.toString()).toSolidityAddress(),
				keys
			);
	
			const parameters = [
				JSON.stringify(stableCoinToCreate)
			];
	
			const params: ICallContractWithAccountRequest = {
				contractId: stableCoinFactory.id,
				parameters,
				gas: 15000000,
				abi: StableCoinFactory__factory.abi,
				account,
				value: 25
			};
	
			const deployStableCoinResponse: any = await this.callContract(
				'deployStableCoin', 
				params
			);
	
	
			const coinToReturn = stableCoin;
			coinToReturn.id = HAccountId.fromSolidityAddress(deployStableCoinResponse[3]).toString();

			return coinToReturn;

		} catch (error) {
			throw new DeploymentError(error);
		}
	}

	private async deployContract(
		factory: any,
		account: HashPackAccount,
		params?: any,
	): Promise<HContractId> {
		try {
			this.hashPackSigner = new HashPackSigner(
				this.hc,
				account,
				this.network,
				this.initData.topic,
			);
			const key = await this.hashPackSigner.getAccountKey();
			const transaction =
				TransactionProvider.buildContractCreateFlowTransaction(
					factory,
					params,
					220_000,
					key,
				);
			const transactionResponse =
				await this.hashPackSigner.signAndSendTransaction(transaction);
			console.log(transactionResponse);
			const htsResponse: HTSResponse =
				await this.transactionResposeHandler.manageResponse(
					transactionResponse,
					TransactionType.RECEIPT,
					this.getSigner(),
				);

			if (!htsResponse?.receipt?.contractId) {
				throw new DeploymentError(
					`An error ocurred during deployment of ${factory.name}`,
				);
			} else {
				return htsResponse.receipt.contractId;
			}
		} catch (error) {
			throw new DeploymentError(
				`An error ocurred during deployment of ${factory.name} : ${error}`,
			);
		}
	}

	private async createToken(
		contractId: HContractId,
		name: string,
		symbol: string,
		decimals: number,
		initialSupply: Long,
		maxSupply: Long | undefined,
		memo: string,
		freezeDefault: boolean,
		account: HashPackAccount,
		treasuryAccountId?: AccountId,
		adminKey?: PublicKey,
		freezeKey?: PublicKey,
		kycKey?: PublicKey,
		wipeKey?: PublicKey,
		pauseKey?: PublicKey,
		supplyKey?: PublicKey,
		autoRenewAccount?: AccountId,
	): Promise<ICreateTokenResponse> {
		const values: ICreateTokenResponse = {
			name,
			symbol,
			decimals,
			initialSupply: initialSupply,
			maxSupply: maxSupply ? maxSupply : Long.ZERO,
			memo,
			freezeDefault,
			treasuryAccountId:
				treasuryAccountId ?? new AccountId(String(contractId)),
			tokenId: TokenId.fromString('0.0.0'),
			adminKey,
			freezeKey,
			kycKey,
			wipeKey,
			pauseKey,
			supplyKey,
			autoRenewAccountId: autoRenewAccount
				? new AccountId(autoRenewAccount.toString())
				: account.accountId,
		};

		this.hashPackSigner = new HashPackSigner(
			this.hc,
			account,
			this.network,
			this.initData.topic,
		);
		const transaction: Transaction =
			TransactionProvider.buildTokenCreateTransaction(
				ContractId.fromHederaContractId(contractId),
				values,
				maxSupply,
			);
		const transactionResponse =
			await this.hashPackSigner.signAndSendTransaction(transaction);
		const htsResponse: HTSResponse =
			await this.transactionResposeHandler.manageResponse(
				transactionResponse,
				TransactionType.RECEIPT,
				this.getSigner(),
			);

		if (!htsResponse?.receipt?.tokenId) {
			throw new DeploymentError(
				`An error ocurred creating the stable coin ${name}`,
			);
		}
		values.tokenId = htsResponse.receipt.tokenId;
		log(
			`Token ${name} created tokenId ${
				values.tokenId
			} - tokenAddress ${values.tokenId?.toSolidityAddress()}`,
			logOpts,
		);
		return values;
	}

	public getPublicKeyString(
		privateKey?: PrivateKey | string | undefined,
	): string {
		let key = null;
		let publicKey = null;
		if (privateKey instanceof PrivateKey) {
			publicKey = privateKey.toHashgraphKey().publicKey.toStringRaw();
		} else {
			key = privateKey;
			if (!key) throw new ProviderError('No private key provided');
			publicKey = HPrivateKey.fromString(key).publicKey.toStringRaw();
		}
		return publicKey;
	}

	public async stop(): Promise<boolean> {
		const topic = this.initData.topic;
		await this.hc.disconnect(topic);
		await this.hc.clearConnectionsAndData();
		return new Promise((res) => {
			res(true);
		});
	}

	getBalance(): Promise<number> {
		throw new ProviderError('Method not implemented.');
	}

	getAvailabilityExtension(): boolean {
		return this.availableExtension;
	}

	gethashConnectConectionState(): HashConnectConnectionState {
		return this.hashConnectConectionState;
	}

	disconectHaspack(): void {
		if (this.initData?.topic) this.hc.disconnect(this.initData.topic);

		this.pairingData = null;
		this.eventService.emit(
			ProviderEventNames.providerConnectionStatusChangeEvent,
			HashConnectConnectionState.Disconnected,
		);
	}

	getInitData(): HashConnectTypes.InitilizationData {
		return this.initData;
	}

	public async wipeHTS(params: IWipeTokenRequest): Promise<boolean> {
		if ('account' in params) {
			this.provider = this.hc.getProvider(
				this.network.hederaNetworkEnviroment as NetworkType,
				this.initData.topic,
				params.account.accountId.id,
			);
			this.hashPackSigner = new HashPackSigner(
				this.hc,
				params.account,
				this.network,
				this.initData.topic,
			);
		} else {
			throw new ProviderError(
				'You must specify an accountId for operate with HashConnect.',
			);
		}

		const transaction: Transaction =
			TransactionProvider.buildTokenWipeTransaction(
				params.wipeAccountId,
				params.tokenId,
				params.amount,
			);

		const transactionResponse =
			await this.hashPackSigner.signAndSendTransaction(transaction);

		const htsResponse: HTSResponse =
			await this.transactionResposeHandler.manageResponse(
				transactionResponse,
				TransactionType.RECEIPT,
				this.getSigner(),
			);

		if (!htsResponse.receipt) {
			throw new ProviderError(
				`An error has occurred when wipe the amount ${params.amount} in the account ${params.wipeAccountId} for tokenId ${params.tokenId}`,
			);
		}
		log(
			`Result wipe ${htsResponse.receipt.status}: account ${params.wipeAccountId}, tokenId ${params.tokenId}, amount ${params.amount}`,
			logOpts,
		);

		return htsResponse.receipt.status == Status.Success ? true : false;
	}

	public async cashInHTS(params: IHTSTokenRequest): Promise<boolean> {
		if ('account' in params) {
			this.provider = this.hc.getProvider(
				this.network.hederaNetworkEnviroment as NetworkType,
				this.initData.topic,
				params.account.accountId.id,
			);
			this.hashPackSigner = new HashPackSigner(
				this.hc,
				params.account,
				this.network,
				this.initData.topic,
			);
		} else {
			throw new ProviderError(
				'You must specify an accountId for operate with HashConnect.',
			);
		}

		const transaction: Transaction =
			TransactionProvider.buildTokenMintTransaction(
				params.tokenId,
				params.amount,
			);

		const transactionResponse =
			await this.hashPackSigner.signAndSendTransaction(transaction);
		const htsResponse: HTSResponse =
			await this.transactionResposeHandler.manageResponse(
				transactionResponse as TransactionResponse,
				TransactionType.RECEIPT,
				this.getSigner(),
			);

		if (!htsResponse.receipt) {
			throw new ProviderError(
				`An error has occurred when cash in the amount ${params.amount} in the account ${params.account.accountId.id} for tokenId ${params.tokenId}`,
			);
		}
		log(
			`Result Cash In ${htsResponse.receipt.status}: account ${params.account.accountId.id}, tokenId ${params.tokenId}, amount ${params.amount}`,
			logOpts,
		);

		return htsResponse.receipt.status == Status.Success ? true : false;
	}

	public async cashOutHTS(params: IHTSTokenRequest): Promise<boolean> {
		if ('account' in params) {
			this.provider = this.hc.getProvider(
				this.network.hederaNetworkEnviroment as NetworkType,
				this.initData.topic,
				params.account.accountId.id,
			);
			this.hashPackSigner = new HashPackSigner(
				this.hc,
				params.account,
				this.network,
				this.initData.topic,
			);
		} else {
			throw new ProviderError(
				'You must specify an accountId for operate with HashConnect.',
			);
		}

		const transaction: Transaction =
			TransactionProvider.buildTokenBurnTransaction(
				params.tokenId,
				params.amount,
			);

		const transactionResponse =
			await this.hashPackSigner.signAndSendTransaction(transaction);

		const htsResponse: HTSResponse =
			await this.transactionResposeHandler.manageResponse(
				transactionResponse,
				TransactionType.RECEIPT,
				this.getSigner(),
			);

		if (!htsResponse.receipt) {
			throw new ProviderError(
				`An error has occurred when cash out the amount ${params.amount} in the account ${params.account.accountId} for tokenId ${params.tokenId}`,
			);
		}
		log(
			`Result cash out ${htsResponse.receipt.status}: account ${params.account.accountId}, tokenId ${params.tokenId}, amount ${params.amount}`,
			logOpts,
		);

		return htsResponse.receipt.status == Status.Success ? true : false;
	}

	public async transferHTS(
		params: ITransferTokenRequest,
		isApproval = false,
	): Promise<boolean> {
		if ('account' in params) {
			this.provider = this.hc.getProvider(
				this.network.hederaNetworkEnviroment as NetworkType,
				this.initData.topic,
				params.account.accountId.id,
			);
			this.hashPackSigner = new HashPackSigner(
				this.hc,
				params.account,
				this.network,
				this.initData.topic,
			);
		} else {
			throw new ProviderError(
				'You must specify an accountId for operate with HashConnect.',
			);
		}

		const transaction: Transaction = isApproval
			? TransactionProvider.buildApprovedTransferTransaction(
					params.tokenId,
					params.amount,
					params.outAccountId,
					params.inAccountId,
			  )
			: TransactionProvider.buildTransferTransaction(
					params.tokenId,
					params.amount,
					params.outAccountId,
					params.inAccountId,
			  );

		const transactionResponse =
			await this.hashPackSigner.signAndSendTransaction(transaction);

		const htsResponse: HTSResponse =
			await this.transactionResposeHandler.manageResponse(
				transactionResponse,
				TransactionType.RECEIPT,
				this.getSigner(),
			);

		if (!htsResponse.receipt) {
			throw new ProviderError(
				`An error has occurred when transfer the amount ${params.amount} to the account ${params.inAccountId} for tokenId ${params.tokenId}`,
			);
		}

		return htsResponse.receipt.status == Status.Success ? true : false;
	}
}
