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
import HederaError from '../error/HederaError.js';
import Web3 from 'web3';
import { log } from '../../../../core/log.js';
import {
	HederaERC1967Proxy__factory,
	HederaERC20__factory,
	HTSTokenOwner__factory,
} from 'hedera-stable-coin-contracts/typechain-types/index.js';
import { HashConnectProvider } from 'hashconnect/provider/provider';
import Long from 'long';
import ProviderEvent, { ProviderEventNames } from '../ProviderEvent.js';
import EventService from '../../../../app/service/event/EventService.js';
import { HashConnect } from 'hashconnect';
import { HashConnectTypes } from 'hashconnect';
import { HashConnectConnectionState } from 'hashconnect/types';
import HashPackAccount from '../../../../domain/context/account/HashPackAccount.js';

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
			throw new Error('No app metadata');
		}
		return this;
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
			this.pairingData = data.pairingData!;
			console.log('Paired with wallet', data);
			this.eventService.emit(
				ProviderEventNames.providerPairingEvent,
				this.pairingData,
			);
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
			throw new Error(
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
			throw new HederaError(
				'Contract function not found in ABI, are you using the right version?',
			);
		const encodedParametersHex = this.web3.eth.abi
			.encodeFunctionCall(functionAbi, parameters)
			.slice(2);

		return Buffer.from(encodedParametersHex, 'hex');
	}

	public async accountToEvmAddress(account: Account): Promise<string> {
		return '';
	}	


	public async deployStableCoin(
		stableCoin: StableCoin,
		account: HashPackAccount,
	): Promise<StableCoin> {
		if (account) {
			this.provider = this.hc.getProvider(
				this.network.hederaNetworkEnviroment,
				this.initData.topic,
				account.accountId.id,
			);
		} else {
			throw new Error(
				'You must specify an accountId for operate with HashConnect.',
			);
		}

		const tokenContract = await this.deployContract(
			HederaERC20__factory,
			account,
		);
		log(
			`Deploying ${HederaERC1967Proxy__factory.name} contract... please wait.`,
			logOpts,
		);
		let proxyContract: HContractId = HContractId.fromString(
			stableCoin.memo.proxyContract,
		);

		if (!proxyContract) {
			proxyContract = await this.deployContract(
				HederaERC1967Proxy__factory,
				account,
				new ContractFunctionParameters()
					.addAddress(tokenContract?.toSolidityAddress())
					.addBytes(new Uint8Array([])),
			);
			stableCoin.memo.proxyContract = String(proxyContract);
		}

		const contractId = stableCoin.memo.proxyContract;

		await this.callContract('initialize', {
			contractId,
			parameters: [],
			gas: 250_000,
			abi: HederaERC20__factory.abi,
			account: account,
		});
		log(
			`Deploying ${HTSTokenOwner__factory.name} contract... please wait.`,
			logOpts,
		);
		const tokenOwnerContract = await this.deployContract(
			HTSTokenOwner__factory,
			account,
		);

		stableCoin.memo = new StableCoinMemo(
			String(proxyContract),
			String(tokenOwnerContract),
		);
		log('Creating token... please wait.', logOpts);
		const hederaToken = await this.createToken(
			tokenOwnerContract,
			stableCoin.name,
			stableCoin.symbol,
			stableCoin.decimals,
			stableCoin.initialSupply,
			stableCoin.maxSupply,
			stableCoin.memo.toJson(),
			stableCoin.freezeDefault,
			account,
		);
		log('Setting up contract... please wait.', logOpts);
		await this.callContract('setTokenAddress', {
			contractId,
			parameters: [
				tokenOwnerContract.toSolidityAddress(),
				TokenId.fromString(
					hederaToken.tokenId.toString(),
				).toSolidityAddress(),
			],
			gas: 80_000,
			abi: HederaERC20__factory.abi,
			account,
		});
		await this.callContract('setERC20Address', {
			contractId,
			parameters: [proxyContract.toSolidityAddress()],
			gas: 60_000,
			abi: HTSTokenOwner__factory.abi,
			account,
		});
		log(
			'Associating administrator account to token... please wait.',
			logOpts,
		);
		await this.callContract('associateToken', {
			contractId,
			parameters: [
				HAccountId.fromString(account.accountId.id).toSolidityAddress(),
			],
			gas: 1_300_000,
			abi: HederaERC20__factory.abi,
			account,
		});

		return new StableCoin({
			name: hederaToken.name,
			symbol: hederaToken.symbol,
			decimals: hederaToken.decimals,
			initialSupply: BigInt(hederaToken.initialSupply.toNumber()),
			maxSupply: BigInt(hederaToken.maxSupply.toNumber()),
			memo: hederaToken.memo,
			freezeDefault: hederaToken.freezeDefault,
			treasury: new AccountId(hederaToken.treasuryAccountId.toString()),
			adminKey: hederaToken.adminKey,
			freezeKey: hederaToken.freezeKey,
			wipeKey: hederaToken.wipeKey,
			pauseKey: hederaToken.pauseKey,
			kycKey: hederaToken.kycKey,
			supplyKey: hederaToken.supplyKey,
			id: hederaToken.tokenId.toString(),
			tokenType: stableCoin.tokenType,
			supplyType: stableCoin.supplyType,
		});
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
			const transaction =
				TransactionProvider.buildContractCreateFlowTransaction(
					factory,
					params,
					90_000,
				);
			const transactionResponse =
				await this.hashPackSigner.signAndSendTransaction(transaction);
			const htsResponse: HTSResponse =
				await this.transactionResposeHandler.manageResponse(
					transactionResponse,
					TransactionType.RECEIPT,
					this.getSigner(),
				);

			if (!htsResponse?.receipt?.contractId) {
				throw new Error(
					`An error ocurred during deployment of ${factory.name}`,
				);
			} else {
				return htsResponse.receipt.contractId;
			}
		} catch (error) {
			throw new Error(
				`An error ocurred during deployment of ${factory.name} : ${error}`,
			);
		}
	}

	private async createToken(
		contractId: HContractId,
		name: string,
		symbol: string,
		decimals: number,
		initialSupply: bigint,
		maxSupply: bigint | undefined,
		memo: string,
		freezeDefault: boolean,
		account: HashPackAccount,
		adminKey?: PublicKey,
		freezeKey?: PublicKey,
		kycKey?: PublicKey,
		wipeKey?: PublicKey,
		pauseKey?: PublicKey,
		supplyKey?: PublicKey,
	): Promise<ICreateTokenResponse> {
		const values: ICreateTokenResponse = {
			name,
			symbol,
			decimals,
			initialSupply: Long.fromString(initialSupply.toString()),
			maxSupply: maxSupply
				? Long.fromString(maxSupply.toString())
				: Long.ZERO,
			memo,
			freezeDefault,
			treasuryAccountId: new AccountId(String(contractId)),
			tokenId: TokenId.fromString('0.0.0'),
			adminKey,
			freezeKey,
			kycKey,
			wipeKey,
			pauseKey,
			supplyKey,
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
			throw new Error(
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
			if (!key) throw new HederaError('No private key provided');
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

	// registerEvents(): void {
	// 	const foundExtensionEventHandler = (
	// 		data: HashConnectTypes.WalletMetadata,
	// 	) => {
	// 		console.log('====foundExtensionEvent====');
	// 		console.log(JSON.stringify(data));
	// 	};

	// 	const pairingEventHandler = (data: MessageTypes.ApprovePairing) => {
	// 		console.log('====pairingEvent:::Wallet connected=====');
	// 		console.log(JSON.stringify(data));
	// 	};

	// 	const acknowledgeEventHandler = (data: MessageTypes.Acknowledge) => {
	// 		console.log('====Acknowledge:::Wallet request received =====');
	// 		console.log(JSON.stringify(data));
	// 	};

	// 	const transactionEventHandler = (data: MessageTypes.Transaction) => {
	// 		console.log('====Transaction:::Transaction executed =====');
	// 		console.log(JSON.stringify(data));
	// 	};

	// 	const additionalAccountRequestEventHandler = (
	// 		data: MessageTypes.AdditionalAccountRequest,
	// 	) => {
	// 		console.log(
	// 			'====AdditionalAccountRequest:::AdditionalAccountRequest=====',
	// 		);
	// 		console.log(JSON.stringify(data));
	// 	};

	// 	const connectionStatusChangeEventHandler = (
	// 		data: HashConnectConnectionState,
	// 	) => {
	// 		console.log(
	// 			'====AdditionalAccountRequest:::AdditionalAccountRequest=====',
	// 		);
	// 		console.log(JSON.stringify(data));
	// 	};
	// 	const authRequestEventHandler = (
	// 		data: MessageTypes.AuthenticationRequest,
	// 	) => {
	// 		console.log(
	// 			'====AdditionalAccountRequest:::AdditionalAccountRequest=====',
	// 		);
	// 		console.log(JSON.stringify(data));
	// 	};

	// 	/*const signRequestEventHandler = (data: ) => {
	// 		console.log("====AdditionalAccountRequest:::AdditionalAccountRequest=====");
	// 		console.log(JSON.stringify(data));
	// 	}*/
	// }

	getBalance(): Promise<number> {
		throw new Error('Method not implemented.');
	}

	getAvailabilityExtension(): boolean {
		return this.availableExtension;
	}

	gethashConnectConectionState(): HashConnectConnectionState {
		return this.hashConnectConectionState;
	}

	disconectHaspack(): void {
		if (this.pairingData?.topic) this.hc.disconnect(this.pairingData.topic);
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
				this.network.hederaNetworkEnviroment,
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
			throw new Error(
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
			throw new Error(
				`An error has occurred when wipe the amount ${params.amount} in the account ${params.wipeAccountId} for tokenId ${params.tokenId}`,
			);
		}
		log(
			`Result wipe HTS ${htsResponse.receipt.status}: account ${params.wipeAccountId}, tokenId ${params.tokenId}, amount ${params.amount}`,
			logOpts,
		);

		return htsResponse.receipt.status == Status.Success ? true : false;
	}

	public async cashInHTS(params: IHTSTokenRequest): Promise<boolean> {
		if ('account' in params) {
			this.provider = this.hc.getProvider(
				this.network.hederaNetworkEnviroment,
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
			throw new Error(
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
				transactionResponse,
				TransactionType.RECEIPT,
				this.getSigner(),
			);

		if (!htsResponse.receipt) {
			throw new Error(
				`An error has occurred when cash in the amount ${params.amount} in the account ${params.account.accountId.id} for tokenId ${params.tokenId}`,
			);
		}
		log(
			`Result cash in HTS ${htsResponse.receipt.status}: account ${params.account.accountId.id}, tokenId ${params.tokenId}, amount ${params.amount}`,
			logOpts,
		);

		return htsResponse.receipt.status == Status.Success ? true : false;
	}

	public async cashOutHTS(params: IHTSTokenRequest): Promise<boolean> {
		if ('account' in params) {
			this.provider = this.hc.getProvider(
				this.network.hederaNetworkEnviroment,
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
			throw new Error(
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
			throw new Error(
				`An error has occurred when cash out the amount ${params.amount} in the account ${params.account.accountId} for tokenId ${params.tokenId}`,
			);
		}
		log(
			`Result cash out HTS ${htsResponse.receipt.status}: account ${params.account.accountId}, tokenId ${params.tokenId}, amount ${params.amount}`,
			logOpts,
		);

		return htsResponse.receipt.status == Status.Success ? true : false;
	}

	public async transferHTS(params: ITransferTokenRequest): Promise<boolean> {
		if ('account' in params) {
			this.provider = this.hc.getProvider(
				this.network.hederaNetworkEnviroment,
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
			throw new Error(
				'You must specify an accountId for operate with HashConnect.',
			);
		}

		const transaction: Transaction =
			TransactionProvider.buildTransferTransaction(
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
			throw new Error(
				`An error has occurred when transfer the amount ${params.amount} to the account ${params.inAccountId} for tokenId ${params.tokenId}`,
			);
		}

		return htsResponse.receipt.status == Status.Success ? true : false;
	}
}
