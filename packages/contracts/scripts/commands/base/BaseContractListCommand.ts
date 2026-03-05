import { BaseBlockchainCommand, BaseBlockchainCommandParams } from '@scripts'

export interface BaseContractListCommandParams extends BaseBlockchainCommandParams {
    readonly contractAddressList: string[]
    readonly businessLogicResolverProxyAddress: string
}

export default abstract class BaseContractListCommand extends BaseBlockchainCommand {
    public readonly contractAddressList: string[]
    public readonly businessLogicResolverProxyAddress: string

    constructor({
        contractAddressList,
        businessLogicResolverProxyAddress,
        signer,
        overrides,
    }: BaseContractListCommandParams) {
        super({ signer, overrides })
        this.contractAddressList = contractAddressList
        this.businessLogicResolverProxyAddress = businessLogicResolverProxyAddress
    }
}
