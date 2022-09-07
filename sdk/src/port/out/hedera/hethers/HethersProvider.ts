/* eslint-disable @typescript-eslint/no-explicit-any */
import { hethers } from '@hashgraph/hethers';
import {
	AccountId,
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
	PrivateKey,
	PublicKey,
	TokenCreateTransaction,
	TokenId,
	TokenSupplyType,
} from '@hashgraph/sdk';
import {
	HederaERC1967Proxy__factory,
	HederaERC20__factory,
	HTSTokenOwner__factory,
} from 'hedera-stable-coin-contracts/typechain-types/index.js';
import { HederaNetwork } from '../../../../core/enum.js';
import { IniConfig, IProvider } from '../Provider.js';
import Web3 from 'web3';
import { StableCoin } from '../../../../domain/context/stablecoin/StableCoin.js';
import Long from 'long';
import { log } from '../../../../core/log.js';
import { IContractParams } from '../types.js';

type DefaultHederaProvider = hethers.providers.DefaultHederaProvider;

const logOpts = { newLine: true, clear: true };
export default class HethersProvider implements IProvider {
	public hethersProvider: DefaultHederaProvider;
	private network: HederaNetwork;
	private web3 = new Web3();

	/**
	 * init
	 */
	public init({ network }: IniConfig): Promise<HethersProvider> {
		this.network = network;
		this.hethersProvider = this.getHethersProvider(network);
		return new Promise((r) => {
			r(this);
		});
	}

	public async stop(): Promise<boolean> {
		return new Promise((res) => {
			res(true);
		});
	}

	public getClient(accountId?: string, privateKey?: string): Client {
		const client = Client.forName(this.network);
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

	public getPublicKey(privateKey?: string | undefined): string {
		const publicKey =
			PrivateKey.fromString(privateKey).publicKey.toStringRaw();

		return publicKey;
	}

	public async callContract(
		name: string,
		params: IContractParams,
	): Promise<Uint8Array> {
		const { contractId, parameters, gas, abi } = params;
		const client = this.getClient(
			params.account?.accountId,
			params.account?.privateKey,
		);
		const functionCallParameters = this.encodeFunctionCall(
			name,
			parameters,
			abi,
		);

		const contractTx = await new ContractExecuteTransaction()
			.setContractId(contractId)
			.setFunctionParameters(functionCallParameters)
			.setGas(gas)
			.execute(client);
		const record = await contractTx.getRecord(client);

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
	): Promise<ContractId> {
		const client = this.getClient(accountId, privateKey);
		const account = {
			accountId,
			privateKey,
		};
		const tokenContract = await this.deployContract(
			HederaERC20__factory,
			10,
			privateKey,
			client,
		);
		log(
			`Deploying ${HederaERC1967Proxy__factory.name} contract... please wait.`,
			logOpts,
		);
		const proxyContract = await this.deployContract(
			HederaERC1967Proxy__factory,
			10,
			privateKey,
			client,
			new ContractFunctionParameters()
				.addAddress(tokenContract?.toSolidityAddress())
				.addBytes(new Uint8Array([])),
		);
		const erc20: IContractParams = {
			contractId: proxyContract,
			parameters: [],
			gas: 250_000,
			abi: HederaERC20__factory.abi,
			account
		};
		await this.callContract('initialize', erc20);
		log(
			`Deploying ${HTSTokenOwner__factory.name} contract... please wait.`,
			logOpts,
		);
		const tokenOwnerContract = await this.deployContract(
			HTSTokenOwner__factory,
			10,
			privateKey,
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
			stableCoin.memo ?? String(proxyContract),
			stableCoin.freezeDefault,
			privateKey,
			PrivateKey.fromString(privateKey).publicKey.toStringRaw(),
			client,
		);
		log('Setting up contract... please wait.', logOpts);
		const setTokenAddress: IContractParams = {
			contractId: proxyContract,
			parameters: [
				tokenOwnerContract.toSolidityAddress(),
				TokenId.fromString(hederaToken.toString()).toSolidityAddress(),
			],
			gas: 80_000,
			abi: HederaERC20__factory.abi,
			account,
		};
		await this.callContract('setTokenAddress', setTokenAddress);
		const setERC20Address: IContractParams = {
			contractId: tokenOwnerContract,
			parameters: [proxyContract.toSolidityAddress()],
			gas: 60_000,
			abi: HTSTokenOwner__factory.abi,
			account,
		};
		await this.callContract('setERC20Address', setERC20Address);
		log(
			'Associate administrator account to token... please wait.',
			logOpts,
		);
		const associateToken: IContractParams = {
			contractId: proxyContract,
			parameters: [AccountId.fromString(accountId).toSolidityAddress()],
			gas: 1_300_000,
			abi: HederaERC20__factory.abi,
			account,
		};
		await this.callContract('associateToken', associateToken);
		return proxyContract;
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
				PrivateKey.fromStringED25519(privateKey),
				client,
			);

			const transaction = new ContractCreateTransaction()
				.setGas(181_000)
				.setBytecodeFileId(bytecodeFileId)
				.setMaxTransactionFee(new Hbar(30))
				.setAdminKey(PrivateKey.fromStringED25519(privateKey));
			if (params) {
				transaction.setConstructorParameters(params);
			}
			transaction.freezeWith(client);
			const contractCreateSign = await transaction.sign(
				PrivateKey.fromStringED25519(privateKey),
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

	private getHethersProvider(network: HederaNetwork): DefaultHederaProvider {
		switch (network) {
			case HederaNetwork.MAIN:
			case HederaNetwork.PREVIEW:
			case HederaNetwork.TEST:
				return hethers.getDefaultProvider(network);
			case HederaNetwork.CUSTOM:
			default:
				throw new Error('Network not supported');
		}
	}

	private async createToken(
		contractId: any,
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
	): Promise<TokenId> {
		const transaction = new TokenCreateTransaction()
			.setMaxTransactionFee(new Hbar(25))
			.setTokenName(name)
			.setTokenSymbol(symbol)
			.setDecimals(decimals)
			.setInitialSupply(Long.fromString(initialSupply.toString()))
			.setTokenMemo(memo)
			.setFreezeDefault(freezeDefault)
			.setTreasuryAccountId(AccountId.fromString(contractId.toString()))
			.setAdminKey(PublicKey.fromString(publicKey))
			.setFreezeKey(PublicKey.fromString(publicKey))
			.setWipeKey(PublicKey.fromString(publicKey))
			.setSupplyKey(DelegateContractId.fromString(contractId));

		if (maxSupply) {
			transaction.setMaxSupply(Long.fromString(maxSupply.toString()));
			transaction.setSupplyType(TokenSupplyType.Finite);
		}

		transaction.freezeWith(clientSdk);
		const transactionSign = await transaction.sign(
			PrivateKey.fromStringED25519(privateKey),
		);
		const txResponse = await transactionSign.execute(clientSdk);
		const receipt = await txResponse.getReceipt(clientSdk);
		if (!receipt.tokenId) {
			throw new Error(
				`An error ocurred creating the stable coin ${name}`,
			);
		}
		const tokenId = receipt.tokenId;
		log(
			`Token ${name} created tokenId ${tokenId} - tokenAddress ${tokenId?.toSolidityAddress()}`,
			logOpts,
		);
		return tokenId;
	}
}
