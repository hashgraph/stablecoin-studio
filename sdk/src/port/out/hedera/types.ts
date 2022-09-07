export interface IContractParams {
	contractId: string;
	parameters: any[];
	gas: number;
	abi: any[];
	account?: {
		privateKey: string;
		accountId: string;
	};
}
