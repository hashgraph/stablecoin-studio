import {
	Signer,
	ContractCreateFlow as CCF,
	FileAppendTransaction,
	FileCreateTransaction,
	ContractCreateTransaction,
    TransactionResponse,
} from '@hashgraph/sdk';

export default class ContractCreateFlow extends CCF {
	constructor() {
		super();
	}

	/**
	 * @param {Signer} signer
	 * @returns {Promise<TransactionResponse>}
	 */
	async executeWithSigner(signer: Signer): Promise<TransactionResponse> {
		if (this._bytecode == null) {
			throw new Error('cannot create contract with no bytecode');
		}

		if (signer.getAccountKey == null) {
			throw new Error(
				'`Signer.getAccountKey()` is not implemented, but is required for `ContractCreateFlow`',
			);
		}

		const key = signer.getAccountKey();

		const fileCreateTransaction = await new FileCreateTransaction()
			.setKeys(key != null ? [key] : [])
			.setContents(
				this._bytecode.subarray(
					0,
					Math.min(this._bytecode.length, 2048),
				),
			)
			.freezeWithSigner(signer);
		await fileCreateTransaction.signWithSigner(signer);

		let response = await fileCreateTransaction.executeWithSigner(signer);
		const receipt = await response.getReceiptWithSigner(signer);
		if (!receipt.fileId) {
			throw new Error('Cannot create without recipt');
		}
		const fileId = /** @type {FileId} */ receipt.fileId;

		if (this._bytecode.length > 2048 && fileId) {
			let fileAppendTransaction = new FileAppendTransaction()
				.setFileId(fileId)
				.setContents(this._bytecode.subarray(2048));
			if (this._maxChunks != null) {
				fileAppendTransaction.setMaxChunks(this._maxChunks);
			}
			fileAppendTransaction =
				(await fileAppendTransaction.freezeWithSigner(
					signer,
				)) as FileAppendTransaction;
			await fileAppendTransaction.signWithSigner(signer);

			await fileAppendTransaction.executeWithSigner(signer);
		}

        console.log(response);

		this._contractCreate = (await this._contractCreate
			.setBytecodeFileId(fileId)
			.freezeWithSigner(signer)) as ContractCreateTransaction;
		this._contractCreate = (await this._contractCreate.signWithSigner(
			signer,
		)) as ContractCreateTransaction;

		response = await this._contractCreate.executeWithSigner(signer);

		await response.getReceiptWithSigner(signer);

		return response;
	}
}
