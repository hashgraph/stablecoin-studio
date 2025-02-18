import { Contract, ContractReceipt } from 'ethers'
import { ContractName } from '@configuration'
import DeployContractWithFactoryResult from './DeployContractWithFactoryResult'

export default class DeployContractResult extends DeployContractWithFactoryResult<Contract> {
    public readonly name: ContractName

    constructor({
        name,
        address,
        contract,
        proxyAddress,
        proxyAdminAddress,
        receipt,
    }: {
        name: ContractName
        address: string
        contract: Contract
        proxyAddress?: string
        proxyAdminAddress?: string
        receipt?: ContractReceipt
    }) {
        super({
            address,
            contract,
            proxyAddress,
            proxyAdminAddress,
            receipt,
        })
        this.name = name
    }
}
