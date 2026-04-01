export const propertyNotFound: string = 'propertyNotFound';

export enum MultisigTransactionStatus {
	SIGNED = 'SIGNED',
	PENDING = 'PENDING',
	EXPIRED = 'EXPIRED',
	ERROR = 'ERROR',
	EXECUTED = 'EXECUTED',
}

export enum MultisigTransactionStatusColors {
	SIGNED = 'green.200',
	PENDING = 'yellow.200',
	EXPIRED = 'orange.200',
	ERROR = 'red.200',
	EXECUTED = 'blue.200',
}
