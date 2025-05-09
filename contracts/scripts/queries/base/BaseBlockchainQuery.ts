import { Overrides, providers } from 'ethers'

export interface BaseBlockchainQueryParams {
    provider: providers.Provider
    overrides?: Overrides
}

export default abstract class BaseBlockchainQuery {
    public readonly provider: providers.Provider
    public readonly overrides?: Overrides

    constructor({ provider, overrides }: BaseBlockchainQueryParams) {
        this.provider = provider
        this.overrides = overrides
    }
}
