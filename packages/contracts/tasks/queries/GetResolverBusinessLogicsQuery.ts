import { BaseResolverQuery, BaseResolverQueryParams } from '@tasks'

type GetResolverBusinessLogicsQueryParams = BaseResolverQueryParams

export default class GetResolverBusinessLogicsQuery extends BaseResolverQuery {
    constructor({ configurationId, businessLogicResolverProxyAddress }: GetResolverBusinessLogicsQueryParams) {
        super({ businessLogicResolverProxyAddress, configurationId })
    }
}
