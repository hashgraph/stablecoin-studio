import { MESSAGES } from '@scripts'

interface TransactionReceiptErrorParams {
    errorMessage?: string
    txHash?: string
}

export default class TransactionReceiptError extends Error {
    constructor({ errorMessage, txHash }: TransactionReceiptErrorParams) {
        const baseMessage = MESSAGES.blockchain.validateTxResponse.error[0]
        const hashMessage = txHash ? `${MESSAGES.blockchain.validateTxResponse.error[1]}${txHash}` : ''
        const message = errorMessage ? `${errorMessage}. ${baseMessage}` : baseMessage

        super(`${message}${hashMessage}`)
    }
}
