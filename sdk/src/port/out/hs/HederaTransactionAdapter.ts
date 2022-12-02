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

	public async cashin(
		coin: StableCoinCapabilities,
		targetId: string,
		amount: BigDecimal,
	): Promise<TransactionResponse> {
		const params = new Params({
			targetId: targetId,
			amount: amount
		});
		return this.performOperation(coin, Operation.CASH_IN, 'mint', 400000, params);		
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
		return this.performOperation(coin, Operation.WIPE, 'wipe', 400000, params);		
	}

	public async burn(
		coin: StableCoinCapabilities,
		amount: BigDecimal,
	): Promise<TransactionResponse> {
		const params = new Params({
			amount: amount
		});
		return this.performOperation(coin, Operation.BURN, 'burn', 400000, params);		
	}

	public async freeze(
		coin: StableCoinCapabilities,
		targetId: string,
	): Promise<TransactionResponse> {
		const params = new Params({
			targetId: targetId
		});
		return this.performOperation(coin, Operation.FREEZE, 'freeze', 60000, params);		
	}

	public async unfreeze(
		coin: StableCoinCapabilities,
		targetId: string,
	): Promise<TransactionResponse> {
		const params = new Params({
			targetId: targetId
		});
		return this.performOperation(coin, Operation.UNFREEZE, 'unfreeze', 60000, params);		
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
		coin: StableCoinCapabilities,
		amount: BigDecimal
	): Promise<TransactionResponse> {
		const params = new Params({
			amount: amount
		});
		return this.performOperation(coin, Operation.RESCUE, 'rescue', 120000, params);		
	}

	public async delete(
		coin: StableCoinCapabilities,
	): Promise<TransactionResponse> {
		return this.performOperation(coin, Operation.DELETE, 'deleteToken', 400000);
	}

	public async grantRole(
		coin: StableCoinCapabilities,
		role: string,
		targetId: string
	): Promise<TransactionResponse> {
		const params = new Params({
			role: role,
			targetId: targetId
		});
		return this.performOperation(coin, Operation.ROLE_MANAGEMENT, 'grantRole', 400000, params);
	}

	public async grantUnlimitedSupplierRole(
		coin: StableCoinCapabilities,
		targetId: string
	): Promise<TransactionResponse> {
		const params = new Params({
			targetId: targetId
		});
		return this.performOperation(coin, Operation.ROLE_MANAGEMENT, 'grantUnlimitedSupplierRole', 250000, params);
	}

	public async grantSupplierRole(
		coin: StableCoinCapabilities,
		targetId: string,
		amount: BigDecimal
	): Promise<TransactionResponse> {
		const params = new Params({
			targetId: targetId,
			amount: amount
		});
		return this.performOperation(coin, Operation.ROLE_MANAGEMENT, 'grantSupplierRole', 250000, params);
	}

	public async revokeRole(
		coin: StableCoinCapabilities,
		role: string,
		targetId: string
	): Promise<TransactionResponse> {
		const params = new Params({
			role: role,
			targetId: targetId
		});
		return this.performOperation(coin, Operation.ROLE_MANAGEMENT, 'revokeRole', 400000, params);
	}

	public async hasRole(
		coin: StableCoinCapabilities,
		role: string,
		targetId: string
	): Promise<TransactionResponse> {
		const params = new Params({
			role: role,
			targetId: targetId
		});
		return this.performOperation(coin, Operation.ROLE_MANAGEMENT, 'hasRole', 400000, params, TransactionType.RECORD);
	}

	public async getRoles(
		coin: StableCoinCapabilities,
		targetId: string
	): Promise<TransactionResponse> {
		const params = new Params({
			targetId: targetId
		});
		return this.performOperation(coin, Operation.ROLE_MANAGEMENT, 'getRoles', 80000, params, TransactionType.RECORD);
	}

	public async supplierAllowance(
		coin: StableCoinCapabilities,
		targetId: string
	): Promise<TransactionResponse> {
		const params = new Params({
			targetId: targetId
		});
		return this.performOperation(coin, Operation.ROLE_MANAGEMENT, 'supplierAllowance', 60000, params, TransactionType.RECORD);
	}

	public async increaseSupplierAllowance(
		coin: StableCoinCapabilities,
		targetId: string,
		amount: BigDecimal
	): Promise<TransactionResponse> {
		const params = new Params({
			targetId: targetId,
			amount: amount
		});
		return this.performOperation(coin, Operation.ROLE_MANAGEMENT, 'increaseSupplierAllowance', 130000, params);
	}

	public async decreaseSupplierAllowance(
		coin: StableCoinCapabilities,
		targetId: string,
		amount: BigDecimal
	): Promise<TransactionResponse> {
		const params = new Params({
			targetId: targetId,
			amount: amount
		});
		return this.performOperation(coin, Operation.ROLE_MANAGEMENT, 'decreaseSupplierAllowance', 130000, params);
	}

	public async resetSupplierAllowance(
		coin: StableCoinCapabilities,
		targetId: string,
	): Promise<TransactionResponse> {
		const params = new Params({
			targetId: targetId
		});
		return this.performOperation(coin, Operation.ROLE_MANAGEMENT, 'resetSupplierAllowance', 120000, params);
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
					return this.performSmartContractOperation(coin, operationName, gas, params, transactionType);

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

	private async performSmartContractOperation(coin: StableCoinCapabilities,
		operationName: string,
		gas: number,
		params?: Params,
		transactionType: TransactionType = TransactionType.RECEIPT									  
	): Promise<TransactionResponse> {
		const contractParams: any[] = (params === undefined || params === null) ? [] : 
			Object.values(params!).filter(element => {
				return element !== undefined;
		 	}); 		
		return await this.contractCall(coin.coin.proxyAddress!.value,
									   operationName,
									   contractParams,
									   gas,
									   transactionType);
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

			case Operation.RESCUE:
				throw new Error(`Rescue operation does not exist through HTS`);
	
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

		return await this.signAndSendTransaction(transaction, trxType, functionName, HederaERC20__factory.abi);
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
	role?: string;
	targetId?: string;
	amount?: BigDecimal;

	constructor({ role, targetId, amount }: { role?: string, targetId?: string, amount?: BigDecimal }) {
		this.role = role;
		this.targetId = targetId;
		this.amount = amount;
	}
}

class RoleParams extends Params {
	role?: string;

	constructor({ targetId, amount, role }: { targetId?: string, amount?: BigDecimal, role?: string }) {
		super({targetId, amount});		
		this.role = role;
	}
}
