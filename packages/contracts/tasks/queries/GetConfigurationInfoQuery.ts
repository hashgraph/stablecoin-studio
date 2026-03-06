import { BaseResolverQuery, BaseResolverQueryParams } from '@tasks'

type GetConfigurationInfoQueryParams = BaseResolverQueryParams

export default class GetConfigurationInfoQuery extends BaseResolverQuery {
    constructor({ configurationId, businessLogicResolverProxyAddress }: GetConfigurationInfoQueryParams) {
        super({ businessLogicResolverProxyAddress, configurationId })
    }
}
