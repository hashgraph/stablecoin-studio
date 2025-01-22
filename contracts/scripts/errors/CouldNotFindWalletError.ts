import { MESSAGES } from '@scripts'

export default class CouldNotFindWalletError extends Error {
    constructor() {
        super(MESSAGES.blockchain.signer.couldNotFindWallet)
    }
}
