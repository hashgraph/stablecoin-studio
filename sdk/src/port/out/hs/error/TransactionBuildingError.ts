export class TransactionBuildingError extends Error {
	constructor(val: unknown) {
		super(
			`An error ocurred when building the transaction: ${val}`,
		);
	}
}