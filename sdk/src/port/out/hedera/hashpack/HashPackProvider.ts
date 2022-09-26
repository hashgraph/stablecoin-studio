import {
	HashConnect,
	HashConnectTypes,
	MessageTypes,
} from 'hashconnect/dist/cjs/main';
import { IniConfig, IProvider } from '../Provider.js';
import {
	HederaNetwork,
	getHederaNetwork,
	AppMetadata,
	PublicKey,
	PrivateKey,
	AccountId,
	ContractId,
} from '../../../in/sdk/sdk.js';
import {
	AccountId as HAccountId,
	TransactionResponse,
	ContractFunctionParameters,
	ContractId as HContractId,
	DelegateContractId,
	PublicKey as HPublicKey,
	PrivateKey as HPrivateKey,
	TokenId,
	Transaction,
	Signer,
} from '@hashgraph/sdk';
import { StableCoin } from '../../../../domain/context/stablecoin/StableCoin.js';
import {
	ICallContractRequest,
	ICallContractWithAccountRequest,
	ICreateTokenResponse,
	InitializationData,
} from '../types.js';
import { HashConnectConnectionState } from 'hashconnect/dist/cjs/types/hashconnect.js';
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
import { HashConnectProvider } from 'hashconnect/dist/cjs/provider/provider.js';
import { HashConnectSigner } from 'hashconnect/dist/cjs/provider/signer';
import Long from 'long';
import ProviderEvent, { ProviderEventNames } from '../ProviderEvent.js';
import EventService from '../../../../app/service/event/EventService.js';

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
		console.log(this.hc);

		this.setUpHashConnectEvents();
		console.log(this.hc);
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
		this.hc.pairingEvent.on((data) => {
			this.pairingData = data.pairingData!;
			console.log('Paired with wallet', data);
			this.eventService.emit(
				ProviderEventNames.providerPairingEvent,
				this.pairingData,
			);
			// this.pairingData = data.pairingData!;
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

		this.hc.acknowledgeMessageEvent.on((state) => {
			console.log('acknowledgeMessageEvent event', state);
			this.eventService.emit(
				ProviderEventNames.providerAcknowledgeMessageEvent,
				state,
			);
		});
	}

	public async callContract(
		name: string,
		params: ICallContractRequest | ICallContractWithAccountRequest,
	): Promise<Uint8Array> {
		const { contractId, parameters, gas, abi } = params;
		if ('account' in params) {
			this.provider = this.hc.getProvider(
				this.network.hederaNetworkEnviroment,
				this.initData.topic,
				params.account.accountId,
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

		this.hashPackSigner = new HashPackSigner();
		const transaction: Transaction =
			TransactionProvider.buildContractExecuteTransaction(
				contractId,
				functionCallParameters,
				gas,
			);

		const transactionResponse: TransactionResponse =
			await this.hashPackSigner.signAndSendTransaction(
				transaction,
				this.hc.getSigner(this.provider),
			);
		const htsResponse: HTSResponse =
			await this.transactionResposeHandler.manageResponse(
				transactionResponse,
				TransactionType.RECORD,
				this.hc.getSigner(this.provider),
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

	public async deployStableCoin(
		accountId: string,
		privateKey: string,
		stableCoin: StableCoin,
	): Promise<StableCoin> {
		const plainAccount = {
			accountId,
			privateKey,
		};

		if (accountId) {
			this.provider = this.hc.getProvider(
				this.network.hederaNetworkEnviroment,
				this.initData.topic,
				accountId,
			);
		} else {
			throw new Error(
				'You must specify an accountId for operate with HashConnect.',
			);
		}

		const tokenContract = await this.deployContract(
			HederaERC20__factory,
			plainAccount.privateKey,
			this.hc.getSigner(this.provider),
		);
		log(
			`Deploying ${HederaERC1967Proxy__factory.name} contract... please wait.`,
			logOpts,
		);
		let proxyContract: HContractId =
			HContractId.fromString(stableCoin.memo) ?? '';

		if (!proxyContract) {
			proxyContract = await this.deployContract(
				HederaERC1967Proxy__factory,
				plainAccount.privateKey,
				this.hc.getSigner(this.provider),
				new ContractFunctionParameters()
					.addAddress(tokenContract?.toSolidityAddress())
					.addBytes(new Uint8Array([])),
			);
			stableCoin.memo = String(proxyContract);
		}

		await this.callContract('initialize', {
			contractId: stableCoin.memo,
			parameters: [],
			gas: 250_000,
			abi: HederaERC20__factory.abi,
			account: plainAccount,
		});
		log(
			`Deploying ${HTSTokenOwner__factory.name} contract... please wait.`,
			logOpts,
		);
		const tokenOwnerContract = await this.deployContract(
			HTSTokenOwner__factory,
			plainAccount.privateKey,
			this.hc.getSigner(this.provider),
		);
		log('Creating token... please wait.', logOpts);
		const hederaToken = await this.createToken(
			tokenOwnerContract,
			stableCoin.name,
			stableCoin.symbol,
			stableCoin.decimals,
			stableCoin.initialSupply,
			stableCoin.maxSupply,
			String(proxyContract),
			stableCoin.freezeDefault,
			plainAccount.privateKey,
			this.getPublicKeyString(privateKey),
			this.hc.getSigner(this.provider),
		);
		log('Setting up contract... please wait.', logOpts);
		await this.callContract('setTokenAddress', {
			contractId: stableCoin.memo,
			parameters: [
				tokenOwnerContract.toSolidityAddress(),
				TokenId.fromString(
					hederaToken.tokenId.toString(),
				).toSolidityAddress(),
			],
			gas: 80_000,
			abi: HederaERC20__factory.abi,
			account: plainAccount,
		});
		await this.callContract('setERC20Address', {
			contractId: String(tokenOwnerContract),
			parameters: [proxyContract.toSolidityAddress()],
			gas: 60_000,
			abi: HTSTokenOwner__factory.abi,
			account: plainAccount,
		});
		log(
			'Associating administrator account to token... please wait.',
			logOpts,
		);
		await this.callContract('associateToken', {
			contractId: stableCoin.memo,
			parameters: [HAccountId.fromString(accountId).toSolidityAddress()],
			gas: 1_300_000,
			abi: HederaERC20__factory.abi,
			account: plainAccount,
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
		privateKey: string,
		signer: HashConnectSigner,
		params?: any,
	): Promise<HContractId> {
		try {
			this.hashPackSigner = new HashPackSigner();
			const transaction =
				TransactionProvider.buildContractCreateFlowTransaction(
					factory,
					privateKey,
					params,
					90_000,
				);
			const transactionResponse: TransactionResponse =
				await this.hashPackSigner.signAndSendTransaction(
					transaction,
					signer,
				);
			const htsResponse: HTSResponse =
				await this.transactionResposeHandler.manageResponse(
					transactionResponse,
					TransactionType.RECEIPT,
					signer,
				);

			if (!htsResponse.receipt.contractId) {
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
		privateKey: string,
		publicKey: string,
		signer: HashConnectSigner,
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

		this.hashPackSigner = new HashPackSigner();
		const transaction: Transaction =
			TransactionProvider.buildTokenCreateTransaction(
				ContractId.fromHederaContractId(contractId),
				values,
				maxSupply,
			);
		const transactionResponse: TransactionResponse =
			await this.hashPackSigner.signAndSendTransaction(
				transaction,
				signer,
			);
		const htsResponse: HTSResponse =
			await this.transactionResposeHandler.manageResponse(
				transactionResponse,
				TransactionType.RECEIPT,
				signer,
			);

		if (!htsResponse.receipt.tokenId) {
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

	private fromPublicKey(key: HPublicKey): PublicKey {
		return new PublicKey({
			key: key._key.toStringRaw(),
			type: key._key._type,
		});
	}

	public getPublicKeyString(
		privateKey?: PrivateKey | string | undefined,
	): string {
		let key = null;
		if (privateKey instanceof PrivateKey) {
			key = privateKey.key;
		} else {
			key = privateKey;
		}
		if (!key) throw new HederaError('No private key provided');
		const publicKey = HPrivateKey.fromString(key).publicKey.toStringRaw();
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

	registerEvents(): void {
		const foundExtensionEventHandler = (
			data: HashConnectTypes.WalletMetadata,
		) => {
			console.log('====foundExtensionEvent====');
			console.log(JSON.stringify(data));
		};

		const pairingEventHandler = (data: MessageTypes.ApprovePairing) => {
			console.log('====pairingEvent:::Wallet connected=====');
			console.log(JSON.stringify(data));
		};

		const acknowledgeEventHandler = (data: MessageTypes.Acknowledge) => {
			console.log('====Acknowledge:::Wallet request received =====');
			console.log(JSON.stringify(data));
		};

		const transactionEventHandler = (data: MessageTypes.Transaction) => {
			console.log('====Transaction:::Transaction executed =====');
			console.log(JSON.stringify(data));
		};

		const additionalAccountRequestEventHandler = (
			data: MessageTypes.AdditionalAccountRequest,
		) => {
			console.log(
				'====AdditionalAccountRequest:::AdditionalAccountRequest=====',
			);
			console.log(JSON.stringify(data));
		};

		const connectionStatusChangeEventHandler = (
			data: HashConnectConnectionState,
		) => {
			console.log(
				'====AdditionalAccountRequest:::AdditionalAccountRequest=====',
			);
			console.log(JSON.stringify(data));
		};
		const authRequestEventHandler = (
			data: MessageTypes.AuthenticationRequest,
		) => {
			console.log(
				'====AdditionalAccountRequest:::AdditionalAccountRequest=====',
			);
			console.log(JSON.stringify(data));
		};

		/*const signRequestEventHandler = (data: ) => {
			console.log("====AdditionalAccountRequest:::AdditionalAccountRequest=====");
			console.log(JSON.stringify(data));
		}*/
	}

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
}
