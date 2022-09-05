export interface IRequestContracts {
	treasuryId: string;
	privateKey: string;
	accountId: string;
}
export interface IRequestContractsAmount extends IRequestContracts {
	amount: number;
}
