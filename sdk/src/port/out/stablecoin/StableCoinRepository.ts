import axios from 'axios';
import { AxiosInstance } from 'axios';
import { HederaERC20__factory } from 'hedera-stable-coin-contracts/typechain-types';
import StableCoinList from 'port/in/sdk/response/StableCoinList.js';
import { StableCoin } from '../../../domain/context/stablecoin/StableCoin.js';
import IStableCoinRepository from './IStableCoinRepository.js';
import NetworkAdapter from '../network/NetworkAdapter.js';
import IHederaStableCoinDetail from './types/IHederaStableCoinDetail.js';
import {
	ICallContractWithAccountRequest,
	IHTSTokenRequestAmount,
	IWipeTokenRequest,
	ITransferTokenRequest,
	IHTSTokenRequest,
	IHTSTokenRequestTargetId,
} from '../hedera/types.js';
import ITokenList from './types/ITokenList.js';
import { IToken } from './types/IToken.js';
import PublicKey from '../../../domain/context/account/PublicKey.js';
import AccountId from '../../../domain/context/account/AccountId.js';
import { IPublicKey } from './types/IPublicKey.js';
import ContractId from '../../../domain/context/contract/ContractId.js';
import {
	getHederaNetwork,
	StableCoinRole,
	PrivateKeyType,
} from '../../../core/enum.js';
import { Capabilities } from '../../../domain/context/stablecoin/Capabilities.js';
import { Roles } from '../../../domain/context/stablecoin/Roles.js';
import { Account } from '../../in/sdk/sdk.js';
import IAccount from '../hedera/account/types/IAccount.js';

import AccountInfo from '../../in/sdk/response/AccountInfo.js';
import {
	AccountId as HAccountId,
	PublicKey as HPublicKey,
} from '@hashgraph/sdk';
import BigDecimal from '../../../domain/context/stablecoin/BigDecimal.js';
import { InvalidResponse } from './error/InvalidResponse.js';
import { StableCoinNotFound } from './error/StableCoinNotFound.js';
import LogService from '../../../app/service/log/LogService.js';

export default class StableCoinRepository implements IStableCoinRepository {
	private networkAdapter: NetworkAdapter;
	private URI_BASE;
	private instance: AxiosInstance;

	constructor(networkAdapter: NetworkAdapter) {
		this.networkAdapter = networkAdapter;
		this.URI_BASE = `${
			getHederaNetwork(networkAdapter.network)?.mirrorNodeUrl
		}/api/v1/`;
		this.instance = axios.create({
			validateStatus: function (status: number) {
				return (status >= 200 && status < 300) || status == 404;
			},
		});
	}

	public async saveCoin(
		coin: StableCoin,
		account: Account
	): Promise<StableCoin> {
		try {
			account.evmAddress = await this.accountToEvmAddress(account);
			return this.networkAdapter.provider.deployStableCoin(coin, account);
		} catch (error) {
			LogService.logError(error);
			throw error;
		}
	}

	public async getListStableCoins(
		account: Account,
	): Promise<StableCoinList[]> {
		try {
			const url =
				this.URI_BASE +
				'tokens?limit=100&account.id=' +
				account.accountId.id;

			LogService.logTrace(
				'Getting stable coin list from mirror node ->',
				url,
			);
			const resObject: StableCoinList[] = [];
			const res = await this.instance.get<ITokenList>(url);
			res.data.tokens.map((item: IToken) => {
				resObject.push({
					id: item.token_id,
					symbol: item.symbol,
				});
			});
			return resObject;
		} catch (error) {
			return Promise.reject<StableCoinList[]>(error);
		}
	}

	public async getStableCoin(id: string): Promise<StableCoin> {
		try {
			const url = this.URI_BASE + 'tokens/' + id;
			LogService.logTrace(
				'Getting stable coin from mirror node -> ',
				url,
			);
			const retry = 10;
			let i = 0;

			let response;
			do {
				if(i > 0) await new Promise( resolve => setTimeout(resolve, 2000) );

				response = await this.instance.get<IHederaStableCoinDetail>(
					url,
				);
				i++;
			} while (response.status !== 200 && i < retry);

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

			if (response.status !== 200) {
				throw new StableCoinNotFound(id);
			}

			const decimals = parseInt(response.data.decimals ?? '0');
			return new StableCoin({
				id: response.data.token_id,
				name: response.data.name ?? '',
				symbol: response.data.symbol ?? '',
				decimals: decimals,
				initialSupply: response.data.initial_supply
					? BigDecimal.fromStringFixed(
							response.data.initial_supply,
							decimals,
					  )
					: BigDecimal.ZERO,
				totalSupply: response.data.total_supply
					? BigDecimal.fromStringFixed(
							response.data.total_supply,
							decimals,
					  )
					: BigDecimal.ZERO,
				maxSupply: response.data.max_supply
					? BigDecimal.fromStringFixed(
							response.data.max_supply,
							decimals,
					  )
					: undefined,
				// customFee: response.data.custom_fees,
				treasury: new AccountId(
					response.data.treasury_account_id ?? '0.0.0',
				),
				// expirationTime: response.data.expiry_timestamp,
				memo: response.data.memo,
				paused: response.data.pause_status,
				freezeDefault: response.data.freeze_default,
				// kycStatus: string;
				deleted: Boolean(response.data.deleted) ?? false,
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
		tokenId: string,
		publickey: string,
	): Promise<Capabilities[]> {
		try {
			const stableCoin: StableCoin = await this.getStableCoin(tokenId);
			const paused = stableCoin.paused === 'PAUSED';
			const deleted = stableCoin.deleted;

			const listCapabilities: Capabilities[] = [];

			listCapabilities.push(Capabilities.DETAILS);
			listCapabilities.push(Capabilities.BALANCE);

			if (
				!deleted &&
				!paused &&
				stableCoin.memo.proxyContract == stableCoin.treasury.toString()
			) {
				listCapabilities.push(Capabilities.RESCUE);
			}

			if (
				!deleted &&
				!paused &&
				stableCoin.supplyKey?.toString() ===
					stableCoin.treasury.toString()
			) {
				//TODO add Roles
				listCapabilities.push(Capabilities.CASH_IN);
				listCapabilities.push(Capabilities.BURN);
			}

			if (
				!deleted &&
				!paused &&
				stableCoin.supplyKey instanceof PublicKey
			) {
				if (
					stableCoin.supplyKey?.key.toString() == publickey.toString()
				) {
					listCapabilities.push(Capabilities.CASH_IN_HTS);
					listCapabilities.push(Capabilities.BURN_HTS);
				}
			}

			if (
				!deleted &&
				!paused &&
				stableCoin.wipeKey instanceof PublicKey
			) {
				if (
					stableCoin.wipeKey?.key.toString() == publickey.toString()
				) {
					listCapabilities.push(Capabilities.WIPE_HTS);
				}
			}
			if (
				!deleted &&
				!paused &&
				stableCoin.wipeKey instanceof ContractId
			) {
				listCapabilities.push(Capabilities.WIPE);
			}

			if (!deleted && stableCoin.pauseKey instanceof PublicKey) {
				if (
					stableCoin.pauseKey?.key.toString() == publickey.toString()
				) {
					listCapabilities.push(Capabilities.PAUSE_HTS);
				}
			}
			if (!deleted && stableCoin.pauseKey instanceof ContractId) {
				listCapabilities.push(Capabilities.PAUSE);
			}

			if (
				!deleted &&
				!paused &&
				stableCoin.freezeKey instanceof PublicKey
			) {
				if (
					stableCoin.freezeKey?.key.toString() == publickey.toString()
				) {
					listCapabilities.push(Capabilities.FREEZE_HTS);
				}
			}
			if (
				!deleted &&
				!paused &&
				stableCoin.freezeKey instanceof ContractId
			) {
				listCapabilities.push(Capabilities.FREEZE);
			}

			if (
				!deleted &&
				!paused &&
				stableCoin.adminKey instanceof PublicKey
			) {
				if (
					stableCoin.adminKey?.key.toString() == publickey.toString()
				) {
					listCapabilities.push(Capabilities.DELETE_HTS);
				}
			}
			if (
				!deleted &&
				!paused &&
				stableCoin.adminKey instanceof ContractId
			) {
				listCapabilities.push(Capabilities.DELETE);
			}

			const roleManagement = listCapabilities.some((capability) =>
				[
					Capabilities.PAUSE,
					Capabilities.WIPE,
					Capabilities.CASH_IN,
					Capabilities.BURN,
					Capabilities.RESCUE,
					Capabilities.FREEZE,
					Capabilities.DELETE,
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
		proxyContractId: string,
		targetId: string,
		tokenId: string,
		account: Account,
	): Promise<string> {
		try {
	const parameters = [
			await this.accountToEvmAddress(new Account(targetId)),
		];

		const params: ICallContractWithAccountRequest = {
			contractId: proxyContractId,
			parameters,
			gas: 40000,
			abi: HederaERC20__factory.abi,
			account,
		};

		const response = await this.networkAdapter.provider.callContract(
			'balanceOf',
			params,
		);

		const coin: StableCoin = await this.getStableCoin(tokenId);
		const balanceHedera = BigDecimal.fromStringFixed(
			response[0].toString(),
			coin.decimals,
		);

		return balanceHedera.toString();
} catch (error) {
	LogService.logError(error);
	throw error;
}
	}

	public async cashIn(
		proxyContractId: string,
		targetId: string,
		amount: BigDecimal,
		account: Account,
	): Promise<Uint8Array> {
		const parameters = [
			await this.accountToEvmAddress(new Account(targetId)),
			amount.toLong().toString(),
		];

		const params: ICallContractWithAccountRequest = {
			contractId: proxyContractId,
			parameters,
			gas: 400000,
			abi: HederaERC20__factory.abi,
			account,
		};

		return await this.networkAdapter.provider.callContract('mint', params);
	}

	public async cashInHTS(
		tokenId: string,
		amount: BigDecimal,
		account: Account,
	): Promise<boolean> {
		const params: IHTSTokenRequestAmount = {
			account,
			tokenId: tokenId,
			amount: amount.toLong(),
		};

		return await this.networkAdapter.provider.cashInHTS(params);
	}

	public async cashOut(
		proxyContractId: string,
		amount: BigDecimal,
		account: Account,
	): Promise<Uint8Array> {
		const parameters = [amount.toLong().toString()];

		const params: ICallContractWithAccountRequest = {
			contractId: proxyContractId,
			parameters,
			gas: 400000,
			abi: HederaERC20__factory.abi,
			account,
		};
		return await this.networkAdapter.provider.callContract('burn', params);
	}

	public async cashOutHTS(
		tokenId: string,
		amount: BigDecimal,
		account: Account,
	): Promise<boolean> {
		const params: IHTSTokenRequestAmount = {
			account,
			tokenId: tokenId,
			amount: amount.toLong(),
		};

		return await this.networkAdapter.provider.cashOutHTS(params);
	}

	public async associateToken(
		proxyContractId: string,
		account: Account,
	): Promise<Uint8Array> {
		if (!account?.accountId.id)
			throw new Error('Associate token without account is not allowed');

		const params: ICallContractWithAccountRequest = {
			contractId: proxyContractId,
			parameters: [
				await this.accountToEvmAddress(
					new Account(account.accountId.id),
				),
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
		proxyContractId: string,
		targetId: string,
		amount: BigDecimal,
		account: Account,
	): Promise<Uint8Array> {
		const parameters = [
			await this.accountToEvmAddress(new Account(targetId)),
			amount.toLong().toString(),
		];

		const params: ICallContractWithAccountRequest = {
			contractId: proxyContractId,
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
		amount: BigDecimal,
		account: Account,
	): Promise<boolean> {
		const params: IWipeTokenRequest = {
			account,
			tokenId: tokenId,
			wipeAccountId: wipeAccountId,
			amount: amount.toLong(),
		};

		return await this.networkAdapter.provider.wipeHTS(params);
	}

	public async grantSupplierRole(
		proxyContractId: string,
		address: string,
		account: Account,
		amount?: BigDecimal,
	): Promise<Uint8Array> {
		const parameters = [
			await this.accountToEvmAddress(new Account(address)),
		];
		amount && parameters.push(amount.toLong().toString());

		const params: ICallContractWithAccountRequest = {
			contractId: proxyContractId,
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
		proxyContractId: string,
		address: string,
		account: Account,
	): Promise<Uint8Array> {
		const parameters = [
			await this.accountToEvmAddress(new Account(address)),
		];

		const params: ICallContractWithAccountRequest = {
			contractId: proxyContractId,
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
		proxyContractId: string,
		address: string,
		account: Account,
	): Promise<Uint8Array> {
		const parameters = [
			await this.accountToEvmAddress(new Account(address)),
		];

		const params: ICallContractWithAccountRequest = {
			contractId: proxyContractId,
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
		proxyContractId: string,
		address: string,
		account: Account,
	): Promise<Uint8Array> {
		const parameters = [
			await this.accountToEvmAddress(new Account(address)),
		];

		const params: ICallContractWithAccountRequest = {
			contractId: proxyContractId,
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
		proxyContractId: string,
		address: string,
		account: Account,
	): Promise<Uint8Array> {
		const parameters = [
			await this.accountToEvmAddress(new Account(address)),
		];

		const params: ICallContractWithAccountRequest = {
			contractId: proxyContractId,
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
		proxyContractId: string,
		address: string,
		account: Account,
		amount: BigDecimal,
	): Promise<Uint8Array> {
		const parameters = [
			await this.accountToEvmAddress(new Account(address)),
			amount.toLong().toString(),
		];

		const params: ICallContractWithAccountRequest = {
			contractId: proxyContractId,
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
		proxyContractId: string,
		address: string,
		account: Account,
		amount: BigDecimal,
	): Promise<Uint8Array> {
		const parameters = [
			await this.accountToEvmAddress(new Account(address)),
			amount.toLong().toString(),
		];

		const params: ICallContractWithAccountRequest = {
			contractId: proxyContractId,
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
		proxyContractId: string,
		amount: BigDecimal,
		account: Account,
	): Promise<Uint8Array> {
		const parameters = [amount.toLong().toString()];

		const params: ICallContractWithAccountRequest = {
			contractId: proxyContractId,
			parameters,
			gas: 140000,
			abi: HederaERC20__factory.abi,
			account,
		};

		return await this.networkAdapter.provider.callContract(
			'rescue',
			params,
		);
	}

	public async isLimitedSupplierAllowance(
		proxyContractId: string,
		address: string,
		account: Account,
	): Promise<Uint8Array> {
		const parameters = [
			StableCoinRole.CASHIN_ROLE,
			await this.accountToEvmAddress(new Account(address)),
		];

		const params: ICallContractWithAccountRequest = {
			contractId: proxyContractId,
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
		proxyContractId: string,
		address: string,
		role: StableCoinRole,
		account: Account,
	): Promise<Uint8Array> {
		const parameters = [
			role,
			await this.accountToEvmAddress(new Account(address)),
		];

		const params: ICallContractWithAccountRequest = {
			contractId: proxyContractId,
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
		proxyContractId: string,
		address: string,
		role: StableCoinRole,
		account: Account,
	): Promise<Uint8Array> {
		const parameters = [
			role,
			await this.accountToEvmAddress(new Account(address)),
		];

		const params: ICallContractWithAccountRequest = {
			contractId: proxyContractId,
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
		proxyContractId: string,
		address: string,
		role: StableCoinRole,
		account: Account,
	): Promise<Uint8Array> {
		const parameters = [
			role,
			await this.accountToEvmAddress(new Account(address)),
		];

		const params: ICallContractWithAccountRequest = {
			contractId: proxyContractId,
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

	public async getRoles(
		proxyContractId: string,
		address: string,
		account: Account,
	): Promise<string[]> {
		const parameters = [
			await this.accountToEvmAddress(new Account(address)),
		];

		const params: ICallContractWithAccountRequest = {
			contractId: proxyContractId,
			parameters,
			gas: 80000,
			abi: HederaERC20__factory.abi,
			account,
		};

		const roles: any = await this.networkAdapter.provider.callContract(
			'getRoles',
			params,
		);
		const listRoles: string[] = roles[0]
			.filter(
				(role: StableCoinRole) => role !== StableCoinRole.WITHOUT_ROLE,
			)
			.map((role: StableCoinRole) => {
				const indexOfS = Object.values(StableCoinRole).indexOf(role);
				const roleName = Object.keys(StableCoinRole)[indexOfS];
				const indexOfRole = Object.keys(Roles).indexOf(roleName);
				return Object.values(Roles)[indexOfRole];
			});

		return listRoles;
	}

	public async transferHTS(
		tokenId: string,
		amount: BigDecimal,
		outAccountId: string,
		inAccountId: string,
		account: Account,
		isApproval = false,
	): Promise<boolean> {
		const params: ITransferTokenRequest = {
			account,
			tokenId: tokenId,
			amount: amount.toLong(),
			outAccountId: outAccountId,
			inAccountId: inAccountId,
			isApproval,
		};

		return await this.networkAdapter.provider.transferHTS(params);
	}

	private async accountToEvmAddress(account: Account): Promise<string> {
		if (account.privateKey) {
			return this.getAccountEvmAddressFromPrivateKeyType(
				account.privateKey?.type,
				account.privateKey.publicKey.key,
				account.accountId.id,
			);
		} else {
			return await this.getAccountEvmAddress(account.accountId.id);
		}
	}

	private async getAccountEvmAddress(accountId: string): Promise<string> {
		try {
			const accountInfo: AccountInfo = await this.getAccountInfo(
				accountId,
			);
			if (accountInfo.accountEvmAddress) {
				return accountInfo.accountEvmAddress;
			} else if (accountInfo.publicKey) {
				return this.getAccountEvmAddressFromPrivateKeyType(
					accountInfo.publicKey.type,
					accountInfo.publicKey.key,
					accountId,
				);
			} else {
				return Promise.reject<string>('');
			}
		} catch (error) {
			return Promise.reject<string>(error);
		}
	}

	private getAccountEvmAddressFromPrivateKeyType(
		privateKeyType: string,
		publicKey: string,
		accountId: string,
	): string {
		switch (privateKeyType) {
			case PrivateKeyType.ECDSA:
				return HPublicKey.fromString(publicKey).toEthereumAddress();

			default:
				return HAccountId.fromString(accountId).toSolidityAddress();
		}
	}

	public async getAccountInfo(accountId: string): Promise<AccountInfo> {
		try {
			LogService.logTrace(this.URI_BASE + 'accounts/' + accountId);
			const res = await axios.get<IAccount>(
				this.URI_BASE + 'accounts/' + accountId,
			);

			const account: AccountInfo = {
				account: accountId,
				accountEvmAddress: res.data.evm_address,
				publicKey: new PublicKey({
					key: res.data.key.key,
					type: res.data.key._type,
				}),
			};

			return account;
		} catch (error) {
			return Promise.reject<AccountInfo>(new InvalidResponse(error));
		}
	}

	public async delete(
		proxyContractId: string,
		account: Account,
	): Promise<Uint8Array> {
		const params: ICallContractWithAccountRequest = {
			contractId: proxyContractId,
			parameters: [],
			gas: 400000,
			abi: HederaERC20__factory.abi,
			account,
		};
		const response = await this.networkAdapter.provider.callContract(
			'delete',
			params,
		);

		return response;
	}
	public async deleteHTS(
		tokenId: string,
		account: Account,
	): Promise<boolean> {
		const params: IHTSTokenRequest = {
			account,
			tokenId: tokenId,
		};

		return await this.networkAdapter.provider.deleteHTS(params);
	}

	public async pause(
		proxyContractId: string,
		account: Account,
	): Promise<Uint8Array> {
		const params: ICallContractWithAccountRequest = {
			contractId: proxyContractId,
			parameters: [],
			gas: 400000,
			abi: HederaERC20__factory.abi,
			account,
		};
		const response = await this.networkAdapter.provider.callContract(
			'pause',
			params,
		);

		return response;
	}

	public async pauseHTS(tokenId: string, account: Account): Promise<boolean> {
		const params: IHTSTokenRequest = {
			account,
			tokenId: tokenId,
		};

		return await this.networkAdapter.provider.pauseHTS(params);
	}

	public async unpause(
		proxyContractId: string,
		account: Account,
	): Promise<Uint8Array> {
		const params: ICallContractWithAccountRequest = {
			contractId: proxyContractId,
			parameters: [],
			gas: 400000,
			abi: HederaERC20__factory.abi,
			account,
		};
		const response = await this.networkAdapter.provider.callContract(
			'unpause',
			params,
		);

		return response;
	}

	public async unpauseHTS(
		tokenId: string,
		account: Account,
	): Promise<boolean> {
		const params: IHTSTokenRequest = {
			account,
			tokenId: tokenId,
		};

		return await this.networkAdapter.provider.unpauseHTS(params);
	}

	public async freeze(
		proxyContractId: string,
		account: Account,
		targetId: string,
	): Promise<Uint8Array> {
		const parameters = [
			await this.accountToEvmAddress(new Account(targetId)),
		];

		const params: ICallContractWithAccountRequest = {
			contractId: proxyContractId,
			parameters,
			gas: 60000,
			abi: HederaERC20__factory.abi,
			account,
		};

		return await this.networkAdapter.provider.callContract(
			'freeze',
			params,
		);
	}

	public async freezeHTS(
		tokenId: string,
		account: Account,
		targetId: string,
	): Promise<boolean> {
		const params: IHTSTokenRequestTargetId = {
			account,
			tokenId,
			targetId,
		};

		return await this.networkAdapter.provider.freezeHTS(params);
	}

	public async unfreeze(
		proxyContractId: string,
		account: Account,
		targetId: string,
	): Promise<Uint8Array> {
		const parameters = [
			await this.accountToEvmAddress(new Account(targetId)),
		];

		const params: ICallContractWithAccountRequest = {
			contractId: proxyContractId,
			parameters,
			gas: 60000,
			abi: HederaERC20__factory.abi,
			account,
		};

		return await this.networkAdapter.provider.callContract(
			'unfreeze',
			params,
		);
	}

	public async unfreezeHTS(
		tokenId: string,
		account: Account,
		targetId: string,
	): Promise<boolean> {
		const params: IHTSTokenRequestTargetId = {
			account,
			tokenId,
			targetId,
		};

		return await this.networkAdapter.provider.unfreezeHTS(params);
	}
}
