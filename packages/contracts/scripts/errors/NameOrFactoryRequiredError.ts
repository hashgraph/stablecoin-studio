import { MESSAGES } from '@scripts'

export default class NameOrFactoryRequiredError extends Error {
    constructor() {
        super(MESSAGES.blockchain.error.nameOrFactoryRequired)
    }
}
