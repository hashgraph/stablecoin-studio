import { MESSAGES } from '@scripts'

export default class BusinessLogicResolverAddressRequiredError extends Error {
    constructor() {
        super(MESSAGES.blockchain.error.businessLogicResolverAddressRequired)
    }
}
