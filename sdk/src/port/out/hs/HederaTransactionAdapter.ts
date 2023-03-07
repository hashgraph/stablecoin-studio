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

/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-non-null-asserted-optional-chain */
/* eslint-disable @typescript-eslint/no-non-null-assertion */
/* eslint-disable no-case-declarations */
import {
	Transaction,
	PublicKey as HPublicKey,
	ContractId as HContractId,
	CustomFee as HCustomFee,
	DelegateContractId,
} from '@hashgraph/sdk';
import TransactionAdapter from '../TransactionAdapter';
import TransactionResponse from '../../../domain/context/transaction/TransactionResponse.js';
import { Operation } from '../../../domain/context/stablecoin/Capability.js';
import Web3 from 'web3';
import { CapabilityDecider, Decision } from '../CapabilityDecider.js';
import { CapabilityError } from './error/CapabilityError.js';
import StableCoinCapabilities from '../../../domain/context/stablecoin/StableCoinCapabilities.js';
import { StableCoinProps } from '../../../domain/context/stablecoin/StableCoin.js';
import { TokenSupplyType } from '../../../domain/context/stablecoin/TokenSupply.js';
import PublicKey from '../../../domain/context/account/PublicKey.js';
import ContractId from '../../../domain/context/contract/ContractId.js';
import {
	HederaERC20__factory,
	HederaReserve__factory,
	StableCoinFactory__factory,
} from 'hedera-stable-coin-contracts';
import BigDecimal from '../../../domain/context/shared/BigDecimal.js';
import { TransactionType } from '../TransactionResponseEnums.js';
import { HTSTransactionBuilder } from './HTSTransactionBuilder.js';
import { StableCoinRole } from '../../../domain/context/stablecoin/StableCoinRole.js';
import Account from '../../../domain/context/account/Account.js';
import { MirrorNodeAdapter } from '../mirror/MirrorNodeAdapter.js';
import { HederaId } from '../../../domain/context/shared/HederaId.js';
import { FactoryKey } from '../../../domain/context/factory/FactoryKey.js';
import { FactoryStableCoin } from '../../../domain/context/factory/FactoryStableCoin.js';
import { TOKEN_CREATION_COST_HBAR } from '../../../core/Constants.js';
import LogService from '../../../app/service/LogService.js';
import { RESERVE_DECIMALS } from '../../../domain/context/reserve/Reserve.js';
import TransactionResultViewModel from '../mirror/response/TransactionResultViewModel.js';
import { TransactionResponseError } from '../error/TransactionResponseError.js';
import { FactoryRole } from '../../../domain/context/factory/FactoryRole.js';
import { FactoryCashinRole } from '../../../domain/context/factory/FactoryCashinRole.js';

export abstract class HederaTransactionAdapter extends TransactionAdapter {
	private web3 = new Web3();

	constructor(public readonly mirrorNodeAdapter: MirrorNodeAdapter) {
		super();
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

			const cashinRole: FactoryCashinRole = {
				account:
					coin.cashInRoleAccount == undefined ||
					coin.cashInRoleAccount.toString() == '0.0.0'
						? '0x0000000000000000000000000000000000000000'
						: (
								await this.accountToEvmAddress(
									coin.cashInRoleAccount,
								)
						  ).toString(),
				allowance: coin.cashInRoleAllowance
					? coin.cashInRoleAllowance.toFixedNumber()
					: BigDecimal.ZERO.toFixedNumber(),
			};

			const providedKeys = [
				coin.adminKey,
				coin.kycKey,
				coin.freezeKey,
				coin.wipeKey,
				coin.supplyKey,
				coin.feeScheduleKey,
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
							key.keyType = 32; // fee schedule
							break;
						}
						case 6: {
							key.keyType = 64; // pause
							break;
						}
					}
					const providedKeyCasted = providedKey as PublicKey;
					key.publicKey =
						providedKeyCasted.key == PublicKey.NULL.key
							? '0x'
							: HPublicKey.fromString(
									providedKeyCasted.key,
							  ).toBytesRaw();
					key.isED25519 = providedKeyCasted.type === 'ED25519';
					keys.push(key);
				}
			});

			const providedRoles = [
				{
					account: coin.burnRoleAccount,
					role: StableCoinRole.BURN_ROLE,
				},
				{
					account: coin.wipeRoleAccount,
					role: StableCoinRole.WIPE_ROLE,
				},
				{
					account: coin.rescueRoleAccount,
					role: StableCoinRole.RESCUE_ROLE,
				},
				{
					account: coin.pauseRoleAccount,
					role: StableCoinRole.PAUSE_ROLE,
				},
				{
					account: coin.freezeRoleAccount,
					role: StableCoinRole.FREEZE_ROLE,
				},
				{
					account: coin.deleteRoleAccount,
					role: StableCoinRole.DELETE_ROLE,
				},
				{ account: coin.kycRoleAccount, role: StableCoinRole.KYC_ROLE },
			];

			const roles = await Promise.all(
				providedRoles
					.filter((item) => {
						return (
							item.account &&
							item.account.value !== HederaId.NULL.value
						);
					})
					.map(async (item) => {
						const role = new FactoryRole();
						role.role = item.role;
						role.account = (
							await this.accountToEvmAddress(item.account!)
						).toString();
						return role;
					}),
			);

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
				coin.grantKYCToOriginalSender
					? coin.grantKYCToOriginalSender
					: false,
				keys,
				roles,
				cashinRole,
			);

			const params = [
				stableCoinToCreate,
				'0x' +
					HContractId.fromString(
						hederaERC20.value,
					).toSolidityAddress(),
			];

			return await this.contractCall(
				factory.value,
				'deployStableCoin',
				params,
				15000000,
				TransactionType.RECORD,
				StableCoinFactory__factory.abi,
				TOKEN_CREATION_COST_HBAR,
			);
		} catch (error) {
			LogService.logError(error);
			throw new Error(
				`Unexpected error in HederaTransactionHandler create operation: ${error}`,
			);
		}
	}

	private async setFactoryRole(
		account: HederaId | undefined,
		stableCoinRole: StableCoinRole,
		roles: FactoryRole[],
	): Promise<void> {
		if (account && account.value !== HederaId.NULL.value) {
			const role = new FactoryRole();
			role.role = stableCoinRole;
			role.account = (await this.accountToEvmAddress(account)).toString();
			roles.push(role);
		}
	}

	getMirrorNodeAdapter(): MirrorNodeAdapter {
		return this.mirrorNodeAdapter;
	}

	public async associateToken(
		coin: StableCoinCapabilities | string,
		targetId: HederaId,
	): Promise<TransactionResponse<any, Error>> {
		if (coin instanceof StableCoinCapabilities) {
			const params = new Params({
				targetId: targetId,
			});

			return this.performSmartContractOperation(
				coin.coin.proxyAddress!.value,
				'associateToken',
				1300000,
				params,
			);
		} else {
			return await this.signAndSendTransaction(
				HTSTransactionBuilder.buildAssociateTokenTransaction(
					coin,
					targetId.toString(),
				),
				TransactionType.RECEIPT,
			);
		}
	}

	public async dissociateToken(
		coin: StableCoinCapabilities,
		targetId: HederaId,
	): Promise<TransactionResponse<any, Error>> {
		const params = new Params({
			targetId: targetId,
		});

		return this.performSmartContractOperation(
			coin.coin.proxyAddress!.value,
			'dissociateToken',
			1300000,
			params,
		);
	}

	public async cashin(
		coin: StableCoinCapabilities,
		targetId: HederaId,
		amount: BigDecimal,
	): Promise<TransactionResponse> {
		const params = new Params({
			targetId: targetId,
			amount: amount,
		});
		return this.performOperation(
			coin,
			Operation.CASH_IN,
			'mint',
			400000,
			params,
		);
	}

	public async wipe(
		coin: StableCoinCapabilities,
		targetId: HederaId,
		amount: BigDecimal,
	): Promise<TransactionResponse> {
		const params = new Params({
			targetId: targetId,
			amount: amount,
		});
		return this.performOperation(
			coin,
			Operation.WIPE,
			'wipe',
			400000,
			params,
		);
	}

	public async burn(
		coin: StableCoinCapabilities,
		amount: BigDecimal,
	): Promise<TransactionResponse> {
		const params = new Params({
			amount: amount,
		});
		return this.performOperation(
			coin,
			Operation.BURN,
			'burn',
			400000,
			params,
		);
	}

	public async balanceOf(
		coin: StableCoinCapabilities,
		targetId: HederaId,
	): Promise<TransactionResponse<BigDecimal, Error>> {
		const params = new Params({
			targetId: targetId,
		});

		const transactionResponse = await this.performSmartContractOperation(
			coin.coin.proxyAddress!.value,
			'balanceOf',
			40000,
			params,
			TransactionType.RECORD,
		);

		transactionResponse.response = BigDecimal.fromStringFixed(
			transactionResponse.response[0].toString(),
			coin.coin.decimals,
		);
		return transactionResponse;
	}

	public async freeze(
		coin: StableCoinCapabilities,
		targetId: HederaId,
	): Promise<TransactionResponse> {
		const params = new Params({
			targetId: targetId,
		});
		return this.performOperation(
			coin,
			Operation.FREEZE,
			'freeze',
			60000,
			params,
		);
	}

	public async unfreeze(
		coin: StableCoinCapabilities,
		targetId: HederaId,
	): Promise<TransactionResponse> {
		const params = new Params({
			targetId: targetId,
		});
		return this.performOperation(
			coin,
			Operation.UNFREEZE,
			'unfreeze',
			60000,
			params,
		);
	}

	public async pause(
		coin: StableCoinCapabilities,
	): Promise<TransactionResponse> {
		return this.performOperation(coin, Operation.PAUSE, 'pause', 60000);
	}

	public async unpause(
		coin: StableCoinCapabilities,
	): Promise<TransactionResponse> {
		return this.performOperation(coin, Operation.UNPAUSE, 'unpause', 60000);
	}

	public async transfer(
		coin: StableCoinCapabilities,
		amount: BigDecimal,
		sourceId: Account,
		targetId: HederaId,
		isApproval = false,
	): Promise<TransactionResponse> {
		const t: Transaction = isApproval
			? HTSTransactionBuilder.buildApprovedTransferTransaction(
					coin.coin.tokenId?.value!,
					amount.toLong(),
					sourceId!.id!.value,
					targetId.toString(),
			  )
			: HTSTransactionBuilder.buildTransferTransaction(
					coin.coin.tokenId?.value!,
					amount.toLong(),
					sourceId!.id!.value,
					targetId.toString(),
			  );
		return this.signAndSendTransaction(t, TransactionType.RECEIPT);
	}

	public async rescue(
		coin: StableCoinCapabilities,
		amount: BigDecimal,
	): Promise<TransactionResponse> {
		const params = new Params({
			amount: amount,
		});
		return this.performOperation(
			coin,
			Operation.RESCUE,
			'rescue',
			120000,
			params,
		);
	}

	public async delete(
		coin: StableCoinCapabilities,
	): Promise<TransactionResponse> {
		return this.performOperation(
			coin,
			Operation.DELETE,
			'deleteToken',
			400000,
		);
	}

	public async getReserveAddress(
		coin: StableCoinCapabilities,
	): Promise<TransactionResponse> {
		const transactionResponse = await this.performSmartContractOperation(
			coin.coin.proxyAddress!.value,
			'getReserveAddress',
			60000,
			undefined,
			TransactionType.RECORD,
		);

		transactionResponse.response =
			transactionResponse.response[0].toString();
		return transactionResponse;
	}

	public async updateReserveAddress(
		coin: StableCoinCapabilities,
		reserveAddress: ContractId,
	): Promise<TransactionResponse> {
		const params = new Params({
			reserveAddress: reserveAddress,
		});
		return this.performOperation(
			coin,
			Operation.RESERVE_MANAGEMENT,
			'updateReserveAddress',
			400000,
			params,
		);
	}

	public async getReserveAmount(
		coin: StableCoinCapabilities,
	): Promise<TransactionResponse> {
		const transactionResponse = await this.performSmartContractOperation(
			coin.coin.proxyAddress!.value,
			'getReserveAmount',
			60000,
			undefined,
			TransactionType.RECORD,
		);

		transactionResponse.response = BigDecimal.fromStringFixed(
			transactionResponse.response[0].toString(),
			RESERVE_DECIMALS,
		);
		return transactionResponse;
	}

	public async updateReserveAmount(
		reserveAddress: ContractId,
		amount: BigDecimal,
	): Promise<TransactionResponse> {
		const params = new Params({
			amount: amount,
		});

		return this.performSmartContractOperation(
			reserveAddress.toHederaAddress().toString(),
			'setAmount',
			400000,
			params,
			TransactionType.RECEIPT,
			HederaReserve__factory.abi,
		);
	}

	public async grantRole(
		coin: StableCoinCapabilities,
		targetId: HederaId,
		role: StableCoinRole,
	): Promise<TransactionResponse> {
		const params = new Params({
			role: role,
			targetId: targetId,
		});
		return this.performOperation(
			coin,
			Operation.ROLE_MANAGEMENT,
			'grantRole',
			400000,
			params,
		);
	}

	public async grantRoles(
		coin: StableCoinCapabilities,
		targetsId: HederaId[],
		roles: StableCoinRole[],
		amounts: BigDecimal[],
	): Promise<TransactionResponse> {
		const params = new Params({
			roles: roles,
			targetsId: targetsId,
			amounts: amounts,
		});
		return this.performOperation(
			coin,
			Operation.ROLE_MANAGEMENT,
			'grantRoles',
			4000000,
			params,
		);
	}

	public async grantUnlimitedSupplierRole(
		coin: StableCoinCapabilities,
		targetId: HederaId,
	): Promise<TransactionResponse> {
		const params = new Params({
			targetId: targetId,
		});
		return this.performOperation(
			coin,
			Operation.ROLE_MANAGEMENT,
			'grantUnlimitedSupplierRole',
			250000,
			params,
		);
	}

	public async grantSupplierRole(
		coin: StableCoinCapabilities,
		targetId: HederaId,
		amount: BigDecimal,
	): Promise<TransactionResponse> {
		const params = new Params({
			targetId: targetId,
			amount: amount,
		});
		return this.performOperation(
			coin,
			Operation.ROLE_MANAGEMENT,
			'grantSupplierRole',
			250000,
			params,
		);
	}

	public async revokeRole(
		coin: StableCoinCapabilities,
		targetId: HederaId,
		role: StableCoinRole,
	): Promise<TransactionResponse> {
		const params = new Params({
			role: role,
			targetId: targetId,
		});
		return this.performOperation(
			coin,
			Operation.ROLE_MANAGEMENT,
			'revokeRole',
			400000,
			params,
		);
	}

	public async revokeRoles(
		coin: StableCoinCapabilities,
		targetsId: HederaId[],
		roles: StableCoinRole[],
	): Promise<TransactionResponse> {
		const params = new Params({
			roles: roles,
			targetsId: targetsId,
		});
		return this.performOperation(
			coin,
			Operation.ROLE_MANAGEMENT,
			'revokeRoles',
			4000000,
			params,
		);
	}

	public async revokeSupplierRole(
		coin: StableCoinCapabilities,
		targetId: HederaId,
	): Promise<TransactionResponse> {
		const params = new Params({
			targetId: targetId,
		});
		return this.performOperation(
			coin,
			Operation.ROLE_MANAGEMENT,
			'revokeSupplierRole',
			130000,
			params,
		);
	}

	public async hasRole(
		coin: StableCoinCapabilities,
		targetId: HederaId,
		role: StableCoinRole,
	): Promise<TransactionResponse<boolean, Error>> {
		const params = new Params({
			role: role,
			targetId: targetId,
		});
		const transactionResponse = await this.performOperation(
			coin,
			Operation.ROLE_MANAGEMENT,
			'hasRole',
			400000,
			params,
			TransactionType.RECORD,
		);
		transactionResponse.response = transactionResponse.response[0];
		return transactionResponse;
	}

	public async getRoles(
		coin: StableCoinCapabilities,
		targetId: HederaId,
	): Promise<TransactionResponse<string[], Error>> {
		const params = new Params({
			targetId: targetId,
		});
		const transactionResponse = await this.performSmartContractOperation(
			coin.coin.proxyAddress!.value,
			'getRoles',
			80000,
			params,
			TransactionType.RECORD,
		);
		transactionResponse.response = transactionResponse.response[0].filter(
			(value: string) => value !== StableCoinRole.WITHOUT_ROLE,
		);
		return transactionResponse;
	}

	public async supplierAllowance(
		coin: StableCoinCapabilities,
		targetId: HederaId,
	): Promise<TransactionResponse<BigDecimal, Error>> {
		const params = new Params({
			targetId: targetId,
		});
		const transactionResponse = await this.performOperation(
			coin,
			Operation.ROLE_MANAGEMENT,
			'getSupplierAllowance',
			60000,
			params,
			TransactionType.RECORD,
		);
		transactionResponse.response = BigDecimal.fromStringFixed(
			transactionResponse.response[0].toString(),
			coin.coin.decimals,
		);
		return transactionResponse;
	}

	public async isUnlimitedSupplierAllowance(
		coin: StableCoinCapabilities,
		targetId: HederaId,
	): Promise<TransactionResponse<boolean, Error>> {
		const params = new Params({
			targetId: targetId,
		});
		const transactionResponse = await this.performOperation(
			coin,
			Operation.ROLE_MANAGEMENT,
			'isUnlimitedSupplierAllowance',
			60000,
			params,
			TransactionType.RECORD,
		);
		transactionResponse.response = transactionResponse.response[0];
		return transactionResponse;
	}

	public async increaseSupplierAllowance(
		coin: StableCoinCapabilities,
		targetId: HederaId,
		amount: BigDecimal,
	): Promise<TransactionResponse> {
		const params = new Params({
			targetId: targetId,
			amount: amount,
		});
		return this.performOperation(
			coin,
			Operation.ROLE_MANAGEMENT,
			'increaseSupplierAllowance',
			130000,
			params,
		);
	}

	public async decreaseSupplierAllowance(
		coin: StableCoinCapabilities,
		targetId: HederaId,
		amount: BigDecimal,
	): Promise<TransactionResponse> {
		const params = new Params({
			targetId: targetId,
			amount: amount,
		});
		return this.performOperation(
			coin,
			Operation.ROLE_MANAGEMENT,
			'decreaseSupplierAllowance',
			130000,
			params,
		);
	}

	public async resetSupplierAllowance(
		coin: StableCoinCapabilities,
		targetId: HederaId,
	): Promise<TransactionResponse> {
		const params = new Params({
			targetId: targetId,
		});
		return this.performOperation(
			coin,
			Operation.ROLE_MANAGEMENT,
			'resetSupplierAllowance',
			120000,
			params,
		);
	}

	public async grantKyc(
		coin: StableCoinCapabilities,
		targetId: HederaId,
	): Promise<TransactionResponse<boolean, Error>> {
		const params = new Params({
			targetId: targetId,
		});
		return this.performOperation(
			coin,
			Operation.GRANT_KYC,
			'grantKyc',
			120000,
			params,
		);
	}

	public async revokeKyc(
		coin: StableCoinCapabilities,
		targetId: HederaId,
	): Promise<TransactionResponse<boolean, Error>> {
		const params = new Params({
			targetId: targetId,
		});
		return this.performOperation(
			coin,
			Operation.REVOKE_KYC,
			'revokeKyc',
			120000,
			params,
		);
	}

	public async updateCustomFees(
		coin: StableCoinCapabilities,
		customFees: HCustomFee[],
	): Promise<TransactionResponse<boolean, Error>> {
		const params = new Params({
			customFees: customFees,
		});
		return this.performHTSOperation(
			coin,
			Operation.CREATE_CUSTOM_FEE,
			params,
		);
	}

	public async transfers(
		coin: StableCoinCapabilities,
		amounts: BigDecimal[],
		targetsId: HederaId[],
		targetId: HederaId,
	): Promise<TransactionResponse<any, Error>> {
		const params = new Params({
			targetId: targetId,
			targetsId: targetsId,
			amounts: amounts,
		});
		if (!coin.coin.tokenId)
			throw new Error(
				`StableCoin ${coin.coin.name} does not have an underlying token`,
			);
		return this.performHTSOperation(coin, Operation.TRANSFERS, params!);
	}

	private async performOperation(
		coin: StableCoinCapabilities,
		operation: Operation,
		operationName: string,
		gas: number,
		params?: Params,
		transactionType: TransactionType = TransactionType.RECEIPT,
		contractAbi: any = HederaERC20__factory.abi,
	): Promise<TransactionResponse> {
		try {
			switch (CapabilityDecider.decide(coin, operation)) {
				case Decision.CONTRACT:
					if (!coin.coin.proxyAddress)
						throw new Error(
							`StableCoin ${coin.coin.name} does not have a proxy address`,
						);
					return await this.performSmartContractOperation(
						coin.coin.proxyAddress!.value,
						operationName,
						gas,
						params,
						transactionType,
						contractAbi,
					);

				case Decision.HTS:
					if (!coin.coin.tokenId)
						throw new Error(
							`StableCoin ${coin.coin.name} does not have an underlying token`,
						);
					return this.performHTSOperation(coin, operation, params!);

				default:
					const tokenId = coin.coin.tokenId
						? coin.coin.tokenId.value
						: '';
					const OperationNotAllowed = new CapabilityError(
						this.getAccount().id?.value ?? '',
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
			const transactionId: string =
				(error as any).error?.transactionId.toString() ??
				(error as any)?.transactionId.toString();
			const transactionError: TransactionResultViewModel =
				await this.mirrorNodeAdapter.getTransactionFinalError(
					transactionId,
				);
			throw new TransactionResponseError({
				message: `Unexpected error in HederaTransactionHandler ${operationName} operation: ${JSON.stringify(
					transactionError,
				)}`,
				transactionId: transactionId,
			});
		}
	}

	private async performSmartContractOperation(
		contractAddress: string,
		operationName: string,
		gas: number,
		params?: Params,
		transactionType: TransactionType = TransactionType.RECEIPT,
		contractAbi: any = HederaERC20__factory.abi,
	): Promise<TransactionResponse> {
		const filteredContractParams: any[] =
			params === undefined || params === null
				? []
				: Object.values(params!).filter((element) => {
						return element !== undefined;
				  });
		for (let i = 0; i < filteredContractParams.length; i++) {
			if (Array.isArray(filteredContractParams[i])) {
				for (let j = 0; j < filteredContractParams[i].length; j++) {
					filteredContractParams[i][j] = await this.getEVMAddress(
						filteredContractParams[i][j],
					);
				}
			}
			filteredContractParams[i] = await this.getEVMAddress(
				filteredContractParams[i],
			);
		}
		return await this.contractCall(
			contractAddress,
			operationName,
			filteredContractParams,
			gas,
			transactionType,
			contractAbi,
		);
	}

	private async getEVMAddress(parameter: any): Promise<any> {
		if (parameter instanceof ContractId) {
			return (await this.contractToEvmAddress(parameter)).toString();
		} else if (parameter instanceof HederaId) {
			return (await this.accountToEvmAddress(parameter)).toString();
		}
		return parameter;
	}

	private async performHTSOperation(
		coin: StableCoinCapabilities,
		operation: Operation,
		params: Params,
	): Promise<TransactionResponse> {
		let t: Transaction = new Transaction();
		LogService.logTrace(
			'HTS Operation: ',
			operation,
			' with params: ',
			params,
		);
		switch (operation) {
			case Operation.CASH_IN:
				t = HTSTransactionBuilder.buildTokenMintTransaction(
					coin.coin.tokenId?.value!,
					params!.amount!.toLong(),
				);
				const resp: TransactionResponse<any, Error> =
					await this.signAndSendTransaction(
						t,
						TransactionType.RECEIPT,
					);

				if (
					resp.error === undefined &&
					coin.coin.treasury?.value !== params.targetId?.toString()
				) {
					if (coin.coin.treasury?.value === coin.account.id.value) {
						t = HTSTransactionBuilder.buildTransferTransaction(
							coin.coin.tokenId?.value!,
							params!.amount!.toLong(),
							coin.coin.treasury?.value,
							params!.targetId!.toString(),
						);
					} else {
						t =
							HTSTransactionBuilder.buildApprovedTransferTransaction(
								coin.coin.tokenId?.value!,
								params!.amount!.toLong(),
								coin.coin.treasury?.value!,
								params!.targetId!.toString(),
							);
					}
				} else {
					return resp;
				}
				break;

			case Operation.BURN:
				t = HTSTransactionBuilder.buildTokenBurnTransaction(
					coin.coin.tokenId?.value!,
					params!.amount!.toLong(),
				);
				break;

			case Operation.WIPE:
				t = HTSTransactionBuilder.buildTokenWipeTransaction(
					params.targetId!.toString(),
					coin.coin.tokenId?.value!,
					params!.amount!.toLong(),
				);
				break;

			case Operation.FREEZE:
				t = HTSTransactionBuilder.buildFreezeTransaction(
					coin.coin.tokenId?.value!,
					params.targetId!.toString(),
				);
				break;

			case Operation.UNFREEZE:
				t = HTSTransactionBuilder.buildUnfreezeTransaction(
					coin.coin.tokenId?.value!,
					params.targetId!.toString(),
				);
				break;

			case Operation.PAUSE:
				t = HTSTransactionBuilder.buildPausedTransaction(
					coin.coin.tokenId?.value!,
				);
				break;

			case Operation.UNPAUSE:
				t = HTSTransactionBuilder.buildUnpausedTransaction(
					coin.coin.tokenId?.value!,
				);
				break;

			case Operation.GRANT_KYC:
				t = HTSTransactionBuilder.buildGrantTokenKycTransaction(
					coin.coin.tokenId?.value!,
					params.targetId!.toString(),
				);
				break;

			case Operation.REVOKE_KYC:
				t = HTSTransactionBuilder.buildRevokeTokenKycTransaction(
					coin.coin.tokenId?.value!,
					params.targetId!.toString(),
				);
				break;

			case Operation.DELETE:
				t = HTSTransactionBuilder.buildDeleteTransaction(
					coin.coin.tokenId?.value!,
				);
				break;

			case Operation.CREATE_CUSTOM_FEE:
				t = HTSTransactionBuilder.buildUpdateCustomFeesTransaction(
					coin.coin.tokenId?.value!,
					params.customFees!,
				);
				break;

			case Operation.TRANSFERS:
				const amountsLong: Long[] = [];
				const targetsIdString: string[] = [];

				for (let i = 0; i < params.amounts!.length; i++) {
					amountsLong.push(params.amounts![i].toLong());
					targetsIdString.push(params.targetsId![i].toString());
				}

				t = HTSTransactionBuilder.buildTransfersTransaction(
					coin.coin.tokenId?.value!,
					amountsLong,
					params!.targetId!.toString(),
					targetsIdString,
				);
				break;

			case Operation.UPDATE:
				t = HTSTransactionBuilder.buildUpdateTokenTransaction(
					coin.coin.tokenId?.value!,
					params.kycKey
						? params.kycKey.key == PublicKey.NULL.key
							? DelegateContractId.fromString(params.kycKey.key)
							: HPublicKey.fromString(params.kycKey.key)
						: undefined,
					params.freezeKey
						? params.freezeKey.key == PublicKey.NULL.key
							? DelegateContractId.fromString(
									params.freezeKey.key,
							  )
							: HPublicKey.fromString(params.freezeKey.key)
						: undefined,
					params.feeScheduleKey
						? params.feeScheduleKey.key == PublicKey.NULL.key
							? DelegateContractId.fromString(
									params.feeScheduleKey.key,
							  )
							: HPublicKey.fromString(params.feeScheduleKey.key)
						: undefined,
					params.pauseKey
						? params.pauseKey.key == PublicKey.NULL.key
							? DelegateContractId.fromString(params.pauseKey.key)
							: HPublicKey.fromString(params.pauseKey.key)
						: undefined,
					params.wipeKey
						? params.wipeKey.key == PublicKey.NULL.key
							? DelegateContractId.fromString(params.wipeKey.key)
							: HPublicKey.fromString(params.wipeKey.key)
						: undefined,
					params.supplyKey
						? params.supplyKey.key == PublicKey.NULL.key
							? DelegateContractId.fromString(
									params.supplyKey.key,
							  )
							: HPublicKey.fromString(params.supplyKey.key)
						: undefined,
				);
				break;

			default:
				throw new Error(`Operation does not exist through HTS`);
		}
		return this.signAndSendTransaction(t, TransactionType.RECEIPT);
	}

	public async contractCall(
		contractAddress: string,
		functionName: string,
		parameters: any[],
		gas: number,
		trxType: TransactionType,
		abi: any,
		value?: number,
	): Promise<TransactionResponse> {
		const functionCallParameters = this.encodeFunctionCall(
			functionName,
			parameters,
			abi,
		);
		const transaction: Transaction =
			HTSTransactionBuilder.buildContractExecuteTransaction(
				contractAddress,
				functionCallParameters,
				gas,
				value,
			);

		return await this.signAndSendTransaction(
			transaction,
			trxType,
			functionName,
			abi,
		);
	}

	private encodeFunctionCall(
		functionName: string,
		parameters: any[],
		abi: any,
	): Uint8Array {
		const functionAbi = abi.find(
			(func: { name: any; type: string }) =>
				func.name === functionName && func.type === 'function',
		);
		if (!functionAbi) {
			const message = `Contract function ${functionName} not found in ABI, are you using the right version?`;
			throw new Error(message);
		}
		const encodedParametersHex = this.web3.eth.abi
			.encodeFunctionCall(functionAbi, parameters)
			.slice(2);

		return Buffer.from(encodedParametersHex, 'hex');
	}

	abstract getAccount(): Account;

	abstract signAndSendTransaction(
		t: Transaction,
		transactionType: TransactionType,
		nameFunction?: string,
		abi?: any[],
	): Promise<TransactionResponse>;
}

class Params {
	role?: string;
	targetId?: HederaId;
	amount?: BigDecimal;
	reserveAddress?: ContractId;
	customFees?: HCustomFee[];
	roles?: string[];
	targetsId?: HederaId[];
	amounts?: BigDecimal[];
	kycKey?: PublicKey;
	freezeKey?: PublicKey;
	feeScheduleKey?: PublicKey;
	pauseKey?: PublicKey;
	wipeKey?: PublicKey;
	supplyKey?: PublicKey;

	constructor({
		role,
		targetId,
		amount,
		reserveAddress,
		customFees,
		roles,
		targetsId,
		amounts,
		kycKey,
		freezeKey,
		feeScheduleKey,
		pauseKey,
		wipeKey,
		supplyKey,
	}: {
		role?: string;
		targetId?: HederaId;
		amount?: BigDecimal;
		reserveAddress?: ContractId;
		customFees?: HCustomFee[];
		roles?: string[];
		targetsId?: HederaId[];
		amounts?: BigDecimal[];
		kycKey?: PublicKey;
		freezeKey?: PublicKey;
		feeScheduleKey?: PublicKey;
		pauseKey?: PublicKey;
		wipeKey?: PublicKey;
		supplyKey?: PublicKey;
	}) {
		this.role = role;
		this.targetId = targetId;
		this.amount = amount;
		this.reserveAddress = reserveAddress;
		this.customFees = customFees;
		this.roles = roles;
		this.targetsId = targetsId;
		this.amounts = amounts;
		this.kycKey = kycKey;
		this.freezeKey = freezeKey;
		this.feeScheduleKey = feeScheduleKey;
		this.pauseKey = pauseKey;
		this.wipeKey = wipeKey;
		this.supplyKey = supplyKey;
	}
}
