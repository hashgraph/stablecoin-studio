import { MESSAGES } from '@tasks'

export default class NotInContractNameListError extends Error {
    constructor(contractName: string) {
        super(MESSAGES.deploy.error.notInContractNameList(contractName))
    }
}
