import { MESSAGES } from '@scripts'

export default class SignerWithoutProviderError extends Error {
    constructor() {
        super(MESSAGES.blockchain.error.signerWithoutProvider)
    }
}
