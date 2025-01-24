import { MESSAGES } from '@scripts'

interface TransactionReceiptErrorParams {
    errorMessage?: string
    txHash?: string
}

export default class TransactionReceiptError extends Error {
    constructor({ errorMessage, txHash }: TransactionReceiptErrorParams) {
        const baseMessage = MESSAGES.blockchain.error.validateTxResponse[0]
        const hashMessage = txHash ? `${MESSAGES.blockchain.error.validateTxResponse[1]}${txHash}` : ''
        const message = errorMessage ? `${errorMessage}. ${baseMessage}` : baseMessage

        super(`${message}${hashMessage}`)
    }
}
