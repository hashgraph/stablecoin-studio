import { MESSAGES } from '@scripts'

export default class ConfigurationVersionRequiredError extends Error {
    constructor() {
        super(MESSAGES.blockchain.error.configurationVersionRequired)
    }
}
