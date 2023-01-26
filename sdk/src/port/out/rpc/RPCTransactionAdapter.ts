/*
 *
 * Hedera Stable Coin SDK
 *
 * Copyright (C) 2023 Hedera Hashgraph, LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 *
 */

/* eslint-disable no-case-declarations */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-non-null-assertion */
import TransactionResponse from '../../../domain/context/transaction/TransactionResponse.js';
import {
	PublicKey as HPublicKey,
	ContractId as HContractId,
} from '@hashgraph/sdk';
import {
	HederaERC20__factory,
	HederaReserve__factory,
	StableCoinFactory__factory,
	IHederaTokenService__factory,
} from 'hedera-stable-coin-contracts';
import TransactionAdapter, { InitializationData } from '../TransactionAdapter';
import { ContractTransaction, ethers, Signer } from 'ethers';
import { singleton } from 'tsyringe';
import StableCoinCapabilities from '../../../domain/context/stablecoin/StableCoinCapabilities.js';
import BigDecimal from '../../../domain/context/shared/BigDecimal.js';
import Injectable from '../../../core/Injectable.js';
import type { Provider } from '@ethersproject/providers';
import { CapabilityDecider, Decision } from '../CapabilityDecider.js';
import { Operation } from '../../../domain/context/stablecoin/Capability.js';
import { CapabilityError } from '../hs/error/CapabilityError.js';
import { CallableContract } from '../../../core/Cast.js';
import { TokenId } from '@hashgraph/sdk';
import { StableCoinRole } from '../../../domain/context/stablecoin/StableCoinRole.js';
import detectEthereumProvider from '@metamask/detect-provider';
import { RuntimeError } from '../../../core/error/RuntimeError.js';
import Account from '../../../domain/context/account/Account.js';
import { HederaId } from '../../../domain/context/shared/HederaId.js';
import { lazyInject } from '../../../core/decorator/LazyInjectDecorator.js';
import { MirrorNodeAdapter } from '../mirror/MirrorNodeAdapter.js';
import NetworkService from '../../../app/service/NetworkService.js';
import ContractId from '../../../domain/context/contract/ContractId.js';
import { StableCoinProps } from '../../../domain/context/stablecoin/StableCoin.js';
import { TokenSupplyType } from '../../../domain/context/stablecoin/TokenSupply.js';
import { FactoryStableCoin } from '../../../domain/context/factory/FactoryStableCoin.js';
import { FactoryKey } from '../../../domain/context/factory/FactoryKey.js';
import PublicKey from '../../../domain/context/account/PublicKey.js';
import { TOKEN_CREATION_COST_HBAR } from '../../../core/Constants.js';
import { MetaMaskInpageProvider } from '@metamask/providers';
import { WalletConnectError } from '../../../domain/context/network/error/WalletConnectError.js';
import EventService from '../../../app/service/event/EventService.js';
import {
	ConnectionState,
	WalletEvents,
} from '../../../app/service/event/WalletEvent.js';
import { SupportedWallets } from '../../../domain/context/network/Wallet.js';
import { RPCTransactionResponseAdapter } from './RPCTransactionResponseAdapter.js';
import LogService from '../../../app/service/LogService.js';
import { WalletConnectRejectedError } from '../../../domain/context/network/error/WalletConnectRejectedError.js';
import { TransactionResponseError } from '../error/TransactionResponseError.js';
import { SigningError } from '../hs/error/SigningError.js';
import { RESERVE_DECIMALS } from '../../../domain/context/reserve/Reserve.js';

// eslint-disable-next-line no-var
declare var ethereum: MetaMaskInpageProvider;

@singleton()
export default class RPCTransactionAdapter extends TransactionAdapter {
	provider: ethers.providers.JsonRpcProvider;
	account: Account;
	signerOrProvider: Signer | Provider;

	constructor(
		@lazyInject(MirrorNodeAdapter)
		private readonly mirrorNodeAdapter: MirrorNodeAdapter,
		@lazyInject(NetworkService)
		private readonly networkService: NetworkService,
		@lazyInject(EventService)
		private readonly eventService: EventService,
	) {
		super();
		this.registerMetamaskEvents();
	}
	public async create(
		coin: StableCoinProps,
		factory: ContractId,
		hederaERC20: ContractId,
		createReserve: boolean,
		reserveAddress?: ContractId,
		reserveInitialAmount?: BigDecimal,
	): Promise<TransactionResponse<any, Error>> {
		try {
			const keys: FactoryKey[] = [];

			const providedKeys = [
				coin.adminKey,
				coin.kycKey,
				coin.freezeKey,
				coin.wipeKey,
				coin.supplyKey,
				coin.pauseKey,
			];

			providedKeys.forEach((providedKey, index) => {
				if (providedKey) {
					const key = new FactoryKey();
					switch (index) {
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
					key.PublicKey =
						providedKeyCasted.key == PublicKey.NULL.key
							? '0x'
							: HPublicKey.fromString(
									providedKeyCasted.key,
							  ).toBytesRaw();
					key.isED25519 = providedKeyCasted.type == 'ED25519';
					keys.push(key);
				}
			});

			const stableCoinToCreate = new FactoryStableCoin(
				coin.name,
				coin.symbol,
				coin.freezeDefault ?? false,
				coin.supplyType == TokenSupplyType.FINITE,
				coin.maxSupply
					? coin.maxSupply.toFixedNumber()
					: BigDecimal.ZERO.toFixedNumber(),
				coin.initialSupply
					? coin.initialSupply.toFixedNumber()
					: BigDecimal.ZERO.toFixedNumber(),
				coin.decimals,
				(
					await this.accountToEvmAddress(coin.autoRenewAccount!)
				).toString(),
				coin.treasury == undefined ||
				coin.treasury.toString() == '0.0.0'
					? '0x0000000000000000000000000000000000000000'
					: (
							await this.accountToEvmAddress(coin.treasury)
					  ).toString(),
				reserveAddress == undefined ||
				reserveAddress.toString() == '0.0.0'
					? '0x0000000000000000000000000000000000000000'
					: HContractId.fromString(
							reserveAddress.value,
					  ).toSolidityAddress(),
				reserveInitialAmount
					? reserveInitialAmount.toFixedNumber()
					: BigDecimal.ZERO.toFixedNumber(),
				createReserve,
				coin.grantKYCToOriginalSender?coin.grantKYCToOriginalSender:false,
				keys,
			);

			const factoryInstance = StableCoinFactory__factory.connect(
				'0x' +
					HContractId.fromString(factory.value).toSolidityAddress(),
				this.signerOrProvider,
			);
			LogService.logTrace('Deploying factory: ', {
				erc20: hederaERC20.value,
				stableCoin: stableCoinToCreate,
			});
			const res = await factoryInstance.deployStableCoin(
				stableCoinToCreate,
				'0x' +
					HContractId.fromString(
						hederaERC20.value,
					).toSolidityAddress(),
				{
					value: ethers.utils.parseEther(
						TOKEN_CREATION_COST_HBAR.toString(),
					),
					gasLimit: 15000000,
				},
			);
			// Put it into an array since structs change the response from the event and its not a simple array
			/*const txRes = await RPCTransactionResponseAdapter.manageResponse(
				res,
				'Deployed',
			);
			txRes.response = [txRes.response]
			return txRes;*/
			return RPCTransactionResponseAdapter.manageResponse(
				res,
				'Deployed',
			);
		} catch (error) {
			LogService.logError(error);
			throw new SigningError(
				`Unexpected error in RPCTransactionAdapter create operation : ${error}`,
			);
		}
	}

	async init(debug = false): Promise<string> {
		this.provider = new ethers.providers.JsonRpcProvider(
			`https://${this.networkService.environment.toString()}.hashio.io/api`,
		);
		!debug && (await this.connectMetamask(false));
		const eventData = {
			initData: {
				account: this.account,
				pairing: '',
				topic: '',
			},
			wallet: SupportedWallets.METAMASK,
		};
		this.eventService.emit(WalletEvents.walletInit, eventData);
		LogService.logTrace('Metamask Initialized ', eventData);

		return this.networkService.environment;
	}

	async register(
		account?: Account,
		debug = false,
	): Promise<InitializationData> {
		if (account) {
			const accountMirror = await this.mirrorNodeAdapter.getAccountInfo(
				account.id,
			);
			this.account = account;
			this.account.publicKey = accountMirror.publicKey;
		}
		Injectable.registerTransactionHandler(this);
		!debug && (await this.connectMetamask());
		LogService.logTrace('Metamask registered as handler');
		return Promise.resolve({ account });
	}

	stop(): Promise<boolean> {
		this.eventService.emit(WalletEvents.walletConnectionStatusChanged, {
			status: ConnectionState.Disconnected,
			wallet: SupportedWallets.METAMASK,
		});
		LogService.logTrace('Metamask stopped');
		this.eventService.emit(WalletEvents.walletDisconnect, {
			wallet: SupportedWallets.METAMASK,
		});
		return Promise.resolve(true);
	}

	getMirrorNodeAdapter(): MirrorNodeAdapter {
		return this.mirrorNodeAdapter;
	}

	async wipe(
		coin: StableCoinCapabilities,
		targetId: HederaId,
		amount: BigDecimal,
	): Promise<TransactionResponse> {
		const params = new Params({
			targetId: await (
				await this.accountToEvmAddress(targetId)
			).toString(),
			amount: amount,
		});
		return this.performOperation(coin, Operation.WIPE, params);
	}

	async cashin(
		coin: StableCoinCapabilities,
		targetId: HederaId,
		amount: BigDecimal,
	): Promise<TransactionResponse> {
		const params = new Params({
			targetId: targetId.toString(),
			amount: amount,
		});
		return this.performOperation(coin, Operation.CASH_IN, params);
	}

	async burn(
		coin: StableCoinCapabilities,
		amount: BigDecimal,
	): Promise<TransactionResponse> {
		const params = new Params({
			amount: amount,
		});
		return this.performOperation(coin, Operation.BURN, params);
	}

	async freeze(
		coin: StableCoinCapabilities,
		targetId: HederaId,
	): Promise<TransactionResponse> {
		const params = new Params({
			targetId: await (
				await this.accountToEvmAddress(targetId)
			).toString(),
		});
		return this.performOperation(coin, Operation.FREEZE, params);
	}

	async unfreeze(
		coin: StableCoinCapabilities,
		targetId: HederaId,
	): Promise<TransactionResponse> {
		const params = new Params({
			targetId: await (
				await this.accountToEvmAddress(targetId)
			).toString(),
		});
		return this.performOperation(coin, Operation.UNFREEZE, params);
	}

	async pause(coin: StableCoinCapabilities): Promise<TransactionResponse> {
		return this.performOperation(coin, Operation.PAUSE);
	}

	async unpause(coin: StableCoinCapabilities): Promise<TransactionResponse> {
		return this.performOperation(coin, Operation.UNPAUSE);
	}

	async rescue(
		coin: StableCoinCapabilities,
		amount: BigDecimal,
	): Promise<TransactionResponse> {
		const params = new Params({
			amount: amount,
		});
		return this.performOperation(coin, Operation.RESCUE, params);
	}

	async delete(coin: StableCoinCapabilities): Promise<TransactionResponse> {
		return this.performOperation(coin, Operation.DELETE);
	}

	public async getReserveAddress(
		coin: StableCoinCapabilities,
	): Promise<TransactionResponse> {
		try {
			if (!coin.coin.evmProxyAddress?.toString())
				throw new TransactionResponseError({
					RPC_relay: true,
					message: `StableCoin ${coin.coin.name} does not have a proxy address`,
				});

			const res = await HederaERC20__factory.connect(
				coin.coin.evmProxyAddress?.toString(),
				this.signerOrProvider,
			).getReserveAddress();

			return new TransactionResponse(undefined, res.toString());
		} catch (error) {
			LogService.logError(error);
			throw new TransactionResponseError({
				RPC_relay: true,
				message: `Unexpected error in RPCTransactionAdapter update reserve operation : ${error}`,
				transactionId: (error as any).error?.transactionId,
			});
		}
	}

	public async updateReserveAddress(
		coin: StableCoinCapabilities,
		reserveAddress: ContractId,
	): Promise<TransactionResponse> {
		try {
			if (!coin.coin.evmProxyAddress?.toString())
				throw new TransactionResponseError({
					RPC_relay: true,
					message: `StableCoin ${coin.coin.name} does not have a proxy address`,
				});

			return RPCTransactionResponseAdapter.manageResponse(
				await HederaERC20__factory.connect(
					coin.coin.evmProxyAddress?.toString(),
					this.signerOrProvider,
				).updateReserveAddress(
					reserveAddress.toHederaAddress().toSolidityAddress(),
				),
			);
		} catch (error) {
			LogService.logError(error);
			throw new TransactionResponseError({
				RPC_relay: true,
				message: `Unexpected error in RPCTransactionAdapter update reserve operation : ${error}`,
				transactionId: (error as any).error?.transactionId,
			});
		}
	}

	public async getReserveAmount(
		coin: StableCoinCapabilities,
	): Promise<TransactionResponse> {
		try {
			if (!coin.coin.evmProxyAddress?.toString())
				throw new TransactionResponseError({
					RPC_relay: true,
					message: `StableCoin ${coin.coin.name} does not have a proxy address`,
				});

			const res = await HederaERC20__factory.connect(
				coin.coin.evmProxyAddress?.toString(),
				this.signerOrProvider,
			).getReserveAmount();

			return new TransactionResponse(
				undefined,
				BigDecimal.fromStringFixed(res.toString(), RESERVE_DECIMALS),
			);
		} catch (error) {
			LogService.logError(error);
			throw new TransactionResponseError({
				RPC_relay: true,
				message: `Unexpected error in RPCTransactionAdapter update reserve operation : ${error}`,
				transactionId: (error as any).error?.transactionId,
			});
		}
	}

	public async updateReserveAmount(
		reserveAddress: ContractId,
		amount: BigDecimal,
	): Promise<TransactionResponse> {
		try {
			return RPCTransactionResponseAdapter.manageResponse(
				await HederaReserve__factory.connect(
					reserveAddress.toHederaAddress().toSolidityAddress(),
					this.signerOrProvider,
				).setAmount(amount.toBigNumber()),
			);
		} catch (error) {
			LogService.logError(error);
			throw new TransactionResponseError({
				RPC_relay: true,
				message: `Unexpected error in RPCTransactionAdapter updatePorAmount operation : ${error}`,
				transactionId: (error as any).error?.transactionId,
			});
		}
	}

	async grantRole(
		coin: StableCoinCapabilities,
		targetId: HederaId,
		role: StableCoinRole,
	): Promise<TransactionResponse> {
		try {
			if (!coin.coin.evmProxyAddress?.toString())
				throw new TransactionResponseError({
					RPC_relay: true,
					message: `StableCoin ${coin.coin.name} does not have a proxy address`,
				});

			return RPCTransactionResponseAdapter.manageResponse(
				await HederaERC20__factory.connect(
					coin.coin.evmProxyAddress?.toString(),
					this.signerOrProvider,
				).grantRole(
					role,
					(
						await (
							await this.accountToEvmAddress(targetId)
						).toString()
					).toString(),
				),
			);
		} catch (error) {
			LogService.logError(error);
			throw new TransactionResponseError({
				RPC_relay: true,
				message: `Unexpected error in RPCTransactionAdapter grantRole operation : ${error}`,
				transactionId: (error as any).error?.transactionId,
			});
		}
	}

	async revokeRole(
		coin: StableCoinCapabilities,
		targetId: HederaId,
		role: StableCoinRole,
	): Promise<TransactionResponse> {
		try {
			if (!coin.coin.evmProxyAddress?.toString())
				throw new TransactionResponseError({
					RPC_relay: true,
					message: `StableCoin ${coin.coin.name} does not have a proxy address`,
				});

			return RPCTransactionResponseAdapter.manageResponse(
				await HederaERC20__factory.connect(
					coin.coin.evmProxyAddress?.toString(),
					this.signerOrProvider,
				).revokeRole(
					role,
					(
						await (
							await this.accountToEvmAddress(targetId)
						).toString()
					).toString(),
				),
			);
		} catch (error) {
			LogService.logError(error);
			throw new TransactionResponseError({
				RPC_relay: true,
				message: `Unexpected error in RPCTransactionAdapter revokeRole operation : ${error}`,
				transactionId: (error as any).error?.transactionId,
			});
		}
	}

	async grantSupplierRole(
		coin: StableCoinCapabilities,
		targetId: HederaId,
		amount: BigDecimal,
	): Promise<TransactionResponse> {
		try {
			if (!coin.coin.evmProxyAddress?.toString())
				throw new TransactionResponseError({
					RPC_relay: true,
					message: `StableCoin ${coin.coin.name} does not have a proxy address`,
				});

			return RPCTransactionResponseAdapter.manageResponse(
				await HederaERC20__factory.connect(
					coin.coin.evmProxyAddress?.toString(),
					this.signerOrProvider,
				).grantSupplierRole(
					(await this.accountToEvmAddress(targetId)).toString(),
					amount.toBigNumber(),
				),
			);
		} catch (error) {
			LogService.logError(error);
			throw new TransactionResponseError({
				RPC_relay: true,
				message: `Unexpected error in RPCTransactionAdapter grantSupplierRole operation : ${error}`,
				transactionId: (error as any).error?.transactionId,
			});
		}
	}

	async grantUnlimitedSupplierRole(
		coin: StableCoinCapabilities,
		targetId: HederaId,
	): Promise<TransactionResponse> {
		try {
			if (!coin.coin.evmProxyAddress?.toString())
				throw new TransactionResponseError({
					RPC_relay: true,
					message: `StableCoin ${coin.coin.name} does not have a proxy address`,
				});

			return RPCTransactionResponseAdapter.manageResponse(
				await HederaERC20__factory.connect(
					coin.coin.evmProxyAddress?.toString(),
					this.signerOrProvider,
				).grantUnlimitedSupplierRole(
					(await this.accountToEvmAddress(targetId)).toString(),
				),
			);
		} catch (error) {
			LogService.logError(error);
			throw new TransactionResponseError({
				RPC_relay: true,
				message: `Unexpected error in RPCTransactionAdapter grantUnlimitedSupplierRole operation : ${error}`,
				transactionId: (error as any).error?.transactionId,
			});
		}
	}

	async revokeSupplierRole(
		coin: StableCoinCapabilities,
		targetId: HederaId,
	): Promise<TransactionResponse> {
		try {
			if (!coin.coin.evmProxyAddress?.toString())
				throw new TransactionResponseError({
					RPC_relay: true,
					message: `StableCoin ${coin.coin.name} does not have a proxy address`,
				});

			return RPCTransactionResponseAdapter.manageResponse(
				await HederaERC20__factory.connect(
					coin.coin.evmProxyAddress?.toString(),
					this.signerOrProvider,
				).revokeSupplierRole(
					(
						await (
							await this.accountToEvmAddress(targetId)
						).toString()
					).toString(),
				),
			);
		} catch (error) {
			LogService.logError(error);
			throw new TransactionResponseError({
				RPC_relay: true,
				message: `Unexpected error in RPCTransactionAdapter revokeSupplierRole operation : ${error}`,
				transactionId: (error as any).error?.transactionId,
			});
		}
	}

	async hasRole(
		coin: StableCoinCapabilities,
		targetId: HederaId,
		role: StableCoinRole,
	): Promise<TransactionResponse<boolean, Error>> {
		try {
			if (!coin.coin.evmProxyAddress?.toString())
				throw new TransactionResponseError({
					RPC_relay: true,
					message: `StableCoin ${coin.coin.name} does not have a proxy address`,
				});

			const res = await HederaERC20__factory.connect(
				coin.coin.evmProxyAddress?.toString(),
				this.signerOrProvider,
			).hasRole(
				role,
				(
					await (await this.accountToEvmAddress(targetId)).toString()
				).toString(),
			);

			return new TransactionResponse(undefined, res.valueOf());
		} catch (error) {
			LogService.logError(error);
			throw new TransactionResponseError({
				RPC_relay: true,
				message: `Unexpected error in RPCTransactionAdapter hasRole operation : ${error}`,
				transactionId: (error as any).error?.transactionId,
			});
		}
	}

	async balanceOf(
		coin: StableCoinCapabilities,
		targetId: HederaId,
	): Promise<TransactionResponse<BigDecimal, Error>> {
		try {
			if (!coin.coin.evmProxyAddress?.toString())
				throw new TransactionResponseError({
					RPC_relay: true,
					message: `StableCoin ${coin.coin.name} does not have a proxy address`,
				});
			const res = await HederaERC20__factory.connect(
				coin.coin.evmProxyAddress?.toString(),
				this.signerOrProvider,
			).balanceOf(
				(
					await (await this.accountToEvmAddress(targetId)).toString()
				).toString(),
			);

			return new TransactionResponse(
				undefined,
				BigDecimal.fromStringFixed(res.toString(), coin.coin.decimals),
			);
		} catch (error) {
			LogService.logError(error);
			throw new TransactionResponseError({
				RPC_relay: true,
				message: `Unexpected error in RPCTransactionAdapter balanceOf operation : ${error}`,
				transactionId: (error as any).error?.transactionId,
			});
		}
	}

	async associateToken(
		coin: StableCoinCapabilities,
		targetId: HederaId,
	): Promise<TransactionResponse> {
		try {
			if (!coin.coin.evmProxyAddress?.toString())
				throw new TransactionResponseError({
					RPC_relay: true,
					message: `StableCoin ${coin.coin.name} does not have a proxy address`,
				});

			return RPCTransactionResponseAdapter.manageResponse(
				await HederaERC20__factory.connect(
					coin.coin.evmProxyAddress?.toString(),
					this.signerOrProvider,
				).associateToken(
					(
						await (
							await this.accountToEvmAddress(targetId)
						).toString()
					).toString(),
				),
			);
		} catch (error) {
			LogService.logError(error);
			throw new TransactionResponseError({
				RPC_relay: true,
				message: `Unexpected error in RPCTransactionAdapter associateToken operation : ${error}`,
				transactionId: (error as any).error?.transactionId,
			});
		}
	}

	async dissociateToken(
		coin: StableCoinCapabilities,
		targetId: HederaId,
	): Promise<TransactionResponse> {
		try {
			if (!coin.coin.evmProxyAddress?.toString())
				throw new TransactionResponseError({
					RPC_relay: true,
					message: `StableCoin ${coin.coin.name} does not have a proxy address`,
				});

			return RPCTransactionResponseAdapter.manageResponse(
				await HederaERC20__factory.connect(
					coin.coin.evmProxyAddress?.toString(),
					this.signerOrProvider,
				).dissociateToken(
					(
						await (
							await this.accountToEvmAddress(targetId)
						).toString()
					).toString(),
				),
			);
		} catch (error) {
			LogService.logError(error);
			throw new TransactionResponseError({
				RPC_relay: true,
				message: `Unexpected error in RPCTransactionAdapter dissociateToken operation : ${error}`,
				transactionId: (error as any).error?.transactionId,
			});
		}
	}

	async isUnlimitedSupplierAllowance(
		coin: StableCoinCapabilities,
		targetId: HederaId,
	): Promise<TransactionResponse> {
		try {
			if (!coin.coin.evmProxyAddress?.toString())
				throw new TransactionResponseError({
					RPC_relay: true,
					message: `StableCoin ${coin.coin.name} does not have a proxy address`,
				});

			return new TransactionResponse(
				undefined,
				await HederaERC20__factory.connect(
					coin.coin.evmProxyAddress?.toString(),
					this.signerOrProvider,
				).isUnlimitedSupplierAllowance(
					(await this.accountToEvmAddress(targetId)).toString(),
				),
			);
		} catch (error) {
			LogService.logError(error);
			throw new TransactionResponseError({
				RPC_relay: true,
				message: `Unexpected error in RPCTransactionAdapter isUnlimitedSupplierAllowance operation : ${error}`,
				transactionId: (error as any).error?.transactionId,
			});
		}
	}

	async supplierAllowance(
		coin: StableCoinCapabilities,
		targetId: HederaId,
	): Promise<TransactionResponse<BigDecimal, Error>> {
		try {
			if (!coin.coin.evmProxyAddress?.toString())
				throw new TransactionResponseError({
					RPC_relay: true,
					message: `StableCoin ${coin.coin.name} does not have a proxy address`,
				});

			const res = await HederaERC20__factory.connect(
				coin.coin.evmProxyAddress?.toString(),
				this.signerOrProvider,
			).getSupplierAllowance(
				(await this.accountToEvmAddress(targetId)).toString(),
			);

			return new TransactionResponse(
				undefined,
				BigDecimal.fromStringFixed(res.toString(), coin.coin.decimals),
			);
		} catch (error) {
			LogService.logError(error);
			throw new TransactionResponseError({
				RPC_relay: true,
				message: `Unexpected error in RPCTransactionAdapter supplierAllowance operation : ${error}`,
				transactionId: (error as any).error?.transactionId,
			});
		}
	}

	async resetSupplierAllowance(
		coin: StableCoinCapabilities,
		targetId: HederaId,
	): Promise<TransactionResponse> {
		try {
			if (!coin.coin.evmProxyAddress?.toString())
				throw new TransactionResponseError({
					RPC_relay: true,
					message: `StableCoin ${coin.coin.name} does not have a proxy address`,
				});

			return RPCTransactionResponseAdapter.manageResponse(
				await HederaERC20__factory.connect(
					coin.coin.evmProxyAddress?.toString(),
					this.signerOrProvider,
				).resetSupplierAllowance(
					(
						await (
							await this.accountToEvmAddress(targetId)
						).toString()
					).toString(),
				),
			);
		} catch (error) {
			LogService.logError(error);
			throw new TransactionResponseError({
				RPC_relay: true,
				message: `Unexpected error in RPCTransactionAdapter resetSupplierAllowance operation : ${error}`,
				transactionId: (error as any).error?.transactionId,
			});
		}
	}

	async increaseSupplierAllowance(
		coin: StableCoinCapabilities,
		targetId: HederaId,
		amount: BigDecimal,
	): Promise<TransactionResponse> {
		try {
			if (!coin.coin.evmProxyAddress?.toString())
				throw new TransactionResponseError({
					RPC_relay: true,
					message: `StableCoin ${coin.coin.name} does not have a proxy address`,
				});

			return RPCTransactionResponseAdapter.manageResponse(
				await HederaERC20__factory.connect(
					coin.coin.evmProxyAddress?.toString(),
					this.signerOrProvider,
				).increaseSupplierAllowance(
					(await this.accountToEvmAddress(targetId)).toString(),
					amount.toBigNumber(),
				),
			);
		} catch (error) {
			LogService.logError(error);
			throw new TransactionResponseError({
				RPC_relay: true,
				message: `Unexpected error in RPCTransactionAdapter increaseSupplierAllowance operation : ${error}`,
				transactionId: (error as any).error?.transactionId,
			});
		}
	}

	async decreaseSupplierAllowance(
		coin: StableCoinCapabilities,
		targetId: HederaId,
		amount: BigDecimal,
	): Promise<TransactionResponse> {
		try {
			if (!coin.coin.evmProxyAddress?.toString())
				throw new TransactionResponseError({
					RPC_relay: true,
					message: `StableCoin ${coin.coin.name} does not have a proxy address`,
				});

			return RPCTransactionResponseAdapter.manageResponse(
				await HederaERC20__factory.connect(
					coin.coin.evmProxyAddress?.toString(),
					this.signerOrProvider,
				).decreaseSupplierAllowance(
					(await this.accountToEvmAddress(targetId)).toString(),
					amount.toBigNumber(),
				),
			);
		} catch (error) {
			LogService.logError(error);
			throw new TransactionResponseError({
				RPC_relay: true,
				message: `Unexpected error in RPCTransactionAdapter decreaseSupplierAllowance operation : ${error}`,
				transactionId: (error as any).error?.transactionId,
			});
		}
	}

	async getRoles(
		coin: StableCoinCapabilities,
		targetId: HederaId,
	): Promise<TransactionResponse<string[], Error>> {
		try {
			if (!coin.coin.evmProxyAddress?.toString())
				throw new TransactionResponseError({
					RPC_relay: true,
					message: `StableCoin ${coin.coin.name} does not have a proxy address`,
				});

			return new TransactionResponse(
				undefined,
				await HederaERC20__factory.connect(
					coin.coin.evmProxyAddress?.toString(),
					this.signerOrProvider,
				).getRoles(
					(
						await (
							await this.accountToEvmAddress(targetId)
						).toString()
					).toString(),
				),
			);
		} catch (error) {
			LogService.logError(error);
			throw new TransactionResponseError({
				RPC_relay: true,
				message: `Unexpected error in RPCTransactionAdapter getRoles operation : ${error}`,
				transactionId: (error as any).error?.transactionId,
			});
		}
	}

	async grantKyc(
		coin: StableCoinCapabilities,
		targetId: HederaId,
	): Promise<TransactionResponse<boolean, Error>> {
		try {
			if (!coin.coin.evmProxyAddress?.toString())
				throw new TransactionResponseError({
					RPC_relay: true,
					message: `StableCoin ${coin.coin.name} does not have a proxy address`,
				});

			return RPCTransactionResponseAdapter.manageResponse(
				await HederaERC20__factory.connect(
					coin.coin.evmProxyAddress?.toString(),
					this.signerOrProvider,
				).grantKyc(
					(await this.accountToEvmAddress(targetId)).toString(),
				),
			);
		} catch (error) {
			LogService.logError(error);
			throw new TransactionResponseError({
				RPC_relay: true,
				message: `Unexpected error in RPCTransactionAdapter grantKyc operation : ${error}`,
				transactionId: (error as any).error?.transactionId,
			});
		}
	}

	async revokeKyc(
		coin: StableCoinCapabilities,
		targetId: HederaId,
	): Promise<TransactionResponse<boolean, Error>> {
		try {
			if (!coin.coin.evmProxyAddress?.toString())
				throw new TransactionResponseError({
					RPC_relay: true,
					message: `StableCoin ${coin.coin.name} does not have a proxy address`,
				});

			return RPCTransactionResponseAdapter.manageResponse(
				await HederaERC20__factory.connect(
					coin.coin.evmProxyAddress?.toString(),
					this.signerOrProvider,
				).revokeKyc(
					(await this.accountToEvmAddress(targetId)).toString(),
				),
			);
		} catch (error) {
			LogService.logError(error);
			throw new TransactionResponseError({
				RPC_relay: true,
				message: `Unexpected error in RPCTransactionAdapter revokeKyc operation : ${error}`,
				transactionId: (error as any).error?.transactionId,
			});
		}
	}

	async contractCall(
		contractAddress: string,
		functionName: string,
		param: unknown[],
	): Promise<ContractTransaction> {
		const erc20: CallableContract = IHederaTokenService__factory.connect(
			contractAddress,
			this.signerOrProvider,
		).functions;
		return erc20[functionName](...param);
	}

	async transfer(
		coin: StableCoinCapabilities,
		amount: BigDecimal,
		sourceId: Account,
		targetId: HederaId,
	): Promise<TransactionResponse> {
		const transfer = await this.precompiledCall('transferToken', [
			coin.coin.tokenId?.toHederaAddress().toSolidityAddress(),
			await this.accountToEvmAddress(sourceId.id),
			await (await this.accountToEvmAddress(targetId)).toString(),
			amount,
		]);
		return RPCTransactionResponseAdapter.manageResponse(transfer);
	}

	async transferFrom(
		coin: StableCoinCapabilities,
		amount: BigDecimal,
		sourceId: HederaId,
		targetId: HederaId,
	): Promise<TransactionResponse> {
		const transfer = await this.precompiledCall('transferFrom', [
			coin.coin.tokenId?.toHederaAddress().toSolidityAddress(),
			await this.accountToEvmAddress(sourceId),
			await (await this.accountToEvmAddress(targetId)).toString(),
			amount,
		]);
		return RPCTransactionResponseAdapter.manageResponse(transfer);
	}

	async signAndSendTransaction(
		t: RPCTransactionAdapter,
	): Promise<TransactionResponse> {
		throw new RuntimeError('Method not implemented.');
	}

	getAccount(): Account {
		return this.account;
	}

	async precompiledCall(
		functionName: string,
		param: unknown[],
	): Promise<ContractTransaction> {
		const precompiledAddress = '0000000000000000000000000000000000000167';
		return await this.contractCall(precompiledAddress, functionName, param);
	}

	/**
	 * TODO consider leaving this as a service and putting two implementations on top for rpc and web wallet.
	 */
	async connectMetamask(pair = true): Promise<Account> {
		try {
			const ethProvider = await detectEthereumProvider();
			if (ethProvider) {
				this.eventService.emit(WalletEvents.walletFound, {
					wallet: SupportedWallets.METAMASK,
					name: SupportedWallets.METAMASK,
				});
				if (ethProvider.isMetaMask) {
					if (!ethereum.isConnected())
						throw new WalletConnectError(
							'Metamask is not connected!',
						);

					pair && (await this.pairWallet());
					this.signerOrProvider = new ethers.providers.Web3Provider(
						// @ts-expect-error No TS compatibility
						ethereum,
					).getSigner();
					return this.account;
				} else {
					throw new WalletConnectError('Metamask was not found!');
				}
			} else {
				throw new WalletConnectError('Metamask was not found!');
			}
		} catch (error: any) {
			if ('code' in error && error.code === 4001) {
				throw new WalletConnectRejectedError(SupportedWallets.METAMASK);
			}
			if (error instanceof WalletConnectError) {
				throw error;
			}
			throw new RuntimeError((error as Error).message);
		}
	}

	private async pairWallet(): Promise<void> {
		const accts = await ethereum.request({
			method: 'eth_requestAccounts',
		});
		if (accts && 'length' in accts) {
			const evmAddress = (accts as string[])[0];
			const mirrorAccount = await this.mirrorNodeAdapter.getAccountInfo(
				evmAddress,
			);
			if (!mirrorAccount.id) {
				throw new WalletConnectError('Invalid account!');
			}
			this.account = new Account({
				id: mirrorAccount.id,
				evmAddress: mirrorAccount.accountEvmAddress,
				publicKey: mirrorAccount.publicKey,
			});
			this.eventService.emit(WalletEvents.walletPaired, {
				data: {
					account: this.account,
					pairing: '',
					topic: '',
				},
				network: this.networkService.environment,
				wallet: SupportedWallets.METAMASK,
			});
			LogService.logTrace('Paired Metamask Wallet Event:', this.account);
		} else {
			LogService.logTrace('Paired Metamask failed with no accounts');
			this.eventService.emit(WalletEvents.walletDisconnect, {
				wallet: SupportedWallets.METAMASK,
			});
		}
	}

	private registerMetamaskEvents(): void {
		try {
			if (typeof window === 'undefined' || !(window as any)?.ethereum)
				return;
			ethereum.on('accountsChanged', async (acct) => {
				const accounts = acct as string[];
				if (
					accounts.length > 0 &&
					this.account &&
					accounts[0] !== this.account.evmAddress
				) {
					const mirrorAccount =
						await this.mirrorNodeAdapter.getAccountInfo(
							accounts[0],
						);
					if (mirrorAccount.id) {
						this.account = new Account({
							id: mirrorAccount.id,
							evmAddress: mirrorAccount.accountEvmAddress,
							publicKey: mirrorAccount.publicKey,
						});
					}
					this.eventService.emit(WalletEvents.walletPaired, {
						data: {
							account: this.account,
						},
						network: this.networkService.environment,
						wallet: SupportedWallets.METAMASK,
					});
				} else {
					LogService.logTrace(
						'Metamask disconnected from the wallet',
					);
					this.eventService.emit(WalletEvents.walletDisconnect, {
						wallet: SupportedWallets.METAMASK,
					});
				}
			});
		} catch (error) {
			LogService.logError(error);
			throw new WalletConnectError('Ethereum is not defined');
		}
	}

	async performOperation(
		coin: StableCoinCapabilities,
		operation: Operation,
		params?: Params,
	): Promise<TransactionResponse> {
		try {
			switch (CapabilityDecider.decide(coin, operation)) {
				case Decision.CONTRACT:
					if (!coin.coin.evmProxyAddress?.toString())
						throw new Error(
							`StableCoin ${coin.coin.name} does not have a proxy address`,
						);
					return this.performSmartContractOperation(
						coin,
						operation,
						params,
					);

				case Decision.HTS:
					if (!coin.coin.evmProxyAddress?.toString())
						throw new Error(
							`StableCoin ${coin.coin.name} does not have a proxy address`,
						);
					if (!coin.coin.tokenId)
						throw new Error(
							`StableCoin ${coin.coin.name}  does not have an underlying token`,
						);

					return this.performHTSOperation(coin, operation, params);

				default:
					const tokenId = coin.coin.tokenId
						? coin.coin.tokenId.value
						: '';
					const OperationNotAllowed = new CapabilityError(
						this.getAccount().id.value,
						operation,
						tokenId,
					);
					return new TransactionResponse(
						undefined,
						undefined,
						OperationNotAllowed,
					);
			}
		} catch (error) {
			LogService.logError(error);
			throw new TransactionResponseError({
				RPC_relay: true,
				message: `Unexpected error in RPCTransactionAdapter ${operation} operation : ${error}`,
				transactionId: (error as any).error.transactionHash,
			});
		}
	}

	private async performSmartContractOperation(
		coin: StableCoinCapabilities,
		operation: Operation,
		params?: Params,
	): Promise<TransactionResponse> {
		const evmProxy = coin.coin.evmProxyAddress?.toString() ?? '';
		switch (operation) {
			case Operation.CASH_IN:
				const targetEvm = await this.accountToEvmAddress(
					HederaId.from(params!.targetId!),
				);
				return RPCTransactionResponseAdapter.manageResponse(
					await HederaERC20__factory.connect(
						evmProxy,
						this.signerOrProvider,
					).mint(targetEvm.toString(), params!.amount!.toBigNumber()),
				);

			case Operation.BURN:
				return RPCTransactionResponseAdapter.manageResponse(
					await HederaERC20__factory.connect(
						evmProxy,
						this.signerOrProvider,
					).burn(params!.amount!.toBigNumber()),
				);

			case Operation.WIPE:
				return RPCTransactionResponseAdapter.manageResponse(
					await HederaERC20__factory.connect(
						evmProxy,
						this.signerOrProvider,
					).wipe(params!.targetId!, params!.amount!.toBigNumber()),
				);

			case Operation.RESCUE:
				return RPCTransactionResponseAdapter.manageResponse(
					await HederaERC20__factory.connect(
						evmProxy,
						this.signerOrProvider,
					).rescue(params!.amount!.toBigNumber()),
				);

			case Operation.FREEZE:
				return RPCTransactionResponseAdapter.manageResponse(
					await HederaERC20__factory.connect(
						evmProxy,
						this.signerOrProvider,
					).freeze(params!.targetId!),
				);

			case Operation.UNFREEZE:
				return RPCTransactionResponseAdapter.manageResponse(
					await HederaERC20__factory.connect(
						evmProxy,
						this.signerOrProvider,
					).unfreeze(params!.targetId!),
				);

			case Operation.PAUSE:
				return RPCTransactionResponseAdapter.manageResponse(
					await HederaERC20__factory.connect(
						evmProxy,
						this.signerOrProvider,
					).pause(),
				);

			case Operation.UNPAUSE:
				return RPCTransactionResponseAdapter.manageResponse(
					await HederaERC20__factory.connect(
						evmProxy,
						this.signerOrProvider,
					).unpause(),
				);

			case Operation.DELETE:
				return RPCTransactionResponseAdapter.manageResponse(
					await HederaERC20__factory.connect(
						evmProxy,
						this.signerOrProvider,
					).deleteToken(),
				);

			default:
				throw new Error(
					`Operation not implemented through Smart Contracts`,
				);
		}
	}

	private async performHTSOperation(
		coin: StableCoinCapabilities,
		operation: Operation,
		params?: Params,
	): Promise<TransactionResponse> {
		switch (operation) {
			case Operation.CASH_IN:
				const coinId = TokenId.fromString(
					coin.coin.tokenId?.value ?? '',
				).toSolidityAddress();

				const resp: TransactionResponse<any, Error> =
					await this.checkTransactionResponse(
						await RPCTransactionResponseAdapter.manageResponse(
							await this.precompiledCall('mintToken', [
								coinId,
								params?.amount,
								[],
							]),
						),
					);

				if (
					resp.error === undefined &&
					coin.coin.treasury?.value !== params!.targetId?.toString()
				) {
					if (coin.coin.treasury?.value === coin.account.id.value) {
						return await this.transfer(
							coin,
							params!.amount!,
							this.account,
							HederaId.from(params?.targetId),
						);
					} else {
						return await this.transferFrom(
							coin,
							params!.amount!,
							coin.coin.treasury!,
							HederaId.from(params?.targetId),
						);
					}
				} else {
					return resp;
				}

			case Operation.BURN:
				return this.checkTransactionResponse(
					await RPCTransactionResponseAdapter.manageResponse(
						await this.precompiledCall('burnToken', [
							TokenId.fromString(
								coin.coin.tokenId?.value ?? '',
							).toSolidityAddress(),
							params?.amount,
							[],
						]),
					),
				);

			case Operation.WIPE:
				return this.checkTransactionResponse(
					await RPCTransactionResponseAdapter.manageResponse(
						await this.precompiledCall('wipeTokenAccount', [
							TokenId.fromString(
								coin.coin.tokenId?.value ?? '',
							).toSolidityAddress(),
							params?.targetId,
							params?.amount,
						]),
					),
				);

			case Operation.FREEZE:
				return this.checkTransactionResponse(
					await RPCTransactionResponseAdapter.manageResponse(
						await this.precompiledCall('freezeToken', [
							TokenId.fromString(
								coin.coin.tokenId?.value ?? '',
							).toSolidityAddress(),
							params?.targetId,
						]),
					),
				);

			case Operation.UNFREEZE:
				return this.checkTransactionResponse(
					await RPCTransactionResponseAdapter.manageResponse(
						await this.precompiledCall('unfreezeToken', [
							TokenId.fromString(
								coin.coin.tokenId?.value ?? '',
							).toSolidityAddress(),
							params?.targetId,
						]),
					),
				);

			case Operation.PAUSE:
				return this.checkTransactionResponse(
					await RPCTransactionResponseAdapter.manageResponse(
						await this.precompiledCall('pauseToken', [
							TokenId.fromString(
								coin.coin.tokenId?.value ?? '',
							).toSolidityAddress(),
						]),
					),
				);

			case Operation.UNPAUSE:
				return this.checkTransactionResponse(
					await RPCTransactionResponseAdapter.manageResponse(
						await this.precompiledCall('unpauseToken', [
							TokenId.fromString(
								coin.coin.tokenId?.value ?? '',
							).toSolidityAddress(),
						]),
					),
				);

			case Operation.DELETE:
				return this.checkTransactionResponse(
					await RPCTransactionResponseAdapter.manageResponse(
						await this.precompiledCall('deleteToken', [
							TokenId.fromString(
								coin.coin.tokenId?.value ?? '',
							).toSolidityAddress(),
						]),
					),
				);

			default:
				throw new Error(`Operation not implemented through HTS`);
		}
	}

	private async checkTransactionResponse(
		transaction: TransactionResponse,
	): Promise<TransactionResponse> {
		const responseCodeLength = 66;
		const responseCodeSuccess =
			'0x0000000000000000000000000000000000000000000000000000000000000016'; // response code 22 SUCCESS

		if (!transaction.id) return transaction;

		const txResponse = await this.mirrorNodeAdapter.getTransactionResult(
			transaction.id,
		);

		console.log(transaction.id);
		this.logTransaction(transaction.id);

		if (
			!txResponse.result ||
			txResponse.result.length < responseCodeLength
		) {
			return transaction;
		}

		const responseCode = txResponse.result.substring(0, responseCodeLength);

		LogService.logTrace('Transaction Response Code : ' + responseCode);

		if (responseCodeSuccess === responseCode) return transaction;

		throw new TransactionResponseError({
			message: 'Transaction failed with error code : ' + responseCode,
			transactionId: transaction.id,
			RPC_relay: true,
		});
	}
}

class Params {
	role?: string;
	targetId?: string;
	amount?: BigDecimal;

	constructor({
		role,
		targetId,
		amount,
	}: {
		role?: string;
		targetId?: string;
		amount?: BigDecimal;
	}) {
		this.role = role;
		this.targetId = targetId;
		this.amount = amount;
	}
}
