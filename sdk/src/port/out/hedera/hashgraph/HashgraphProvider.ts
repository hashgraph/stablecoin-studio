import {
	Hbar,
	PrivateKey,
	ContractCreateTransaction,
	FileCreateTransaction,
	FileAppendTransaction,
} from '@hashgraph/sdk';

export class HashgraphProvider {
	async deployContractSDK(
		factory: any,
		chunks: any,
		privateKey: any,
		clientOperator: any,
	) {
		const bytecodeFileId = await this.fileCreate(
			factory.bytecode,
			chunks,
			PrivateKey.fromStringED25519(privateKey),
			clientOperator,
		);

		const transaction = new ContractCreateTransaction()
			.setGas(181_000)
			.setBytecodeFileId(bytecodeFileId)
			.setMaxTransactionFee(new Hbar(30))
			.setAdminKey(PrivateKey.fromStringED25519(privateKey));
			
		return null;
	}

	async fileCreate(
		bytecode: any,
		chunks: any,
		signingPrivateKey: any,
		clientOperator: any,
	) {
		const fileCreateTx = new FileCreateTransaction()
			.setKeys([signingPrivateKey])
			.freezeWith(clientOperator);
		const fileSign = await fileCreateTx.sign(signingPrivateKey);
		const fileSubmit = await fileSign.execute(clientOperator);
		const fileCreateRx = await fileSubmit.getReceipt(clientOperator);

		const bytecodeFileId = fileCreateRx.fileId || '';
		const fileAppendTx = new FileAppendTransaction()
			.setFileId(bytecodeFileId)
			.setContents(bytecode)
			.setMaxChunks(chunks)
			.setMaxTransactionFee(new Hbar(2))
			.freezeWith(clientOperator);
		const fileAppendSign = await fileAppendTx.sign(signingPrivateKey);
		const fileAppendSubmit = await fileAppendSign.execute(clientOperator);
		const fileAppendRx = await fileAppendSubmit.getReceipt(clientOperator);
		return bytecodeFileId;
	}
}
