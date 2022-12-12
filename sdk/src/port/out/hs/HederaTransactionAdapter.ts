/* eslint-disable @typescript-eslint/no-non-null-asserted-optional-chain */
/* eslint-disable @typescript-eslint/no-non-null-assertion */
/* eslint-disable no-case-declarations */
import { PublicKey as HPublicKey, Transaction } from '@hashgraph/sdk';
import TransactionAdapter from '../TransactionAdapter';
import TransactionResponse from '../../../domain/context/transaction/TransactionResponse.js';
import { Operation } from '../../../domain/context/stablecoin/Capability.js';
import Web3 from 'web3';
import { CapabilityDecider, Decision } from '../CapabilityDecider.js';
import { CapabilityError } from './error/CapabilityError.js';
import StableCoinCapabilities from '../../../domain/context/stablecoin/StableCoinCapabilities.js';
import { HederaERC20__factory } from 'hedera-stable-coin-contracts/typechain-types/index.js';
import BigDecimal from '../../../domain/context/shared/BigDecimal.js';
import { TransactionType } from '../TransactionResponseEnums.js';
import { HTSTransactionBuilder } from './HTSTransactionBuilder.js';
import { StableCoinRole } from '../../../domain/context/stablecoin/StableCoinRole.js';
import Account from '../../../domain/context/account/Account.js';
import { PrivateKeyType } from '../../../domain/context/account/PrivateKey.js';
import { MirrorNodeAdapter } from '../mirror/MirrorNodeAdapter.js';
import AccountViewModel from '../mirror/response/AccountViewModel.js';
import { HederaId } from '../../../domain/context/shared/HederaId.js';

export abstract class HederaTransactionAdapter extends TransactionAdapter {
	private web3 = new Web3();

	constructor(public readonly mirrorNodeAdapter: MirrorNodeAdapter) {
		super();
	}

	public async associateToken(
		coin: StableCoinCapabilities | string,
		targetId: Account,
	): Promise<TransactionResponse<any, Error>> {
		if (coin instanceof StableCoinCapabilities) {
			const params = new Params({
				targetId: targetId,
			});

			return this.performSmartContractOperation(
				coin,
				'associateToken',
				1300000,
				params,
			);
		} else {
			return await this.signAndSendTransaction(
				HTSTransactionBuilder.buildAssociateTokenTransaction(
					coin,
					targetId!.id!.value,
				),
				TransactionType.RECEIPT,
			);
		}
	}

	public async dissociateToken(
		coin: StableCoinCapabilities,
		targetId: Account,
	): Promise<TransactionResponse<any, Error>> {
		const params = new Params({
			targetId: targetId,
		});

		return this.performSmartContractOperation(
			coin,
			'dissociateToken',
			1300000,
			params,
		);
	}

	public async cashin(
		coin: StableCoinCapabilities,
		targetId: Account,
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
		targetId: Account,
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
		targetId: Account,
	): Promise<TransactionResponse> {
		const params = new Params({
			targetId: targetId,
		});

		const transactionResponse = await this.performSmartContractOperation(
			coin,
			'balanceOf',
			40000,
			params,
			TransactionType.RECORD,
		);

		transactionResponse.response = BigDecimal.fromStringFixed(
			transactionResponse.response[0].toString(),
			coin.coin.decimals,
		).toString();
		return transactionResponse;
	}

	public async freeze(
		coin: StableCoinCapabilities,
		targetId: Account,
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
		targetId: Account,
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
		targetId: Account,
		isApproval = false,
	): Promise<TransactionResponse> {
		const t: Transaction = isApproval
			? HTSTransactionBuilder.buildApprovedTransferTransaction(
					coin.coin.tokenId?.value!,
					amount.toLong(),
					sourceId!.id!.value,
					targetId!.id!.value,
			  )
			: HTSTransactionBuilder.buildTransferTransaction(
					coin.coin.tokenId?.value!,
					amount.toLong(),
					sourceId!.id!.value,
					targetId!.id!.value,
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

	public async grantRole(
		coin: StableCoinCapabilities,
		targetId: Account,
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

	public async grantUnlimitedSupplierRole(
		coin: StableCoinCapabilities,
		targetId: Account,
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
		targetId: Account,
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
		targetId: Account,
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

	public async revokeSupplierRole(
		coin: StableCoinCapabilities,
		targetId: Account,
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
		targetId: Account,
		role: StableCoinRole,
	): Promise<TransactionResponse> {
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
		targetId: Account,
	): Promise<TransactionResponse> {
		const params = new Params({
			targetId: targetId,
		});
		const transactionResponse = await this.performOperation(
			coin,
			Operation.ROLE_MANAGEMENT,
			'getRoles',
			80000,
			params,
			TransactionType.RECORD,
		);
		transactionResponse.response = transactionResponse.response[0];
		return transactionResponse;
	}

	public async supplierAllowance(
		coin: StableCoinCapabilities,
		targetId: Account,
	): Promise<TransactionResponse> {
		const params = new Params({
			targetId: targetId,
		});
		const transactionResponse = await this.performOperation(
			coin,
			Operation.ROLE_MANAGEMENT,
			'supplierAllowance',
			60000,
			params,
			TransactionType.RECORD,
		);
		transactionResponse.response = BigDecimal.fromStringFixed(
			transactionResponse.response[0].toString(),
			coin.coin.decimals,
		).toString();
		return transactionResponse;
	}

	public async isUnlimitedSupplierAllowance(
		coin: StableCoinCapabilities,
		targetId: Account,
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
		targetId: Account,
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
		targetId: Account,
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
		targetId: Account,
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

	private async performOperation(
		coin: StableCoinCapabilities,
		operation: Operation,
		operationName: string,
		gas: number,
		params?: Params,
		transactionType: TransactionType = TransactionType.RECEIPT,
	): Promise<TransactionResponse> {
		try {
			let t: Transaction;
			switch (CapabilityDecider.decide(coin, operation)) {
				case Decision.CONTRACT:
					if (!coin.coin.proxyAddress)
						throw new Error(
							`StableCoin ${coin.coin.name} does not have a proxy Address`,
						);
					return await this.performSmartContractOperation(
						coin,
						operationName,
						gas,
						params,
						transactionType,
					);

				case Decision.HTS:
					if (!coin.coin.tokenId)
						throw new Error(
							`StableCoin ${coin.coin.name} does not have an underlying token`,
						);
					return this.performHTSOperation(coin, operation, params);

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
			throw new Error(
				`Unexpected error in HederaTransactionHandler ${operationName} operation : ${error}`,
			);
		}
	}

	private async performSmartContractOperation(
		coin: StableCoinCapabilities,
		operationName: string,
		gas: number,
		params?: Params,
		transactionType: TransactionType = TransactionType.RECEIPT,
	): Promise<TransactionResponse> {
		const filteredContractParams: any[] =
			params === undefined || params === null
				? []
				: Object.values(params!).filter((element) => {
						return element !== undefined;
				  });

		for (let i = 0; i < filteredContractParams.length; i++) {
			if (filteredContractParams[i] instanceof Account) {
				filteredContractParams[i] = await this.accountToEvmAddress(
					filteredContractParams[i],
				);
			}
		}

		return await this.contractCall(
			coin.coin.proxyAddress!.value,
			operationName,
			filteredContractParams,
			gas,
			transactionType,
		);
	}

	private async performHTSOperation(
		coin: StableCoinCapabilities,
		operation: Operation,
		params?: Params,
	): Promise<TransactionResponse> {
		let t: Transaction = new Transaction();
		switch (operation) {
			case Operation.CASH_IN:
				t = HTSTransactionBuilder.buildTokenMintTransaction(
					coin.coin.tokenId?.value!,
					params!.amount!.toLong(),
				);
				break;

			case Operation.BURN:
				t = HTSTransactionBuilder.buildTokenBurnTransaction(
					coin.coin.tokenId?.value!,
					params!.amount!.toLong(),
				);
				break;

			case Operation.WIPE:
				t = HTSTransactionBuilder.buildTokenWipeTransaction(
					params!.targetId!.id!.value,
					coin.coin.tokenId?.value!,
					params!.amount!.toLong(),
				);
				break;

			case Operation.FREEZE:
				t = HTSTransactionBuilder.buildFreezeTransaction(
					coin.coin.tokenId?.value!,
					params!.targetId!.id!.value,
				);
				break;

			case Operation.UNFREEZE:
				t = HTSTransactionBuilder.buildUnfreezeTransaction(
					coin.coin.tokenId?.value!,
					params!.targetId!.id!.value,
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

			case Operation.DELETE:
				t = HTSTransactionBuilder.buildDeleteTransaction(
					coin.coin.tokenId?.value!,
				);
				break;

			default:
				throw new Error(`Rescue operation does not exist through HTS`);
		}
		return this.signAndSendTransaction(t, TransactionType.RECEIPT);
	}

	public async contractCall(
		contractAddress: string,
		functionName: string,
		parameters: any[],
		gas: number,
		trxType: TransactionType,
		value?: number,
	): Promise<TransactionResponse> {
		const functionCallParameters = this.encodeFunctionCall(
			functionName,
			parameters,
			HederaERC20__factory.abi,
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
			HederaERC20__factory.abi,
		);
	}

	private encodeFunctionCall(
		functionName: string,
		parameters: any[],
		abi: any[],
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

	private async accountToEvmAddress(account: Account): Promise<string> {
		if (account.privateKey) {
			return this.getAccountEvmAddressFromPrivateKeyType(
				account.privateKey?.type,
				account.privateKey.publicKey.key,
				account.id,
			);
		} else {
			return await this.getAccountEvmAddress(account.id);
		}
	}

	private async getAccountEvmAddress(accountId: HederaId): Promise<string> {
		try {
			const accountInfoViewModel: AccountViewModel =
				await this.mirrorNodeAdapter.getAccountInfo(accountId);
			if (accountInfoViewModel.accountEvmAddress) {
				return accountInfoViewModel.accountEvmAddress;
			} else if (accountInfoViewModel.publicKey) {
				return this.getAccountEvmAddressFromPrivateKeyType(
					accountInfoViewModel.publicKey.type,
					accountInfoViewModel.publicKey.key,
					accountId,
				);
			} else {
				return Promise.reject<string>('');
			}
		} catch (error) {
			return Promise.reject<string>(error);
		}
	}

	private async getAccountEvmAddressFromPrivateKeyType(
		privateKeyType: string,
		publicKey: string,
		accountId: HederaId,
	): Promise<string> {
		switch (privateKeyType) {
			case PrivateKeyType.ECDSA:
				return HPublicKey.fromString(publicKey).toEthereumAddress();

			default:
				return accountId.toHederaAddress().toSolidityAddress();
		}
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
	targetId?: Account;
	amount?: BigDecimal;

	constructor({
		role,
		targetId,
		amount,
	}: {
		role?: string;
		targetId?: Account;
		amount?: BigDecimal;
	}) {
		this.role = role;
		this.targetId = targetId;
		this.amount = amount;
	}
}

class RoleParams extends Params {
	role?: string;

	constructor({
		targetId,
		amount,
		role,
	}: {
		targetId?: Account;
		amount?: BigDecimal;
		role?: string;
	}) {
		super({ targetId, amount });
		this.role = role;
	}
}
