import { Contract, ContractReceipt } from 'ethers'
import { ContractName } from '@configuration'

export default class DeployContractResult<C extends Contract> {
    public readonly name: ContractName
    public readonly address: string
    public readonly contract: C
    public readonly proxyAddress?: string
    public readonly proxyAdminAddress?: string
    public readonly receipt?: ContractReceipt

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
        contract: C
        proxyAddress?: string
        proxyAdminAddress?: string
        receipt?: ContractReceipt
    }) {
        this.name = name
        this.address = address
        this.contract = contract
        this.proxyAddress = proxyAddress
        this.proxyAdminAddress = proxyAdminAddress
        this.receipt = receipt
    }
}
