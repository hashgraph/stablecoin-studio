import { BaseStableCoinFactoryQuery, BaseStableCoinFactoryQueryParams } from '@tasks'

type GetTokenManagerQueryParams = BaseStableCoinFactoryQueryParams

export default class GetTokenManagerQuery extends BaseStableCoinFactoryQuery {
    constructor({ factoryProxyAddress }: GetTokenManagerQueryParams) {
        super({ factoryProxyAddress })
    }
}
