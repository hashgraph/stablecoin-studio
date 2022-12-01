/* eslint-disable @typescript-eslint/no-non-null-asserted-optional-chain */
/* eslint-disable @typescript-eslint/no-non-null-assertion */
/* eslint-disable no-case-declarations */
import { Transaction } from '@hashgraph/sdk';
import { HTSTransactionBuilder } from './../builder/HTSTransactionBuilder.js';
import TransactionHandler from '../TransactionHandler';
import TransactionResponse from '../../../domain/context/transaction/TransactionResponse.js';
import { Operation } from '../../../domain/context/stablecoin/Capability.js';
import Web3 from 'web3';
import { CapabilityDecider, Decision } from './decider/CapabilityDecider.js';
import { CapabilityError } from './error/CapabilityError.js';
import StableCoinCapabilities from '../../../domain/context/stablecoin/StableCoinCapabilities.js';
import { HederaERC20__factory } from 'hedera-stable-coin-contracts/typechain-types/index.js';
import { TransactionType } from './response/TransactionResponseEnums.js';
import BigDecimal from '../../../domain/context/shared/BigDecimal.js';
import { Injectable } from '../../../core/Injectable.js';

export abstract class HederaTransactionHandler implements TransactionHandler {
	private web3 = new Web3();

	register(): boolean {
		return !!Injectable.registerTransactionHandler(this);
	}
	stop(): Promise<boolean> {
		return Promise.resolve(!!Injectable.disposeTransactionHandler(this));
	}

	public async wipe(
		stableCoinCapabilities: StableCoinCapabilities,
		targetId: string,
		amount: BigDecimal,
	): Promise<TransactionResponse> {
		const t: Transaction = HTSTransactionBuilder.buildTokenWipeTransaction(
			targetId,
			stableCoinCapabilities.coin.tokenId?.value!,
			amount.toLong(),
		);
		return this.signAndSendTransaction(t, TransactionType.RECEIPT);
	}

	public async cashin(
		coin: StableCoinCapabilities,
		targetId: string,
		amount: BigDecimal,
	): Promise<TransactionResponse> {
		try {
			let t: Transaction;
			switch (CapabilityDecider.decide(coin, Operation.CASH_IN)) {
				case Decision.CONTRACT:
					if (!coin.coin.proxyAddress)
						throw new Error(
							`StableCoin ${coin.coin.name} does not have a proxy Address`,
						);
					return await this.contractCall(
						coin.coin.proxyAddress!.value,
						'mint',
						[targetId, amount],
						400000,
						TransactionType.RECEIPT,
					);

				case Decision.HTS:
					if (!coin.coin.tokenId)
						throw new Error(
							`StableCoin ${coin.coin.name}  does not have an underlying token`,
						);
					t = HTSTransactionBuilder.buildTokenMintTransaction(
						coin.coin.tokenId.value,
						amount.toLong(),
					);
					return this.signAndSendTransaction(
						t,
						TransactionType.RECEIPT,
					);

				default:
					const tokenId = coin.coin.tokenId
						? coin.coin.tokenId.value
						: '';
					const OperationNotAllowed = new CapabilityError(
						this.getAccount(),
						Operation.CASH_IN,
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
				`Unexpected error in HederaTransactionHandler Cash in operation : ${error}`,
			);
		}
	}

	public async burn(
		coin: StableCoinCapabilities,
		amount: BigDecimal,
	): Promise<TransactionResponse> {
		try {
			let t: Transaction;

			switch (CapabilityDecider.decide(coin, Operation.BURN)) {
				case Decision.CONTRACT:
					if (!coin.coin.proxyAddress)
						throw new Error(
							`StableCoin ${coin.coin.name} does not have a proxy Address`,
						);
					return await this.contractCall(
						coin.coin.proxyAddress!.value,
						'burn',
						[amount],
						400000,
						TransactionType.RECEIPT,
					);

				case Decision.HTS:
					if (!coin.coin.tokenId)
						throw new Error(
							`StableCoin ${coin.coin.name} does not have an underlying token`,
						);
					t = HTSTransactionBuilder.buildTokenBurnTransaction(
						coin.coin.tokenId?.value!,
						amount.toLong(),
					);
					return this.signAndSendTransaction(
						t,
						TransactionType.RECEIPT,
					);

				default:
					const tokenId = coin.coin.tokenId
						? coin.coin.tokenId.value
						: '';
					const OperationNotAllowed = new CapabilityError(
						this.getAccount(),
						Operation.BURN,
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
				`Unexpected error in HederaTransactionHandler Burn operation : ${error}`,
			);
		}
	}

	public async freeze(
		coin: StableCoinCapabilities,
		targetId: string,
	): Promise<TransactionResponse> {
		try {
			let t: Transaction;

			switch (CapabilityDecider.decide(coin, Operation.FREEZE)) {
				case Decision.CONTRACT:
					if (!coin.coin.proxyAddress)
						throw new Error(
							`StableCoin ${coin.coin.name} does not have a proxy Address`,
						);
					return await this.contractCall(
						coin.coin.proxyAddress!.value,
						'freeze',
						[targetId],
						60000,
						TransactionType.RECEIPT,
					);

				case Decision.HTS:
					if (!coin.coin.tokenId)
						throw new Error(
							`StableCoin ${coin.coin.name} does not have an underlying token`,
						);
					t = HTSTransactionBuilder.buildFreezeTransaction(
						coin.coin.tokenId?.value!,
						targetId,
					);
					return this.signAndSendTransaction(
						t,
						TransactionType.RECEIPT,
					);

				default:
					const tokenId = coin.coin.tokenId
						? coin.coin.tokenId.value
						: '';
					const OperationNotAllowed = new CapabilityError(
						this.getAccount(),
						Operation.FREEZE,
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
				`Unexpected error in HederaTransactionHandler Freeze operation : ${error}`,
			);
		}
	}

	public async unfreeze(
		coin: StableCoinCapabilities,
		targetId: string,
	): Promise<TransactionResponse> {
		try {
			let t: Transaction;

			switch (CapabilityDecider.decide(coin, Operation.UNFREEZE)) {
				case Decision.CONTRACT:
					if (!coin.coin.proxyAddress)
						throw new Error(
							`StableCoin ${coin.coin.name} does not have a proxy Address`,
						);
					return await this.contractCall(
						coin.coin.proxyAddress!.value,
						'unfreeze',
						[targetId],
						60000,
						TransactionType.RECEIPT,
					);

				case Decision.HTS:
					if (!coin.coin.tokenId)
						throw new Error(
							`StableCoin ${coin.coin.name} does not have an underlying token`,
						);
					t = HTSTransactionBuilder.buildUnfreezeTransaction(
						coin.coin.tokenId?.value!,
						targetId,
					);
					return this.signAndSendTransaction(
						t,
						TransactionType.RECEIPT,
					);

				default:
					const tokenId = coin.coin.tokenId
						? coin.coin.tokenId.value
						: '';
					const OperationNotAllowed = new CapabilityError(
						this.getAccount(),
						Operation.UNFREEZE,
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
				`Unexpected error in HederaTransactionHandler Unfreeze operation : ${error}`,
			);
		}
	}

	public async pause(
		coin: StableCoinCapabilities,
	): Promise<TransactionResponse> {
		try {
			let t: Transaction;

			switch (CapabilityDecider.decide(coin, Operation.PAUSE)) {
				case Decision.CONTRACT:
					if (!coin.coin.proxyAddress)
						throw new Error(
							`StableCoin ${coin.coin.name} does not have a proxy Address`,
						);
					return await this.contractCall(
						coin.coin.proxyAddress!.value,
						'pause',
						[],
						60000,
						TransactionType.RECEIPT,
					);

				case Decision.HTS:
					if (!coin.coin.tokenId)
						throw new Error(
							`StableCoin ${coin.coin.name} does not have an underlying token`,
						);
					t = HTSTransactionBuilder.buildPausedTransaction(
						coin.coin.tokenId?.value!,
					);
					return this.signAndSendTransaction(
						t,
						TransactionType.RECEIPT,
					);

				default:
					const tokenId = coin.coin.tokenId
						? coin.coin.tokenId.value
						: '';
					const OperationNotAllowed = new CapabilityError(
						this.getAccount(),
						Operation.PAUSE,
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
				`Unexpected error in HederaTransactionHandler Pause operation : ${error}`,
			);
		}
	}

	public async unpause(
		coin: StableCoinCapabilities,
	): Promise<TransactionResponse> {
		try {
			let t: Transaction;

			switch (CapabilityDecider.decide(coin, Operation.UNPAUSE)) {
				case Decision.CONTRACT:
					if (!coin.coin.proxyAddress)
						throw new Error(
							`StableCoin ${coin.coin.name} does not have a proxy Address`,
						);
					return await this.contractCall(
						coin.coin.proxyAddress!.value,
						'unpause',
						[],
						60000,
						TransactionType.RECEIPT,
					);

				case Decision.HTS:
					if (!coin.coin.tokenId)
						throw new Error(
							`StableCoin ${coin.coin.name} does not have an underlying token`,
						);
					t = HTSTransactionBuilder.buildUnpausedTransaction(
						coin.coin.tokenId?.value!,
					);
					return this.signAndSendTransaction(
						t,
						TransactionType.RECEIPT,
					);

				default:
					const tokenId = coin.coin.tokenId
						? coin.coin.tokenId.value
						: '';
					const OperationNotAllowed = new CapabilityError(
						this.getAccount(),
						Operation.UNPAUSE,
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
				`Unexpected error in HederaTransactionHandler Unpause operation : ${error}`,
			);
		}
	}

	public async transfer(
		stableCoinCapabilities: StableCoinCapabilities,
		amount: BigDecimal,
		inAccountId: string,
		outAccountId: string,
	): Promise<TransactionResponse> {
		const t: Transaction = HTSTransactionBuilder.buildTransferTransaction(
			stableCoinCapabilities.coin.tokenId?.value!,
			amount.toLong(),
			inAccountId,
			outAccountId,
		);
		return this.signAndSendTransaction(t, TransactionType.RECEIPT);
	}

	public async rescue(
		stableCoinCapabilities: StableCoinCapabilities,
	): Promise<TransactionResponse> {
		throw new Error('Method not implemented.');
	}

	public async delete(
		stableCoinCapabilities: StableCoinCapabilities,
	): Promise<TransactionResponse> {
		const t: Transaction = HTSTransactionBuilder.buildDeleteTransaction(
			stableCoinCapabilities.coin.tokenId?.value!,
		);
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

		return await this.signAndSendTransaction(transaction, trxType);
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
			console.log(message);
			throw new Error(message);
		}
		const encodedParametersHex = this.web3.eth.abi
			.encodeFunctionCall(functionAbi, parameters)
			.slice(2);

		return Buffer.from(encodedParametersHex, 'hex');
	}

	abstract getAccount(): string;

	abstract signAndSendTransaction(
		t: Transaction,
		transactionType: TransactionType,
		nameFunction?: string,
		abi?: any[],
	): Promise<TransactionResponse>;
}
