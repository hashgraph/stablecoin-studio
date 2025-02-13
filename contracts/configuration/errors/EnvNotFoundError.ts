import { MESSAGES } from '@configuration'

interface NewEnvNotFoundErrorCommand {
    envName: string
}

export default class EnvNotFoundError extends Error {
    constructor({ envName }: NewEnvNotFoundErrorCommand) {
        const [prefix, infix, suffix] = MESSAGES.error.envNotFound
        super(`${prefix}${envName}${infix}${envName}${suffix}`)
        this.name = 'EnvNotFoundError'
    }
}
