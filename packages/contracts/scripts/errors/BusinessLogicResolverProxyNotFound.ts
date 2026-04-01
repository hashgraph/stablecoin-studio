import { MESSAGES } from '@scripts'

export default class BusinessLogicResolverProxyNotFound extends Error {
    constructor() {
        super(MESSAGES.businessLogicResolver.error.proxyNotFound)
    }
}
