import { TransactionReceipt, TransactionResponse } from 'ethers'

interface ValidateTxResponseResultParams {
    txResponse: TransactionResponse
    txReceipt: TransactionReceipt
}

export default class ValidateTxResponseResult {
    public txResponse: TransactionResponse
    public txReceipt: TransactionReceipt

    constructor({ txResponse, txReceipt }: ValidateTxResponseResultParams) {
        this.txResponse = txResponse
        this.txReceipt = txReceipt
    }
}
