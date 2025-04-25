export interface GetConfigurationInfoQueryParams {
    resolver: string
    configurationId: string
}

export default class GetConfigurationInfoQuery {
    public readonly resolver: string
    public readonly configurationId: string
    constructor({ resolver, configurationId }: GetConfigurationInfoQueryParams) {
        this.resolver = resolver
        this.configurationId = configurationId
    }
}
