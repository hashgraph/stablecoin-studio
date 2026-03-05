import { Contract, TransactionResponse } from 'ethers'
import { ErrorMessageCommand, validateTxResponse } from '@scripts'

interface ValidateTxResponseCommandParams {
    txResponse: TransactionResponse
    contract?: Contract
    confirmationEvent?: string
    confirmations?: number
    errorMessage?: string
}

export default class ValidateTxResponseCommand extends ErrorMessageCommand {
    public readonly txResponse: TransactionResponse
    public readonly confirmationEvent?: string
    public readonly confirmations: number
    public readonly contract?: Contract

    constructor({
        txResponse,
        confirmationEvent,
        confirmations = 1,
        errorMessage,
        contract,
    }: ValidateTxResponseCommandParams) {
        super({ errorMessage })
        this.txResponse = txResponse
        this.confirmationEvent = confirmationEvent
        this.confirmations = confirmations
        this.contract = contract
    }

    async execute() {
        return await validateTxResponse(this)
    }
}
