export interface GetResolverBusinessLogicsQueryParams {
    resolver: string
    configurationId: string
}

export default class GetResolverBusinessLogicsQuery {
    public readonly resolver: string
    public readonly configurationId: string
    constructor({ resolver, configurationId }: GetResolverBusinessLogicsQueryParams) {
        this.resolver = resolver
        this.configurationId = configurationId
    }
}
