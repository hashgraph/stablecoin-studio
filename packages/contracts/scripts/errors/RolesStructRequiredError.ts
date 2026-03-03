import { MESSAGES } from '@scripts'

export default class RolesStructRequiredError extends Error {
    constructor() {
        super(MESSAGES.blockchain.error.rolesStructRequired)
    }
}
