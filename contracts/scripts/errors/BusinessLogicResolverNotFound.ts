import { MESSAGES } from '../'

export default class BusinessLogicResolverNotFound extends Error {
    constructor() {
        super(MESSAGES.businessLogicResolver.error.notFound)
    }
}
