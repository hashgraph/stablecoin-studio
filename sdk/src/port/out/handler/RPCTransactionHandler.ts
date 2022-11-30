import { Long } from 'long';

import StableCoin from '../../../domain/context/stablecoin/StableCoin.js';
import TransactionResponse from '../../../domain/context/transaction/TransactionResponse.js';
import {
	HederaERC20__factory,
	HederaERC20ProxyAdmin__factory,
	HederaERC20Proxy__factory,
	IHederaTokenService,
	IHederaTokenService__factory,
} from 'hedera-stable-coin-contracts/typechain-types/index.js';
import TransactionHandler from '../TransactionHandler';
import { BigNumber, ethers } from 'ethers';
import ContractService from '../../../domain/services/ContractService.js';
import { Response } from '../../../domain/context/transaction/Response.js';

export default class RPCTransactionHandler
	implements TransactionHandler<RPCTransactionHandler>
{
	provider = new ethers.providers.JsonRpcProvider(
		'https://testnet.hashio.io/api',
	);
	wallet = new ethers.Wallet(
		'1404d4a4a67fb21e7181d147bfdaa7c9b55ebeb7e1a9048bf18d5da6e169c09c',
		this.provider,
	);
	metamaskAccount = '0x320D33046B60DBc5a027cFB7E4124F75b0417240';
	stableCoinFactory: HederaERC20__factory;
	precompileFactory: IHederaTokenService__factory;
	constructor() {
		this.stableCoinFactory = ContractService.getContractFactory(
			'HederaERC20',
		) as HederaERC20__factory;
		console.log(this.stableCoinFactory);

		this.precompileFactory =
			ContractService.getContractFactory<IHederaTokenService__factory>(
				'HederaPrecompiled',
			);
	}
	async wipe(
		coin: StableCoin,
		targetId: string,
		amount: Long,
	): Promise<TransactionResponse<Record<string, any>, Error, Response>> {
		throw new Error('Method not implemented.');
	}

	async mint(coin: StableCoin, amount: Long): Promise<TransactionResponse> {
		const response = await this.stableCoinFactory
			.connect(this.wallet)
			.attach(coin.evmProxyAddress)
			.mint(
				'0x320D33046B60DBc5a027cFB7E4124F75b0417240',
				BigNumber.from('1'),
			);
		console.log(response);

		throw new Error('asd');
	}

	async balance(coin: StableCoin): Promise<TransactionResponse> {
		console.log(
			await HederaERC20__factory.connect(
				coin.evmProxyAddress,
				this.wallet,
			).balanceOf(this.metamaskAccount),
		);
		const factory = await this.stableCoinFactory
			.connect(this.wallet)
			.attach(coin.evmProxyAddress)
			.balanceOf(this.metamaskAccount);

		// const factWithAddress = await factory.attach(coin.evmProxyAddress);
		// const response = await factWithAddress.balanceOf(this.metamaskAccount);
		console.log(factory);

		throw new Error('asd');
	}
	async burn(coin: StableCoin, amount: Long): Promise<TransactionResponse> {
		throw new Error('Method not implemented.');
	}
	async freeze(
		coin: StableCoin,
		targetId: string,
	): Promise<TransactionResponse> {
		throw new Error('Method not implemented.');
	}
	async unfreeze(
		coin: StableCoin,
		targetId: string,
	): Promise<TransactionResponse> {
		throw new Error('Method not implemented.');
	}
	async pause(coin: StableCoin): Promise<TransactionResponse> {
		throw new Error('Method not implemented.');
	}
	async unpause(coin: StableCoin): Promise<TransactionResponse> {
		throw new Error('Method not implemented.');
	}
	async rescue(coin: StableCoin): Promise<TransactionResponse> {
		throw new Error('Method not implemented.');
	}
	async delete(coin: StableCoin): Promise<TransactionResponse> {
		throw new Error('Method not implemented.');
	}
	async contractCall(
		evmProxyAddress: string,
		functionName: string,
		param: unknown[],
	): Promise<TransactionResponse> {
		throw new Error('Method not implemented.');
	}
	async transfer(
		coin: StableCoin,
		amount: Long,
		sourceId: string,
		targetId: string,
	): Promise<TransactionResponse> {
		throw new Error('Method not implemented.');
	}
	async signAndSendTransaction(
		t: RPCTransactionHandler,
	): Promise<TransactionResponse> {
		throw new Error('Method not implemented.');
	}
}
