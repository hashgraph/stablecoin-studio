/* eslint-disable @typescript-eslint/no-explicit-any */

export interface IContractParams {
	treasuryId: string;
	parameters: any[];
	clientSdk: any;
	gas: number;
	abi: any;
}

export default interface IContractRepository {
	getClient(network: 'previewnet' | 'mainnet' | 'testnet'): any;
	callContract(name: string, params: IContractParams): Promise<Uint8Array>;
	encodeFuncionCall(
		functionName: any,
		parameters: any[],
		abi: any,
	): Uint8Array;
	decodeFunctionResult(
		abi: any,
		functionName: any,
		resultAsBytes: any,
	): Uint8Array;
	getPublicKey(privateKey: string): string;
}
