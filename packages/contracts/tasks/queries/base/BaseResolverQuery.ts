export interface BaseResolverQueryParams {
    businessLogicResolverProxyAddress: string
    configurationId: string
}

export default class BaseResolverQuery {
    public readonly businessLogicResolverProxyAddress: string
    public readonly configurationId: string

    constructor({ businessLogicResolverProxyAddress }: BaseResolverQueryParams) {
        this.businessLogicResolverProxyAddress = businessLogicResolverProxyAddress
        this.configurationId = businessLogicResolverProxyAddress
    }
}
