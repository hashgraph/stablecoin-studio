/* eslint-disable @typescript-eslint/no-explicit-any */
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
	HederaERC20Proxy__factory,
	HederaERC20ProxyAdmin__factory
} from 'hedera-stable-coin-contracts/typechain-types/index.js';
import {
	HederaNetwork,
	HederaNetworkEnviroment,
} from '../../../../core/enum.js';
import { IniConfig, IProvider } from '../Provider.js';
import Web3 from 'web3';
import { StableCoin } from '../../../../domain/context/stablecoin/StableCoin.js';
import { getHederaNetwork, PrivateKeyType } from '../../../../core/enum.js';
import {
	ICallContractRequest,
	ICallContractWithAccountRequest,
	IHTSTokenRequest,
	IWipeTokenRequest,
	ITransferTokenRequest,
	InitializationData,
	ICreateTokenResponse,
	IHTSTokenRequestAmount,
	IHTSTokenRequestTargetId
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
import { StableCoinMemo } from '../../../../domain/context/stablecoin/StableCoinMemo.js';
import BigDecimal from '../../../../domain/context/stablecoin/BigDecimal.js';
import Long from 'long';
import ProviderError from '../error/HederaError.js';
import LogService from '../../../../app/service/log/LogService.js';
import { LogOperation } from '../../../../core/decorators/LogOperationDecorator.js';


type DefaultHederaProvider = hethers.providers.DefaultHederaProvider;

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

	@LogOperation
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

	@LogOperation
	public async deployStableCoin(
		stableCoin: StableCoin,
		account: EOAccount,
	): Promise<StableCoin> {
		const client = this.getClient(account);
		LogService.logTrace(
			`Deploying ${HederaERC20__factory.name} contract...`,
		);
		const tokenContract = await this.deployContract(
			HederaERC20__factory,
			account.privateKey,
			client,
		);
		LogService.logTrace(
			`Deploying ${HederaERC20ProxyAdmin__factory.name} contract...`,
		);
		const tokenProxyAdminContract = await this.deployContract(
			HederaERC20ProxyAdmin__factory,
			account.privateKey,
			client,
		);

		// Set Proxy admin owner
		LogService.logTrace(
			`Setting the Proxy admin owner contract... please wait.`
		);
		await this.callContract('transferOwnership', {
			contractId: String(tokenProxyAdminContract),
			parameters: [HAccountId.fromString(account.accountId.id).toSolidityAddress()],
			gas: 250_000,
			abi: HederaERC20ProxyAdmin__factory.abi,
			account,
		});
		LogService.logTrace(
			`Deploying ${HederaERC20Proxy__factory.name} contract...`,
		);
		const proxyContract = await this.deployContract(
			HederaERC20Proxy__factory,
			account.privateKey,
			client,
			new ContractFunctionParameters()
				.addAddress(tokenContract?.toSolidityAddress())
				.addAddress(tokenProxyAdminContract?.toSolidityAddress())
				.addBytes(new Uint8Array([])),
		);

		// Creating the token
		LogService.logTrace('Creating token... please wait.');

		stableCoin.memo = new StableCoinMemo(
			String(proxyContract)
		);

		LogService.logTrace('Creating token...');
		const hederaToken = await this.createToken(
			proxyContract,
			stableCoin.name,
			stableCoin.symbol,
			stableCoin.decimals,
			stableCoin.initialSupply?.toLong(),
			stableCoin.maxSupply?.toLong(),
			stableCoin.memo.toJson(),
			stableCoin.freezeDefault,
			client,
			stableCoin.treasury,
			safeCast<PublicKey>(stableCoin.adminKey),
			safeCast<PublicKey>(stableCoin.freezeKey),
			safeCast<PublicKey>(stableCoin.kycKey),
			safeCast<PublicKey>(stableCoin.wipeKey),
			safeCast<PublicKey>(stableCoin.pauseKey),
			safeCast<PublicKey>(stableCoin.supplyKey),
			stableCoin.autoRenewAccount,
		);

		// Initialize Proxy
		LogService.logTrace('Initializing the Proxy... please wait.');
		await this.callContract('initialize', {
			contractId: String(proxyContract),
			parameters: [hederaToken.tokenId.toSolidityAddress(), HAccountId.fromString(account.accountId.id).toSolidityAddress()],
			gas: 15000000,
			abi: HederaERC20__factory.abi,
			account,
		});

		if (
			hederaToken.treasuryAccountId.toString() !== account.accountId.id &&
			account.evmAddress
		) {
			LogService.logTrace(
				'Associating administrator account to token...',
			);

			await this.callContract('associateToken', {
				contractId: stableCoin.memo.proxyContract,
				parameters: [account.evmAddress],
				gas: 1_300_000,
				abi: HederaERC20__factory.abi,
				account: account,
			});
		}

		return new StableCoin({
			name: hederaToken.name,
			symbol: hederaToken.symbol,
			decimals: hederaToken.decimals,
			initialSupply: BigDecimal.fromString(
				hederaToken.initialSupply.toString(),
				hederaToken.decimals,
			),
			maxSupply: BigDecimal.fromString(
				hederaToken.maxSupply.toString(),
				hederaToken.decimals,
			),
			memo: hederaToken.memo,
			freezeDefault: hederaToken.freezeDefault,
			treasury: new AccountId(hederaToken.treasuryAccountId.toString()),
			adminKey:
				hederaToken.adminKey &&
				hederaToken.adminKey instanceof HPublicKey
					? PublicKey.fromHederaKey(hederaToken.adminKey)
					: hederaToken.adminKey,
			freezeKey:
				hederaToken.freezeKey &&
				hederaToken.freezeKey instanceof HPublicKey
					? PublicKey.fromHederaKey(hederaToken.freezeKey)
					: hederaToken.freezeKey,
			kycKey:
				hederaToken.kycKey && hederaToken.kycKey instanceof HPublicKey
					? PublicKey.fromHederaKey(hederaToken.kycKey)
					: hederaToken.kycKey,
			wipeKey:
				hederaToken.wipeKey && hederaToken.wipeKey instanceof HPublicKey
					? PublicKey.fromHederaKey(hederaToken.wipeKey)
					: hederaToken.wipeKey,
			pauseKey:
				hederaToken.pauseKey &&
				hederaToken.pauseKey instanceof HPublicKey
					? PublicKey.fromHederaKey(hederaToken.pauseKey)
					: hederaToken.pauseKey,
			supplyKey:
				hederaToken.supplyKey &&
				hederaToken.supplyKey instanceof HPublicKey
					? PublicKey.fromHederaKey(hederaToken.supplyKey)
					: hederaToken.supplyKey,
			id: hederaToken.tokenId.toString(),
			tokenType: stableCoin.tokenType,
			supplyType: stableCoin.supplyType,
		});
	}

	private async deployContract(
		factory: any,
		privateKey: PrivateKey,
		client: Client,
		params?: any,
	): Promise<HContractId> {
		try {
			this.htsSigner = new HTSSigner(client);
			const transaction =
				TransactionProvider.buildContractCreateFlowTransaction(
					factory,
					params,
					220_000,
					privateKey.publicKey.toHederaKey(),
				);
			const transactionResponse: TransactionResponse =
				await this.htsSigner.signAndSendTransaction(transaction);
			this.logHashScan(transactionResponse, 'Deploy contract');
			const htsResponse: HTSResponse =
				await this.transactionResposeHandler.manageResponse(
					transactionResponse,
					TransactionType.RECEIPT,
					client,
				);

			if (!htsResponse?.receipt?.contractId) {
				throw new ProviderError(
					`An error ocurred during deployment of ${factory.name}`,
				);
			} else {
				return htsResponse.receipt.contractId;
			}
		} catch (error) {
			throw new ProviderError(
				`An error ocurred during deployment of ${factory.name} : ${error}`,
			);
		}
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

	@LogOperation
	private async createToken(
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
		LogService.logTrace(
			`Token ${name} created tokenId ${
				values.tokenId
			} - tokenAddress ${values.tokenId?.toSolidityAddress()}`,
		);
		return values;
	}

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

	@LogOperation
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

	@LogOperation
	public async cashInHTS(params: IHTSTokenRequestAmount): Promise<boolean> {
		let client;
		if ('account' in params) {
			client = this.getClient(params.account);
		} else {
			throw new ProviderError('Account must be supplied');
		}

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

	@LogOperation
	public async cashOutHTS(params: IHTSTokenRequestAmount): Promise<boolean> {
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

	@LogOperation
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

	@LogOperation
	public async deleteHTS(params: IHTSTokenRequest): Promise<boolean> {
		let client;

		if ('account' in params) {
			client = this.getClient(params.account);
		} else {
			throw new ProviderError('Account must be supplied');
		}

		this.htsSigner = new HTSSigner(client);
		const transaction: Transaction =
			TransactionProvider.buildDeleteTransaction(params.tokenId);
		const transactionResponse: TransactionResponse =
			await this.htsSigner.signAndSendTransaction(transaction);
		this.logHashScan(transactionResponse, 'Delete');
		const htsResponse: HTSResponse =
			await this.transactionResposeHandler.manageResponse(
				transactionResponse,
				TransactionType.RECEIPT,
				client,
			);

		if (!htsResponse.receipt) {
			throw new ProviderError(
				`An error has occurred when delete with the account ${params?.account?.accountId.id} for tokenId ${params.tokenId}`,
			);
		}
		return htsResponse.receipt.status == Status.Success ? true : false;
	}

	@LogOperation
	public async pauseHTS(params: IHTSTokenRequest): Promise<boolean> {
		let client;

		if ('account' in params) {
			client = this.getClient(params.account);
		} else {
			throw new ProviderError('Account must be supplied');
		}

		this.htsSigner = new HTSSigner(client);
		const transaction: Transaction =
			TransactionProvider.buildPausedTransaction(params.tokenId);
		const transactionResponse: TransactionResponse =
			await this.htsSigner.signAndSendTransaction(transaction);
		this.logHashScan(transactionResponse, 'Pause');
		const htsResponse: HTSResponse =
			await this.transactionResposeHandler.manageResponse(
				transactionResponse,
				TransactionType.RECEIPT,
				client,
			);

		if (!htsResponse.receipt) {
			throw new ProviderError(
				`An error has occurred when paused with the account ${params?.account?.accountId.id} for tokenId ${params.tokenId}`,
			);
		}
		return htsResponse.receipt.status == Status.Success ? true : false;
	}

	@LogOperation
	public async unpauseHTS(params: IHTSTokenRequest): Promise<boolean> {
		let client;

		if ('account' in params) {
			client = this.getClient(params.account);
		} else {
			throw new ProviderError('Account must be supplied');
		}

		this.htsSigner = new HTSSigner(client);
		const transaction: Transaction =
			TransactionProvider.buildUnpausedTransaction(params.tokenId);
		const transactionResponse: TransactionResponse =
			await this.htsSigner.signAndSendTransaction(transaction);
		this.logHashScan(transactionResponse, 'Unpause');
		const htsResponse: HTSResponse =
			await this.transactionResposeHandler.manageResponse(
				transactionResponse,
				TransactionType.RECEIPT,
				client,
			);

		if (!htsResponse.receipt) {
			throw new ProviderError(
				`An error has occurred when unpaused with the account ${params?.account?.accountId.id} for tokenId ${params.tokenId}`,
			);
		}
		return htsResponse.receipt.status == Status.Success ? true : false;
	}

	@LogOperation
	public async freezeHTS(params: IHTSTokenRequestTargetId): Promise<boolean> {
		let client;

		if ('account' in params) {
			client = this.getClient(params.account);
		} else {
			throw new ProviderError('Account must be supplied');
		}

		this.htsSigner = new HTSSigner(client);
		const transaction: Transaction =
			TransactionProvider.buildFreezeTransaction(
				params.tokenId,
				params.targetId,
			);
		const transactionResponse: TransactionResponse =
			await this.htsSigner.signAndSendTransaction(transaction);
		this.logHashScan(transactionResponse, 'Freeze');
		const htsResponse: HTSResponse =
			await this.transactionResposeHandler.manageResponse(
				transactionResponse,
				TransactionType.RECEIPT,
				client,
			);

		if (!htsResponse.receipt) {
			throw new ProviderError(
				`An error has occurred when freeze the account ${params.targetId} with the account ${params?.account?.accountId.id} for tokenId ${params.tokenId}`,
			);
		}
		return htsResponse.receipt.status == Status.Success ? true : false;
	}

	@LogOperation
	public async unfreezeHTS(
		params: IHTSTokenRequestTargetId,
	): Promise<boolean> {
		let client;

		if ('account' in params) {
			client = this.getClient(params.account);
		} else {
			throw new ProviderError('Account must be supplied');
		}

		this.htsSigner = new HTSSigner(client);
		const transaction: Transaction =
			TransactionProvider.buildUnfreezeTransaction(
				params.tokenId,
				params.targetId,
			);
		const transactionResponse: TransactionResponse =
			await this.htsSigner.signAndSendTransaction(transaction);
		this.logHashScan(transactionResponse, 'Unfreeze');
		const htsResponse: HTSResponse =
			await this.transactionResposeHandler.manageResponse(
				transactionResponse,
				TransactionType.RECEIPT,
				client,
			);

		if (!htsResponse.receipt) {
			throw new ProviderError(
				`An error has occurred when unfreeze the account ${params.targetId} with the account ${params?.account?.accountId.id} for tokenId ${params.tokenId}`,
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
		LogService.logInfo(`${hs} \n`);
	}
}
