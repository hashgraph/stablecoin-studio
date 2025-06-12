import { BaseBlockchainQuery, BaseBlockchainQueryParams } from '@scripts'

interface GetFacetsByConfigurationIdAndVersionQueryParams extends BaseBlockchainQueryParams {
    businessLogicResolverAddress: string
    configurationId: string
}

export default class GetFacetsByConfigurationIdAndVersionQuery extends BaseBlockchainQuery {
    public readonly businessLogicResolverAddress: string
    public readonly configurationId: string

    constructor({
        businessLogicResolverAddress,
        configurationId,
        provider,
        overrides,
    }: GetFacetsByConfigurationIdAndVersionQueryParams) {
        super({ provider, overrides })
        this.businessLogicResolverAddress = businessLogicResolverAddress
        this.configurationId = configurationId
    }
}
