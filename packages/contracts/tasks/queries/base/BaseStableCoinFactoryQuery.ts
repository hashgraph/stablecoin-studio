export interface BaseStableCoinFactoryQueryParams {
    factoryProxyAddress: string
}

export default class BaseStableCoinFactoryQuery {
    public readonly factoryProxyAddress: string

    constructor({ factoryProxyAddress }: BaseStableCoinFactoryQueryParams) {
        this.factoryProxyAddress = factoryProxyAddress
    }
}
