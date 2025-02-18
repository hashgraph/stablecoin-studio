import { BaseStableCoinFactoryQuery, BaseStableCoinFactoryQueryParams } from '@tasks'

type GetStableCoinFactoryAdminQueryParams = BaseStableCoinFactoryQueryParams

export default class GetStableCoinFactoryAdminQuery extends BaseStableCoinFactoryQuery {
    constructor({ factoryProxyAddress }: GetStableCoinFactoryAdminQueryParams) {
        super({ factoryProxyAddress })
    }
}
