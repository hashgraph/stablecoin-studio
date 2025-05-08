import {
    DeployScsContractListResult,
    BusinessLogicResolverProxyNotFound,
    BaseContractListCommand,
    BaseBlockchainCommandParams,
} from '@scripts'

interface CreateConfigurationsForDeployedContractsCommandParams extends BaseBlockchainCommandParams {
    readonly deployedContractList: DeployScsContractListResult
}

export default class CreateConfigurationsForDeployedContractsCommand extends BaseContractListCommand {
    public readonly stableCoinFactoryAddressList: string[]
    public readonly stableCoinAddressList: string[]
    public readonly reserveAddressList: string[]

    constructor({ deployedContractList, signer, overrides }: CreateConfigurationsForDeployedContractsCommandParams) {
        const {
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
            deployer: _,
            businessLogicResolver,
            ...contractListToRegister
        } = deployedContractList
        const { stableCoinFactoryFacet, hederaReserveFacet, reserveFacet, ...stableCoinFacetList } =
            contractListToRegister

        if (!businessLogicResolver.proxyAddress) {
            throw new BusinessLogicResolverProxyNotFound()
        }

        const contractAddressList = Object.values(contractListToRegister).map((contract) => contract.address)

        super({
            contractAddressList,
            businessLogicResolverProxyAddress: businessLogicResolver.proxyAddress,
            signer,
            overrides,
        })

        this.stableCoinFactoryAddressList = [stableCoinFactoryFacet.address]
        this.stableCoinAddressList = Object.values(stableCoinFacetList).map((facet) => facet.address)
        this.reserveAddressList = [reserveFacet.address, hederaReserveFacet.address]
    }
}
