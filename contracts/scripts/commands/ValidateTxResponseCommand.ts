import { ContractTransaction } from 'ethers'
import { ErrorMessageCommand } from '@scripts'

interface ValidateTxResponseCommandParams {
    txResponse: ContractTransaction
    confirmationEvent?: string
    confirmations?: number
    errorMessage?: string
}

export default class ValidateTxResponseCommand extends ErrorMessageCommand {
    public readonly txResponse: ContractTransaction
    public readonly confirmationEvent?: string
    public readonly confirmations: number

    constructor({ txResponse, confirmationEvent, confirmations = 1, errorMessage }: ValidateTxResponseCommandParams) {
        super({ errorMessage })
        this.txResponse = txResponse
        this.confirmationEvent = confirmationEvent
        this.confirmations = confirmations
    }
}
