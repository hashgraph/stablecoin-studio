import { ContractReceipt, ContractTransaction, Event } from 'ethers'

interface ValidateTxResponseResultParams {
    txResponse: ContractTransaction
    txReceipt: ContractReceipt
    confirmationEvent?: Event
}

export default class ValidateTxResponseResult {
    public txResponse: ContractTransaction
    public txReceipt: ContractReceipt
    public confirmationEvent?: Event

    constructor({ txResponse, txReceipt, confirmationEvent }: ValidateTxResponseResultParams) {
        this.txResponse = txResponse
        this.txReceipt = txReceipt
        this.confirmationEvent = confirmationEvent
    }
}
