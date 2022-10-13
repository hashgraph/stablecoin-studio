import axios from 'axios';
import {AxiosInstance} from 'axios';
import { HederaERC20__factory } from 'hedera-stable-coin-contracts/typechain-types';
import IStableCoinList from 'port/in/sdk/response/IStableCoinList.js';
import { StableCoin } from '../../../domain/context/stablecoin/StableCoin.js';
import IStableCoinRepository from './IStableCoinRepository.js';
import NetworkAdapter from '../network/NetworkAdapter.js';
import IHederaStableCoinDetail from './types/IHederaStableCoinDetail.js';
import {
	ICallContractWithAccountRequest,
	IHTSTokenRequest,
	IWipeTokenRequest,
	ITransferTokenRequest,
} from '../hedera/types.js';
import ITokenList from './types/ITokenList.js';
import HederaError from '../hedera/error/HederaError.js';
import { IToken } from './types/IToken.js';
import PublicKey from '../../../domain/context/account/PublicKey.js';
import AccountId from '../../../domain/context/account/AccountId.js';
import { IPublicKey } from './types/IPublicKey.js';
import ContractId from '../../../domain/context/contract/ContractId.js';
import { getHederaNetwork, StableCoinRole, PrivateKeyType } from '../../../core/enum.js';
import { Capabilities } from '../../../domain/context/stablecoin/Capabilities.js';
import { Account } from '../../in/sdk/sdk.js';
import IAccount from '../hedera/account/types/IAccount.js';

import IAccountInfo from '../../in/sdk/response/IAccountInfo.js';
import { AccountId as HAccountId,
		 PublicKey as HPublicKey,
} from '@hashgraph/sdk';

export default class StableCoinRepository implements IStableCoinRepository {
	private networkAdapter: NetworkAdapter;
	private URI_BASE;
	private instance:AxiosInstance;

	constructor(networkAdapter: NetworkAdapter) {
		this.networkAdapter = networkAdapter;
		this.URI_BASE = `${
			getHederaNetwork(networkAdapter.network)?.mirrorNodeUrl
		}/api/v1/`;
		this.instance = axios.create({

			validateStatus: function (status:number) {
		 
				 return (status >= 200 && status < 300) ||  status == 404;
			 }
		 });
	}

	public async saveCoin(
		coin: StableCoin,
		account: Account,
	): Promise<StableCoin> {
		try {
			account.evmAddress = await this.accountToEvmAddress(account);
			return this.networkAdapter.provider.deployStableCoin(coin, account);
		} catch (error) {
			console.error(error);
			throw new HederaError(
				`There was a fatal error deploying the Stable Coin: ${coin.name}`,
			);
		}
	}

	public async getListStableCoins(
		account: Account,
	): Promise<IStableCoinList[]> {
		try {
			const resObject: IStableCoinList[] = [];
			const res = await this.instance.get<ITokenList>(
				this.URI_BASE +
					'tokens?limit=100&account.id=' +
					account.accountId.id,
			);
			res.data.tokens.map((item: IToken) => {
				resObject.push({
					id: item.token_id,
					symbol: item.symbol,
				});
			});
			return resObject;
		} catch (error) {
			return Promise.reject<IStableCoinList[]>(error);
		}
	}

	public async getStableCoin(id: string): Promise<StableCoin> {
		try {
			
			const response = await this.instance.get<IHederaStableCoinDetail>(
				this.URI_BASE + 'tokens/' + id,
			);

			const getKeyOrDefault = (
				val?: IPublicKey,
			): ContractId | PublicKey | undefined => {
				if (val?._type === 'ProtobufEncoded') {
					return ContractId.fromProtoBufKey(val.key);
				}
				if (val) {
					return new PublicKey({
						key: val.key,
						type: val._type,
					});
				} else {
					return undefined;
				}
			};

			return new StableCoin({
				id: response.data.token_id,
				name: response.data.name ?? '',
				symbol: response.data.symbol ?? '',
				decimals: parseInt(response.data.decimals ?? '0'),
				initialSupply: BigInt(response.data.initial_supply ?? '0'),
				totalSupply: BigInt(response.data.total_supply ?? '0'),
				maxSupply: BigInt(response.data.max_supply ?? '0'),
				// customFee: response.data.custom_fees,
				treasury: new AccountId(
					response.data.treasury_account_id ?? '0.0.0',
				),
				// expirationTime: response.data.expiry_timestamp,
				memo: response.data.memo,
				paused: response.data.pause_status,
				freezeDefault: response.data.freeze_default,
				// kycStatus: string;
				deleted: response.data.deleted ?? '',
				autoRenewAccount: response.data.auto_renew_account,
				autoRenewAccountPeriod:
					response.data.auto_renew_period / (3600 * 24),
				adminKey: getKeyOrDefault(response.data.admin_key) as PublicKey,
				kycKey: getKeyOrDefault(response.data.kyc_key),
				freezeKey: getKeyOrDefault(response.data.freeze_key),
				wipeKey: getKeyOrDefault(response.data.wipe_key),
				supplyKey: getKeyOrDefault(response.data.supply_key),
				pauseKey: getKeyOrDefault(response.data.pause_key),
			});
		} catch (error) {
			return Promise.reject<StableCoin>(error);
		}
	}
	public async getCapabilitiesStableCoin(
		id: string,
		publickey: string,
	): Promise<Capabilities[]> {
		try {
			const stableCoin: StableCoin = await this.getStableCoin(id);
			const listCapabilities: Capabilities[] = [];

			listCapabilities.push(Capabilities.DETAILS);
			listCapabilities.push(Capabilities.BALANCE);

			if (stableCoin.memo.htsAccount == stableCoin.treasury.toString()) {
				listCapabilities.push(Capabilities.RESCUE);
			}

			if (
				stableCoin.supplyKey?.toString() ===
				stableCoin.treasury.toString()
			) {
				//TODO add Roles
				listCapabilities.push(Capabilities.CASH_IN);
				listCapabilities.push(Capabilities.BURN);
			}

			if (stableCoin.supplyKey instanceof PublicKey) {
				if (
					stableCoin.supplyKey?.key.toString() == publickey.toString()
				) {
					listCapabilities.push(Capabilities.CASH_IN_HTS);
					listCapabilities.push(Capabilities.BURN_HTS);
				}
			}

			if (stableCoin.wipeKey instanceof PublicKey) {
				if (
					stableCoin.wipeKey?.key.toString() == publickey.toString()
				) {
					listCapabilities.push(Capabilities.WIPE_HTS);
				}
			}
			if (stableCoin.wipeKey instanceof ContractId) {
				listCapabilities.push(Capabilities.WIPE);
			}
			if (stableCoin.pauseKey instanceof ContractId) {
				listCapabilities.push(Capabilities.PAUSE);
			}

			const roleManagement = listCapabilities.some((capability) =>
				[
					Capabilities.PAUSE,
					Capabilities.WIPE,
					Capabilities.CASH_IN,
					Capabilities.BURN,
					Capabilities.RESCUE,
				].includes(capability),
			);
			if (roleManagement) {
				listCapabilities.push(Capabilities.ROLE_MANAGEMENT);
			}
			return listCapabilities;
		} catch (error) {
			return Promise.reject<Capabilities[]>(error);
		}
	}

	public async getBalanceOf(
		treasuryId: string,
		targetId: string,
		tokenId: string,
		account: Account,
	): Promise<Uint8Array> {
		const parameters = [
			await this.accountToEvmAddress(new Account(targetId))
		];

		const params: ICallContractWithAccountRequest = {
			contractId: treasuryId,
			parameters,
			gas: 36000,
			abi: HederaERC20__factory.abi,
			account,
		};

		const response = await this.networkAdapter.provider.callContract(
			'balanceOf',
			params,
		);
		const coin: StableCoin = await this.getStableCoin(tokenId);
		response[0] = coin.fromInteger(response[0]);

		return response;
	}

	public async getNameToken(
		treasuryId: string,
		account: Account,
	): Promise<Uint8Array> {
		const params: ICallContractWithAccountRequest = {
			contractId: treasuryId,
			parameters: [],
			gas: 36000,
			abi: HederaERC20__factory.abi,
			account,
		};

		return await this.networkAdapter.provider.callContract('name', params);
	}

	public async cashIn(
		treasuryId: string,
		targetId: string,
		amount: number,
		account: Account,
	): Promise<Uint8Array> {
		const parameters = [
			await this.accountToEvmAddress(new Account(targetId)),
			amount.toString(),
		];

		const params: ICallContractWithAccountRequest = {
			contractId: treasuryId,
			parameters,
			gas: 400000,
			abi: HederaERC20__factory.abi,
			account,
		};

		return await this.networkAdapter.provider.callContract('mint', params);
	}
	public async cashInHTS(
		tokenId: string,
		amount: number,
		account: Account,
	): Promise<boolean> {
		const params: IHTSTokenRequest = {
			account,
			tokenId: tokenId,
			amount: amount,
		};

		return await this.networkAdapter.provider.cashInHTS(params);
	}
	public async cashOut(
		treasuryId: string,
		amount: number,
		account: Account,
	): Promise<Uint8Array> {
		const parameters = [amount.toString()];

		const params: ICallContractWithAccountRequest = {
			contractId: treasuryId,
			parameters,
			gas: 400000,
			abi: HederaERC20__factory.abi,
			account,
		};
		return await this.networkAdapter.provider.callContract('burn', params);
	}

	public async cashOutHTS(
		tokenId: string,
		amount: number,
		account: Account,
	): Promise<boolean> {
		const params: IHTSTokenRequest = {
			account,
			tokenId: tokenId,
			amount: amount,
		};

		return await this.networkAdapter.provider.cashOutHTS(params);
	}

	public async associateToken(
		treasuryId: string,
		account: Account,
	): Promise<Uint8Array> {
		if (!account?.accountId.id)
			throw new Error('Associate token without account is not allowed');

		const params: ICallContractWithAccountRequest = {
			contractId: treasuryId,
			parameters: [
				await this.accountToEvmAddress(new Account(account.accountId.id))
			],
			gas: 1300000,
			abi: HederaERC20__factory.abi,
			account,
		};

		return await this.networkAdapter.provider.callContract(
			'associateToken',
			params,
		);
	}

	public async wipe(
		treasuryId: string,
		targetId: string,
		amount: number,
		account: Account,
	): Promise<Uint8Array> {
		const parameters = [
			await this.accountToEvmAddress(new Account(targetId)),
			amount.toString(),
		];

		const params: ICallContractWithAccountRequest = {
			contractId: treasuryId,
			parameters,
			gas: 400000,
			abi: HederaERC20__factory.abi,
			account,
		};

		return await this.networkAdapter.provider.callContract('wipe', params);
	}

	public async wipeHTS(
		tokenId: string,
		wipeAccountId: string,
		amount: number,
		account: Account,
	): Promise<boolean> {
		const params: IWipeTokenRequest = {
			account,
			tokenId: tokenId,
			wipeAccountId: wipeAccountId,
			amount: amount,
		};

		return await this.networkAdapter.provider.wipeHTS(params);
	}

	public async grantSupplierRole(
		treasuryId: string,
		address: string,
		account: Account,
		amount?: number,
	): Promise<Uint8Array> {
		const parameters = [
			await this.accountToEvmAddress(new Account(address))
		];
		amount && parameters.push(amount.toString());

		const params: ICallContractWithAccountRequest = {
			contractId: treasuryId,
			parameters: parameters,
			gas: 250000,
			abi: HederaERC20__factory.abi,
			account,
		};

		return await this.networkAdapter.provider.callContract(
			amount ? 'grantSupplierRole' : 'grantUnlimitedSupplierRole',
			params,
		);
	}

	public async isUnlimitedSupplierAllowance(
		treasuryId: string,
		address: string,
		account: Account,
	): Promise<Uint8Array> {
		const parameters = [
			await this.accountToEvmAddress(new Account(address))
		];

		const params: ICallContractWithAccountRequest = {
			contractId: treasuryId,
			parameters,
			gas: 60_000,
			abi: HederaERC20__factory.abi,
			account,
		};

		return await this.networkAdapter.provider.callContract(
			'isUnlimitedSupplierAllowance',
			params,
		);
	}

	public async supplierAllowance(
		treasuryId: string,
		address: string,
		account: Account,
	): Promise<Uint8Array> {
		const parameters = [
			await this.accountToEvmAddress(new Account(address))
		];

		const params: ICallContractWithAccountRequest = {
			contractId: treasuryId,
			parameters,
			gas: 60_000,
			abi: HederaERC20__factory.abi,
			account,
		};

		return await this.networkAdapter.provider.callContract(
			'supplierAllowance',
			params,
		);
	}

	public async revokeSupplierRole(
		treasuryId: string,
		address: string,
		account: Account,
	): Promise<Uint8Array> {
		const parameters = [
			await this.accountToEvmAddress(new Account(address))
		];

		const params: ICallContractWithAccountRequest = {
			contractId: treasuryId,
			parameters,
			gas: 130000,
			abi: HederaERC20__factory.abi,
			account,
		};

		return await this.networkAdapter.provider.callContract(
			'revokeSupplierRole',
			params,
		);
	}

	public async resetSupplierAllowance(
		treasuryId: string,
		address: string,
		account: Account,
	): Promise<Uint8Array> {
		const parameters = [
			await this.accountToEvmAddress(new Account(address))
		];

		const params: ICallContractWithAccountRequest = {
			contractId: treasuryId,
			parameters,
			gas: 120000,
			abi: HederaERC20__factory.abi,
			account,
		};

		return await this.networkAdapter.provider.callContract(
			'resetSupplierAllowance',
			params,
		);
	}

	public async increaseSupplierAllowance(
		treasuryId: string,
		address: string,
		account: Account,
		amount: number,
	): Promise<Uint8Array> {
		const parameters = [
			await this.accountToEvmAddress(new Account(address)),
			amount.toString(),
		];

		const params: ICallContractWithAccountRequest = {
			contractId: treasuryId,
			parameters,
			gas: 130000,
			abi: HederaERC20__factory.abi,
			account,
		};

		return await this.networkAdapter.provider.callContract(
			'increaseSupplierAllowance',
			params,
		);
	}

	public async decreaseSupplierAllowance(
		treasuryId: string,
		address: string,
		account: Account,
		amount: number,
	): Promise<Uint8Array> {
		const parameters = [
			await this.accountToEvmAddress(new Account(address)),
			amount.toString(),
		];

		const params: ICallContractWithAccountRequest = {
			contractId: treasuryId,
			parameters,
			gas: 130000,
			abi: HederaERC20__factory.abi,
			account,
		};

		return await this.networkAdapter.provider.callContract(
			'decreaseSupplierAllowance',
			params,
		);
	}

	public async rescue(
		treasuryId: string,
		amount = 1000,
		account: Account,
	): Promise<Uint8Array> {
		const parameters = [amount.toString()];

		const params: ICallContractWithAccountRequest = {
			contractId: treasuryId,
			parameters,
			gas: 140000,
			abi: HederaERC20__factory.abi,
			account,
		};

		return await this.networkAdapter.provider.callContract(
			'rescueToken',
			params,
		);
	}

	public async isLimitedSupplierAllowance(
		treasuryId: string,
		address: string,
		account: Account,
	): Promise<Uint8Array> {
		const parameters = [
			StableCoinRole.CASHIN_ROLE,
			await this.accountToEvmAddress(new Account(address))
		];

		const params: ICallContractWithAccountRequest = {
			contractId: treasuryId,
			parameters,
			gas: 60000,
			abi: HederaERC20__factory.abi,
			account,
		};

		return await this.networkAdapter.provider.callContract(
			'hasRole',
			params,
		);
	}

	public async grantRole(
		treasuryId: string,
		address: string,
		role: StableCoinRole,
		account: Account,
	): Promise<Uint8Array> {
		const parameters = [
			role,
			await this.accountToEvmAddress(new Account(address))
		];

		const params: ICallContractWithAccountRequest = {
			contractId: treasuryId,
			parameters,
			gas: 400000,
			abi: HederaERC20__factory.abi,
			account,
		};

		return await this.networkAdapter.provider.callContract(
			'grantRole',
			params,
		);
	}

	public async revokeRole(
		treasuryId: string,
		address: string,
		role: StableCoinRole,
		account: Account,
	): Promise<Uint8Array> {
		const parameters = [
			role,
			await this.accountToEvmAddress(new Account(address))
		];

		const params: ICallContractWithAccountRequest = {
			contractId: treasuryId,
			parameters,
			gas: 400000,
			abi: HederaERC20__factory.abi,
			account,
		};

		return await this.networkAdapter.provider.callContract(
			'revokeRole',
			params,
		);
	}

	public async hasRole(
		treasuryId: string,
		address: string,
		role: StableCoinRole,
		account: Account,
	): Promise<Uint8Array> {
		const parameters = [
			role,
			await this.accountToEvmAddress(new Account(address))
		];

		const params: ICallContractWithAccountRequest = {
			contractId: treasuryId,
			parameters,
			gas: 400000,
			abi: HederaERC20__factory.abi,
			account,
		};

		return await this.networkAdapter.provider.callContract(
			'hasRole',
			params,
		);
	}

	public async transferHTS(
		tokenId: string,
		amount: number,
		outAccountId: string,
		inAccountId: string,
		account: Account,
	): Promise<boolean> {
		const params: ITransferTokenRequest = {
			account,
			tokenId: tokenId,
			amount: amount,
			outAccountId: outAccountId,
			inAccountId: inAccountId,
		};

		return await this.networkAdapter.provider.transferHTS(params);
	}

	private async accountToEvmAddress(account: Account): Promise<string> {
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
			const accountInfo: IAccountInfo = await this.getAccountInfo(accountId);
			if (accountInfo.accountEvmAddress) {
				return accountInfo.accountEvmAddress;
			} else {
				return this.getAccountEvmAddressFromPrivateKeyType(
					accountInfo.publicKey!.type, 
					accountInfo.publicKey!.key, 
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
				return HAccountId.fromString(accountId).toSolidityAddress();
		}
	}

	public async getAccountInfo(
		accountId: string,
	): Promise<IAccountInfo> {
		try {
			const res = await axios.get<IAccount>(
				this.URI_BASE + 'accounts/' + accountId
			);

			const account:IAccountInfo = {
				account: accountId,
				accountEvmAddress: res.data.evm_address,
				publicKey: new PublicKey({key: res.data.key.key, type: res.data.key._type})
			};

			return account;

		} catch (error) {
			return Promise.reject<IAccountInfo>(error);
		}
	}
}
