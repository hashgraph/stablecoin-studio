import { MESSAGES } from '@scripts'

export default class ConfigurationIdRequiredError extends Error {
    constructor() {
        super(MESSAGES.blockchain.error.configurationIdRequired)
    }
}
