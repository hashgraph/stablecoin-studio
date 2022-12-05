import TransactionResponse from '../../domain/context/transaction/TransactionResponse.js';
import StableCoinCapabilities from '../../domain/context/stablecoin/StableCoinCapabilities.js';
import BigDecimal from '../../domain/context/shared/BigDecimal.js';
import { StableCoinRole } from '../../domain/context/stablecoin/StableCoinRole.js';

interface ITransactionHandler {
	register(): boolean;
	stop(): Promise<boolean>;
	wipe(
		coin: StableCoinCapabilities,
		targetId: string,
		amount: BigDecimal,
	): Promise<TransactionResponse>;
	cashin(
		coin: StableCoinCapabilities,
		targetId: string,
		amount: BigDecimal,
	): Promise<TransactionResponse>;
	burn(
		coin: StableCoinCapabilities,
		amount: BigDecimal,
	): Promise<TransactionResponse>;
	freeze(
		coin: StableCoinCapabilities,
		targetId: string,
	): Promise<TransactionResponse>;
	unfreeze(
		coin: StableCoinCapabilities,
		targetId: string,
	): Promise<TransactionResponse>;
	pause(coin: StableCoinCapabilities): Promise<TransactionResponse>;
	unpause(coin: StableCoinCapabilities): Promise<TransactionResponse>;
	rescue(
		coin: StableCoinCapabilities,
		amount: BigDecimal,
	): Promise<TransactionResponse>;
	delete(coin: StableCoinCapabilities): Promise<TransactionResponse>;
	/*contractCall(
		contract: Contract,
		functionName: keyof ABI,
		param: unknown[],
	): Promise<TransactionResponse>;*/
	transfer(
		coin: StableCoinCapabilities,
		amount: BigDecimal,
		sourceId: string,
		targetId: string,
	): Promise<TransactionResponse>;
	//signAndSendTransaction(t: K): Promise<TransactionResponse>;
}

interface RoleTransactionHandler {
	grantRole(
		coin: StableCoinCapabilities,
		targetId: string,
		role: StableCoinRole,
	): Promise<TransactionResponse>;
	revokeRole(
		coin: StableCoinCapabilities,
		targetId: string,
		role: StableCoinRole,
	): Promise<TransactionResponse>;
	hasRole(
		coin: StableCoinCapabilities,
		targetId: string,
		role: StableCoinRole,
	): Promise<TransactionResponse<boolean, Error>>;
	grantSupplierRole(
		coin: StableCoinCapabilities,
		role: StableCoinRole,
		amount: BigDecimal,
	): Promise<TransactionResponse>;
	grantUnlimitedSupplierRole(
		coin: StableCoinCapabilities,
		role: StableCoinRole,
	): Promise<TransactionResponse>;
	revokeSupplierRole(
		coin: StableCoinCapabilities,
		role: StableCoinRole,
	): Promise<TransactionResponse>;
	balanceOf(
		coin: StableCoinCapabilities,
		targetId: string,
	): Promise<TransactionResponse<BigDecimal, Error>>;
	associateToken(
		coin: StableCoinCapabilities,
		targetId: string,
	): Promise<TransactionResponse>;
	isUnlimitedSupplierAllowance(
		coin: StableCoinCapabilities,
		targetId: string,
	): Promise<TransactionResponse<boolean, Error>>;
	supplierAllowance(
		coin: StableCoinCapabilities,
		targetId: string,
	): Promise<TransactionResponse<BigDecimal, Error>>;
	resetSupplierAllowance(
		coin: StableCoinCapabilities,
		targetId: string,
	): Promise<TransactionResponse>;
	increaseSupplierAllowance(
		coin: StableCoinCapabilities,
		targetId: string,
		amount: BigDecimal,
	): Promise<TransactionResponse>;
	decreaseSupplierAllowance(
		coin: StableCoinCapabilities,
		targetId: string,
		amount: BigDecimal,
	): Promise<TransactionResponse>;
	getRoles(
		coin: StableCoinCapabilities,
		targetId: string,
	): Promise<TransactionResponse<string[], Error>>;
}

export default abstract class TransactionAdapter
	implements ITransactionHandler, RoleTransactionHandler
{
	register(): boolean {
		throw new Error('Method not implemented.');
	}
	stop(): Promise<boolean> {
		throw new Error('Method not implemented.');
	}
	wipe(
		coin: StableCoinCapabilities,
		targetId: string,
		amount: BigDecimal,
	): Promise<TransactionResponse<any, Error>> {
		throw new Error('Method not implemented.');
	}
	cashin(
		coin: StableCoinCapabilities,
		targetId: string,
		amount: BigDecimal,
	): Promise<TransactionResponse<any, Error>> {
		throw new Error('Method not implemented.');
	}
	burn(
		coin: StableCoinCapabilities,
		amount: BigDecimal,
	): Promise<TransactionResponse<any, Error>> {
		throw new Error('Method not implemented.');
	}
	freeze(
		coin: StableCoinCapabilities,
		targetId: string,
	): Promise<TransactionResponse<any, Error>> {
		throw new Error('Method not implemented.');
	}
	unfreeze(
		coin: StableCoinCapabilities,
		targetId: string,
	): Promise<TransactionResponse<any, Error>> {
		throw new Error('Method not implemented.');
	}
	pause(
		coin: StableCoinCapabilities,
	): Promise<TransactionResponse<any, Error>> {
		throw new Error('Method not implemented.');
	}
	unpause(
		coin: StableCoinCapabilities,
	): Promise<TransactionResponse<any, Error>> {
		throw new Error('Method not implemented.');
	}
	rescue(
		coin: StableCoinCapabilities,
		amount: BigDecimal,
	): Promise<TransactionResponse<any, Error>> {
		throw new Error('Method not implemented.');
	}
	delete(
		coin: StableCoinCapabilities,
	): Promise<TransactionResponse<any, Error>> {
		throw new Error('Method not implemented.');
	}
	transfer(
		coin: StableCoinCapabilities,
		amount: BigDecimal,
		sourceId: string,
		targetId: string,
		isApproval = false
	): Promise<TransactionResponse<any, Error>> {
		throw new Error('Method not implemented.');
	}
	grantRole(
		coin: StableCoinCapabilities,
		targetId: string,
		role: StableCoinRole,
	): Promise<TransactionResponse<any, Error>> {
		throw new Error('Method not implemented.');
	}
	revokeRole(
		coin: StableCoinCapabilities,
		targetId: string,
		role: StableCoinRole,
	): Promise<TransactionResponse<any, Error>> {
		throw new Error('Method not implemented.');
	}
	hasRole(
		coin: StableCoinCapabilities,
		targetId: string,
		role: StableCoinRole,
	): Promise<TransactionResponse<boolean, Error>> {
		throw new Error('Method not implemented.');
	}
	grantSupplierRole(
		coin: StableCoinCapabilities,
		targetId: string,
		amount: BigDecimal
	): Promise<TransactionResponse<any, Error>> {
		throw new Error('Method not implemented.');
	}
	grantUnlimitedSupplierRole(
		coin: StableCoinCapabilities,
		targetId: string
	): Promise<TransactionResponse<any, Error>> {
		throw new Error('Method not implemented.');
	}
	revokeSupplierRole(
		coin: StableCoinCapabilities,
		targetId: string,
	): Promise<TransactionResponse<any, Error>> {
		throw new Error('Method not implemented.');
	}
	balanceOf(
		coin: StableCoinCapabilities,
		targetId: string,
	): Promise<TransactionResponse<BigDecimal, Error>>;
	balanceOf(
		coin: StableCoinCapabilities,
		targetId: string,
	): Promise<TransactionResponse<BigDecimal, Error>> {
		throw new Error('Method not implemented.');
	}
	associateToken(
		coin: StableCoinCapabilities,
		targetId: string,
	): Promise<TransactionResponse<any, Error>> {
		throw new Error('Method not implemented.');
	}
	isUnlimitedSupplierAllowance(
		coin: StableCoinCapabilities,
		targetId: string,
	): Promise<TransactionResponse<boolean, Error>> {
		throw new Error('Method not implemented.');
	}
	supplierAllowance(
		coin: StableCoinCapabilities,
		targetId: string,
	): Promise<TransactionResponse<BigDecimal, Error>> {
		throw new Error('Method not implemented.');
	}
	resetSupplierAllowance(
		coin: StableCoinCapabilities,
		targetId: string,
	): Promise<TransactionResponse<any, Error>> {
		throw new Error('Method not implemented.');
	}
	increaseSupplierAllowance(
		coin: StableCoinCapabilities,
		targetId: string,
		amount: BigDecimal,
	): Promise<TransactionResponse<any, Error>> {
		throw new Error('Method not implemented.');
	}
	decreaseSupplierAllowance(
		coin: StableCoinCapabilities,
		targetId: string,
		amount: BigDecimal,
	): Promise<TransactionResponse<any, Error>> {
		throw new Error('Method not implemented.');
	}
	getRoles(
		coin: StableCoinCapabilities,
		targetId: string,
	): Promise<TransactionResponse<string[], Error>> {
		throw new Error('Method not implemented.');
	}
}
