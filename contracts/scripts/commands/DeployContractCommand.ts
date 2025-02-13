import { Signer } from 'ethers'
import { ContractName } from '@configuration'

interface DeployContractCommandParams {
    name: ContractName
    signer: Signer
    args?: Array<any>
}

export default class DeployContractCommand {
    public readonly name: ContractName
    public readonly signer: Signer
    public readonly args: Array<any> = []

    constructor({ name, signer, args = [] }: DeployContractCommandParams) {
        this.name = name
        this.signer = signer
        this.args = args
    }
}
