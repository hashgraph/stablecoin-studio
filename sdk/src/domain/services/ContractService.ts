import { ContractFactory, Signer } from 'ethers';
import {
	HederaERC20__factory,
	HederaERC20Proxy__factory,
	IHederaTokenService__factory,
} from 'hedera-stable-coin-contracts/typechain-types/index.js';

export default class ContractService {
	public static getContractFactory<T>(name: string): T {
		switch (name) {
			case 'HederaERC20':
				return HederaERC20__factory as T;
				break;
			case 'HederaERC20Proxy':
				return new HederaERC20Proxy__factory() as T;
				break;
			case 'HederaPrecompiled':
				// TODO IMPLEMENT
				return new HederaERC20__factory() as T;
				// return new IHederaTokenService__factory();
				break;
			default:
				throw Error('Contract not found');
		}
	}
}
