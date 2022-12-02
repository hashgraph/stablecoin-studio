/* eslint-disable @typescript-eslint/no-non-null-asserted-optional-chain */
/* eslint-disable @typescript-eslint/no-non-null-assertion */
/* eslint-disable no-case-declarations */
import { Transaction } from '@hashgraph/sdk';
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

export abstract class HederaTransactionAdapter extends TransactionAdapter {
	private web3 = new Web3();


	public async wipe2(
		coin: StableCoinCapabilities,
		targetId: string,
		amount: BigDecimal,
	): Promise<TransactionResponse> {
		try {
			let t: Transaction;
			switch (CapabilityDecider.decide(coin, Operation.WIPE)) {
				case Decision.CONTRACT:
					if (!coin.coin.proxyAddress)
						throw new Error(
							`StableCoin ${coin.coin.name} does not have a proxy Address`,
						);
					return await this.contractCall(
						coin.coin.proxyAddress!.value,
						'wipe',
						[targetId, amount],
						400000,
						TransactionType.RECEIPT,
					);

				case Decision.HTS:
					if (!coin.coin.tokenId)
						throw new Error(
							`StableCoin ${coin.coin.name} does not have an underlying token`,
						);
					t = HTSTransactionBuilder.buildTokenWipeTransaction(
						targetId,
						coin.coin.tokenId?.value!,
						amount.toLong(),
					);
					return this.signAndSendTransaction(t, TransactionType.RECEIPT);					

				default:
					const tokenId = coin.coin.tokenId
						? coin.coin.tokenId.value
						: '';
					const OperationNotAllowed = new CapabilityError(
						this.getAccount(),
						Operation.WIPE,
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
				`Unexpected error in HederaTransactionHandler Wipe operation : ${error}`,
			);
		}
	}

	public async wipe(
		coin: StableCoinCapabilities,
		targetId: string,
		amount: BigDecimal,
	): Promise<TransactionResponse> {
		const params = new Params({
			targetId: targetId,
			amount: amount
		});
		return this.perform(coin, Operation.WIPE, 'wipe', params);		
	}

	public async cashin2(
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

	public async cashin(
		coin: StableCoinCapabilities,
		targetId: string,
		amount: BigDecimal,
	): Promise<TransactionResponse> {
		const params = new Params({
			targetId: targetId,
			amount: amount
		});
		return this.perform(coin, Operation.CASH_IN, 'mint', params);		
	}

	public async burn2(
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

	public async burn(
		coin: StableCoinCapabilities,
		amount: BigDecimal,
	): Promise<TransactionResponse> {
		const params = new Params({
			amount: amount
		});
		return this.perform(coin, Operation.BURN, 'burn', params);		
	}

	public async freeze2(
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

	public async freeze(
		coin: StableCoinCapabilities,
		targetId: string,
	): Promise<TransactionResponse> {
		const params = new Params({
			targetId: targetId
		});
		return this.perform(coin, Operation.FREEZE, 'freeze', params);		
	}

	public async unfreeze2(
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

	public async unfreeze(
		coin: StableCoinCapabilities,
		targetId: string,
	): Promise<TransactionResponse> {
		const params = new Params({
			targetId: targetId
		});
		return this.perform(coin, Operation.UNFREEZE, 'unfreeze', params);		
	}


	public async pause2(
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

	public async pause(
		coin: StableCoinCapabilities,
	): Promise<TransactionResponse> {
		return this.perform(coin, Operation.PAUSE, 'pause');
	}

	public async unpause2(
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

	public async unpause(
		coin: StableCoinCapabilities,
	): Promise<TransactionResponse> {
		return this.perform(coin, Operation.UNPAUSE, 'unpause');
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

	public async rescue2(
		coin: StableCoinCapabilities,
		amount: BigDecimal
	): Promise<TransactionResponse> {
		try {
			let t: Transaction;
			switch (CapabilityDecider.decide(coin, Operation.RESCUE)) {
				case Decision.CONTRACT:
					if (!coin.coin.proxyAddress)
						throw new Error(
							`StableCoin ${coin.coin.name} does not have a proxy Address`,
						);
					return await this.contractCall(
						coin.coin.proxyAddress!.value,
						'rescue',
						[amount],
						120000,
						TransactionType.RECEIPT,
					);

				default:
					const tokenId = coin.coin.tokenId
						? coin.coin.tokenId.value
						: '';
					const OperationNotAllowed = new CapabilityError(
						this.getAccount(),
						Operation.RESCUE,
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
				`Unexpected error in HederaTransactionHandler Rescue operation : ${error}`,
			);
		}
	}

	public async rescue(
		coin: StableCoinCapabilities,
		amount: BigDecimal
	): Promise<TransactionResponse> {
		const params = new Params({
			amount: amount
		});
		return this.perform(coin, Operation.RESCUE, 'rescue', params);		
	}

	private async perform(
		coin: StableCoinCapabilities,
		operation: Operation,
		operationName: string,
		params?: Params
	): Promise<TransactionResponse> {
		try {
			let t: Transaction;
			switch (CapabilityDecider.decide(coin, operation)) {
				case Decision.CONTRACT:
					if (!coin.coin.proxyAddress)
						throw new Error(
							`StableCoin ${coin.coin.name} does not have a proxy Address`,
						);
					const contractParams: any[] = (params === undefined || params === null) ? [] : 
						Object.values(params!).filter(element => {
							return element !== undefined;
					 	}); 		
console.log(contractParams);					
					return await this.contractCall(
						coin.coin.proxyAddress!.value,
						operationName,
						contractParams,
						120000,
						TransactionType.RECEIPT,
					);

				case Decision.HTS:
					if (!coin.coin.tokenId)
						throw new Error(`StableCoin ${coin.coin.name} does not have an underlying token`,);
					return this.performHTSOperation(coin, operation, params);					
	
				default:
					const tokenId = coin.coin.tokenId
						? coin.coin.tokenId.value
						: '';
					const OperationNotAllowed = new CapabilityError(
						this.getAccount(),
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

	private async performHTSOperation(coin: StableCoinCapabilities,
									  operation: Operation,
									  params?: Params									  
	): Promise<TransactionResponse> {
		let t: Transaction = new Transaction();
		switch(operation) {
			case Operation.CASH_IN:
				t = HTSTransactionBuilder.buildTokenMintTransaction(coin.coin.tokenId?.value!, params!.amount!.toLong());		
				break;		
			
			case Operation.BURN:
				t = HTSTransactionBuilder.buildTokenBurnTransaction(coin.coin.tokenId?.value!, params!.amount!.toLong());
				break;

			case Operation.WIPE:
				t = HTSTransactionBuilder.buildTokenWipeTransaction(params!.targetId!, coin.coin.tokenId?.value!, params!.amount!.toLong());
				break;

			case Operation.FREEZE:
				t = HTSTransactionBuilder.buildFreezeTransaction(coin.coin.tokenId?.value!, params!.targetId!);
				break;

			case Operation.UNFREEZE:
				t = HTSTransactionBuilder.buildUnfreezeTransaction(coin.coin.tokenId?.value!, params!.targetId!);
				break;

			case Operation.PAUSE:
				t = HTSTransactionBuilder.buildPausedTransaction(coin.coin.tokenId?.value!);
				break;

			case Operation.UNPAUSE:
				t = HTSTransactionBuilder.buildUnpausedTransaction(coin.coin.tokenId?.value!);
				break;

			case Operation.DELETE:
				t = HTSTransactionBuilder.buildDeleteTransaction(coin.coin.tokenId?.value!);
				break;
		}
		return this.signAndSendTransaction(t, TransactionType.RECEIPT);			
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

class Params{
	targetId?: string;
	amount?: BigDecimal;

	constructor({ targetId, amount }: { targetId?: string, amount?: BigDecimal }) {
		this.targetId = targetId;
		this.amount = amount;
	}
}
