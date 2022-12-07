/* eslint-disable @typescript-eslint/no-explicit-any */
import axios from 'axios';
import IAccount from '../account/types/IAccount';
import { hethers } from '@hashgraph/hethers';
import PrivateKey from '../../../../domain/context/account/PrivateKey.js';
import {
	Client,
	ContractId as HContractId,
	TransactionResponse,
	ContractFunctionParameters,
	PrivateKey as HPrivateKey,
	PublicKey as HPublicKey,
	AccountId as HAccountId,
	TokenId,
	Transaction,
	Status,
} from '@hashgraph/sdk';
import {
	HederaERC20__factory,
	StableCoinFactory__factory
} from 'hedera-stable-coin-contracts/typechain-types/index.js';
import {
	HederaNetwork,
	HederaNetworkEnviroment,
} from '../../../../core/enum.js';
import { IniConfig, IProvider } from '../Provider.js';
import Web3 from 'web3';
import { StableCoin } from '../../../../domain/context/stablecoin/StableCoin.js';
import { getHederaNetwork, PrivateKeyType } from '../../../../core/enum.js';
import { log } from '../../../../core/log.js';
import {
	ICallContractRequest,
	ICallContractWithAccountRequest,
	IHTSTokenRequest,
	IWipeTokenRequest,
	ITransferTokenRequest,
	InitializationData,
} from '../types.js';
import PublicKey from '../../../../domain/context/account/PublicKey.js';
import AccountId from '../../../../domain/context/account/AccountId.js';
import { TransactionProvider } from '../transaction/TransactionProvider.js';
import { HTSSigner } from './HTSSigner.js';
import { HTSResponse, TransactionType } from '../sign/ISigner.js';
import { TransactionResposeHandler } from '../transaction/TransactionResponseHandler.js';
import EOAccount from '../../../../domain/context/account/EOAccount.js';
import { HashConnectConnectionState } from 'hashconnect/types';
import ProviderEvent, { ProviderEventNames } from '../ProviderEvent.js';
import EventService from '../../../../app/service/event/EventService.js';
import { Account, ContractId, TokenSupplyType } from '../../../in/sdk/sdk.js';
import { safeCast } from '../../../../core/cast.js';
import { FactoryStableCoin } from '../../../../domain/context/factory/FactoryStableCoin.js';
import { FactoryKey } from '../../../../domain/context/factory/FactoryKey.js';
import BigDecimal from '../../../../domain/context/stablecoin/BigDecimal.js';
import Long from 'long';
import ProviderError from '../error/HederaError.js';

type DefaultHederaProvider = hethers.providers.DefaultHederaProvider;

const logOpts = { newLine: true, clear: true };
export default class HTSProvider implements IProvider {
	public HTSProvider: DefaultHederaProvider;
	private network: HederaNetwork;
	private web3 = new Web3();
	private htsSigner: HTSSigner;
	private transactionResposeHandler: TransactionResposeHandler =
		new TransactionResposeHandler();

	private client: Client;

	public initData: InitializationData;

	public eventService: EventService;
	public events: ProviderEvent;

	constructor(eventService: EventService) {
		this.eventService = eventService;
	}

	/**
	 * init
	 */
	public init({ network }: IniConfig): Promise<HTSProvider> {
		this.network = network;
		this.HTSProvider = this.getHTSProvider(network);

		// We have to follow an async pattern to match Hashconnect
		return new Promise((r) => {
			this.eventService.emit(ProviderEventNames.providerInitEvent, {
				status: 'connected',
			});
			r(this);
		});
	}

	public async stop(): Promise<boolean> {
		// No need to do anything here but return true, hasconnect does need this function
		return new Promise((res) => {
			res(true);
		});
	}

	public getClient(account: Account): Client {
		let client: Client;
		const hederaNetWork = getHederaNetwork(this.network);

		if (hederaNetWork.consensusNodes) {
			client = Client.forNetwork(hederaNetWork.consensusNodes);
		} else if (
			this.network.hederaNetworkEnviroment !=
			HederaNetworkEnviroment.LOCAL
		) {
			client = Client.forName(this.network.hederaNetworkEnviroment);
		} else {
			throw new ProviderError('Cannot get client: Invalid configuration');
		}

		if (account && account.privateKey) {
			client.setOperator(
				account.accountId.id,
				account.privateKey.toHashgraphKey(),
			);
		} else {
			throw new ProviderError('Cannot get client: No private key');
		}
		return client;
	}

	public encodeFunctionCall(
		functionName: string,
		parameters: string[],
		// eslint-disable-next-line @typescript-eslint/no-explicit-any
		abi: any[],
	): Uint8Array {
		const functionAbi = abi.find(
			(func: { name: string; type: string }) =>
				func.name === functionName && func.type === 'function',
		);
		if (!functionAbi)
			throw new ProviderError(
				`Contract function ${functionName} not found in ABI, are you using the right version?`,
			);
		const encodedParametersHex = this.web3.eth.abi
			.encodeFunctionCall(functionAbi, parameters)
			.slice(2);

		return Buffer.from(encodedParametersHex, 'hex');
	}

	public getPublicKey(
		privateKey?: PrivateKey | string | undefined,
		privateKeyType?: string,
	): HPublicKey {
		let key = null;
		let publicKey = null;
		if (privateKey instanceof PrivateKey) {
			publicKey = privateKey.toHashgraphKey().publicKey;
		} else {
			key = privateKey;
			if (!key) throw new ProviderError('No private key provided');
			switch (privateKeyType) {
				case PrivateKeyType.ECDSA:
					publicKey = HPrivateKey.fromStringECDSA(key).publicKey;
					break;

				default:
					publicKey = HPrivateKey.fromStringED25519(key).publicKey;
			}
		}
		return publicKey;
	}

	public getPublicKeyString(
		privateKey?: PrivateKey | string | undefined,
		privateKeyType?: string,
	): string {
		return this.getPublicKey(privateKey, privateKeyType).toStringRaw();
	}

	public async callContract(
		name: string,
		params: ICallContractRequest | ICallContractWithAccountRequest
	): Promise<Uint8Array> {
		const { contractId, parameters, gas, abi, value } = params;

		let client;

		if ('account' in params) {
			client = this.getClient(params.account);
		} else {
			throw new ProviderError('Account must be supplied');
		}

		const functionCallParameters = this.encodeFunctionCall(
			name,
			parameters,
			abi,
		);

		this.htsSigner = new HTSSigner(client);
		const transaction: Transaction =
			TransactionProvider.buildContractExecuteTransaction(
				contractId,
				functionCallParameters,
				gas,
				value
			);
		const transactionResponse: TransactionResponse =
			await this.htsSigner.signAndSendTransaction(transaction);
		this.logHashScan(transactionResponse, 'Call contract');
		const htsResponse: HTSResponse =
			await this.transactionResposeHandler.manageResponse(
				transactionResponse,
				TransactionType.RECORD,
				client,
				name,
				abi,
			);

		return htsResponse.reponseParam;
	}

	public async accountToEvmAddress(account: Account): Promise<string> {
		if (account.privateKey) {
			return this.getAccountEvmAddressFromPrivateKeyType(
				account.privateKey?.type, 
				account.privateKey.publicKey.key, 
				account.accountId.id);
		} else {
			return await this.getAccountEvmAddress(account.accountId.id);
		}
	}	

	private async getAccountEvmAddress(
		accountId: string,
	): Promise<string> {
		try {
			const URI_BASE = `${getHederaNetwork(this.network)?.mirrorNodeUrl}/api/v1/`;
			const res = await axios.get<IAccount>(
				URI_BASE + 'accounts/' + accountId
			);

			if (res.data.evm_address) {
				return res.data.evm_address;
			} else {
				return this.getAccountEvmAddressFromPrivateKeyType(
					res.data.key._type, 
					res.data.key.key, 
					accountId);
			}
		} catch (error) {
			return Promise.reject<string>(error);
		}
	}	

	private getAccountEvmAddressFromPrivateKeyType(
		privateKeyType: string, 
		publicKey: string,
		accountId: string): string {
			
		switch(privateKeyType) {
			case PrivateKeyType.ECDSA:
				return HPublicKey.fromString(publicKey).toEthereumAddress();

			default:
				return "0x" + HAccountId.fromString(accountId).toSolidityAddress();
		}
	}

	public async deployStableCoin(
		stableCoin: StableCoin,
		account: EOAccount,
		stableCoinFactory: ContractId
	): Promise<StableCoin> {

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
					key.PublicKey = (providedKeyCasted.key == PublicKey.NULL.key)? "0x" : HPublicKey.fromString(providedKeyCasted.key).toBytesRaw();
					key.isED25519 = (providedKeyCasted.type == 'ED25519');
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
			await this.accountToEvmAddress(new Account(stableCoin.autoRenewAccount.toString())),
			(stableCoin.treasury.toString() == '0.0.0') ? 
				"0x0000000000000000000000000000000000000000"
				: await this.accountToEvmAddress(new Account(stableCoin.treasury.toString())),
			keys
		);

		const parameters = [
			stableCoinToCreate
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
	}

	private getHTSProvider(network: HederaNetwork): DefaultHederaProvider {
		const enviroment = network.hederaNetworkEnviroment;
		switch (enviroment) {
			case HederaNetworkEnviroment.MAIN:
			case HederaNetworkEnviroment.PREVIEW:
			case HederaNetworkEnviroment.TEST:
				return hethers.getDefaultProvider(
					getHederaNetwork(network)?.name,
				);
			case HederaNetworkEnviroment.LOCAL:
			default:
				throw new ProviderError('Network not supported');
		}
	}

	/*private async createToken(
		contractId: HContractId,
		name: string,
		symbol: string,
		decimals: number,
		initialSupply: Long,
		maxSupply: Long | undefined,
		memo: string,
		freezeDefault: boolean,
		client: Client,
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
				: new AccountId('0.0.0'),
		};

		this.htsSigner = new HTSSigner(client);
		const transaction: Transaction =
			TransactionProvider.buildTokenCreateTransaction(
				ContractId.fromHederaContractId(contractId),
				values,
				maxSupply,
			);
		const transactionResponse: TransactionResponse =
			await this.htsSigner.signAndSendTransaction(transaction);
		this.logHashScan(transactionResponse, 'Create token');
		const htsResponse: HTSResponse =
			await this.transactionResposeHandler.manageResponse(
				transactionResponse,
				TransactionType.RECEIPT,
				client,
			);

		if (!htsResponse?.receipt?.tokenId) {
			throw new ProviderError(
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
	}*/

	getAvailabilityExtension(): boolean {
		return false;
	}

	gethashConnectConectionState(): HashConnectConnectionState {
		return HashConnectConnectionState.Disconnected;
	}

	disconectHaspack(): void {
		this.eventService.emit(
			ProviderEventNames.providerConnectionStatusChangeEvent,
			HashConnectConnectionState.Disconnected,
		);
	}

	connectWallet(): Promise<HTSProvider> {
		this.eventService.emit(ProviderEventNames.providerPairingEvent);
		return new Promise((r) => r(this));
	}

	getInitData(): InitializationData {
		throw new ProviderError('not haspack');
	}

	public async wipeHTS(params: IWipeTokenRequest): Promise<boolean> {
		let client;

		if ('account' in params) {
			client = this.getClient(params.account);
		} else {
			throw new ProviderError('Account must be supplied');
		}

		this.htsSigner = new HTSSigner(client);
		const transaction: Transaction =
			TransactionProvider.buildTokenWipeTransaction(
				params.wipeAccountId,
				params.tokenId,
				params.amount,
			);
		const transactionResponse: TransactionResponse =
			await this.htsSigner.signAndSendTransaction(transaction);
		this.logHashScan(transactionResponse), 'Wipe';
		const htsResponse: HTSResponse =
			await this.transactionResposeHandler.manageResponse(
				transactionResponse,
				TransactionType.RECEIPT,
				client,
			);

		if (!htsResponse.receipt) {
			throw new ProviderError(
				`An error has occurred when wipe the amount ${params.amount} in the account ${params.wipeAccountId} for tokenId ${params.tokenId}`,
			);
		}
		return htsResponse.receipt.status == Status.Success ? true : false;
	}

	public async cashInHTS(params: IHTSTokenRequest): Promise<boolean> {
		let client;

		if ('account' in params) {
			client = this.getClient(params.account);
		} else {
			throw new ProviderError('Account must be supplied');
		}

		/*const transactionApprove: Transaction = TransactionProvider.approveTokenAllowance();
		const transactionApproveResponse: TransactionResponse = await this.htsSigner.signAndSendTransaction(transactionApprove);
		const htsApproveResponse: HTSResponse = await this.transactionResposeHandler.manageResponse(transactionApproveResponse, TransactionType.RECEIPT, client);
		if (!htsApproveResponse.receipt) {
		 	throw new ProviderError(
		 		`An error has occurred when approving`,
		 	);
		}
		console.log("xxx SE HA HECHO UN APPROVE DE LA CUENTA 0.0.47624288 A LA CUENTA 0.0.48692645 DE 100 TOKENS");*/

		this.htsSigner = new HTSSigner(client);
		const transaction: Transaction =
			TransactionProvider.buildTokenMintTransaction(
				params.tokenId,
				params.amount,
			);
		const transactionResponse: TransactionResponse =
			await this.htsSigner.signAndSendTransaction(transaction);
		this.logHashScan(transactionResponse, 'Cash in');
		const htsResponse: HTSResponse =
			await this.transactionResposeHandler.manageResponse(
				transactionResponse,
				TransactionType.RECEIPT,
				client,
			);

		if (!htsResponse.receipt) {
			throw new ProviderError(
				`An error has occurred when cash in the amount ${params.amount} in the account ${params?.account?.accountId.id} for tokenId ${params.tokenId}`,
			);
		}
		return htsResponse.receipt.status == Status.Success ? true : false;
	}

	public async cashOutHTS(params: IHTSTokenRequest): Promise<boolean> {
		let client;

		if ('account' in params) {
			client = this.getClient(params.account);
		} else {
			throw new ProviderError('Account must be supplied');
		}

		this.htsSigner = new HTSSigner(client);
		const transaction: Transaction =
			TransactionProvider.buildTokenBurnTransaction(
				params.tokenId,
				params.amount,
			);
		const transactionResponse: TransactionResponse =
			await this.htsSigner.signAndSendTransaction(transaction);
		this.logHashScan(transactionResponse, 'Cash out');
		const htsResponse: HTSResponse =
			await this.transactionResposeHandler.manageResponse(
				transactionResponse,
				TransactionType.RECEIPT,
				client,
			);

		if (!htsResponse.receipt) {
			throw new ProviderError(
				`An error has occurred when cash out the amount ${params.amount} in the account ${params?.account?.accountId.id} for tokenId ${params.tokenId}`,
			);
		}
		return htsResponse.receipt.status == Status.Success ? true : false;
	}

	public async transferHTS(params: ITransferTokenRequest): Promise<boolean> {
		let client;

		if ('account' in params) {
			client = this.getClient(params.account);
		} else {
			throw new ProviderError('Account must be supplied');
		}

		this.htsSigner = new HTSSigner(client);
		const transaction: Transaction = params.isApproval
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
		const transactionResponse: TransactionResponse =
			await this.htsSigner.signAndSendTransaction(transaction);
		this.logHashScan(transactionResponse, 'Tranfer');
		const htsResponse: HTSResponse =
			await this.transactionResposeHandler.manageResponse(
				transactionResponse,
				TransactionType.RECEIPT,
				client,
			);

		if (!htsResponse.receipt) {
			throw new ProviderError(
				`An error has occurred when transfer the amount ${params.amount} to the account ${params.inAccountId} for tokenId ${params.tokenId}`,
			);
		}

		return htsResponse.receipt.status == Status.Success ? true : false;
	}

	public logHashScan(
		transactionResponse: TransactionResponse,
		operation?: string,
	): void {
		operation;
		let hs = `You can check the transaction here: https://hashscan.io/#/${
			this.network.hederaNetworkEnviroment
		}/transaction/${transactionResponse.transactionId
			.toString()
			.replace('@', '-')}`;
		const num: number = hs.lastIndexOf('.');

		hs = hs.substring(0, num) + '-' + hs.substring(num + 1, hs.length);
		log(`${hs} \n`, logOpts);
	}
}
