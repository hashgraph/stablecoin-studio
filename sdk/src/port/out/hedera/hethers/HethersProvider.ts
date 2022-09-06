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
import StableCoin from '../../../../domain/context/stablecoin/StableCoin.js';
import Long from 'long';

type DefaultHederaProvider = hethers.providers.DefaultHederaProvider;

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

	public async deploy(
		accountId: string,
		privateKey: string,
		stableCoin: StableCoin,
	): Promise<ContractId> {
		const client = Client.forName(this.network);
		client.setOperator(accountId, privateKey);
		const tokenContract = await this.deployContract(
			HederaERC20__factory,
			10,
			privateKey,
			client,
		);
		console.log(
			`\tDeploying ${HederaERC1967Proxy__factory.name} contract... please wait.`,
		);
		const parameters = new ContractFunctionParameters()
			.addAddress(tokenContract?.toSolidityAddress())
			.addBytes(new Uint8Array([]));
		const proxyContract = await this.deployContract(
			HederaERC1967Proxy__factory,
			10,
			privateKey,
			client,
			parameters,
		);
		let parametersContractCall: any[] = [];
		await this.contractCall(
			proxyContract,
			'initialize',
			parametersContractCall,
			client,
			250_000,
			HederaERC20__factory.abi,
		);
		console.log(
			`\tDeploying ${HTSTokenOwner__factory.name} contract... please wait.`,
		);
		const tokenOwnerContract = await this.deployContract(
			HTSTokenOwner__factory,
			10,
			privateKey,
			client,
		);
		console.log('\tCreating token... please wait.');
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
		console.log('\tSetting up contract... please wait.');
		parametersContractCall = [
			tokenOwnerContract.toSolidityAddress(),
			TokenId.fromString(hederaToken.toString()).toSolidityAddress(),
		];
		await this.contractCall(
			proxyContract,
			'setTokenAddress',
			parametersContractCall,
			client,
			80_000,
			HederaERC20__factory.abi,
		);
		parametersContractCall = [proxyContract.toSolidityAddress()];
		await this.contractCall(
			tokenOwnerContract,
			'setERC20Address',
			parametersContractCall,
			client,
			60_000,
			HTSTokenOwner__factory.abi,
		);
		console.log('\tAssociate administrator account to token... please wait.');
		parametersContractCall = [
			AccountId.fromString(accountId).toSolidityAddress(),
		];
		await this.contractCall(
			proxyContract,
			'associateToken',
			parametersContractCall,
			client,
			1_300_000,
			HederaERC20__factory.abi,
		);
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
					`\tAn error ocurred during deployment of ${factory.name}`,
				);
			} else {
				return receipt.contractId;
			}
		} catch (error) {
			throw new Error(
				`\tAn error ocurred during deployment of ${factory.name}`,
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

	private async contractCall(
		contractId: any,
		functionName: string,
		parameters: any[],
		clientOperator: any,
		gas: any,
		abi: any,
	): Promise<any> {
		const functionCallParameters = this.encodeFunctionCall(
			functionName,
			parameters,
			abi,
		);

		const contractTx = await new ContractExecuteTransaction()
			.setContractId(contractId)
			.setFunctionParameters(functionCallParameters)
			.setGas(gas)
			.execute(clientOperator);
		const record = await contractTx.getRecord(clientOperator);

		const results = this.decodeFunctionResult(
			abi,
			functionName,
			record.contractFunctionResult?.bytes,
		);

		return results;
	}

	private encodeFunctionCall(
		functionName: any,
		parameters: any[],
		abi: any,
	): Buffer {
		const functionAbi = abi.find(
			(func: { name: any; type: string }) =>
				func.name === functionName && func.type === 'function',
		);
		const encodedParametersHex = this.web3.eth.abi
		.encodeFunctionCall(functionAbi, parameters)
		.slice(2);
		return Buffer.from(encodedParametersHex, 'hex');
	}

	private decodeFunctionResult(
		abi: any,
		functionName: any,
		resultAsBytes: any,
	): any {
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

	private async createToken(
		contractId: any,
		name: string,
		symbol: string,
		decimals: number,
		initialSupply: bigint,
		maxSupply: bigint|undefined,
		memo: string,
		freezeDefault: boolean,
		privateKey: string,
		publicKey: string,
		clientSdk: any,
	): Promise<TokenId> {
		
		const transaction = new TokenCreateTransaction()
			.setMaxTransactionFee(new Hbar(15))
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
		
		if (maxSupply){
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
		console.log(
			`Token ${name} created tokenId ${tokenId} - tokenAddress ${tokenId?.toSolidityAddress()}   `,
		);
		return tokenId;
	}
}
