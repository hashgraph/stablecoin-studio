/* eslint-disable @typescript-eslint/no-explicit-any */
import { hethers } from '@hashgraph/hethers';
import PrivateKey from '../../../../domain/context/account/PrivateKey.js';
import {
	AccountId as HAccountId,
	Client,
	ContractCreateTransaction,
	ContractExecuteTransaction,
	ContractFunctionParameters,
	ContractId,
	DelegateContractId,
	FileAppendTransaction,
	FileCreateTransaction,
	FileId,
	Hbar,
	PrivateKey as HPrivateKey,
	PublicKey as HPublicKey,
	TokenCreateTransaction,
	TokenId,
	TokenSupplyType,
	Transaction
} from '@hashgraph/sdk';
import {
	HederaERC1967Proxy__factory,
	HederaERC20__factory,
	HTSTokenOwner__factory,
} from 'hedera-stable-coin-contracts/typechain-types/index.js';
import {
	HederaNetwork,
	HederaNetworkEnviroment,
} from '../../../../core/enum.js';
import { IniConfig, IProvider } from '../Provider.js';
import Web3 from 'web3';
import { StableCoin } from '../../../../domain/context/stablecoin/StableCoin.js';
import { getHederaNetwork } from '../../../../core/enum.js';
import Long from 'long';
import { log } from '../../../../core/log.js';
import {
	ICallContractRequest,
	ICallContractWithAccountRequest,
	ICreateTokenResponse,
} from '../types.js';
import HederaError from '../error/HederaError.js';
import PublicKey from '../../../../domain/context/account/PublicKey.js';
import AccountId from '../../../../domain/context/account/AccountId.js';
import { json } from 'stream/consumers';
import { TransactionProvider } from '../transaction/TransactionProvider.js';
import { HTSSign } from './HTSSign.js';
import { HTSResponse, TransactionResponse, TransactionType } from '../sign/ISigner.js';
import { TransactionResposeHandler } from '../TransactionResponseHandler.js';

type DefaultHederaProvider = hethers.providers.DefaultHederaProvider;

const logOpts = { newLine: true, clear: true };
export default class HTSProvider implements IProvider {
	public HTSProvider: DefaultHederaProvider;
	private network: HederaNetwork;
	private web3 = new Web3();
	private transactionProvider: TransactionProvider;
	private htsSign: HTSSign;

	/**
	 * init
	 */
	public init({ network }: IniConfig): Promise<HTSProvider> {
		this.network = network;
		this.HTSProvider = this.getHTSProvider(network);
		// We have to follow an async pattern to match Hashconnect
		return new Promise((r) => {
			r(this);
		});
	}

	public async stop(): Promise<boolean> {
		// No need to do anything here but return true, hasconnect does need this function
		return new Promise((res) => {
			res(true);
		});
	}

	public getClient(accountId?: string, privateKey?: string): Client {
		let client: any;
		const hederaNetWork = getHederaNetwork(this.network);

		if (hederaNetWork.consensusNodes) {
			client = Client.forNetwork(hederaNetWork.consensusNodes);
		} else if (
			this.network.hederaNetworkEnviroment !=
			HederaNetworkEnviroment.LOCAL
		) {
			client = Client.forName(this.network.hederaNetworkEnviroment);
		}

		if (accountId && privateKey) {
			client.setOperator(accountId, privateKey);
		}
		return client;
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

	public decodeFunctionResult(
		functionName: string,
		resultAsBytes: ArrayBuffer,
		abi: any[],
	): Uint8Array {
		const functionAbi = abi.find(
			(func: { name: any }) => func.name === functionName,
		);
		if (!functionAbi?.outputs)
			throw new HederaError(
				'Contract function not found in ABI, are you using the right version?',
			);
		const functionParameters = functionAbi?.outputs;
		const resultHex = '0x'.concat(
			Buffer.from(resultAsBytes).toString('hex'),
		);
		const result = this.web3.eth.abi.decodeParameters(
			functionParameters || [],
			resultHex,
		);

		const jsonParsedArray = JSON.parse(JSON.stringify(result));

		return jsonParsedArray;
	}

	public getPublicKey(privateKey?: PrivateKey | string | undefined): string {
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

	public async callContract(
		name: string,
		params: ICallContractRequest | ICallContractWithAccountRequest,
	): Promise<Uint8Array> {
		const { contractId, parameters, gas, abi } = params;
		//_>> cambiarlo!!
		let client;

		if ('account' in params) {
			client = this.getClient(
				params.account.accountId,
				params.account.privateKey,
			);
		} else {
			client = this.getClient();
		}

		const functionCallParameters = this.encodeFunctionCall(
			name,
			parameters,
			abi,
		);

		/*const contractTx = await new ContractExecuteTransaction()
			.setContractId(contractId)
			.setFunctionParameters(functionCallParameters)
			.setGas(gas)
			.execute(client);
		const record = await contractTx.getRecord(client);
		*/

		let transaction: Transaction = this.transactionProvider.contractExecute(contractId, functionCallParameters, gas);
		let transactionResponse: TransactionResponse = this.htsSign.signAndSendTransaction(transaction);
		let htsResponse: HTSResponse = TransactionResposeHandler.manageResponse(transactionResponse, TransactionType.RECORD, this.getClient());

		
		const results = this.decodeFunctionResult(
			name,
			record.contractFunctionResult?.bytes,
			abi,
		);

		return results;
	}

	

	public async deployStableCoin(
		accountId: string,
		privateKey: string,
		stableCoin: StableCoin,
	): Promise<StableCoin> {
		const client = this.getClient(accountId, privateKey);
		const plainAccount = {
			accountId,
			privateKey,
		};
		const tokenContract = await this.deployContract(
			HederaERC20__factory,
			10,
			plainAccount.privateKey,
			client,
		);
		log(
			`Deploying ${HederaERC1967Proxy__factory.name} contract... please wait.`,
			logOpts,
		);
		let proxyContract: ContractId = stableCoin.memo ?? '';

		if (!proxyContract) {
			proxyContract = await this.deployContract(
				HederaERC1967Proxy__factory,
				10,
				plainAccount.privateKey,
				client,
				new ContractFunctionParameters()
					.addAddress(tokenContract?.toSolidityAddress())
					.addBytes(new Uint8Array([])),
			);
			stableCoin.memo = String(proxyContract);
		}

		await this.callContract('initialize', {
			contractId: proxyContract,
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
			10,
			plainAccount.privateKey,
			client,
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
			this.getPublicKey(privateKey),
			client,
		);
		log('Setting up contract... please wait.', logOpts);
		await this.callContract('setTokenAddress', {
			contractId: proxyContract,
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
			contractId: tokenOwnerContract,
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
			contractId: proxyContract,
			parameters: [HAccountId.fromString(accountId).toSolidityAddress()],
			gas: 1_300_000,
			abi: HederaERC20__factory.abi,
			account: plainAccount,
		});
		console.log(hederaToken.supplyKey);

		return new StableCoin({
			name: hederaToken.name,
			symbol: hederaToken.symbol,
			decimals: hederaToken.decimals,
			initialSupply: BigInt(hederaToken.initialSupply.toNumber()),
			maxSupply: BigInt(hederaToken.maxSupply.toNumber()),
			memo: hederaToken.memo,
			freezeDefault: hederaToken.freezeDefault,
			treasury: new AccountId(hederaToken.treasuryAccountId.toString()),
			adminKey: this.fromPublicKey(hederaToken.adminKey),
			freezeKey: this.fromPublicKey(hederaToken.freezeKey),
			wipeKey: this.fromPublicKey(hederaToken.wipeKey),
			supplyKey: hederaToken.supplyKey,
			id: hederaToken.tokenId,
			tokenType: stableCoin.tokenType,
			supplyType: stableCoin.supplyType,
		});
	}

	private async deployContract(
		factory: any,
		chunks: number,
		privateKey: string,
		client: Client,
		params?: any,
	): Promise<ContractId> {
		try {
			const bytecodeFileId = await this.fileCreate(
				factory.bytecode,
				chunks,
				HPrivateKey.fromString(privateKey),
				client,
			);

			const transaction = new ContractCreateTransaction()
				.setGas(181_000)
				.setBytecodeFileId(bytecodeFileId)
				.setMaxTransactionFee(new Hbar(30))
				.setAdminKey(HPrivateKey.fromString(privateKey));
			if (params) {
				transaction.setConstructorParameters(params);
			}
			transaction.freezeWith(client);

			const contractCreateSign = await transaction.sign(
				HPrivateKey.fromString(privateKey),
			);

			const txResponse = await contractCreateSign.execute(client);
			const receipt = await txResponse.getReceipt(client);
			if (!receipt.contractId) {
				throw new Error(
					`An error ocurred during deployment of ${factory.name}`,
				);
			} else {
				return receipt.contractId;
			}
		} catch (error) {
			throw new Error(
				`An error ocurred during deployment of ${factory.name}`,
			);
		}
	}

	private async fileCreate(
		bytecode: any,
		chunks: any,
		signingPrivateKey: any,
		client: Client,
	): Promise<FileId | string> {
		const fileCreateTx = new FileCreateTransaction()
			.setKeys([signingPrivateKey])
			.freezeWith(client);
		const fileSign = await fileCreateTx.sign(signingPrivateKey);
		const fileSubmit = await fileSign.execute(client);
		const fileCreateRx = await fileSubmit.getReceipt(client);

		const bytecodeFileId = fileCreateRx.fileId || '';
		const fileAppendTx = new FileAppendTransaction()
			.setFileId(bytecodeFileId)
			.setContents(bytecode)
			.setMaxChunks(chunks)
			.setMaxTransactionFee(new Hbar(2))
			.freezeWith(client);
		const fileAppendSign = await fileAppendTx.sign(signingPrivateKey);
		const fileAppendSubmit = await fileAppendSign.execute(client);
		await fileAppendSubmit.getReceipt(client);
		return bytecodeFileId;
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
				throw new Error('Network not supported');
		}
	}

	private async createToken(
		contractId: ContractId,
		name: string,
		symbol: string,
		decimals: number,
		initialSupply: bigint,
		maxSupply: bigint | undefined,
		memo: string,
		freezeDefault: boolean,
		privateKey: string,
		publicKey: string,
		clientSdk: any,
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
			treasuryAccountId: HAccountId.fromString(contractId.toString()),
			adminKey: HPublicKey.fromString(publicKey),
			freezeKey: HPublicKey.fromString(publicKey),
			wipeKey: HPublicKey.fromString(publicKey),
			supplyKey: DelegateContractId.fromString(contractId),
			tokenId: '',
		};

		const transaction = new TokenCreateTransaction()
			.setMaxTransactionFee(new Hbar(25))
			.setTokenName(values.name)
			.setTokenSymbol(values.symbol)
			.setDecimals(values.decimals)
			.setInitialSupply(values.initialSupply)
			.setTokenMemo(values.memo)
			.setFreezeDefault(values.freezeDefault)
			.setTreasuryAccountId(values.treasuryAccountId)
			.setAdminKey(values.adminKey)
			.setFreezeKey(values.freezeKey)
			.setWipeKey(values.wipeKey)
			.setSupplyKey(values.supplyKey);

		if (maxSupply) {
			transaction.setMaxSupply(values.maxSupply);
			transaction.setSupplyType(TokenSupplyType.Finite);
		}

		transaction.freezeWith(clientSdk);
		const transactionSign = await transaction.sign(
			HPrivateKey.fromString(privateKey),
		);
		const txResponse = await transactionSign.execute(clientSdk);
		const receipt = await txResponse.getReceipt(clientSdk);
		if (!receipt.tokenId) {
			throw new Error(
				`An error ocurred creating the stable coin ${name}`,
			);
		}
		values.tokenId = receipt.tokenId;
		log(
			`Token ${name} created tokenId ${
				values.tokenId
			} - tokenAddress ${values.tokenId?.toSolidityAddress()}`,
			logOpts,
		);
		return values;
	}

	private fromPublicKey(key: HPublicKey): PublicKey {
		return new PublicKey({ key: key._key, type: key._type });
	}
}
