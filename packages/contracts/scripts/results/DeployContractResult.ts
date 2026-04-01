import { BaseContract, ContractTransactionResponse } from 'ethers'
import { ContractName } from '@configuration'

export default class DeployContractResult<C extends BaseContract> {
    public name: ContractName
    public address: string
    public contract: C
    public proxyAddress?: string
    public proxyAdminAddress?: string
    public receipt?: ContractTransactionResponse

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
        receipt?: ContractTransactionResponse
    }) {
        this.name = name
        this.address = address
        this.contract = contract
        this.proxyAddress = proxyAddress
        this.proxyAdminAddress = proxyAdminAddress
        this.receipt = receipt
    }
}
