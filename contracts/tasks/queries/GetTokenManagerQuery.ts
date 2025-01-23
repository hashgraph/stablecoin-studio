interface GetTokenManagerQueryParams {
    factoryProxyAddress: string
}

export default class GetTokenManagerQuery {
    public readonly factoryProxyAddress: string

    private constructor({ factoryProxyAddress }: GetTokenManagerQueryParams) {
        this.factoryProxyAddress = factoryProxyAddress
    }
}
