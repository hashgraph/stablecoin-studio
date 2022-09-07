export interface IAccountRequestModel {
	accountId: string;
}

export interface IPrivateKeyRequestModel {
	privateKey: string;
}

export interface IAccountWithKeyRequestModel
	extends IAccountRequestModel,
		IPrivateKeyRequestModel {}

export interface IAmountRequestModel {
	amount: number;
}

export interface ITreasureyRequestModel {
	treasuryId: string;
}
